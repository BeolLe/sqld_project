from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from psycopg.rows import dict_row

from app.api.auth.router import get_current_user
from app.api.exams.router import ensure_dashboard_row
from app.db.logs import insert_learning_event
from app.db.postgres import get_connection
from app.services.amplitude import send_amplitude_event

router = APIRouter(prefix="/api/endless", tags=["endless"])


class EndlessAnswerRequest(BaseModel):
    problem_id: str
    selected_answer: str
    category: str | None = None
    difficulty: str | None = None
def ensure_endless_answers_table(conn) -> None:
    with conn.cursor() as cur:
        cur.execute("CREATE SCHEMA IF NOT EXISTS logs")
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS logs.endless_answers (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES auth.users(user_id),
                problem_id VARCHAR(64) NOT NULL,
                selected_answer VARCHAR(5) NOT NULL,
                is_correct BOOLEAN NOT NULL,
                category VARCHAR(50),
                difficulty VARCHAR(20),
                answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_endless_answers_user_id
            ON logs.endless_answers (user_id)
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_endless_answers_answered_at
            ON logs.endless_answers (answered_at)
            """
        )


def fetch_endless_question(conn, problem_id: str) -> dict | None:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            SELECT
                q.id AS question_id,
                q.difficulty,
                q.question_payload->>'category' AS category,
                ak.correct_answer
            FROM exam.exam_questions q
            JOIN exam.answer_keys ak
              ON ak.question_id = q.id
            WHERE q.question_payload->>'source_id' = %s
            LIMIT 1
            """,
            (problem_id,),
        )
        return cur.fetchone()


def fetch_user_total_points(conn, user_id: str) -> int:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            SELECT total_points
            FROM dashboard.user_stats
            WHERE user_id = %s::uuid
            """,
            (user_id,),
        )
        row = cur.fetchone()
    return int(row["total_points"] or 0) if row else 0


def build_stats_payload(conn, user_id: str) -> dict:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            SELECT
                COUNT(*) AS total_answered,
                COUNT(*) FILTER (WHERE is_correct) AS total_correct
            FROM logs.endless_answers
            WHERE user_id = %s::uuid
            """,
            (user_id,),
        )
        summary = cur.fetchone() or {"total_answered": 0, "total_correct": 0}

        cur.execute(
            """
            SELECT
                COALESCE(category, '미분류') AS category,
                COUNT(*) AS answered,
                COUNT(*) FILTER (WHERE is_correct) AS correct
            FROM logs.endless_answers
            WHERE user_id = %s::uuid
            GROUP BY COALESCE(category, '미분류')
            ORDER BY COALESCE(category, '미분류')
            """,
            (user_id,),
        )
        category_rows = cur.fetchall()

        cur.execute(
            """
            SELECT
                COALESCE(difficulty, 'unknown') AS difficulty,
                COUNT(*) AS answered,
                COUNT(*) FILTER (WHERE is_correct) AS correct
            FROM logs.endless_answers
            WHERE user_id = %s::uuid
            GROUP BY COALESCE(difficulty, 'unknown')
            ORDER BY COALESCE(difficulty, 'unknown')
            """,
            (user_id,),
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
):
    with get_connection() as conn:
        ensure_endless_answers_table(conn)
        ensure_dashboard_row(conn, current_user["user_id"])

        question = fetch_endless_question(conn, req.problem_id)
        if not question:
            raise HTTPException(status_code=404, detail="question not found")

        is_correct = req.selected_answer == question["correct_answer"]
        category = question["category"] or req.category or "미분류"
        difficulty = question["difficulty"] or req.difficulty or "unknown"
        awarded_points = 1 if is_correct else 0

        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO logs.endless_answers (
                    user_id,
                    problem_id,
                    selected_answer,
                    is_correct,
                    category,
                    difficulty
                )
                VALUES (%s::uuid, %s, %s, %s, %s, %s)
                """,
                (
                    current_user["user_id"],
                    req.problem_id,
                    req.selected_answer,
                    is_correct,
                    category,
                    difficulty,
                ),
            )
            cur.execute(
                """
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

        stats = build_stats_payload(conn, current_user["user_id"])

    insert_learning_event(
        event_type="endless_answer_submitted",
        content_type="exam_question",
        content_id=req.problem_id,
        user_id=current_user["user_id"],
        is_correct=is_correct,
        metadata={
            "mode": "endless",
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
        "isCorrect": is_correct,
        "awardedPoints": awarded_points,
        "totalPoints": total_points,
    }


@router.get("/stats")
def get_endless_stats(current_user: dict = Depends(get_current_user)):
    with get_connection() as conn:
        ensure_endless_answers_table(conn)
        stats = build_stats_payload(conn, current_user["user_id"])
        total_points = fetch_user_total_points(conn, current_user["user_id"])

    return {
        **stats,
        "totalPoints": total_points,
    }


@router.delete("/stats")
def reset_endless_stats(current_user: dict = Depends(get_current_user)):
    with get_connection() as conn:
        ensure_endless_answers_table(conn)
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM logs.endless_answers
                WHERE user_id = %s::uuid
                """,
                (current_user["user_id"],),
            )
        total_points = fetch_user_total_points(conn, current_user["user_id"])

    return {
        "totalAnswered": 0,
        "totalCorrect": 0,
        "correctRate": 0.0,
        "byCategory": {},
        "byDifficulty": {},
        "totalPoints": total_points,
    }
