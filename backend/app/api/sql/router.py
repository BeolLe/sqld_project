import time
from datetime import date, datetime
from decimal import Decimal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.oracle import get_oracle_connection

router = APIRouter(prefix="/api/sql", tags=["sql"])

MAX_ROWS = 200


class SQLExecuteRequest(BaseModel):
    query: str


def normalize_value(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def validate_query(query: str) -> str:
    normalized = query.strip()
    normalized_upper = normalized.upper()

    if not normalized:
        raise HTTPException(status_code=400, detail="query is required")

    if ";" in normalized.rstrip(";"):
        raise HTTPException(status_code=400, detail="only one query is allowed")

    if not (normalized_upper.startswith("SELECT") or normalized_upper.startswith("WITH")):
        raise HTTPException(status_code=400, detail="only SELECT or WITH queries are allowed")

    return normalized.rstrip(";")


@router.post("/execute")
def execute_sql(req: SQLExecuteRequest):
    query = validate_query(req.query)
    started_at = time.perf_counter()

    with get_oracle_connection() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(query)
                rows = cur.fetchmany(MAX_ROWS)
            except Exception as exc:
                elapsed_ms = round((time.perf_counter() - started_at) * 1000)
                return {
                    "columns": [],
                    "rows": [],
                    "executionTimeMs": elapsed_ms,
                    "error": str(exc),
                }

            elapsed_ms = round((time.perf_counter() - started_at) * 1000)
            columns = [desc[0] for desc in cur.description] if cur.description else []
            serialized_rows = [
                {columns[index]: normalize_value(value) for index, value in enumerate(row)}
                for row in rows
            ]

            return {
                "columns": columns,
                "rows": serialized_rows,
                "executionTimeMs": elapsed_ms,
            }
