import psycopg
from app.core.config import settings


def get_postgres_connection():
    return psycopg.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
    )


def check_postgres():
    conn = get_postgres_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 'OK'")
        row = cur.fetchone()
        return row[0]
    finally:
        cur.close()
        conn.close()
