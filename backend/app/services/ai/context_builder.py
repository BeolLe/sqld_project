from __future__ import annotations

from typing import Any

from fastapi import HTTPException
from psycopg.rows import dict_row

from app.api.dashboard.router import (
    fetch_subject_stats_by_mode,
    has_endless_answers_table,
)
from app.db.postgres import get_connection


def build_explanation_context(
    *, user_id: str, source: str, attempt_id: str | None, problem_id: str
) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            if source == "exam":
                normalized_attempt_id = None
                if attempt_id and attempt_id.lower() not in {"undefined", "null"}:
                    if not attempt_id.isdigit():
                        raise HTTPException(
                            status_code=422,
                            detail="응시 기록 ID 형식이 올바르지 않습니다.",
                        )
                    normalized_attempt_id = int(attempt_id)
                cur.execute(
                    """
                    SELECT
                        COALESCE(
                            question.question_payload->>'source_id',
                            'exam_q_' || question.question_no::text
                        ) AS problem_id,
                        question.question_text,
                        question.choice_payload AS options,
                        COALESCE(answer.selected_choice, '미답변') AS user_answer,
                        answer_key.correct_answer,
                        answer_key.explanation
                    FROM exam.exam_attempts AS attempt
                    JOIN exam.exam_questions AS question
                      ON question.exam_id = attempt.exam_id
                    LEFT JOIN exam.exam_attempt_answers AS answer
                      ON answer.attempt_id = attempt.id
                     AND answer.question_id = question.id
                    JOIN exam.answer_keys AS answer_key
                      ON answer_key.question_id = question.id
                    WHERE (%s::bigint IS NULL OR attempt.id = %s::bigint)
                      AND attempt.user_id = %s::uuid
                      AND COALESCE(
                          question.question_payload->>'source_id',
                          'exam_q_' || question.question_no::text
                      ) = %s
                    ORDER BY attempt.submitted_at DESC NULLS LAST, attempt.id DESC
                    LIMIT 1
                    """,
                    (
                        normalized_attempt_id,
                        normalized_attempt_id,
                        user_id,
                        problem_id,
                    ),
                )
            elif source == "endless":
                cur.execute(
                    """
                    SELECT
                        problem.problem_id,
                        COALESCE(problem.title, problem.description) AS question_text,
                        (
                            SELECT jsonb_agg(choice.choice_text ORDER BY choice.choice_no)
                            FROM endless.problem_choices AS choice
                            WHERE choice.problem_id = problem.problem_id
                        ) AS options,
                        answer.selected_answer AS user_answer,
                        answer_key.correct_answer,
                        COALESCE(answer_key.answer_commentary, problem.explanation) AS explanation
                    FROM logs.endless_answers AS answer
                    JOIN endless.problems AS problem
                      ON problem.source_problem_id = answer.problem_id
                    JOIN endless.problem_answer_keys AS answer_key
                      ON answer_key.problem_id = problem.problem_id
                    WHERE answer.id = %s::bigint
                      AND answer.user_id = %s::uuid
                      AND problem.source_problem_id = %s
                    """,
                    (attempt_id, user_id, problem_id),
                )
            else:
                raise HTTPException(status_code=422, detail="unsupported explanation source")
            row = cur.fetchone()
    if not row:
        raise HTTPException(
            status_code=404,
            detail="해당 응시 기록 또는 문제를 찾을 수 없습니다.",
        )
    return {"source": source, **dict(row)}


def build_sql_review_context(*, user_id: str, attempt_id: str) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    attempt.id::text AS attempt_id,
                    practice.practice_code,
                    practice.title,
                    practice.description,
                    practice.prompt_text,
                    practice.prompt_payload,
                    attempt.submitted_sql AS user_query,
                    attempt.is_correct,
                    attempt.result_payload,
                    practice.expected_answer,
                    practice.answer_payload
                FROM practice.sql_practice_attempts AS attempt
                JOIN practice.sql_practices AS practice
                  ON practice.id = attempt.practice_id
                WHERE attempt.id = %s::bigint
                  AND attempt.user_id = %s::uuid
                """,
                (attempt_id, user_id),
            )
            row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="SQL attempt not found")
    return dict(row)


def build_study_plan_context(*, user_id: str, mode: str) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            include_endless = has_endless_answers_table(cur)
            stats = fetch_subject_stats_by_mode(cur, user_id, include_endless)
            cur.execute(
                """
                SELECT
                    exam.title,
                    result.score_percent,
                    result.passed,
                    attempt.submitted_at
                FROM exam.exam_attempts AS attempt
                JOIN exam.exam_attempt_results AS result
                  ON result.attempt_id = attempt.id
                JOIN exam.exams AS exam ON exam.id = attempt.exam_id
                WHERE attempt.user_id = %s::uuid
                  AND attempt.submitted_at IS NOT NULL
                ORDER BY attempt.submitted_at DESC
                LIMIT 10
                """,
                (user_id,),
            )
            recent_exams = [
                {
                    "title": row[0],
                    "score": float(row[1] or 0),
                    "passed": bool(row[2]),
                    "submittedAt": row[3].isoformat() if row[3] else None,
                }
                for row in cur.fetchall()
            ]
    return {
        "mode": mode,
        "subjectStats": stats.get(mode, stats.get("all", [])),
        "recentExamResults": recent_exams,
    }
