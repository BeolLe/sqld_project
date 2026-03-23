import time
from datetime import date, datetime
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.db.logs import (
    ensure_request_id,
    insert_learning_event,
    insert_sql_request,
    insert_sql_response,
    update_sql_request_status,
)
from app.db.oracle import get_oracle_connection
from app.core.security import decode_access_token

router = APIRouter(prefix="/api/sql", tags=["sql"])

MAX_ROWS = 200


class SQLExecuteRequest(BaseModel):
    practice_id: str
    query: str
    action: str = "execute"


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


def extract_user_id(request: Request) -> str | None:
    authorization = request.headers.get("authorization")
    if not authorization or not authorization.lower().startswith("bearer "):
        return None

    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
    except Exception:
        return None

    user_id = payload.get("sub")
    return str(user_id) if user_id else None


def extract_oracle_error_code(message: str) -> str | None:
    if ":" not in message:
        return None
    return message.split(":", 1)[0].strip()


@router.post("/execute")
def execute_sql(req: SQLExecuteRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    session_id = request.headers.get("x-session-id")
    user_id = extract_user_id(request)
    action = req.action if req.action in {"execute", "submit"} else "execute"

    try:
        query = validate_query(req.query)
    except HTTPException as exc:
        insert_sql_request(
            request_id=request_id,
            user_id=user_id,
            session_id=session_id,
            practice_id=req.practice_id,
            query_text=req.query,
            normalized_query=None,
            statement_type=None,
            status="blocked",
            metadata={"action": action, "detail": exc.detail},
        )
        raise

    started_at = time.perf_counter()
    sql_request_id = insert_sql_request(
        request_id=request_id,
        user_id=user_id,
        session_id=session_id,
        practice_id=req.practice_id,
        query_text=req.query,
        normalized_query=query,
        statement_type="WITH" if query.upper().startswith("WITH") else "SELECT",
        status="pending",
        metadata={"action": action},
    )

    with get_oracle_connection() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(query)
                rows = cur.fetchmany(MAX_ROWS)
            except Exception as exc:
                elapsed_ms = round((time.perf_counter() - started_at) * 1000)
                if sql_request_id is not None:
                    insert_sql_response(
                        sql_request_id=sql_request_id,
                        success=False,
                        execution_time_ms=elapsed_ms,
                        row_count=0,
                        oracle_error_code=extract_oracle_error_code(str(exc)),
                        oracle_error_message=str(exc),
                        metadata={"action": action},
                    )
                    update_sql_request_status(request_id, "failed")
                insert_learning_event(
                    event_type="sql_submitted" if action == "submit" else "sql_executed",
                    content_type="practice",
                    content_id=req.practice_id,
                    user_id=user_id,
                    session_id=session_id,
                    request_id=request_id,
                    duration_ms=elapsed_ms,
                    is_correct=False if action == "submit" else None,
                    metadata={"success": False, "error": str(exc)},
                )
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
            if sql_request_id is not None:
                insert_sql_response(
                    sql_request_id=sql_request_id,
                    success=True,
                    execution_time_ms=elapsed_ms,
                    row_count=len(serialized_rows),
                    result_preview=serialized_rows[:10],
                    metadata={"action": action, "columns": columns},
                )
                update_sql_request_status(request_id, "succeeded")
            insert_learning_event(
                event_type="sql_submitted" if action == "submit" else "sql_executed",
                content_type="practice",
                content_id=req.practice_id,
                user_id=user_id,
                session_id=session_id,
                request_id=request_id,
                duration_ms=elapsed_ms,
                metadata={"success": True, "row_count": len(serialized_rows)},
            )

            return {
                "columns": columns,
                "rows": serialized_rows,
                "executionTimeMs": elapsed_ms,
            }
