import logging

import oracledb
from app.core.config import settings

logger = logging.getLogger(__name__)
oracle_pool: oracledb.ConnectionPool | None = None


def init_oracle_pool():
    global oracle_pool

    if oracle_pool is not None:
        return oracle_pool

    # Always Free ADB session budget is small enough that pool size must stay
    # conservative. timeout controls idle pooled sessions; wait_timeout
    # controls how long acquire() waits in TIMEDWAIT mode.
    oracle_pool = oracledb.create_pool(
        user=settings.ORACLE_USER,
        password=settings.ORACLE_PASSWORD,
        dsn=settings.ORACLE_DSN,
        config_dir=settings.ORACLE_WALLET_PATH,
        wallet_location=settings.ORACLE_WALLET_PATH,
        wallet_password=settings.ORACLE_WALLET_PASSWORD,
        min=settings.ORACLE_POOL_MIN,
        max=settings.ORACLE_POOL_MAX,
        increment=settings.ORACLE_POOL_INCREMENT,
        getmode=oracledb.POOL_GETMODE_TIMEDWAIT,
        timeout=settings.ORACLE_POOL_IDLE_TIMEOUT_SECONDS,
        wait_timeout=settings.ORACLE_POOL_WAIT_TIMEOUT_MS,
        ping_interval=settings.ORACLE_POOL_PING_INTERVAL_SECONDS,
    )
    return oracle_pool


def close_oracle_pool():
    global oracle_pool

    if oracle_pool is not None:
        oracle_pool.close()
        oracle_pool = None


def get_oracle_connection():
    pool = init_oracle_pool()
    connection = pool.acquire()
    try:
        connection.call_timeout = settings.ORACLE_CALL_TIMEOUT_MS
        # Reapply on every checkout: pooled sessions retain their previous settings.
        cur = connection.cursor()
        try:
            for statement_type in ("QUERY", "DDL", "DML"):
                cur.execute(f"ALTER SESSION DISABLE PARALLEL {statement_type}")
        except Exception:
            try:
                cur.close()
            except Exception:
                logger.exception("failed to close cursor after Oracle session setup failure")
            raise
        cur.close()
    except Exception:
        # A partially configured session must not reach application SQL.
        try:
            pool.drop(connection)
        except Exception:
            logger.exception("failed to discard Oracle connection after session setup failure")
            try:
                connection.close()
            except Exception:
                logger.exception("failed to close Oracle connection after discard failure")
        raise
    return connection


def check_oracle():
    with get_oracle_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 'OK' FROM dual")
            row = cur.fetchone()
            return row[0]
