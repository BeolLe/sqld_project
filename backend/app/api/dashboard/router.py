from __future__ import annotations

from copy import deepcopy
from threading import Lock
from time import monotonic

from fastapi import APIRouter, Depends
from app.core.exam_scope import ExamType
from app.db.exam_scope import require_exam_schema, scope_filter, scope_params

from app.api.auth.router import get_current_user
from app.core.config import settings
from app.db.postgres import get_connection

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
_cache_lock = Lock()
_summary_cache: dict[tuple[str, str, bool], tuple[float, dict]] = {}


def has_endless_answers_table(cur) -> bool:
    cur.execute("SELECT to_regclass('logs.endless_answers')")
    return cur.fetchone()[0] is not None


def fetch_subject_stats_by_mode(cur, user_id: str, include_endless: bool, exam_type: ExamType = "sqld", *, scoped: bool = True) -> dict[str, list[dict]]:
    if include_endless:
        cur.execute(
            f"""
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
                  {"AND EXISTS (SELECT 1 FROM exam.exams e WHERE e.id = aa.exam_id AND e.exam_type = %s)" if scoped else ""}
            ),
            endless_answered AS (
                SELECT
                    COALESCE(NULLIF(category, ''), '미분류') AS category,
                    is_correct
                FROM logs.endless_answers
                WHERE user_id = %s::uuid {scope_filter(scoped)} {"AND statistics_cleared_at IS NULL" if scoped else ""}
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
            (user_id,) + scope_params(scoped, exam_type) + (user_id,) + scope_params(scoped, exam_type),
        )
    else:
        cur.execute(
            f"""
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
                  {"AND EXISTS (SELECT 1 FROM exam.exams e WHERE e.id = aa.exam_id AND e.exam_type = %s)" if scoped else ""}
            )
            SELECT
                'all'::text AS stat_type,
                category,
                COUNT(*) AS solved_count,
                COUNT(*) FILTER (WHERE is_correct) AS correct_count,
                ROUND(
                    COUNT(*) FILTER (WHERE is_correct)::numeric
                    / NULLIF(COUNT(*), 0) * 100,
                    2
                ) AS accuracy_rate
            FROM exam_answered
            GROUP BY category

            UNION ALL

            SELECT
                'exam'::text AS stat_type,
                category,
                COUNT(*) AS solved_count,
                COUNT(*) FILTER (WHERE is_correct) AS correct_count,
                ROUND(
                    COUNT(*) FILTER (WHERE is_correct)::numeric
                    / NULLIF(COUNT(*), 0) * 100,
                    2
                ) AS accuracy_rate
            FROM exam_answered
            GROUP BY category

            ORDER BY
                stat_type ASC,
                solved_count DESC,
                category ASC
            """,
            (user_id,) + scope_params(scoped, exam_type),
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



def scoped_counters(cur, user_id: str, exam_type: ExamType, include_endless: bool, *, scoped: bool = True):
    """Keep historical SQLD counters (including deleted old logs) exactly intact.

    The migration predates any ADsP writes. Shared lifetime counters continue to
    receive both exams; ADsP contributions are recoverable from immutable new
    submission snapshots and retained endless rows. SQLD = lifetime - ADsP.
    """
    if not scoped:
        cur.execute("SELECT total_points, total_mock_exam_attempt_count, total_learning_seconds, total_solved_question_count "
                    "FROM dashboard.user_stats WHERE user_id = %s::uuid", (user_id,))
        totals = cur.fetchone() or (0, 0, 0, 0)
        return dict(zip(("totalPoints", "totalMockExamAttemptCount", "totalLearningSeconds", "totalSolvedQuestionCount"),
                        (int(value or 0) for value in totals)))
    # One SQL statement gives totals and contributions the same MVCC snapshot.
    endless_sql = "SELECT COUNT(*) FROM logs.endless_answers WHERE user_id = %(user_id)s::uuid AND exam_type = 'adsp'" if include_endless else "SELECT 0"
    cur.execute(
        f"""
        WITH adsp AS (
            SELECT COUNT(*) AS attempts,
                   COALESCE(SUM((r.grading_snapshot->>'elapsedLearningSeconds')::bigint), 0) AS seconds,
                   COALESCE(SUM(r.total_question_count), 0) AS solved,
                   COUNT(*) FILTER (WHERE (r.grading_snapshot ? 'elapsedLearningSeconds') IS NOT TRUE) AS incomplete
            FROM exam.exam_attempts a
            JOIN exam.exams e ON e.id = a.exam_id
            JOIN exam.exam_attempt_results r ON r.attempt_id = a.id
            WHERE a.user_id = %(user_id)s::uuid AND e.exam_type = 'adsp' AND a.status = 'submitted'
        )
        SELECT COALESCE(s.total_points, 0), COALESCE(s.total_mock_exam_attempt_count, 0),
               COALESCE(s.total_learning_seconds, 0), COALESCE(s.total_solved_question_count, 0),
               adsp.attempts, adsp.seconds, adsp.solved + ({endless_sql}), adsp.incomplete
        FROM adsp LEFT JOIN dashboard.user_stats s ON s.user_id = %(user_id)s::uuid
        """, {"user_id": user_id},
    )
    row = cur.fetchone()
    if row[7]:
        raise ValueError('ADsP results are missing contribution snapshots; reconcile before serving')
    totals, adsp = row[:4], row[4:7]
    counters = adsp if exam_type == 'adsp' else [int(totals[i + 1] or 0) - int(adsp[i] or 0) for i in range(3)]
    if any(n < 0 for n in counters):
        raise ValueError('exam counters exceed shared lifetime totals; reconcile before serving')
    return {"totalPoints": int(totals[0] or 0), "totalMockExamAttemptCount": int(counters[0]),
            "totalLearningSeconds": int(counters[1]), "totalSolvedQuestionCount": int(counters[2])}


@router.get("/summary")
def get_dashboard_summary(current_user: dict = Depends(get_current_user), exam_type: ExamType = "sqld"):
    user_id = current_user["user_id"]
    with get_connection() as conn:
        scoped = require_exam_schema(conn, exam_type)
    cache_key = (user_id, exam_type, scoped)
    now = monotonic()
    ttl = settings.DASHBOARD_SUMMARY_CACHE_TTL_SECONDS

    with _cache_lock:
        cached = _summary_cache.get(cache_key)
        response = deepcopy(cached[1]) if cached and now - cached[0] < ttl else None
    if response is not None:
        # Neither connection-pool waits nor SQL may hold the process-wide cache lock.
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT total_points FROM dashboard.user_stats WHERE user_id = %s::uuid", (user_id,))
                balance = cur.fetchone()
        response["stats"]["totalPoints"] = int(balance[0] or 0) if balance else 0
        return response

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
        with conn.cursor() as cur:
            include_endless = has_endless_answers_table(cur)
            stats = scoped_counters(cur, user_id, exam_type, include_endless, scoped=scoped)

            code_prefix = "e.exam_type || '_mock_'" if scoped else "'sqld_mock_'"
            subject_stats = fetch_subject_stats_by_mode(cur, user_id, include_endless, exam_type, scoped=scoped)

            cur.execute(
                f"""
                SELECT
                    replace(e.exam_code, {code_prefix}, '') AS exam_url_id,
                    e.title,
                    ea.id AS attempt_id,
                    ea.attempt_no,
                    COALESCE(ear.score_percent, 0),
                    COALESCE(ear.passed, false),
                    ea.submitted_at
                FROM exam.exam_attempts ea
                JOIN exam.exams e
                  ON e.id = ea.exam_id
                LEFT JOIN exam.exam_attempt_results ear
                  ON ear.attempt_id = ea.id
                WHERE ea.user_id = %s::uuid {scope_filter(scoped, "e")}
                  AND ea.submitted_at IS NOT NULL
                ORDER BY ea.submitted_at DESC, ea.id DESC
                LIMIT 5
                """,
                (user_id,) + scope_params(scoped, exam_type),
            )
            recent_exam_results = [
                {
                    "examId": str(row[0]),
                    "examTitle": row[1],
                    "attemptId": int(row[2]),
                    "attemptNo": int(row[3] or 0),
                    "scorePercent": float(row[4] or 0),
                    "passed": bool(row[5]),
                    "submittedAt": row[6].isoformat() if row[6] else None,
                }
                for row in cur.fetchall()
                if row[6] is not None
            ]

            cur.execute(
                f"""
                SELECT
                    spa.id AS attempt_id,
                    sp.practice_code,
                    sp.title,
                    COALESCE(spa.is_correct, false),
                    spa.submitted_at
                FROM practice.sql_practice_attempts spa
                JOIN practice.sql_practices sp
                  ON sp.id = spa.practice_id
                WHERE spa.user_id = %s::uuid AND %s = 'sqld'
                  AND spa.submitted_at IS NOT NULL
                  AND spa.submitted_sql IS NOT NULL
                  AND btrim(spa.submitted_sql) <> ''
                ORDER BY spa.submitted_at DESC,
                         spa.id DESC
                LIMIT 5
                """,
                (user_id, exam_type),
            )
            recent_sql_attempts = [
                {
                    "attemptId": str(row[0]),
                    "practiceId": str(row[1]),
                    "title": row[2],
                    "isCorrect": bool(row[3]),
                    "submittedAt": row[4].isoformat() if row[4] else None,
                }
                for row in cur.fetchall()
                if row[4] is not None
            ]

            if include_endless:
                cur.execute(
                    f"""
                    WITH learning_events AS (
                        SELECT
                            timezone('Asia/Seoul', COALESCE(spa.submitted_at, spa.completed_at, spa.last_saved_at, spa.created_at))::date AS learning_date
                        FROM practice.sql_practice_attempts spa
                        WHERE spa.user_id = %s::uuid AND %s = 'sqld'
                          AND COALESCE(spa.submitted_at, spa.completed_at, spa.last_saved_at, spa.created_at) IS NOT NULL

                        UNION ALL

                        SELECT
                            timezone('Asia/Seoul', COALESCE(ea.submitted_at, ea.last_saved_at, ea.started_at, ea.created_at))::date AS learning_date
                        FROM exam.exam_attempts ea
                        WHERE ea.user_id = %s::uuid
                          {"AND EXISTS (SELECT 1 FROM exam.exams e WHERE e.id = ea.exam_id AND e.exam_type = %s)" if scoped else ""}
                          AND COALESCE(ea.submitted_at, ea.last_saved_at, ea.started_at, ea.created_at) IS NOT NULL

                        UNION ALL

                        SELECT
                            timezone('Asia/Seoul', lea.answered_at)::date AS learning_date
                        FROM logs.endless_answers lea
                        WHERE lea.user_id = %s::uuid {scope_filter(scoped, "lea")} {"AND lea.statistics_cleared_at IS NULL" if scoped else ""}
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
                    (user_id, exam_type, user_id) + scope_params(scoped, exam_type) + (user_id,) + scope_params(scoped, exam_type),
                )
            else:
                cur.execute(
                    f"""
                    WITH learning_events AS (
                        SELECT
                            timezone('Asia/Seoul', COALESCE(spa.submitted_at, spa.completed_at, spa.last_saved_at, spa.created_at))::date AS learning_date
                        FROM practice.sql_practice_attempts spa
                        WHERE spa.user_id = %s::uuid AND %s = 'sqld'
                          AND COALESCE(spa.submitted_at, spa.completed_at, spa.last_saved_at, spa.created_at) IS NOT NULL

                        UNION ALL

                        SELECT
                            timezone('Asia/Seoul', COALESCE(ea.submitted_at, ea.last_saved_at, ea.started_at, ea.created_at))::date AS learning_date
                        FROM exam.exam_attempts ea
                        WHERE ea.user_id = %s::uuid
                          {"AND EXISTS (SELECT 1 FROM exam.exams e WHERE e.id = ea.exam_id AND e.exam_type = %s)" if scoped else ""}
                          AND COALESCE(ea.submitted_at, ea.last_saved_at, ea.started_at, ea.created_at) IS NOT NULL
                    )
                    SELECT
                        learning_date::text,
                        COUNT(*)::int AS event_count
                    FROM learning_events
                    WHERE learning_date >= timezone('Asia/Seoul', now())::date - INTERVAL '83 days'
                    GROUP BY learning_date
                    ORDER BY learning_date ASC
                    """,
                    (user_id, exam_type, user_id) + scope_params(scoped, exam_type),
                )
            learning_calendar = [
                {
                    "date": row[0],
                    "eventCount": int(row[1] or 0),
                }
                for row in cur.fetchall()
            ]

    response = {
        "examType": exam_type,
        "stats": stats,
        "subjectStats": subject_stats,
        "recentExamResults": recent_exam_results,
        "recentSqlAttempts": recent_sql_attempts,
        "learningCalendar": learning_calendar,
    }

    with _cache_lock:
        _summary_cache[cache_key] = (now, deepcopy(response))

    return response
