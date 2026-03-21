import oracledb
from app.core.config import settings


def get_oracle_connection():
    return oracledb.connect(
        user=settings.ORACLE_USER,
        password=settings.ORACLE_PASSWORD,
        dsn=settings.ORACLE_DSN,
        config_dir=settings.ORACLE_WALLET_PATH,
        wallet_location=settings.ORACLE_WALLET_PATH,
        wallet_password=settings.ORACLE_WALLET_PASSWORD,
    )


def check_oracle():
    conn = get_oracle_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 'OK' FROM dual")
        row = cur.fetchone()
        return row[0]
    finally:
        cur.close()
        conn.close()
