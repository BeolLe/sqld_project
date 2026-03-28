from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass


BASE_TABLES = (
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
)

SUPPORTED_STATEMENTS = {
    "SELECT",
    "WITH",
    "INSERT",
    "UPDATE",
    "DELETE",
    "MERGE",
    "CREATE",
    "ALTER",
    "DROP",
    "RENAME",
    "TRUNCATE",
}

READ_ONLY_STATEMENTS = {"SELECT", "WITH"}
MAX_USER_TABLES = 5
MAX_ROWS_PER_USER_TABLE = 10000
MAX_TOTAL_ROWS_PER_NAMESPACE = 50000
BLOCKED_IDENTIFIER_PATTERNS = (
    "ALL_",
    "DBA_",
    "USER_",
    "V$",
    "GV$",
    "SYS",
    "SYSTEM",
    "DBMS_",
)
BLOCKED_SQL_PATTERNS = (
    r"\bCONNECT\s+BY\b",
    r"\bEXECUTE\s+IMMEDIATE\b",
    r"\bDBMS_RANDOM\b",
)

TARGET_PATTERNS = {
    "CREATE": r"^(\s*CREATE\s+TABLE\s+)([A-Za-z0-9_#$]+)",
    "ALTER": r"^(\s*ALTER\s+TABLE\s+)([A-Za-z0-9_#$]+)",
    "DROP": r"^(\s*DROP\s+TABLE\s+)([A-Za-z0-9_#$]+)",
    "RENAME": r"^(\s*RENAME\s+)([A-Za-z0-9_#$]+)(\s+TO\s+)([A-Za-z0-9_#$]+)",
    "TRUNCATE": r"^(\s*TRUNCATE\s+TABLE\s+)([A-Za-z0-9_#$]+)",
    "INSERT": r"^(\s*INSERT\s+(?:INTO\s+)?)([A-Za-z0-9_#$]+)",
    "UPDATE": r"^(\s*UPDATE\s+)([A-Za-z0-9_#$]+)",
    "DELETE": r"^(\s*DELETE\s+FROM\s+)([A-Za-z0-9_#$]+)",
    "MERGE": r"^(\s*MERGE\s+INTO\s+)([A-Za-z0-9_#$]+)",
}


@dataclass(frozen=True)
class WorkspaceContext:
    practice_id: str
    scope_key: str
    namespace_token: str

    @property
    def namespace_prefix(self) -> str:
        return f"PX_{self.namespace_token}_"

    def table_name(self, logical_name: str) -> str:
        return f"{self.namespace_prefix}{logical_name.upper()}"


class WorkspaceValidationError(ValueError):
    pass


def normalize_practice_id(practice_id: str) -> str:
    normalized = practice_id.strip()
    if not normalized:
        raise WorkspaceValidationError("practice_id is required")
    return normalized


def classify_statement(query: str) -> str:
    stripped = query.lstrip()
    if not stripped:
        raise WorkspaceValidationError("query is required")

    match = re.match(r"[A-Za-z]+", stripped)
    if not match:
        raise WorkspaceValidationError("unable to determine statement type")

    statement = match.group(0).upper()
    if statement not in SUPPORTED_STATEMENTS:
        raise WorkspaceValidationError(
            "only SELECT, WITH, INSERT, UPDATE, DELETE, MERGE, CREATE TABLE, ALTER TABLE, DROP TABLE, RENAME, or TRUNCATE TABLE queries are allowed"
        )
    return statement


def validate_statement_shape(query: str, statement_type: str) -> None:
    if statement_type in TARGET_PATTERNS and extract_target_object(query, statement_type) is None:
        raise WorkspaceValidationError(
            f"unsupported {statement_type} statement shape for SQL practice execution"
        )


def validate_query_safety(query: str) -> None:
    uppercase_query = query.upper()

    for blocked in BLOCKED_IDENTIFIER_PATTERNS:
        if blocked in uppercase_query:
            raise WorkspaceValidationError(
                f"references to {blocked} objects are not allowed in SQL practice execution"
            )

    for pattern in BLOCKED_SQL_PATTERNS:
        if re.search(pattern, uppercase_query, flags=re.IGNORECASE):
            raise WorkspaceValidationError(
                "the submitted query uses a blocked Oracle-specific expansion pattern"
            )


def is_read_only_statement(statement_type: str) -> bool:
    return statement_type in READ_ONLY_STATEMENTS


def build_workspace_context(practice_id: str, scope_key: str) -> WorkspaceContext:
    normalized_practice_id = normalize_practice_id(practice_id)
    normalized_scope_key = scope_key.strip()
    if not normalized_scope_key:
        raise WorkspaceValidationError("workspace scope is required")

    digest = hashlib.sha1(
        f"{normalized_scope_key}:{normalized_practice_id}".encode("utf-8")
    ).hexdigest()[:8].upper()
    return WorkspaceContext(
        practice_id=normalized_practice_id,
        scope_key=normalized_scope_key,
        namespace_token=digest,
    )


def extract_target_object(query: str, statement_type: str) -> str | None:
    pattern = TARGET_PATTERNS.get(statement_type)
    if not pattern:
        return None

    match = re.match(pattern, query, flags=re.IGNORECASE)
    if not match:
        return None

    if statement_type == "RENAME":
        return match.group(2).upper()

    return match.group(2).upper()


def extract_rename_target_object(query: str) -> str | None:
    match = re.match(TARGET_PATTERNS["RENAME"], query, flags=re.IGNORECASE)
    if not match:
        return None
    return match.group(4).upper()


def prepare_namespace(conn, workspace: WorkspaceContext) -> list[str]:
    dropped_tables = cleanup_namespace_tables(conn, workspace)
    create_base_tables(conn, workspace)
    return dropped_tables


def cleanup_namespace_tables(conn, workspace: WorkspaceContext) -> list[str]:
    existing_tables = fetch_namespace_tables(conn, workspace)
    if not existing_tables:
        return []

    with conn.cursor() as cur:
        for table_name in sorted(existing_tables):
            cur.execute(f"DROP TABLE {table_name} PURGE")

    conn.commit()
    return sorted(existing_tables)


def create_base_tables(conn, workspace: WorkspaceContext) -> list[str]:
    with conn.cursor() as cur:
        for base_table in BASE_TABLES:
            cur.execute(
                f"CREATE TABLE {workspace.table_name(base_table)} AS "
                f"SELECT * FROM MASTER_{base_table}"
            )

    conn.commit()
    return list(BASE_TABLES)


def fetch_namespace_tables(conn, workspace: WorkspaceContext) -> set[str]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT table_name FROM user_tables WHERE table_name LIKE :prefix",
            {"prefix": f"{workspace.namespace_prefix}%"},
        )
        return {row[0] for row in cur.fetchall()}


def fetch_user_tables(conn, workspace: WorkspaceContext) -> set[str]:
    namespace_tables = fetch_namespace_tables(conn, workspace)
    base_tables = {workspace.table_name(table) for table in BASE_TABLES}
    return namespace_tables - base_tables


def cleanup_namespace_by_prefix(conn, namespace_prefix: str) -> list[str]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT table_name FROM user_tables WHERE table_name LIKE :prefix",
            {"prefix": f"{namespace_prefix}%"},
        )
        existing_tables = sorted(row[0] for row in cur.fetchall())

    if not existing_tables:
        return []

    with conn.cursor() as cur:
        for table_name in existing_tables:
            cur.execute(f"DROP TABLE {table_name} PURGE")

    conn.commit()
    return existing_tables


def rewrite_query_for_namespace(
    query: str, workspace: WorkspaceContext, statement_type: str
) -> str:
    rewritten = rewrite_target_object_name(query, workspace, statement_type)
    rewritten = rewrite_base_table_references(rewritten, workspace)
    return rewritten


def rewrite_target_object_name(
    query: str, workspace: WorkspaceContext, statement_type: str
) -> str:
    pattern = TARGET_PATTERNS.get(statement_type)
    if not pattern:
        return query

    if statement_type == "RENAME":
        match = re.match(pattern, query, flags=re.IGNORECASE)
        if not match:
            return query
        source_name = workspace.table_name(match.group(2))
        target_name = workspace.table_name(match.group(4))
        return f"{match.group(1)}{source_name}{match.group(3)}{target_name}"

    def replace(match: re.Match[str]) -> str:
        object_name = match.group(2)
        return f"{match.group(1)}{workspace.table_name(object_name)}"

    return re.sub(pattern, replace, query, count=1, flags=re.IGNORECASE)


def rewrite_base_table_references(query: str, workspace: WorkspaceContext) -> str:
    mapping = {table: workspace.table_name(table) for table in BASE_TABLES}
    parts: list[str] = []

    for kind, value in split_sql_segments(query):
        if kind == "code":
            parts.append(rewrite_code_segment(value, mapping))
        else:
            parts.append(value)

    return "".join(parts)


def split_sql_segments(sql: str) -> list[tuple[str, str]]:
    segments: list[tuple[str, str]] = []
    buffer: list[str] = []
    i = 0
    length = len(sql)

    while i < length:
        ch = sql[i]
        next_ch = sql[i + 1] if i + 1 < length else ""

        if ch == "'":
            if buffer:
                segments.append(("code", "".join(buffer)))
                buffer.clear()
            literal, i = consume_single_quote(sql, i)
            segments.append(("literal", literal))
            continue

        if ch == '"':
            if buffer:
                segments.append(("code", "".join(buffer)))
                buffer.clear()
            literal, i = consume_double_quote(sql, i)
            segments.append(("literal", literal))
            continue

        if ch == "-" and next_ch == "-":
            if buffer:
                segments.append(("code", "".join(buffer)))
                buffer.clear()
            literal, i = consume_line_comment(sql, i)
            segments.append(("comment", literal))
            continue

        if ch == "/" and next_ch == "*":
            if buffer:
                segments.append(("code", "".join(buffer)))
                buffer.clear()
            literal, i = consume_block_comment(sql, i)
            segments.append(("comment", literal))
            continue

        buffer.append(ch)
        i += 1

    if buffer:
        segments.append(("code", "".join(buffer)))

    return segments


def consume_single_quote(sql: str, start: int) -> tuple[str, int]:
    i = start + 1
    length = len(sql)
    while i < length:
        if sql[i] == "'" and i + 1 < length and sql[i + 1] == "'":
            i += 2
            continue
        if sql[i] == "'":
            i += 1
            break
        i += 1
    return sql[start:i], i


def consume_double_quote(sql: str, start: int) -> tuple[str, int]:
    i = start + 1
    length = len(sql)
    while i < length:
        if sql[i] == '"' and i + 1 < length and sql[i + 1] == '"':
            i += 2
            continue
        if sql[i] == '"':
            i += 1
            break
        i += 1
    return sql[start:i], i


def consume_line_comment(sql: str, start: int) -> tuple[str, int]:
    i = start
    length = len(sql)
    while i < length and sql[i] != "\n":
        i += 1
    return sql[start:i], i


def consume_block_comment(sql: str, start: int) -> tuple[str, int]:
    i = start + 2
    length = len(sql)
    while i + 1 < length:
        if sql[i] == "*" and sql[i + 1] == "/":
            i += 2
            break
        i += 1
    return sql[start:i], i


def rewrite_code_segment(segment: str, mapping: dict[str, str]) -> str:
    rewritten: list[str] = []
    token: list[str] = []

    def flush_token() -> None:
        if not token:
            return
        value = "".join(token)
        rewritten.append(mapping.get(value.upper(), value))
        token.clear()

    for ch in segment:
        if ch.isalnum() or ch in {"_", "$", "#"}:
            token.append(ch)
            continue

        flush_token()
        rewritten.append(ch)

    flush_token()
    return "".join(rewritten)


def enforce_namespace_limits(conn, workspace: WorkspaceContext) -> None:
    user_tables = sorted(fetch_user_tables(conn, workspace))
    if len(user_tables) > MAX_USER_TABLES:
        raise WorkspaceValidationError(
            f"user-created table limit exceeded: maximum {MAX_USER_TABLES} tables"
        )

    total_rows = 0
    with conn.cursor() as cur:
        for table_name in user_tables:
            cur.execute(f"SELECT COUNT(*) FROM {table_name}")
            row_count = int(cur.fetchone()[0])
            if row_count > MAX_ROWS_PER_USER_TABLE:
                raise WorkspaceValidationError(
                    f"user-created table row limit exceeded: {MAX_ROWS_PER_USER_TABLE} rows max per table"
                )
            total_rows += row_count

    if total_rows > MAX_TOTAL_ROWS_PER_NAMESPACE:
        raise WorkspaceValidationError(
            f"namespace row limit exceeded: maximum {MAX_TOTAL_ROWS_PER_NAMESPACE} rows"
        )
