import oracledb
from app.core.config import settings

oracle_pool: oracledb.ConnectionPool | None = None


def init_oracle_pool():
    global oracle_pool

    if oracle_pool is not None:
        return oracle_pool

    # Always Free ADB session budget is small enough that pool size must stay
    # aligned with deployment concurrency. Current assumption:
    # replicas=1, uvicorn workers=1, pool max=8 -> up to 8 DB sessions.
    # If replicas or workers increase, lower this value or recalculate.
    oracle_pool = oracledb.create_pool(
        user=settings.ORACLE_USER,
        password=settings.ORACLE_PASSWORD,
        dsn=settings.ORACLE_DSN,
        config_dir=settings.ORACLE_WALLET_PATH,
        wallet_location=settings.ORACLE_WALLET_PATH,
        wallet_password=settings.ORACLE_WALLET_PASSWORD,
        min=1,
        max=8,
        increment=1,
        getmode=oracledb.POOL_GETMODE_WAIT,
        timeout=300,
        ping_interval=60,
    )
    return oracle_pool


def close_oracle_pool():
    global oracle_pool

    if oracle_pool is not None:
        oracle_pool.close()
        oracle_pool = None


def get_oracle_connection():
    pool = init_oracle_pool()
    return pool.acquire()


def check_oracle():
    with get_oracle_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 'OK' FROM dual")
            row = cur.fetchone()
            return row[0]
