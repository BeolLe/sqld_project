"""Bounded, disposable Oracle workspaces coordinated across API processes by PostgreSQL."""
from contextlib import contextmanager
import logging
import math
from threading import Event, Thread
from uuid import uuid4

from fastapi import HTTPException
from psycopg.pq import TransactionStatus

from app.core.config import settings
from app.db.oracle import get_oracle_connection
from app.db.postgres import get_postgres_connection
from app.services.sql_workspace import (
    BASE_TABLES, WorkspaceContext, cleanup_namespace_by_prefix,
    fetch_namespace_tables, prepare_namespace,
)

logger = logging.getLogger(__name__)


def pool_name() -> str:
    return settings.SQL_WORKSPACE_POOL_NAME


def initialize_pool() -> None:
    if not pool_name() or not 2 <= settings.SQL_WORKSPACE_POOL_SIZE <= 32:
        raise ValueError("SQL workspace pool requires a name and 2..32 slots")
    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT pg_advisory_xact_lock(hashtextextended('sql-workspace-init', 0))")
            # Additive tables: old images keep their runtime.sql_namespaces contract.
            cur.execute("CREATE SCHEMA IF NOT EXISTS runtime")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS runtime.sql_workspace_slots (
                    pool_name TEXT NOT NULL,
                    slot_id INTEGER NOT NULL,
                    namespace_token TEXT NOT NULL UNIQUE,
                    state TEXT NOT NULL CHECK (state IN ('dirty', 'ready', 'leased')),
                    last_user_id TEXT,
                    last_practice_id TEXT,
                    last_leased_at TIMESTAMPTZ,
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
                    PRIMARY KEY (pool_name, slot_id)
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS runtime.sql_execution_cooldowns (
                    pool_name TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    practice_id TEXT NOT NULL,
                    next_allowed_at TIMESTAMPTZ NOT NULL,
                    PRIMARY KEY (pool_name, user_id, practice_id)
                )
            """)
            for slot_id in range(settings.SQL_WORKSPACE_POOL_SIZE):
                cur.execute("""
                    INSERT INTO runtime.sql_workspace_slots
                        (pool_name, slot_id, namespace_token, state)
                    VALUES (%s, %s, %s, 'dirty')
                    ON CONFLICT (pool_name, slot_id) DO NOTHING
                """, (pool_name(), slot_id, uuid4().hex[:12].upper()))


def enforce_cooldown(user_id: str, practice_id: str) -> None:
    """One atomic gate for execute AND submit, across tabs and API replicas."""
    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO runtime.sql_execution_cooldowns
                    (pool_name, user_id, practice_id, next_allowed_at)
                VALUES (%s, %s, %s, clock_timestamp() + interval '3 seconds')
                ON CONFLICT (pool_name, user_id, practice_id) DO UPDATE
                SET next_allowed_at = clock_timestamp() + interval '3 seconds'
                WHERE runtime.sql_execution_cooldowns.next_allowed_at <= clock_timestamp()
                RETURNING next_allowed_at
            """, (pool_name(), user_id, practice_id))
            if cur.fetchone():
                return
            cur.execute("""
                SELECT GREATEST(0, EXTRACT(EPOCH FROM next_allowed_at - clock_timestamp()))
                FROM runtime.sql_execution_cooldowns
                WHERE pool_name = %s AND user_id = %s AND practice_id = %s
            """, (pool_name(), user_id, practice_id))
            retry_after = max(1, math.ceil(float(cur.fetchone()[0])))
    raise HTTPException(
        status_code=429,
        detail=f"실행과 제출은 3초 간격으로 가능합니다. {retry_after}초 후 다시 시도해 주세요.",
        headers={"Retry-After": str(retry_after)},
    )


def slot_lock_key(slot_id: int) -> str:
    return f"sql-workspace:{pool_name()}:{slot_id}"


@contextmanager
def try_lock(conn, key: str):
    """Session lock spans commits; a dead process releases it automatically."""
    with conn.cursor() as cur:
        cur.execute("SELECT pg_try_advisory_lock(hashtextextended(%s, 0))", (key,))
        acquired = cur.fetchone()[0]
    try:
        yield acquired
    finally:
        if acquired:
            try:
                if conn.info.transaction_status == TransactionStatus.INERROR:
                    conn.rollback()
                with conn.cursor() as cur:
                    cur.execute("SELECT pg_advisory_unlock(hashtextextended(%s, 0))", (key,))
            except Exception:
                # Never return a session with an advisory lock to the connection pool.
                conn.close()
                logger.exception("SQL workspace lock release failed; connection closed")


@contextmanager
def lease_workspace(user_id: str, practice_id: str):
    """Never runs Oracle DDL. A consumed slot cannot become ready without reset."""
    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT slot_id FROM runtime.sql_workspace_slots
                WHERE pool_name = %s AND state = 'ready' AND slot_id < %s
                ORDER BY (last_user_id = %s AND last_practice_id = %s) DESC NULLS LAST,
                         last_leased_at DESC NULLS LAST, slot_id
            """, (pool_name(), settings.SQL_WORKSPACE_POOL_SIZE, user_id, practice_id))
            candidates = [row[0] for row in cur.fetchall()]
        for slot_id in candidates:
            with try_lock(conn, slot_lock_key(slot_id)) as acquired:
                if not acquired:
                    continue
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE runtime.sql_workspace_slots
                        SET state = 'leased', last_user_id = %s, last_practice_id = %s,
                            last_leased_at = clock_timestamp(),
                            updated_at = clock_timestamp()
                        WHERE pool_name = %s AND slot_id = %s AND state = 'ready'
                        RETURNING namespace_token
                    """, (user_id, practice_id, pool_name(), slot_id))
                    row = cur.fetchone()
                conn.commit()
                if row is None:
                    continue
                # BackgroundTasks releases after sending; crashed requests are recovered
                # after a grace period. The advisory lock protects active executions.
                yield WorkspaceContext(practice_id, user_id, row[0])
                return
    raise HTTPException(
        status_code=503, detail="실습 환경을 준비 중입니다. 잠시 후 다시 실행해 주세요.",
        headers={"Retry-After": "3"},
    )


def release_workspace(namespace_token: str) -> None:
    """Called only after the HTTP response; token guards against stale callbacks."""
    try:
        with get_postgres_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE runtime.sql_workspace_slots SET state = 'dirty', updated_at = clock_timestamp()
                    WHERE pool_name = %s AND namespace_token = %s AND state = 'leased'
                """, (pool_name(), namespace_token))
    except Exception:
        logger.exception("failed to release SQL workspace; worker will recover it")


def maintain_pool() -> bool:
    """Reset at most one slot at a time across replicas, including crash recovery."""
    with get_postgres_connection() as conn:
        with try_lock(conn, f"sql-workspace-maintenance:{pool_name()}") as leader:
            if not leader:
                return False
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT slot_id FROM runtime.sql_workspace_slots
                    WHERE pool_name = %s AND (
                        (state = 'dirty' AND updated_at < clock_timestamp() - interval '1 second')
                        OR (state = 'leased' AND updated_at < clock_timestamp() - interval '1 minute')
                    )
                    ORDER BY updated_at, slot_id
                """, (pool_name(),))
                candidates = [row[0] for row in cur.fetchall()]
            for slot_id in candidates:
                with try_lock(conn, slot_lock_key(slot_id)) as acquired:
                    if not acquired:
                        continue
                    with conn.cursor() as cur:
                        cur.execute("""
                            SELECT namespace_token, state FROM runtime.sql_workspace_slots
                            WHERE pool_name = %s AND slot_id = %s
                        """, (pool_name(), slot_id))
                        old_token, state = cur.fetchone()
                    if state == 'ready':
                        continue
                    try:
                        with get_oracle_connection() as oracle:
                            cleanup_namespace_by_prefix(oracle, f"PX_{old_token}_")
                            # A different physical prefix prevents a late old callback
                            # from releasing or modifying a newly prepared environment.
                            token = uuid4().hex[:12].upper()
                            with conn.cursor() as cur:
                                cur.execute("""
                                    UPDATE runtime.sql_workspace_slots
                                    SET namespace_token = %s, state = 'dirty', updated_at = clock_timestamp()
                                    WHERE pool_name = %s AND slot_id = %s
                                """, (token, pool_name(), slot_id))
                            conn.commit()  # Track partial CTAS before touching Oracle.
                            workspace = WorkspaceContext("pool", "pool", token)
                            prepare_namespace(oracle, workspace)
                            if fetch_namespace_tables(oracle, workspace) != {
                                workspace.table_name(name) for name in BASE_TABLES
                            }:
                                raise RuntimeError("SQL workspace reset verification failed")
                        with conn.cursor() as cur:
                            cur.execute("""
                                UPDATE runtime.sql_workspace_slots
                                SET state = 'ready', updated_at = clock_timestamp()
                                WHERE pool_name = %s AND slot_id = %s
                            """, (pool_name(), slot_id))
                        conn.commit()
                        logger.info("sql_workspace_ready pool=%s slot=%s", pool_name(), slot_id)
                    except Exception:
                        conn.rollback()
                        with conn.cursor() as cur:
                            cur.execute("""
                                UPDATE runtime.sql_workspace_slots SET state = 'dirty', updated_at = clock_timestamp()
                                WHERE pool_name = %s AND slot_id = %s
                            """, (pool_name(), slot_id))
                        conn.commit()
                        logger.exception("SQL workspace reset failed pool=%s slot=%s", pool_name(), slot_id)
                    return True
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM runtime.sql_execution_cooldowns
                    WHERE pool_name = %s AND next_allowed_at < clock_timestamp() - interval '1 day'
                """, (pool_name(),))
    return False


def start_pool_worker():
    initialize_pool()
    stop = Event()

    def run():
        while not stop.is_set():
            try:
                if maintain_pool():
                    continue
            except Exception:
                logger.exception("SQL workspace maintenance failed")
            stop.wait(1)

    thread = Thread(target=run, name="sql-workspace-pool", daemon=True)
    thread.start()
    return stop, thread
