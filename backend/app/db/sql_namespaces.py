from __future__ import annotations

import logging
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from app.db.postgres import get_postgres_connection

logger = logging.getLogger(__name__)

NAMESPACE_IDLE_MINUTES = 10


@dataclass(frozen=True)
class NamespaceRecord:
    scope_key: str
    practice_id: str
    namespace_token: str
    namespace_prefix: str
    user_id: str | None
    session_id: str | None
    last_used_at: datetime


def ensure_namespace_table() -> None:
    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE SCHEMA IF NOT EXISTS runtime")
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS runtime.sql_namespaces (
                    scope_key TEXT PRIMARY KEY,
                    user_id TEXT NULL,
                    session_id TEXT NULL,
                    practice_id TEXT NOT NULL,
                    namespace_token TEXT NOT NULL,
                    namespace_prefix TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            cur.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_sql_namespaces_last_used_at
                ON runtime.sql_namespaces (last_used_at)
                """
            )


def get_namespace(scope_key: str) -> NamespaceRecord | None:
    ensure_namespace_table()
    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    scope_key,
                    practice_id,
                    namespace_token,
                    namespace_prefix,
                    user_id,
                    session_id,
                    last_used_at
                FROM runtime.sql_namespaces
                WHERE scope_key = %s
                """,
                (scope_key,),
            )
            row = cur.fetchone()

    if not row:
        return None

    return NamespaceRecord(
        scope_key=row[0],
        practice_id=row[1],
        namespace_token=row[2],
        namespace_prefix=row[3],
        user_id=row[4],
        session_id=row[5],
        last_used_at=row[6],
    )


def upsert_namespace(
    *,
    scope_key: str,
    practice_id: str,
    namespace_token: str,
    namespace_prefix: str,
    user_id: str | None,
    session_id: str | None,
) -> None:
    ensure_namespace_table()
    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO runtime.sql_namespaces (
                    scope_key,
                    user_id,
                    session_id,
                    practice_id,
                    namespace_token,
                    namespace_prefix,
                    created_at,
                    updated_at,
                    last_used_at
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    NOW(),
                    NOW(),
                    NOW()
                )
                ON CONFLICT (scope_key) DO UPDATE
                SET
                    user_id = EXCLUDED.user_id,
                    session_id = EXCLUDED.session_id,
                    practice_id = EXCLUDED.practice_id,
                    namespace_token = EXCLUDED.namespace_token,
                    namespace_prefix = EXCLUDED.namespace_prefix,
                    updated_at = NOW(),
                    last_used_at = NOW()
                """,
                (
                    scope_key,
                    user_id,
                    session_id,
                    practice_id,
                    namespace_token,
                    namespace_prefix,
                ),
            )


def touch_namespace(scope_key: str) -> None:
    ensure_namespace_table()
    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE runtime.sql_namespaces
                SET updated_at = NOW(), last_used_at = NOW()
                WHERE scope_key = %s
                """,
                (scope_key,),
            )


def delete_namespace(scope_key: str) -> None:
    ensure_namespace_table()
    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM runtime.sql_namespaces WHERE scope_key = %s",
                (scope_key,),
            )


def list_stale_namespaces(
    now: datetime | None = None,
    idle_minutes: int = NAMESPACE_IDLE_MINUTES,
) -> list[NamespaceRecord]:
    ensure_namespace_table()
    reference_time = now or datetime.now(timezone.utc)
    cutoff = reference_time - timedelta(minutes=idle_minutes)

    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    scope_key,
                    practice_id,
                    namespace_token,
                    namespace_prefix,
                    user_id,
                    session_id,
                    last_used_at
                FROM runtime.sql_namespaces
                WHERE last_used_at < %s
                ORDER BY last_used_at ASC
                """,
                (cutoff,),
            )
            rows = cur.fetchall()

    return [
        NamespaceRecord(
            scope_key=row[0],
            practice_id=row[1],
            namespace_token=row[2],
            namespace_prefix=row[3],
            user_id=row[4],
            session_id=row[5],
            last_used_at=row[6],
        )
        for row in rows
    ]


@contextmanager
def namespace_advisory_lock(scope_key: str):
    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT pg_advisory_lock(hashtext(%s))", (scope_key,))
        try:
            yield
        finally:
            with conn.cursor() as cur:
                cur.execute("SELECT pg_advisory_unlock(hashtext(%s))", (scope_key,))
