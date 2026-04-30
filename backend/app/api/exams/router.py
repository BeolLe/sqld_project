from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from psycopg.rows import dict_row

from app.api.auth.router import get_current_user
from app.db.postgres import get_connection
from app.services.amplitude import send_amplitude_event

router = APIRouter(prefix="/api/exams", tags=["exams"])


class AnswerSaveRequest(BaseModel):
    problem_id: str
    selected_answer: str
    current_page_no: int | None = None
    remaining_seconds: int | None = None


class MemoSaveRequest(BaseModel):
    content: str


class SessionSyncRequest(BaseModel):
    current_page_no: int | None = None
    remaining_seconds: int | None = None


class SubmitExamRequest(BaseModel):
    remaining_seconds: int | None = None
    current_page_no: int | None = None


def normalize_decimal(value):
    if isinstance(value, Decimal):
        return float(value)
    return value


def get_exam_code(exam_id: str) -> str:
    return f"sqld_mock_{exam_id}"


def fetch_exam(conn, exam_id: str) -> dict:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            SELECT id, exam_code, title, total_question_count, duration_seconds
            FROM exam.exams
            WHERE exam_code = %s
            """,
            (get_exam_code(exam_id),),
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


def build_result_payload(conn, attempt_id: int) -> dict:
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
                "points": question_payload.get("points", 2),
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
        query += " AND exam_type = %s"
        params.append(exam_type)

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
def get_exam_session(exam_id: str, current_user: dict = Depends(get_current_user)):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id)
        ensure_dashboard_row(conn, current_user["user_id"])
        attempt = get_or_create_attempt(conn, exam=exam, user_id=current_user["user_id"])
        answers, memo_content = load_attempt_state(conn, attempt["id"])

    return {
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
):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id)
        attempt = get_or_create_attempt(conn, exam=exam, user_id=current_user["user_id"])

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
):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id)
        attempt = get_or_create_attempt(conn, exam=exam, user_id=current_user["user_id"])

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
):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id)
        attempt = get_or_create_attempt(conn, exam=exam, user_id=current_user["user_id"])
        update_attempt_counters(
            conn,
            attempt["id"],
            current_page_no=req.current_page_no,
            remaining_seconds=req.remaining_seconds,
        )

    return {"ok": True}


@router.post("/{exam_id}/submit")
def submit_exam(
    exam_id: str,
    req: SubmitExamRequest,
    current_user: dict = Depends(get_current_user),
):
    with get_connection() as conn:
        exam = fetch_exam(conn, exam_id)
        ensure_dashboard_row(conn, current_user["user_id"])
        attempt = get_latest_attempt(conn, exam_id=exam["id"], user_id=current_user["user_id"])
        if not attempt:
            attempt = get_or_create_attempt(conn, exam=exam, user_id=current_user["user_id"])

        if attempt["status"] == "submitted":
            result_payload = build_result_payload(conn, attempt["id"])
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    """
                    SELECT passed, failed_by_subject_cutoff, score_percent
                    FROM exam.exam_attempt_results
                    WHERE attempt_id = %s
                    """,
                    (attempt["id"],),
                )
                stored_result = cur.fetchone()

            return {
                "attemptId": attempt["id"],
                "passed": bool(stored_result["passed"]) if stored_result else False,
                "failedBySubjectCutoff": bool(stored_result["failed_by_subject_cutoff"]) if stored_result else False,
                "scorePercent": float(stored_result["score_percent"]) if stored_result and stored_result["score_percent"] is not None else 0,
                **result_payload,
            }

        if req.current_page_no is not None or req.remaining_seconds is not None:
            update_attempt_counters(
                conn,
                attempt["id"],
                current_page_no=req.current_page_no,
                remaining_seconds=req.remaining_seconds,
            )

        result_payload = build_result_payload(conn, attempt["id"])
        total_question_count = exam["total_question_count"]
        correct_count = result_payload["correctCount"]
        score_percent = round((correct_count / total_question_count) * 100, 2) if total_question_count else 0

        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    q.subject_id,
                    COUNT(*) AS question_count,
                    COUNT(*) FILTER (WHERE a.selected_choice = ak.correct_answer) AS correct_count
                FROM exam.exam_questions q
                JOIN exam.answer_keys ak
                  ON ak.question_id = q.id
                LEFT JOIN exam.exam_attempt_answers a
                  ON a.question_id = q.id
                 AND a.attempt_id = %s
                WHERE q.exam_id = %s
                GROUP BY q.subject_id
                """,
                (attempt["id"], exam["id"]),
            )
            subject_rows = cur.fetchall()

            failed_by_subject_cutoff = False
            for row in subject_rows:
                subject_percent = round((row["correct_count"] / row["question_count"]) * 100, 2) if row["question_count"] else 0
                is_failed_cutoff = subject_percent < 40
                failed_by_subject_cutoff = failed_by_subject_cutoff or is_failed_cutoff
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
                        '{"source":"submit"}',
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
                        subject_percent,
                    ),
                )

            passed = score_percent >= 60 and not failed_by_subject_cutoff

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
                    '{"source":"submit"}',
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
                    '{"source":"submit"}',
                    attempt["id"],
                ),
            )

            elapsed_seconds = max(exam["duration_seconds"] - (req.remaining_seconds or 0), 0)

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
                    total_learning_seconds,
                    total_solved_question_count,
                    total_mock_exam_attempt_count,
                    last_mock_exam_at
                )
                VALUES (%s, %s, %s, 1, now())
                ON CONFLICT (user_id)
                DO UPDATE SET
                    total_learning_seconds = dashboard.user_stats.total_learning_seconds + EXCLUDED.total_learning_seconds,
                    total_solved_question_count = dashboard.user_stats.total_solved_question_count + EXCLUDED.total_solved_question_count,
                    total_mock_exam_attempt_count = dashboard.user_stats.total_mock_exam_attempt_count + 1,
                    last_mock_exam_at = EXCLUDED.last_mock_exam_at
                """,
                (
                    current_user["user_id"],
                    elapsed_seconds,
                    total_question_count,
                ),
            )

    send_amplitude_event(
        event_type="backend_exam_submit_succeeded",
        user_id=current_user["user_id"],
        event_properties={
            "exam_id": exam_id,
            "attempt_id": attempt["id"],
            "score_percent": score_percent,
            "passed": passed,
            "correct_count": correct_count,
            "total_question_count": total_question_count,
            "failed_by_subject_cutoff": failed_by_subject_cutoff,
        },
        insert_id=f"exam-submit-{attempt['id']}",
    )

    return {
        "attemptId": attempt["id"],
        "passed": passed,
        "failedBySubjectCutoff": failed_by_subject_cutoff,
        "scorePercent": score_percent,
        **result_payload,
    }
