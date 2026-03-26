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
from app.services.sql_workspace import (
    WorkspaceValidationError,
    build_workspace_context,
    classify_statement,
    cleanup_workspace_tables,
    ensure_workspace_tables,
    extract_mutation_target_table,
    extract_referenced_base_tables,
    is_read_only_statement,
    reset_workspace_tables,
    rewrite_query_for_workspace,
)

router = APIRouter(prefix="/api/sql", tags=["sql"])

MAX_ROWS = 200


class SQLExecuteRequest(BaseModel):
    practice_id: str
    query: str
    action: str = "execute"


class SQLWorkspaceRequest(BaseModel):
    practice_id: str


def normalize_value(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def validate_query(query: str) -> str:
    normalized = query.strip()

    if not normalized:
        raise HTTPException(status_code=400, detail="query is required")

    if ";" in normalized.rstrip(";"):
        raise HTTPException(status_code=400, detail="only one query is allowed")

    try:
        classify_statement(normalized)
    except WorkspaceValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

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


def resolve_workspace_scope(
    request: Request,
    practice_id: str,
    request_id: str,
    require_persistent_scope: bool = False,
):
    session_id = request.headers.get("x-session-id")
    user_id = extract_user_id(request)

    scope_key = session_id or user_id or (None if require_persistent_scope else request_id)
    if not scope_key:
        raise HTTPException(
            status_code=400,
            detail="workspace identity requires authorization or x-session-id",
        )

    try:
        workspace = build_workspace_context(practice_id=practice_id, scope_key=scope_key)
    except WorkspaceValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return workspace, session_id, user_id


@router.post("/workspace/init")
def init_workspace(req: SQLWorkspaceRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    workspace, session_id, user_id = resolve_workspace_scope(
        request=request,
        practice_id=req.practice_id,
        request_id=request_id,
        require_persistent_scope=True,
    )

    with get_oracle_connection() as conn:
        initialized_tables = ensure_workspace_tables(conn, workspace)

    return {
        "practiceId": workspace.practice_id,
        "workspaceToken": workspace.workspace_token,
        "tableCount": len(initialized_tables),
        "sessionId": session_id,
        "userId": user_id,
    }


@router.post("/workspace/cleanup")
def cleanup_workspace(req: SQLWorkspaceRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    workspace, session_id, user_id = resolve_workspace_scope(
        request=request,
        practice_id=req.practice_id,
        request_id=request_id,
        require_persistent_scope=True,
    )

    with get_oracle_connection() as conn:
        dropped_tables = cleanup_workspace_tables(conn, workspace)

    return {
        "practiceId": workspace.practice_id,
        "workspaceToken": workspace.workspace_token,
        "droppedTableCount": len(dropped_tables),
        "sessionId": session_id,
        "userId": user_id,
    }


@router.post("/execute")
def execute_sql(req: SQLExecuteRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    session_id = request.headers.get("x-session-id")
    user_id = extract_user_id(request)
    action = req.action if req.action in {"execute", "submit"} else "execute"
    has_persistent_scope = bool(session_id or user_id)
    referenced_tables: list[str] = []

    try:
        query = validate_query(req.query)
        statement_type = classify_statement(query)
        referenced_tables = extract_referenced_base_tables(query)
        if not is_read_only_statement(statement_type):
            mutation_target_table = extract_mutation_target_table(query, statement_type)
            if mutation_target_table not in referenced_tables:
                raise HTTPException(
                    status_code=400,
                    detail="mutating queries must target a practice base table such as EMP or DEPT",
                )
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
        statement_type=statement_type,
        status="pending",
        metadata={"action": action},
    )

    workspace = None
    executed_query = query
    should_cleanup_workspace = False
    should_reset_workspace = False

    with get_oracle_connection() as conn:
        try:
            if referenced_tables:
                workspace, session_id, user_id = resolve_workspace_scope(
                    request=request,
                    practice_id=req.practice_id,
                    request_id=request_id,
                )
                ensure_workspace_tables(conn, workspace, referenced_tables)
                executed_query = rewrite_query_for_workspace(query, workspace)
                should_cleanup_workspace = not has_persistent_scope
                should_reset_workspace = has_persistent_scope and not is_read_only_statement(
                    statement_type
                )

            with conn.cursor() as cur:
                try:
                    cur.execute(executed_query)
                    if is_read_only_statement(statement_type):
                        rows = cur.fetchmany(MAX_ROWS)
                    else:
                        conn.commit()
                        rows = []
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
                            metadata={"action": action, "statementType": statement_type},
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
                        metadata={"action": action, "columns": columns, "statementType": statement_type},
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

                response = {
                    "columns": columns,
                    "rows": serialized_rows,
                    "executionTimeMs": elapsed_ms,
                }
                if not is_read_only_statement(statement_type):
                    response["affectedRows"] = cur.rowcount

                return response
        finally:
            if workspace is not None:
                if should_cleanup_workspace:
                    cleanup_workspace_tables(conn, workspace, referenced_tables)
                elif should_reset_workspace:
                    reset_workspace_tables(conn, workspace, referenced_tables)
