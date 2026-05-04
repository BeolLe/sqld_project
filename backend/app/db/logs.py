import hashlib
import logging
import re
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from psycopg.types.json import Jsonb

from app.db.postgres import get_postgres_connection

logger = logging.getLogger(__name__)
_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="log-writer")


def log_insert_error(operation: str, exc: Exception) -> None:
    logger.exception("logs persistence failed during %s: %s", operation, exc)


def ensure_request_id(request_id: str | None = None) -> str:
    return request_id or str(uuid.uuid4())


def build_query_hash(query: str) -> str:
    return hashlib.sha256(query.encode("utf-8")).hexdigest()


def strip_sql_comments(query: str) -> str:
    result: list[str] = []
    i = 0
    in_single_quote = False
    in_double_quote = False
    length = len(query)

    while i < length:
        char = query[i]
        nxt = query[i + 1] if i + 1 < length else ""

        if in_single_quote:
            result.append(char)
            if char == "'" and nxt == "'":
                result.append(nxt)
                i += 2
                continue
            if char == "'":
                in_single_quote = False
            i += 1
            continue

        if in_double_quote:
            result.append(char)
            if char == '"':
                in_double_quote = False
            i += 1
            continue

        if char == "'":
            in_single_quote = True
            result.append(char)
            i += 1
            continue

        if char == '"':
            in_double_quote = True
            result.append(char)
            i += 1
            continue

        if char == "-" and nxt == "-":
            i += 2
            while i < length and query[i] not in "\r\n":
                i += 1
            continue

        if char == "/" and nxt == "*":
            i += 2
            while i + 1 < length and not (query[i] == "*" and query[i + 1] == "/"):
                i += 1
            i += 2
            continue

        result.append(char)
        i += 1

    return "".join(result)


def collapse_sql_whitespace(query: str) -> str:
    result: list[str] = []
    token: list[str] = []
    in_single_quote = False
    in_double_quote = False

    def flush_token() -> None:
        nonlocal token
        if token:
            result.append("".join(token))
            token = []

    for char in query:
        if in_single_quote:
            token.append(char)
            if char == "'":
                in_single_quote = False
            continue

        if in_double_quote:
            token.append(char)
            if char == '"':
                in_double_quote = False
            continue

        if char == "'":
            if result and result[-1] != " " and not result[-1].endswith(("(", ",", "=")):
                flush_token()
            in_single_quote = True
            token.append(char)
            continue

        if char == '"':
            if result and result[-1] != " " and not result[-1].endswith(("(", ",", "=")):
                flush_token()
            in_double_quote = True
            token.append(char)
            continue

        if char.isspace():
            flush_token()
            if result and result[-1] != " ":
                result.append(" ")
            continue

        if char in "(),;":
            flush_token()
            if result and result[-1] == " ":
                result.pop()
            result.append(char)
            continue

        token.append(char)

    flush_token()
    normalized = "".join(result).strip()
    normalized = re.sub(r"\s*([=<>+\-*/])\s*", r"\1", normalized)
    normalized = re.sub(r"\s*,\s*", ",", normalized)
    normalized = re.sub(r"\(\s+", "(", normalized)
    normalized = re.sub(r"\s+\)", ")", normalized)
    normalized = re.sub(r";+$", "", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def normalize_query_for_alert(query: str) -> str:
    without_comments = strip_sql_comments(query or "")
    normalized = collapse_sql_whitespace(without_comments)
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


def submit_auth_event(**kwargs: Any) -> None:
    _executor.submit(insert_auth_event, **kwargs)


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
                query_hash = build_query_hash(normalized_query)
                cur.execute(
                    """
                    SELECT 1
                    FROM logs.sql_alert_events
                    WHERE alert_type = %s
                      AND practice_id = %s
                      AND query_hash = %s
                    LIMIT 1
                    """,
                    (
                        alert_type,
                        practice_id,
                        query_hash,
                    ),
                )
                if cur.fetchone():
                    return False

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
                        query_hash,
                        Jsonb(payload or {}),
                    ),
                )
                return cur.fetchone() is not None
    except Exception as exc:
        log_insert_error("insert_sql_alert_once", exc)
        return False
