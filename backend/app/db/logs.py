import hashlib
import logging
import uuid
from typing import Any

from psycopg.types.json import Jsonb

from app.db.postgres import get_postgres_connection

logger = logging.getLogger(__name__)


def log_insert_error(operation: str, exc: Exception) -> None:
    logger.exception("logs persistence failed during %s: %s", operation, exc)


def ensure_request_id(request_id: str | None = None) -> str:
    return request_id or str(uuid.uuid4())


def build_query_hash(query: str) -> str:
    return hashlib.sha256(query.encode("utf-8")).hexdigest()


def normalize_query_for_alert(query: str) -> str:
    normalized = " ".join((query or "").strip().rstrip(";").split())
    return normalized.upper()


def insert_auth_event(
    *,
    event_type: str,
    success: bool,
    email: str | None = None,
    user_id: str | None = None,
    session_id: str | None = None,
    request_id: str | None = None,
    page_path: str | None = None,
    failure_code: str | None = None,
    failure_message: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    try:
        with get_postgres_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO logs.auth_events (
                        event_time,
                        user_id,
                        session_id,
                        request_id,
                        event_type,
                        email,
                        auth_provider,
                        success,
                        failure_code,
                        failure_message,
                        page_path,
                        metadata
                    )
                    VALUES (
                        NOW(),
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        'local',
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        user_id,
                        session_id,
                        request_id,
                        event_type,
                        email,
                        success,
                        failure_code,
                        failure_message,
                        page_path,
                        Jsonb(metadata or {}),
                    ),
                )
    except Exception as exc:
        log_insert_error("insert_auth_event", exc)
        return


def insert_learning_event(
    *,
    event_type: str,
    content_type: str,
    content_id: str,
    user_id: str | None = None,
    session_id: str | None = None,
    request_id: str | None = None,
    duration_ms: int | None = None,
    is_correct: bool | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    try:
        with get_postgres_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO logs.learning_events (
                        event_time,
                        user_id,
                        session_id,
                        request_id,
                        event_type,
                        content_type,
                        content_id,
                        duration_ms,
                        is_correct,
                        metadata
                    )
                    VALUES (
                        NOW(),
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        user_id,
                        session_id,
                        request_id,
                        event_type,
                        content_type,
                        content_id,
                        duration_ms,
                        is_correct,
                        Jsonb(metadata or {}),
                    ),
                )
    except Exception as exc:
        log_insert_error("insert_learning_event", exc)
        return


def insert_sql_request(
    *,
    request_id: str,
    practice_id: str,
    query_text: str,
    normalized_query: str | None,
    statement_type: str | None,
    user_id: str | None = None,
    session_id: str | None = None,
    submitted_from: str = "frontend",
    status: str = "pending",
    metadata: dict[str, Any] | None = None,
) -> int | None:
    try:
        with get_postgres_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO logs.sql_requests (
                        request_id,
                        event_time,
                        user_id,
                        session_id,
                        practice_id,
                        query_text,
                        normalized_query,
                        statement_type,
                        query_hash,
                        submitted_from,
                        status,
                        metadata
                    )
                    VALUES (
                        %s,
                        NOW(),
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    RETURNING id
                    """,
                    (
                        request_id,
                        user_id,
                        session_id,
                        practice_id,
                        query_text,
                        normalized_query,
                        statement_type,
                        build_query_hash(normalized_query or query_text),
                        submitted_from,
                        status,
                        Jsonb(metadata or {}),
                    ),
                )
                row = cur.fetchone()
                return row[0] if row else None
    except Exception as exc:
        log_insert_error("insert_sql_request", exc)
        return None


def update_sql_request_status(request_id: str, status: str) -> None:
    try:
        with get_postgres_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE logs.sql_requests
                    SET status = %s
                    WHERE request_id = %s
                    """,
                    (status, request_id),
                )
    except Exception as exc:
        log_insert_error("update_sql_request_status", exc)
        return


def insert_sql_response(
    *,
    sql_request_id: int,
    success: bool,
    execution_time_ms: int,
    row_count: int,
    oracle_error_code: str | None = None,
    oracle_error_message: str | None = None,
    result_preview: Any = None,
    full_response: Any = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    try:
        with get_postgres_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO logs.sql_responses (
                        sql_request_id,
                        responded_at,
                        success,
                        execution_time_ms,
                        row_count,
                        oracle_error_code,
                        oracle_error_message,
                        result_preview,
                        full_response,
                        metadata
                    )
                    VALUES (
                        %s,
                        NOW(),
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        sql_request_id,
                        success,
                        execution_time_ms,
                        row_count,
                        oracle_error_code,
                        oracle_error_message,
                        Jsonb(result_preview) if result_preview is not None else None,
                        Jsonb(full_response) if full_response is not None else None,
                        Jsonb(metadata or {}),
                    ),
                )
    except Exception as exc:
        log_insert_error("insert_sql_response", exc)
        return


def insert_sql_alert_once(
    *,
    alert_type: str,
    practice_id: str,
    normalized_query: str,
    user_id: str | None = None,
    request_id: str | None = None,
    payload: dict[str, Any] | None = None,
) -> bool:
    try:
        with get_postgres_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO logs.sql_alert_events (
                        created_at,
                        alert_type,
                        practice_id,
                        user_id,
                        request_id,
                        normalized_query,
                        query_hash,
                        payload
                    )
                    VALUES (
                        NOW(),
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    ON CONFLICT (alert_type, practice_id, query_hash) DO NOTHING
                    RETURNING id
                    """,
                    (
                        alert_type,
                        practice_id,
                        user_id,
                        request_id,
                        normalized_query,
                        build_query_hash(normalized_query),
                        Jsonb(payload or {}),
                    ),
                )
                return cur.fetchone() is not None
    except Exception as exc:
        log_insert_error("insert_sql_alert_once", exc)
        return False
