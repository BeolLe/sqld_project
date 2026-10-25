from datetime import datetime, timezone
from decimal import Decimal
import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from psycopg.rows import dict_row

from app.api.auth.router import get_current_user
from app.db.postgres import get_connection
from app.db.exam_scope import require_exam_schema, scope_filter, scope_params
from app.core.exam_scope import ExamType, exam_code
from app.services.exam_grading import grade_exam
from app.services.amplitude import send_amplitude_event

router = APIRouter(prefix="/api/exams", tags=["exams"])


class AttemptRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    attempt_uuid: UUID | None = Field(default=None, alias="attemptUuid")


class AnswerSaveRequest(AttemptRequest):
    problem_id: str
    selected_answer: str
    current_page_no: int | None = Field(default=None, ge=1)
    remaining_seconds: int | None = Field(default=None, ge=0)


class MemoSaveRequest(AttemptRequest):
    content: str


class SessionSyncRequest(AttemptRequest):
    current_page_no: int | None = Field(default=None, ge=1)
    remaining_seconds: int | None = Field(default=None, ge=0)


class SubmitExamRequest(AttemptRequest):
    remaining_seconds: int | None = Field(default=None, ge=0)
    current_page_no: int | None = Field(default=None, ge=1)


def normalize_decimal(value):
    if isinstance(value, Decimal):
        return float(value)
    return value


def get_exam_code(exam_id: str, exam_type: ExamType = "sqld") -> str:
    return exam_code(exam_id, exam_type)


def fetch_exam(conn, exam_id: str, exam_type: ExamType = "sqld") -> dict:
    scoped = require_exam_schema(conn, exam_type)
    columns = "exam_type, grading_policy, pass_threshold_percent" if scoped else "'sqld' AS exam_type, 'legacy_equal' AS grading_policy, 60 AS pass_threshold_percent"
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            f"""
            SELECT id, exam_code, title, total_question_count, duration_seconds, {columns}
            FROM exam.exams
            WHERE exam_code = %s {scope_filter(scoped)}
            """,
            (get_exam_code(exam_id, exam_type),) + scope_params(scoped, exam_type),
        )
        exam = cur.fetchone()

    if not exam:
        raise HTTPException(status_code=404, detail="exam not found")
    return exam


def ensure_dashboard_row(conn, user_id: str) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO dashboard.user_stats (user_id)
            VALUES (%s)
            ON CONFLICT (user_id) DO NOTHING
            """,
            (user_id,),
        )


def lock_user_progress(conn, user_id: str) -> None:
    # One existing shared row serializes this user's attempt creation and awards.
    ensure_dashboard_row(conn, user_id)
    with conn.cursor() as cur:
        cur.execute("SELECT user_id FROM dashboard.user_stats WHERE user_id = %s::uuid FOR UPDATE", (user_id,))


def resolve_attempt(conn, *, exam: dict, user_id: str, attempt_uuid, allow_submitted=False):
    lock_user_progress(conn, user_id)
    if attempt_uuid is not None:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT * FROM exam.exam_attempts WHERE attempt_uuid = %s::uuid "
                "AND exam_id = %s AND user_id = %s::uuid FOR UPDATE",
                (str(attempt_uuid), exam["id"], user_id),
            )
            attempt = cur.fetchone()
        if attempt is None:
            raise HTTPException(status_code=404, detail="exam attempt not found")
    else:
        if exam["exam_type"] != "sqld":
            raise HTTPException(status_code=422, detail="attemptUuid is required for ADsP writes")
        attempt = get_latest_attempt(conn, exam_id=exam["id"], user_id=user_id) if allow_submitted else None
        if attempt is None:
            attempt = get_or_create_attempt(conn, exam=exam, user_id=user_id)
    allowed = {"in_progress", "submitted"} if allow_submitted else {"in_progress"}
    if attempt["status"] not in allowed:
        raise HTTPException(status_code=409, detail="attempt is not writable")
    return attempt


def stored_result_payload(conn, attempt_id, stored_result):
    snapshot = (stored_result or {}).get("grading_snapshot") or {}
    if isinstance(snapshot, dict) and isinstance(snapshot.get("result"), dict):
        return snapshot["result"]
    # Old snapshots did not contain grading facts. Preserve the legacy rendering.
    return build_result_payload(conn, attempt_id)


def get_or_create_attempt(conn, *, exam: dict, user_id: str) -> dict:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            SELECT *
            FROM exam.exam_attempts
            WHERE exam_id = %s
              AND user_id = %s
              AND status = 'in_progress'
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (exam["id"], user_id),
        )
        attempt = cur.fetchone()

        if attempt:
            return attempt

        cur.execute(
            """
            SELECT COALESCE(MAX(attempt_no), 0) + 1 AS next_attempt_no
            FROM exam.exam_attempts
            WHERE exam_id = %s
              AND user_id = %s
            """,
            (exam["id"], user_id),
        )
        next_attempt_no = cur.fetchone()["next_attempt_no"]

        cur.execute(
            """
            INSERT INTO exam.exam_attempts (
                exam_id,
                user_id,
                attempt_no,
                duration_seconds,
                remaining_seconds,
                current_page_no,
                status
            )
            VALUES (%s, %s, %s, %s, %s, %s, 'in_progress')
            RETURNING *
            """,
            (
                exam["id"],
                user_id,
                next_attempt_no,
                exam["duration_seconds"],
                exam["duration_seconds"],
                1,
            ),
        )
        return cur.fetchone()


def get_latest_attempt(conn, *, exam_id: int, user_id: str) -> dict | None:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            SELECT *
            FROM exam.exam_attempts
            WHERE exam_id = %s
              AND user_id = %s
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (exam_id, user_id),
        )
        return cur.fetchone()


def load_attempt_state(conn, attempt_id: int) -> tuple[dict[str, str], str]:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            SELECT
                q.question_payload->>'source_id' AS source_id,
                a.selected_choice
            FROM exam.exam_attempt_answers a
            JOIN exam.exam_questions q
              ON q.id = a.question_id
            WHERE a.attempt_id = %s
            """,
            (attempt_id,),
        )
        answers = {row["source_id"]: row["selected_choice"] for row in cur.fetchall() if row["source_id"]}

        cur.execute(
            """
            SELECT memo_content
            FROM memo.exam_attempt_memos
            WHERE attempt_id = %s
            """,
            (attempt_id,),
        )
        memo = cur.fetchone()

    return answers, (memo["memo_content"] if memo else "")


def build_result_payload(conn, attempt_id: int, *, grading_policy: str = 'legacy_equal') -> dict:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            SELECT
                q.question_no,
                q.title,
                q.question_text,
                q.question_type,
                q.difficulty,
                q.question_payload,
                q.choice_payload,
                q.correct_rate,
                q.seed_correct_rate,
                ak.correct_answer,
                ak.explanation,
                a.selected_choice,
                q.subject_id
            FROM exam.exam_attempts ea
            JOIN exam.exam_questions q
              ON q.exam_id = ea.exam_id
            JOIN exam.answer_keys ak
              ON ak.question_id = q.id
            LEFT JOIN exam.exam_attempt_answers a
              ON a.attempt_id = ea.id
             AND a.question_id = q.id
            WHERE ea.id = %s
            ORDER BY q.question_no
            """,
            (attempt_id,),
        )
        rows = cur.fetchall()

    answers: dict[str, str] = {}
    problems: list[dict] = []

    for row in rows:
        question_payload = row["question_payload"] or {}
        source_id = question_payload.get("source_id") or f"exam_q_{row['question_no']}"
        answers[source_id] = row["selected_choice"]
        problems.append(
            {
                "id": source_id,
                "title": row["title"],
                "description": row["question_text"],
                "type": row["question_type"],
                "difficulty": row["difficulty"],
                "category": question_payload.get("category") or "미분류",
                "correctRate": normalize_decimal(row["correct_rate"])
                if row["correct_rate"] is not None
                else normalize_decimal(row["seed_correct_rate"]),
                "answer": row["correct_answer"],
                "explanation": row["explanation"],
                "options": row["choice_payload"] or [],
                "points": question_payload.get("points") if grading_policy == 'weighted' else question_payload.get("points", 2),
                "subjectId": row["subject_id"],
            }
        )

    correct_count = sum(1 for problem in problems if answers.get(problem["id"]) == problem["answer"])
    score = correct_count * 2

    return {
        "score": score,
        "answers": answers,
        "problems": problems,
        "correctCount": correct_count,
    }


def update_attempt_counters(conn, attempt_id: int, *, current_page_no: int | None, remaining_seconds: int | None):
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE exam.exam_attempts ea
            SET
                current_page_no = COALESCE(%s, ea.current_page_no),
                remaining_seconds = COALESCE(%s, ea.remaining_seconds),
                answered_count = (
                    SELECT COUNT(*)
                    FROM exam.exam_attempt_answers aaa
                    WHERE aaa.attempt_id = ea.id
                      AND aaa.selected_choice IS NOT NULL
                      AND aaa.selected_choice <> ''
                ),
                flagged_count = (
                    SELECT COUNT(*)
                    FROM exam.exam_attempt_answers aaa
                    WHERE aaa.attempt_id = ea.id
                      AND aaa.is_flagged = true
                ),
                last_saved_at = now()
            WHERE ea.id = %s
            """,
            (current_page_no, remaining_seconds, attempt_id),
        )


def serialize_schedule_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc).isoformat()
        return value.isoformat()
    return value


@router.get("/schedules")
def get_exam_schedules(
    year: int | None = None,
    exam_type: str | None = None,
):
    resolved_year = year or datetime.now(timezone.utc).year

    query = """
        SELECT
            schedule_id,
            schedule_year,
            exam_type,
            round_label,
            application_start_at,
            application_end_at,
            ticket_start_at,
            ticket_end_at,
            exam_start_at,
            exam_end_at,
            score_open_start_at,
            score_open_end_at,
            pass_announcement_start_at,
            pass_announcement_end_at,
            qualification_submission_start_at,
            qualification_submission_end_at,
            display_order,
            created_at,
            updated_at
        FROM schedule.exam_schedules
        WHERE schedule_year = %s
    """
    params: list = [resolved_year]

    if exam_type:
        query += " AND exam_type = ANY(%s)"
        params.append(["sqld", "SQL 개발자"] if exam_type == "sqld" else [exam_type])

    query += " ORDER BY display_order ASC, round_label ASC"

    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, params)
            rows = cur.fetchall()

    return {
        "year": resolved_year,
        "count": len(rows),
        "items": [
            {
                "scheduleId": row["schedule_id"],
                "scheduleYear": row["schedule_year"],
                "examType": row["exam_type"],
                "roundLabel": row["round_label"],
                "applicationStartAt": serialize_schedule_datetime(row["application_start_at"]),
                "applicationEndAt": serialize_schedule_datetime(row["application_end_at"]),
                "ticketStartAt": serialize_schedule_datetime(row["ticket_start_at"]),
                "ticketEndAt": serialize_schedule_datetime(row["ticket_end_at"]),
                "examStartAt": serialize_schedule_datetime(row["exam_start_at"]),
                "examEndAt": serialize_schedule_datetime(row["exam_end_at"]),
                "scoreOpenStartAt": serialize_schedule_datetime(row["score_open_start_at"]),
                "scoreOpenEndAt": serialize_schedule_datetime(row["score_open_end_at"]),
                "passAnnouncementStartAt": serialize_schedule_datetime(row["pass_announcement_start_at"]),
                "passAnnouncementEndAt": serialize_schedule_datetime(row["pass_announcement_end_at"]),
                "qualificationSubmissionStartAt": serialize_schedule_datetime(row["qualification_submission_start_at"]),
                "qualificationSubmissionEndAt": serialize_schedule_datetime(row["qualification_submission_end_at"]),
                "displayOrder": row["display_order"],
                "createdAt": serialize_schedule_datetime(row["created_at"]),
                "updatedAt": serialize_schedule_datetime(row["updated_at"]),
            }
            for row in rows
        ],
    }


@router.get("/{exam_id}/session")
def get_exam_session(exam_id: str, current_user: dict = Depends(get_current_user), exam_type: ExamType = "sqld"):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id, exam_type)
        lock_user_progress(conn, current_user["user_id"])
        attempt = get_or_create_attempt(conn, exam=exam, user_id=current_user["user_id"])
        answers, memo_content = load_attempt_state(conn, attempt["id"])

    return {
        "examType": exam_type,
        "attemptId": attempt["id"],
        "attemptUuid": str(attempt["attempt_uuid"]),
        "examId": exam_id,
        "remainingSeconds": attempt["remaining_seconds"],
        "currentPageNo": attempt["current_page_no"],
        "answers": answers,
        "memoContent": memo_content,
        "durationSeconds": attempt["duration_seconds"],
    }


@router.put("/{exam_id}/answers")
def save_exam_answer(
    exam_id: str,
    req: AnswerSaveRequest,
    current_user: dict = Depends(get_current_user),
    exam_type: ExamType = "sqld",
):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id, exam_type)
        attempt = resolve_attempt(conn, exam=exam, user_id=current_user["user_id"], attempt_uuid=req.attempt_uuid)

        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT id
                FROM exam.exam_questions
                WHERE exam_id = %s
                  AND question_payload->>'source_id' = %s
                """,
                (exam["id"], req.problem_id),
            )
            question = cur.fetchone()

            if not question:
                raise HTTPException(status_code=404, detail="question not found")

            cur.execute(
                """
                INSERT INTO exam.exam_attempt_answers (
                    attempt_id,
                    question_id,
                    selected_choice,
                    saved_at
                )
                VALUES (%s, %s, %s, now())
                ON CONFLICT (attempt_id, question_id)
                DO UPDATE SET
                    selected_choice = EXCLUDED.selected_choice,
                    saved_at = now()
                """,
                (attempt["id"], question["id"], req.selected_answer),
            )

        update_attempt_counters(
            conn,
            attempt["id"],
            current_page_no=req.current_page_no,
            remaining_seconds=req.remaining_seconds,
        )

    return {"ok": True}


@router.put("/{exam_id}/memo")
def save_exam_memo(
    exam_id: str,
    req: MemoSaveRequest,
    current_user: dict = Depends(get_current_user),
    exam_type: ExamType = "sqld",
):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id, exam_type)
        attempt = resolve_attempt(conn, exam=exam, user_id=current_user["user_id"], attempt_uuid=req.attempt_uuid)

        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO memo.exam_attempt_memos (
                    attempt_id,
                    memo_content
                )
                VALUES (%s, %s)
                ON CONFLICT (attempt_id)
                DO UPDATE SET
                    memo_content = EXCLUDED.memo_content
                """,
                (attempt["id"], req.content),
            )
            cur.execute(
                """
                UPDATE exam.exam_attempts
                SET last_saved_at = now()
                WHERE id = %s
                """,
                (attempt["id"],),
            )

    return {"ok": True}


@router.put("/{exam_id}/session")
def sync_exam_session(
    exam_id: str,
    req: SessionSyncRequest,
    current_user: dict = Depends(get_current_user),
    exam_type: ExamType = "sqld",
):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id, exam_type)
        attempt = resolve_attempt(conn, exam=exam, user_id=current_user["user_id"], attempt_uuid=req.attempt_uuid)
        update_attempt_counters(
            conn,
            attempt["id"],
            current_page_no=req.current_page_no,
            remaining_seconds=req.remaining_seconds,
        )

    return {"ok": True}


@router.get("/{exam_id}/result")
def get_latest_exam_result(
    exam_id: str,
    attempt_id: int | None = None,
    current_user: dict = Depends(get_current_user),
    exam_type: ExamType = "sqld",
):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id, exam_type)
        with conn.cursor(row_factory=dict_row) as cur:
            attempt_filter = ""
            params: list = [exam["id"], current_user["user_id"]]
            if attempt_id is not None:
                attempt_filter = "AND ea.id = %s"
                params.append(attempt_id)

            cur.execute(
                f"""
                SELECT ea.*
                FROM exam.exam_attempts ea
                WHERE ea.exam_id = %s
                  AND ea.user_id = %s::uuid
                  AND ea.status = 'submitted'
                  AND ea.submitted_at IS NOT NULL
                  {attempt_filter}
                ORDER BY ea.submitted_at DESC, ea.id DESC
                LIMIT 1
                """,
                params,
            )
            attempt = cur.fetchone()

            if not attempt:
                raise HTTPException(status_code=404, detail="exam result not found")

            cur.execute(
                """
                SELECT passed, failed_by_subject_cutoff, score_percent, grading_snapshot
                FROM exam.exam_attempt_results
                WHERE attempt_id = %s
                """,
                (attempt["id"],),
            )
            stored_result = cur.fetchone()

        result_payload = stored_result_payload(conn, attempt["id"], stored_result)

    return {
        "examType": exam_type,
        "attemptId": attempt["id"],
        "passed": bool(stored_result["passed"]) if stored_result else False,
        "failedBySubjectCutoff": bool(stored_result["failed_by_subject_cutoff"]) if stored_result else False,
        "scorePercent": float(stored_result["score_percent"]) if stored_result and stored_result["score_percent"] is not None else 0,
        **result_payload,
    }


@router.post("/{exam_id}/submit")
def submit_exam(
    exam_id: str,
    req: SubmitExamRequest,
    current_user: dict = Depends(get_current_user),
    exam_type: ExamType = "sqld",
):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id, exam_type)
        attempt = resolve_attempt(conn, exam=exam, user_id=current_user["user_id"],
                                  attempt_uuid=req.attempt_uuid, allow_submitted=True)

        if attempt["status"] == "submitted":
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    """
                    SELECT passed, failed_by_subject_cutoff, score_percent, grading_snapshot
                    FROM exam.exam_attempt_results
                    WHERE attempt_id = %s
                    """,
                    (attempt["id"],),
                )
                stored_result = cur.fetchone()
                cur.execute(
                    """
                    SELECT total_points
                    FROM dashboard.user_stats
                    WHERE user_id = %s::uuid
                    """,
                    (current_user["user_id"],),
                )
                stats_row = cur.fetchone()

            result_payload = stored_result_payload(conn, attempt["id"], stored_result)
            return {
                "examType": exam_type,
                "attemptId": attempt["id"],
                "passed": bool(stored_result["passed"]) if stored_result else False,
                "failedBySubjectCutoff": bool(stored_result["failed_by_subject_cutoff"]) if stored_result else False,
                "scorePercent": float(stored_result["score_percent"]) if stored_result and stored_result["score_percent"] is not None else 0,
                "awardedPoints": 0,
                "totalPoints": int(stats_row["total_points"] or 0) if stats_row else 0,
                **result_payload,
            }

        if req.current_page_no is not None or req.remaining_seconds is not None:
            update_attempt_counters(
                conn,
                attempt["id"],
                current_page_no=req.current_page_no,
                remaining_seconds=req.remaining_seconds,
            )

        result_payload = build_result_payload(conn, attempt["id"], grading_policy=exam["grading_policy"])
        total_question_count = exam["total_question_count"]
        if exam["grading_policy"] == 'legacy_equal':
            # Original SQLD grouped q.subject_id and used a fixed 40% cutoff;
            # do not introduce a new requirement on legacy exam.subjects columns.
            subjects = [{'id': subject_id, 'pass_threshold_percent': 40}
                        for subject_id in dict.fromkeys(p['subjectId'] for p in result_payload['problems'])]
        else:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute("SELECT id, pass_threshold_percent FROM exam.subjects WHERE exam_id = %s ORDER BY id", (exam["id"],))
                subjects = cur.fetchall()
        try:
            grading = grade_exam(result_payload["problems"], result_payload["answers"],
                                 policy=exam["grading_policy"], total_question_count=total_question_count,
                                 total_cutoff=exam["pass_threshold_percent"], subjects=subjects)
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        correct_count = grading["correctCount"]
        awarded_points = correct_count
        score_percent = grading["scorePercent"]
        failed_by_subject_cutoff = grading["failedBySubjectCutoff"]
        passed = grading["passed"]
        result_payload.update(score=grading["score"], maxScore=grading["maxScore"])
        remaining = req.remaining_seconds if req.remaining_seconds is not None else attempt["remaining_seconds"]
        elapsed_seconds = max(attempt["duration_seconds"] - min(remaining, attempt["duration_seconds"]), 0)
        if exam["grading_policy"] == "legacy_equal":
            elapsed_seconds = max(exam["duration_seconds"] - (req.remaining_seconds or 0), 0)
        snapshot = {"elapsedLearningSeconds": elapsed_seconds, "schemaVersion": 1, "examType": exam_type, "grading": grading, "result": result_payload}

        with conn.cursor(row_factory=dict_row) as cur:
            for row in grading["subjects"]:
                subject_percent = row["score_percent"]
                is_failed_cutoff = row["is_failed_cutoff"]
                cur.execute(
                    """
                    INSERT INTO exam.exam_attempt_subject_results (
                        attempt_id,
                        subject_id,
                        question_count,
                        correct_count,
                        score_percent,
                        is_failed_cutoff,
                        grading_snapshot
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb)
                    ON CONFLICT (attempt_id, subject_id)
                    DO UPDATE SET
                        question_count = EXCLUDED.question_count,
                        correct_count = EXCLUDED.correct_count,
                        score_percent = EXCLUDED.score_percent,
                        is_failed_cutoff = EXCLUDED.is_failed_cutoff,
                        grading_snapshot = EXCLUDED.grading_snapshot
                    """,
                    (
                        attempt["id"],
                        row["subject_id"],
                        row["question_count"],
                        row["correct_count"],
                        subject_percent,
                        is_failed_cutoff,
                        json.dumps(row),
                    ),
                )

                cur.execute(
                    """
                    INSERT INTO dashboard.user_subject_stats (
                        user_id,
                        subject_id,
                        solved_count,
                        correct_count,
                        accuracy_rate
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (user_id, subject_id)
                    DO UPDATE SET
                        solved_count = dashboard.user_subject_stats.solved_count + EXCLUDED.solved_count,
                        correct_count = dashboard.user_subject_stats.correct_count + EXCLUDED.correct_count,
                        accuracy_rate = ROUND(
                            (
                                (dashboard.user_subject_stats.correct_count + EXCLUDED.correct_count)::numeric
                                / NULLIF((dashboard.user_subject_stats.solved_count + EXCLUDED.solved_count), 0)
                            ) * 100,
                            2
                        )
                    """,
                    (
                        current_user["user_id"],
                        row["subject_id"],
                        row["question_count"],
                        row["correct_count"],
                        row["accuracy_rate"],
                    ),
                )

            cur.execute(
                """
                INSERT INTO exam.exam_attempt_results (
                    attempt_id,
                    total_question_count,
                    correct_count,
                    score_percent,
                    passed,
                    failed_by_subject_cutoff,
                    grading_snapshot
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb)
                ON CONFLICT (attempt_id)
                DO UPDATE SET
                    total_question_count = EXCLUDED.total_question_count,
                    correct_count = EXCLUDED.correct_count,
                    score_percent = EXCLUDED.score_percent,
                    passed = EXCLUDED.passed,
                    failed_by_subject_cutoff = EXCLUDED.failed_by_subject_cutoff,
                    grading_snapshot = EXCLUDED.grading_snapshot
                """,
                (
                    attempt["id"],
                    total_question_count,
                    correct_count,
                    score_percent,
                    passed,
                    failed_by_subject_cutoff,
                    json.dumps(snapshot),
                ),
            )

            cur.execute(
                """
                UPDATE exam.exam_attempts
                SET
                    status = 'submitted',
                    submitted_at = now(),
                    ended_at = now(),
                    end_reason = 'submitted',
                    remaining_seconds = COALESCE(%s, remaining_seconds),
                    current_page_no = COALESCE(%s, current_page_no),
                    exam_snapshot = %s::jsonb
                WHERE id = %s
                """,
                (
                    req.remaining_seconds,
                    req.current_page_no,
                    json.dumps({"examType": exam_type, "examCode": exam["exam_code"],
                                "durationSeconds": exam["duration_seconds"], "gradingPolicy": exam["grading_policy"]}),
                    attempt["id"],
                ),
            )

            cur.execute(
                """
                INSERT INTO dashboard.user_exam_stats (
                    user_id,
                    exam_id,
                    attempt_count,
                    best_score,
                    last_score,
                    last_attempt_at
                )
                VALUES (%s, %s, 1, %s, %s, now())
                ON CONFLICT (user_id, exam_id)
                DO UPDATE SET
                    attempt_count = dashboard.user_exam_stats.attempt_count + 1,
                    best_score = GREATEST(COALESCE(dashboard.user_exam_stats.best_score, 0), EXCLUDED.last_score),
                    last_score = EXCLUDED.last_score,
                    last_attempt_at = EXCLUDED.last_attempt_at
                """,
                (
                    current_user["user_id"],
                    exam["id"],
                    score_percent,
                    score_percent,
                ),
            )

            cur.execute(
                """
                INSERT INTO dashboard.user_stats (
                    user_id,
                    total_points,
                    total_learning_seconds,
                    total_solved_question_count,
                    total_mock_exam_attempt_count,
                    last_mock_exam_at
                )
                VALUES (%s, %s, %s, %s, 1, now())
                ON CONFLICT (user_id)
                DO UPDATE SET
                    total_points = dashboard.user_stats.total_points + EXCLUDED.total_points,
                    total_learning_seconds = dashboard.user_stats.total_learning_seconds + EXCLUDED.total_learning_seconds,
                    total_solved_question_count = dashboard.user_stats.total_solved_question_count + EXCLUDED.total_solved_question_count,
                    total_mock_exam_attempt_count = dashboard.user_stats.total_mock_exam_attempt_count + 1,
                    last_mock_exam_at = EXCLUDED.last_mock_exam_at
                RETURNING total_points
                """,
                (
                    current_user["user_id"],
                    awarded_points,
                    elapsed_seconds,
                    total_question_count,
                ),
            )
            stats_row = cur.fetchone()
            total_points = int(stats_row["total_points"] or 0) if stats_row else awarded_points

    send_amplitude_event(
        event_type="backend_exam_submit_succeeded",
        user_id=current_user["user_id"],
        event_properties={
            "exam_id": exam_id,
            "exam_type": exam_type,
            "attempt_id": attempt["id"],
            "score_percent": score_percent,
            "passed": passed,
            "correct_count": correct_count,
            "total_question_count": total_question_count,
            "failed_by_subject_cutoff": failed_by_subject_cutoff,
            "awarded_points": awarded_points,
            "total_points": total_points,
        },
        insert_id=f"exam-submit-{attempt['id']}",
    )

    return {
        "examType": exam_type,
        "attemptId": attempt["id"],
        "passed": passed,
        "failedBySubjectCutoff": failed_by_subject_cutoff,
        "scorePercent": score_percent,
        "awardedPoints": awarded_points,
        "totalPoints": total_points,
        **result_payload,
    }
