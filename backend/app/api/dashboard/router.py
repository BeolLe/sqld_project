from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.auth.router import get_current_user
from app.db.postgres import get_connection

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]

    stats = {
        "totalPoints": 0,
        "totalMockExamAttemptCount": 0,
        "totalLearningSeconds": 0,
        "totalSolvedQuestionCount": 0,
    }
    subject_stats: list[dict] = []
    recent_exam_results: list[dict] = []
    recent_sql_attempts: list[dict] = []

    with get_connection() as conn:
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

            cur.execute(
                """
                SELECT
                    us.subject_id,
                    s.name,
                    us.solved_count,
                    us.correct_count,
                    us.accuracy_rate
                FROM dashboard.user_subject_stats us
                JOIN exam.subjects s
                  ON s.id = us.subject_id
                WHERE us.user_id = %s::uuid
                ORDER BY s.display_order ASC, s.id ASC
                """,
                (user_id,),
            )
            subject_stats = [
                {
                    "subjectId": str(row[0]),
                    "subjectName": row[1],
                    "solvedCount": int(row[2] or 0),
                    "correctCount": int(row[3] or 0),
                    "accuracyRate": float(row[4] or 0),
                }
                for row in cur.fetchall()
            ]

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

    return {
        "stats": stats,
        "subjectStats": subject_stats,
        "recentExamResults": recent_exam_results,
        "recentSqlAttempts": recent_sql_attempts,
        "learningCalendar": [],
    }
