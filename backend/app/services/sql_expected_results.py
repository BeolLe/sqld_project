from __future__ import annotations

import re
from typing import Any, Sequence

from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from app.db.oracle import get_oracle_connection
from app.db.postgres import get_connection
from app.services.sql_grading import build_result_hash, normalize_columns, normalize_rows
from app.services.sql_workspace import (
    WorkspaceValidationError,
    build_workspace_context,
    classify_statement,
    cleanup_namespace_tables,
    prepare_namespace,
    rewrite_query_for_namespace,
    validate_statement_shape,
)

ORDER_BY_PATTERN = re.compile(r"\bORDER\s+BY\b", flags=re.IGNORECASE)
VALID_COMPARISON_MODES = {"ordered", "unordered"}


class ExpectedResultGenerationError(RuntimeError):
    pass


def validate_expected_query(query: str) -> str:
    normalized = query.strip()
    if not normalized:
        raise ExpectedResultGenerationError("expected_answer is empty")

    if ";" in normalized.rstrip(";"):
        raise ExpectedResultGenerationError("only one expected query is allowed")

    try:
        statement_type = classify_statement(normalized)
        validate_statement_shape(normalized, statement_type)
    except WorkspaceValidationError as exc:
        raise ExpectedResultGenerationError(str(exc)) from exc

    if statement_type not in {"SELECT", "WITH"}:
        raise ExpectedResultGenerationError(
            "expected_answer must be a SELECT or WITH query to generate expected results"
        )

    return normalized.rstrip(";")


def infer_comparison_mode(query: str, prompt_payload: dict[str, Any] | None) -> str:
    payload = prompt_payload or {}
    configured = payload.get("comparisonMode")
    if isinstance(configured, str):
        normalized = configured.strip().lower()
        if normalized in VALID_COMPARISON_MODES:
            return normalized

    return "ordered" if ORDER_BY_PATTERN.search(query) else "unordered"


def list_target_practices(practice_codes: Sequence[str] | None = None) -> list[dict[str, Any]]:
    filters = ""
    params: tuple[Any, ...] = ()

    if practice_codes:
        filters = "AND practice_code = ANY(%s)"
        params = (list(practice_codes),)

    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                f"""
                SELECT
                    id,
                    practice_code,
                    title,
                    expected_answer,
                    prompt_payload
                FROM practice.sql_practices
                WHERE is_active = true
                  {filters}
                ORDER BY practice_code
                """,
                params,
            )
            return cur.fetchall()


def execute_expected_query(practice_code: str, query: str) -> tuple[list[str], list[dict[str, Any]]]:
    validated_query = validate_expected_query(query)
    workspace = build_workspace_context(
        practice_id=practice_code,
        scope_key=f"expected-results:{practice_code}",
    )

    with get_oracle_connection() as conn:
        try:
            prepare_namespace(conn, workspace)
            rewritten_query = rewrite_query_for_namespace(
                query=validated_query,
                workspace=workspace,
                statement_type=classify_statement(validated_query),
            )

            with conn.cursor() as cur:
                cur.execute(rewritten_query)
                columns = [desc[0] for desc in cur.description] if cur.description else []
                rows = cur.fetchall()
                serialized_rows = [
                    {columns[index]: row[index] for index in range(len(columns))}
                    for row in rows
                ]
                return columns, serialized_rows
        finally:
            cleanup_namespace_tables(conn, workspace)


def upsert_expected_result(
    *,
    practice_id: int,
    source_query: str,
    result_columns: list[str],
    result_rows: list[dict[str, Any]],
    comparison_mode: str,
) -> None:
    normalized_columns = normalize_columns(result_columns)
    normalized_rows = normalize_rows(result_rows)
    row_count = len(normalized_rows)
    result_hash = build_result_hash(
        normalized_columns,
        normalized_rows,
        comparison_mode,
    )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE practice.sql_practice_expected_results
                SET is_active = false,
                    updated_at = now()
                WHERE practice_id = %s
                  AND is_active = true
                """,
                (practice_id,),
            )
            cur.execute(
                """
                INSERT INTO practice.sql_practice_expected_results (
                    practice_id,
                    source_query,
                    result_columns,
                    result_rows,
                    row_count,
                    result_hash,
                    comparison_mode,
                    is_active
                ) VALUES (%s, %s, %s::jsonb, %s::jsonb, %s, %s, %s, true)
                """,
                (
                    practice_id,
                    source_query,
                    Jsonb(normalized_columns),
                    Jsonb(normalized_rows),
                    row_count,
                    result_hash,
                    comparison_mode,
                ),
            )
        conn.commit()


def generate_expected_results(
    practice_codes: Sequence[str] | None = None,
) -> list[dict[str, Any]]:
    summaries: list[dict[str, Any]] = []

    for practice in list_target_practices(practice_codes):
        comparison_mode = infer_comparison_mode(
            practice["expected_answer"],
            practice.get("prompt_payload"),
        )
        columns, rows = execute_expected_query(
            practice_code=practice["practice_code"],
            query=practice["expected_answer"],
        )
        upsert_expected_result(
            practice_id=practice["id"],
            source_query=practice["expected_answer"],
            result_columns=columns,
            result_rows=rows,
            comparison_mode=comparison_mode,
        )
        summaries.append(
            {
                "practice_code": practice["practice_code"],
                "title": practice["title"],
                "comparison_mode": comparison_mode,
                "row_count": len(rows),
                "column_count": len(columns),
            }
        )

    return summaries
