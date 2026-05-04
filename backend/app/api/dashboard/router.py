from __future__ import annotations

from threading import Lock
from time import monotonic

from fastapi import APIRouter, Depends

from app.api.auth.router import get_current_user
from app.core.config import settings
from app.db.postgres import get_connection

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
_cache_lock = Lock()
_summary_cache: dict[str, tuple[float, dict]] = {}


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


def fetch_subject_stats_by_mode(cur, user_id: str) -> dict[str, list[dict]]:
    cur.execute(
        """
        WITH exam_answered AS (
            SELECT
                COALESCE(NULLIF(q.question_payload->>'category', ''), '미분류') AS category,
                aaa.selected_choice = ak.correct_answer AS is_correct
            FROM exam.exam_attempt_answers aaa
            JOIN exam.exam_attempts aa
              ON aa.id = aaa.attempt_id
            JOIN exam.exam_questions q
              ON q.id = aaa.question_id
            JOIN exam.answer_keys ak
              ON ak.question_id = q.id
            WHERE aa.user_id = %s::uuid
        ),
        endless_answered AS (
            SELECT
                COALESCE(NULLIF(category, ''), '미분류') AS category,
                is_correct
            FROM logs.endless_answers
            WHERE user_id = %s::uuid
        ),
        combined AS (
            SELECT 'exam'::text AS source_type, category, is_correct
            FROM exam_answered
            UNION ALL
            SELECT 'endless'::text AS source_type, category, is_correct
            FROM endless_answered
        ),
        aggregated AS (
            SELECT
                CASE
                    WHEN GROUPING(source_type) = 1 THEN 'all'
                    ELSE source_type
                END AS stat_type,
                category,
                COUNT(*) AS solved_count,
                COUNT(*) FILTER (WHERE is_correct) AS correct_count,
                ROUND(
                    COUNT(*) FILTER (WHERE is_correct)::numeric
                    / NULLIF(COUNT(*), 0) * 100,
                    2
                ) AS accuracy_rate
            FROM combined
            GROUP BY GROUPING SETS (
                (source_type, category),
                (category)
            )
        )
        SELECT
            stat_type,
            category,
            solved_count,
            correct_count,
            accuracy_rate
        FROM aggregated
        ORDER BY
            stat_type ASC,
            solved_count DESC,
            category ASC
        """,
        (user_id, user_id),
    )
    rows = cur.fetchall()

    stats_by_mode = {
        "all": [],
        "exam": [],
        "endless": [],
    }
    for row in rows:
        stat_type = row[0]
        if stat_type not in stats_by_mode:
            continue
        stats_by_mode[stat_type].append(
            {
                "subjectId": row[1],
                "subjectName": row[1],
                "solvedCount": int(row[2] or 0),
                "correctCount": int(row[3] or 0),
                "accuracyRate": float(row[4] or 0),
            }
        )

    return stats_by_mode


@router.get("/summary")
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    now = monotonic()
    ttl = settings.DASHBOARD_SUMMARY_CACHE_TTL_SECONDS

    with _cache_lock:
        cached = _summary_cache.get(user_id)
        if cached and now - cached[0] < ttl:
            return cached[1]

    stats = {
        "totalPoints": 0,
        "totalMockExamAttemptCount": 0,
        "totalLearningSeconds": 0,
        "totalSolvedQuestionCount": 0,
    }
    subject_stats = {
        "all": [],
        "exam": [],
        "endless": [],
    }
    recent_exam_results: list[dict] = []
    recent_sql_attempts: list[dict] = []
    learning_calendar: list[dict] = []

    with get_connection() as conn:
        ensure_endless_answers_table(conn)
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    COALESCE(total_points, 0),
                    COALESCE(total_mock_exam_attempt_count, 0),
                    COALESCE(total_learning_seconds, 0),
                    COALESCE(total_solved_question_count, 0)
                FROM dashboard.user_stats
                WHERE user_id = %s::uuid
                """,
                (user_id,),
            )
            row = cur.fetchone()
            if row:
                stats = {
                    "totalPoints": int(row[0] or 0),
                    "totalMockExamAttemptCount": int(row[1] or 0),
                    "totalLearningSeconds": int(row[2] or 0),
                    "totalSolvedQuestionCount": int(row[3] or 0),
                }

            subject_stats = fetch_subject_stats_by_mode(cur, user_id)

            cur.execute(
                """
                SELECT
                    ues.exam_id,
                    e.title,
                    ues.attempt_count,
                    COALESCE(ues.last_score, 0),
                    COALESCE(ear.passed, false),
                    COALESCE(ea.submitted_at, ues.last_attempt_at)
                FROM dashboard.user_exam_stats ues
                JOIN exam.exams e
                  ON e.id = ues.exam_id
                LEFT JOIN LATERAL (
                    SELECT
                        ea.id,
                        ea.submitted_at
                    FROM exam.exam_attempts ea
                    WHERE ea.user_id = %s::uuid
                      AND ea.exam_id = ues.exam_id
                      AND ea.submitted_at IS NOT NULL
                    ORDER BY ea.submitted_at DESC, ea.id DESC
                    LIMIT 1
                ) ea ON true
                LEFT JOIN exam.exam_attempt_results ear
                  ON ear.attempt_id = ea.id
                WHERE ues.user_id = %s::uuid
                ORDER BY COALESCE(ea.submitted_at, ues.last_attempt_at) DESC NULLS LAST, ues.id DESC
                LIMIT 5
                """,
                (user_id, user_id),
            )
            recent_exam_results = [
                {
                    "examId": str(row[0]),
                    "examTitle": row[1],
                    "attemptNo": int(row[2] or 0),
                    "scorePercent": float(row[3] or 0),
                    "passed": bool(row[4]),
                    "submittedAt": row[5].isoformat() if row[5] else None,
                }
                for row in cur.fetchall()
                if row[5] is not None
            ]

            cur.execute(
                """
                SELECT
                    spa.practice_id,
                    sp.title,
                    COALESCE(spa.is_correct, false),
                    COALESCE(spa.submitted_at, spa.completed_at, spa.last_saved_at, spa.created_at)
                FROM practice.sql_practice_attempts spa
                JOIN practice.sql_practices sp
                  ON sp.id = spa.practice_id
                WHERE spa.user_id = %s::uuid
                ORDER BY COALESCE(spa.submitted_at, spa.completed_at, spa.last_saved_at, spa.created_at) DESC,
                         spa.id DESC
                LIMIT 5
                """,
                (user_id,),
            )
            recent_sql_attempts = [
                {
                    "practiceId": str(row[0]),
                    "title": row[1],
                    "isCorrect": bool(row[2]),
                    "submittedAt": row[3].isoformat() if row[3] else None,
                }
                for row in cur.fetchall()
                if row[3] is not None
            ]

            cur.execute(
                """
                WITH learning_events AS (
                    SELECT
                        timezone('Asia/Seoul', COALESCE(spa.submitted_at, spa.completed_at, spa.last_saved_at, spa.created_at))::date AS learning_date
                    FROM practice.sql_practice_attempts spa
                    WHERE spa.user_id = %s::uuid
                      AND COALESCE(spa.submitted_at, spa.completed_at, spa.last_saved_at, spa.created_at) IS NOT NULL

                    UNION ALL

                    SELECT
                        timezone('Asia/Seoul', COALESCE(ea.submitted_at, ea.last_saved_at, ea.started_at, ea.created_at))::date AS learning_date
                    FROM exam.exam_attempts ea
                    WHERE ea.user_id = %s::uuid
                      AND COALESCE(ea.submitted_at, ea.last_saved_at, ea.started_at, ea.created_at) IS NOT NULL

                    UNION ALL

                    SELECT
                        timezone('Asia/Seoul', lea.answered_at)::date AS learning_date
                    FROM logs.endless_answers lea
                    WHERE lea.user_id = %s::uuid
                      AND lea.answered_at IS NOT NULL
                )
                SELECT
                    learning_date::text,
                    COUNT(*)::int AS event_count
                FROM learning_events
                WHERE learning_date >= timezone('Asia/Seoul', now())::date - INTERVAL '83 days'
                GROUP BY learning_date
                ORDER BY learning_date ASC
                """,
                (user_id, user_id, user_id),
            )
            learning_calendar = [
                {
                    "date": row[0],
                    "eventCount": int(row[1] or 0),
                }
                for row in cur.fetchall()
            ]

    response = {
        "stats": stats,
        "subjectStats": subject_stats,
        "recentExamResults": recent_exam_results,
        "recentSqlAttempts": recent_sql_attempts,
        "learningCalendar": learning_calendar,
    }

    with _cache_lock:
        _summary_cache[user_id] = (now, response)

    return response
