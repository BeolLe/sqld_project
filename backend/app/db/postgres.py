import os
from threading import Lock

import psycopg
from psycopg_pool import ConnectionPool

from app.core.config import settings

_pool: ConnectionPool | None = None
_pool_lock = Lock()


def _build_conninfo() -> str:
    return " ".join(
        [
            f"host={settings.POSTGRES_HOST or os.getenv('POSTGRES_HOST', '')}",
            f"port={settings.POSTGRES_PORT or os.getenv('POSTGRES_PORT', '5432')}",
            f"dbname={settings.POSTGRES_DB or os.getenv('POSTGRES_DB', '')}",
            f"user={settings.POSTGRES_USER or os.getenv('POSTGRES_USER', '')}",
            f"password={settings.POSTGRES_PASSWORD or os.getenv('POSTGRES_PASSWORD', '')}",
        ]
    )


def init_postgres_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        with _pool_lock:
            if _pool is None:
                _pool = ConnectionPool(
                    conninfo=_build_conninfo(),
                    min_size=settings.POSTGRES_POOL_MIN_SIZE,
                    max_size=settings.POSTGRES_POOL_MAX_SIZE,
                    open=True,
                )
    return _pool


def close_postgres_pool() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None


def get_postgres_connection():
    return init_postgres_pool().connection()


def check_postgres():
    with get_postgres_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 'OK'")
            row = cur.fetchone()
            return row[0]


def get_connection():
    return init_postgres_pool().connection()
