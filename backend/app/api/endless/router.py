from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from psycopg.rows import dict_row

from app.api.auth.router import get_current_user
from app.api.exams.router import lock_user_progress
from app.core.exam_scope import ExamType
from app.db.exam_scope import require_exam_schema, scope_filter, scope_params, unavailable
from app.db.logs import insert_learning_event
from app.db.postgres import get_connection
from app.services.amplitude import send_amplitude_event

router = APIRouter(prefix="/api/endless", tags=["endless"])


class EndlessAnswerRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    request_id: UUID | None = Field(default=None, alias="requestId")
    problem_id: str
    selected_answer: str
    category: str | None = None
    difficulty: str | None = None


def has_endless_answers_table(conn) -> bool:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute("SELECT to_regclass('logs.endless_answers') AS reg")
        row = cur.fetchone()
    return bool(row and row["reg"])


def fetch_endless_question(conn, problem_id: str, exam_type: ExamType = "sqld", *, scoped: bool | None = None) -> dict | None:
    if scoped is None:
        scoped = require_exam_schema(conn, exam_type)
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            f"""
            SELECT
                p.source_problem_id AS question_id,
                {"c.exam_type" if scoped else "'sqld' AS exam_type"},
                p.difficulty,
                c.category_name AS category,
                ak.correct_answer
            FROM endless.problems p
            JOIN endless.problem_categories c
              ON c.category_id = p.category_id
            JOIN endless.problem_answer_keys ak
              ON ak.problem_id = p.problem_id
            WHERE p.source_problem_id = %s {scope_filter(scoped, "c")}
              AND p.is_active = TRUE
            LIMIT 1
            """,
            (problem_id,) + scope_params(scoped, exam_type),
        )
        return cur.fetchone()


def list_endless_problems(conn, exam_type: ExamType = "sqld", *, scoped: bool | None = None) -> list[dict]:
    if scoped is None:
        scoped = require_exam_schema(conn, exam_type)
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            f"""
            SELECT
                p.source_problem_id,
                COALESCE(NULLIF(p.title, ''), '') AS title,
                p.description,
                p.difficulty,
                c.category_name,
                p.correct_rate,
                p.explanation,
                p.points,
                ak.correct_answer,
                ARRAY_AGG(pc.choice_text ORDER BY pc.choice_no) AS options
            FROM endless.problems p
            JOIN endless.problem_categories c
              ON c.category_id = p.category_id
            JOIN endless.problem_answer_keys ak
              ON ak.problem_id = p.problem_id
            JOIN endless.problem_choices pc
              ON pc.problem_id = p.problem_id
            WHERE p.is_active = TRUE {scope_filter(scoped, "c")}
            GROUP BY
                p.problem_id,
                p.source_problem_id,
                p.title,
                p.description,
                p.difficulty,
                c.category_name,
                p.correct_rate,
                p.explanation,
                p.points,
                ak.correct_answer
            ORDER BY p.source_problem_id
            """,
            scope_params(scoped, exam_type),
        )
        rows = cur.fetchall()

    return [
        {
            "id": row["source_problem_id"],
            "title": row["title"],
            "description": row["description"],
            "type": "multiple_choice",
            "difficulty": row["difficulty"],
            "category": row["category_name"],
            "correctRate": float(row["correct_rate"] or 0),
            "answer": str(row["correct_answer"]),
            "explanation": row["explanation"] or "",
            "options": list(row["options"] or []),
            "points": int(row["points"] or 1),
        }
        for row in rows
    ]


def fetch_user_total_points(conn, user_id: str) -> int:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            f"""
            SELECT total_points
            FROM dashboard.user_stats
            WHERE user_id = %s::uuid
            """,
            (user_id,),
        )
        row = cur.fetchone()
    return int(row["total_points"] or 0) if row else 0


def empty_stats_payload() -> dict:
    return {
        "totalAnswered": 0,
        "totalCorrect": 0,
        "correctRate": 0.0,
        "byCategory": {},
        "byDifficulty": {},
    }


def build_stats_payload(conn, user_id: str, exam_type: ExamType = "sqld", *, scoped: bool | None = None) -> dict:
    if scoped is None:
        scoped = require_exam_schema(conn, exam_type)
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            f"""
            SELECT
                COUNT(*) AS total_answered,
                COUNT(*) FILTER (WHERE is_correct) AS total_correct
            FROM logs.endless_answers
            WHERE user_id = %s::uuid {scope_filter(scoped)} {"AND statistics_cleared_at IS NULL" if scoped else ""}
            """,
            (user_id,) + scope_params(scoped, exam_type),
        )
        summary = cur.fetchone() or {"total_answered": 0, "total_correct": 0}

        cur.execute(
            f"""
            SELECT
                COALESCE(category, '미분류') AS category,
                COUNT(*) AS answered,
                COUNT(*) FILTER (WHERE is_correct) AS correct
            FROM logs.endless_answers
            WHERE user_id = %s::uuid {scope_filter(scoped)} {"AND statistics_cleared_at IS NULL" if scoped else ""}
            GROUP BY COALESCE(category, '미분류')
            ORDER BY COALESCE(category, '미분류')
            """,
            (user_id,) + scope_params(scoped, exam_type),
        )
        category_rows = cur.fetchall()

        cur.execute(
            f"""
            SELECT
                COALESCE(difficulty, 'unknown') AS difficulty,
                COUNT(*) AS answered,
                COUNT(*) FILTER (WHERE is_correct) AS correct
            FROM logs.endless_answers
            WHERE user_id = %s::uuid {scope_filter(scoped)} {"AND statistics_cleared_at IS NULL" if scoped else ""}
            GROUP BY COALESCE(difficulty, 'unknown')
            ORDER BY COALESCE(difficulty, 'unknown')
            """,
            (user_id,) + scope_params(scoped, exam_type),
        )
        difficulty_rows = cur.fetchall()

    total_answered = int(summary["total_answered"] or 0)
    total_correct = int(summary["total_correct"] or 0)
    correct_rate = round((total_correct / total_answered) * 100, 1) if total_answered else 0.0

    by_category: dict[str, dict] = {}
    for row in category_rows:
        answered = int(row["answered"] or 0)
        correct = int(row["correct"] or 0)
        by_category[str(row["category"])] = {
            "answered": answered,
            "correct": correct,
            "rate": round((correct / answered) * 100, 1) if answered else 0.0,
        }

    by_difficulty: dict[str, dict] = {}
    for row in difficulty_rows:
        answered = int(row["answered"] or 0)
        correct = int(row["correct"] or 0)
        by_difficulty[str(row["difficulty"])] = {
            "answered": answered,
            "correct": correct,
            "rate": round((correct / answered) * 100, 1) if answered else 0.0,
        }

    return {
        "totalAnswered": total_answered,
        "totalCorrect": total_correct,
        "correctRate": correct_rate,
        "byCategory": by_category,
        "byDifficulty": by_difficulty,
    }


@router.post("/answer")
def save_endless_answer(
    req: EndlessAnswerRequest,
    current_user: dict = Depends(get_current_user),
    exam_type: ExamType = "sqld",
):
    with get_connection() as conn:
        scoped = require_exam_schema(conn, exam_type)
        if not has_endless_answers_table(conn):
            raise HTTPException(status_code=503, detail="endless answers table not ready")
        if exam_type == "adsp" and req.request_id is None:
            raise HTTPException(status_code=422, detail="requestId is required for ADsP answers")
        if req.request_id is not None and not scoped:
            unavailable("schema_upgrade_required", "요청 중복 방지 기능은 DB 변경 후 사용할 수 있습니다.")
        lock_user_progress(conn, current_user["user_id"])
        if req.request_id is not None:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    "SELECT id, problem_id, selected_answer, is_correct, exam_type FROM logs.endless_answers "
                    "WHERE user_id = %s::uuid AND request_id = %s::uuid",
                    (current_user["user_id"], str(req.request_id)),
                )
                previous = cur.fetchone()
            if previous:
                if (previous["exam_type"], previous["problem_id"], previous["selected_answer"]) != (exam_type, req.problem_id, req.selected_answer):
                    raise HTTPException(status_code=409, detail="requestId already used for a different answer")
                return {**build_stats_payload(conn, current_user["user_id"], exam_type, scoped=scoped),
                        "answerId": previous["id"], "isCorrect": previous["is_correct"],
                        "awardedPoints": 0, "totalPoints": fetch_user_total_points(conn, current_user["user_id"])}

        question = fetch_endless_question(conn, req.problem_id, exam_type, scoped=scoped)
        if not question:
            raise HTTPException(status_code=404, detail="question not found")

        is_correct = req.selected_answer == question["correct_answer"]
        category = question["category"] or req.category or "미분류"
        difficulty = question["difficulty"] or req.difficulty or "unknown"
        awarded_points = 1 if is_correct else 0

        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                f"""
                INSERT INTO logs.endless_answers (
                    user_id,
                    problem_id,
                    selected_answer,
                    is_correct,
                    category,
                    difficulty {", exam_type, request_id" if scoped else ""}
                )
                VALUES (%s::uuid, %s, %s, %s, %s, %s {", %s, %s::uuid" if scoped else ""})
                RETURNING id
                """,
                (
                    current_user["user_id"],
                    req.problem_id,
                    req.selected_answer,
                    is_correct,
                    category,
                    difficulty,
                ) + ((question["exam_type"], str(req.request_id) if req.request_id else None) if scoped else ()),
            )
            answer_id = cur.fetchone()["id"]
            cur.execute(
                f"""
                INSERT INTO dashboard.user_stats (
                    user_id,
                    total_points,
                    total_solved_question_count
                )
                VALUES (%s::uuid, %s, 1)
                ON CONFLICT (user_id) DO UPDATE
                SET total_points = dashboard.user_stats.total_points + EXCLUDED.total_points,
                    total_solved_question_count = dashboard.user_stats.total_solved_question_count + 1
                RETURNING total_points
                """,
                (current_user["user_id"], awarded_points),
            )
            row = cur.fetchone()
            total_points = int(row["total_points"] or 0) if row else awarded_points

        stats = build_stats_payload(conn, current_user["user_id"], exam_type, scoped=scoped)

    insert_learning_event(
        event_type="endless_answer_submitted",
        content_type="exam_question",
        content_id=req.problem_id,
        user_id=current_user["user_id"],
        is_correct=is_correct,
        metadata={
            "mode": "endless",
            "exam_type": exam_type,
            "category": category,
            "difficulty": difficulty,
            "awarded_points": awarded_points,
        },
    )

    send_amplitude_event(
        event_type="backend_endless_answer_saved",
        user_id=current_user["user_id"],
        event_properties={
            "mode": "endless",
            "exam_type": exam_type,
            "problem_id": req.problem_id,
            "selected_answer": req.selected_answer,
            "is_correct": is_correct,
            "category": category,
            "difficulty": difficulty,
            "awarded_points": awarded_points,
            "total_points": total_points,
        },
    )

    return {
        **stats,
        "answerId": answer_id,
        "isCorrect": is_correct,
        "awardedPoints": awarded_points,
        "totalPoints": total_points,
    }


@router.get("/problems")
def get_endless_problems(current_user: dict = Depends(get_current_user), exam_type: ExamType = "sqld"):
    _ = current_user
    with get_connection() as conn:
        scoped = require_exam_schema(conn, exam_type)
        return list_endless_problems(conn, exam_type, scoped=scoped)


@router.get("/stats")
def get_endless_stats(current_user: dict = Depends(get_current_user), exam_type: ExamType = "sqld"):
    with get_connection() as conn:
        scoped = require_exam_schema(conn, exam_type)
        stats = (
            build_stats_payload(conn, current_user["user_id"], exam_type, scoped=scoped)
            if has_endless_answers_table(conn)
            else empty_stats_payload()
        )
        total_points = fetch_user_total_points(conn, current_user["user_id"])

    return {
        **stats,
        "totalPoints": total_points,
    }


@router.delete("/stats")
def reset_endless_stats(current_user: dict = Depends(get_current_user), exam_type: ExamType = "sqld"):
    with get_connection() as conn:
        scoped = require_exam_schema(conn, exam_type)
        lock_user_progress(conn, current_user["user_id"])
        if has_endless_answers_table(conn):
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    {"UPDATE logs.endless_answers SET statistics_cleared_at = now()" if scoped else "DELETE FROM logs.endless_answers"}
                    WHERE user_id = %s::uuid {scope_filter(scoped)} {"AND statistics_cleared_at IS NULL" if scoped else ""}
                    """,
                    (current_user["user_id"],) + scope_params(scoped, exam_type),
                )
        total_points = fetch_user_total_points(conn, current_user["user_id"])

    return {
        **empty_stats_payload(),
        "totalPoints": total_points,
    }
