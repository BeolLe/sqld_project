import time
from datetime import date, datetime
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from psycopg.rows import dict_row

from app.db.logs import (
    ensure_request_id,
    insert_learning_event,
    insert_sql_request,
    insert_sql_response,
    update_sql_request_status,
)
from app.db.postgres import get_connection
from app.db.oracle import get_oracle_connection
from app.db.sql_namespaces import (
    delete_namespace,
    get_namespace,
    list_stale_namespaces,
    touch_namespace,
    upsert_namespace,
)
from app.core.security import decode_access_token
from app.services.sql_grading import compare_result_sets
from app.services.sql_workspace import (
    WorkspaceValidationError,
    build_workspace_context,
    classify_statement,
    cleanup_namespace_by_prefix,
    cleanup_namespace_tables,
    enforce_namespace_limits,
    extract_rename_target_object,
    extract_target_object,
    is_read_only_statement,
    prepare_namespace,
    rewrite_query_for_namespace,
    validate_statement_shape,
    validate_query_safety,
)

router = APIRouter(prefix="/api/sql", tags=["sql"])

MAX_ROWS = 50
RESERVED_BASE_TABLES = {
    "COURSE",
    "CUSTOMER",
    "DEPT",
    "EMP",
    "ENROLLMENT",
    "ORDERS",
    "ORDER_DETAIL",
    "PRODUCT",
    "PROFESSOR",
    "SALGRADE",
    "SAL_HISTORY",
    "STUDENT",
}


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
        statement_type = classify_statement(normalized)
        validate_statement_shape(normalized, statement_type)
        validate_query_safety(normalized)
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


def fetch_expected_result(practice_code: str) -> dict | None:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    per.id,
                    per.result_columns,
                    per.result_rows,
                    per.row_count,
                    per.result_hash,
                    per.comparison_mode
                FROM practice.sql_practice_expected_results per
                JOIN practice.sql_practices p
                  ON p.id = per.practice_id
                WHERE p.practice_code = %s
                  AND p.is_active = true
                  AND per.is_active = true
                """,
                (practice_code,),
            )
            return cur.fetchone()


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

    return workspace, session_id, user_id, scope_key


def cleanup_stale_namespaces() -> None:
    stale_records = list_stale_namespaces()
    if not stale_records:
        return

    with get_oracle_connection() as conn:
        for record in stale_records:
            cleanup_namespace_by_prefix(conn, record.namespace_prefix)
            delete_namespace(record.scope_key)


def sync_namespace_lifecycle(
    *,
    conn,
    workspace,
    scope_key: str,
    practice_id: str,
    user_id: str | None,
    session_id: str | None,
) -> None:
    existing = get_namespace(scope_key)
    if existing and existing.practice_id != practice_id:
        cleanup_namespace_by_prefix(conn, existing.namespace_prefix)
        delete_namespace(scope_key)

    prepare_namespace(conn, workspace)
    upsert_namespace(
        scope_key=scope_key,
        practice_id=practice_id,
        namespace_token=workspace.namespace_token,
        namespace_prefix=workspace.namespace_prefix,
        user_id=user_id,
        session_id=session_id,
    )


@router.post("/workspace/init")
def init_workspace(req: SQLWorkspaceRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    workspace, session_id, user_id, scope_key = resolve_workspace_scope(
        request=request,
        practice_id=req.practice_id,
        request_id=request_id,
        require_persistent_scope=True,
    )

    cleanup_stale_namespaces()
    with get_oracle_connection() as conn:
        sync_namespace_lifecycle(
            conn=conn,
            workspace=workspace,
            scope_key=scope_key,
            practice_id=req.practice_id,
            user_id=user_id,
            session_id=session_id,
        )

    return {
        "practiceId": workspace.practice_id,
        "workspaceToken": workspace.namespace_token,
        "tableCount": 12,
        "sessionId": session_id,
        "userId": user_id,
    }


@router.post("/workspace/cleanup")
def cleanup_workspace(req: SQLWorkspaceRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    workspace, session_id, user_id, scope_key = resolve_workspace_scope(
        request=request,
        practice_id=req.practice_id,
        request_id=request_id,
        require_persistent_scope=True,
    )

    with get_oracle_connection() as conn:
        dropped_tables = cleanup_namespace_tables(conn, workspace)
    delete_namespace(scope_key)

    return {
        "practiceId": workspace.practice_id,
        "workspaceToken": workspace.namespace_token,
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

    try:
        query = validate_query(req.query)
        statement_type = classify_statement(query)
        validate_statement_shape(query, statement_type)
        validate_query_safety(query)
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
    scope_key = None

    cleanup_stale_namespaces()
    with get_oracle_connection() as conn:
        try:
            workspace, session_id, user_id, scope_key = resolve_workspace_scope(
                request=request,
                practice_id=req.practice_id,
                request_id=request_id,
            )

            if has_persistent_scope:
                sync_namespace_lifecycle(
                    conn=conn,
                    workspace=workspace,
                    scope_key=scope_key,
                    practice_id=req.practice_id,
                    user_id=user_id,
                    session_id=session_id,
                )
            else:
                prepare_namespace(conn, workspace)

            executed_query = rewrite_query_for_namespace(
                query=query,
                workspace=workspace,
                statement_type=statement_type,
            )

            target_object = extract_target_object(query, statement_type)
            rename_target_object = (
                extract_rename_target_object(query) if statement_type == "RENAME" else None
            )
            if statement_type == "CREATE" and target_object in RESERVED_BASE_TABLES:
                raise HTTPException(
                    status_code=400,
                    detail="cannot CREATE TABLE using a reserved base table name",
                )
            if statement_type == "RENAME" and (
                target_object in RESERVED_BASE_TABLES
                or rename_target_object in RESERVED_BASE_TABLES
            ):
                raise HTTPException(
                    status_code=400,
                    detail="cannot RENAME reserved base tables",
                )

            with conn.cursor() as cur:
                try:
                    cur.execute(executed_query)
                    if is_read_only_statement(statement_type):
                        rows = cur.fetchmany(MAX_ROWS)
                    else:
                        conn.commit()
                        enforce_namespace_limits(conn, workspace)
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
                        "isCorrect": False if action == "submit" else None,
                    }

                if has_persistent_scope and scope_key:
                    touch_namespace(scope_key)

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
                is_correct = None
                grading = None

                if action == "submit":
                    expected_result = fetch_expected_result(req.practice_id)
                    if expected_result:
                        is_correct, grading = compare_result_sets(
                            user_columns=columns,
                            user_rows=serialized_rows,
                            expected_columns=expected_result["result_columns"],
                            expected_rows=expected_result["result_rows"],
                            comparison_mode=expected_result["comparison_mode"],
                        )
                    else:
                        grading = {
                            "reason": "missing_expected_result",
                            "comparisonMode": None,
                        }

                insert_learning_event(
                    event_type="sql_submitted" if action == "submit" else "sql_executed",
                    content_type="practice",
                    content_id=req.practice_id,
                    user_id=user_id,
                    session_id=session_id,
                    request_id=request_id,
                    duration_ms=elapsed_ms,
                    is_correct=is_correct,
                    metadata={
                        "success": True,
                        "row_count": len(serialized_rows),
                        "grading": grading,
                    },
                )

                response = {
                    "columns": columns,
                    "rows": serialized_rows,
                    "executionTimeMs": elapsed_ms,
                }
                if not is_read_only_statement(statement_type):
                    response["affectedRows"] = cur.rowcount
                if action == "submit":
                    response["isCorrect"] = is_correct
                    response["grading"] = grading

                return response
        finally:
            if workspace is not None:
                if not has_persistent_scope:
                    cleanup_namespace_tables(conn, workspace)
