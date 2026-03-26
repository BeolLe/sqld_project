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

SUPPORTED_STATEMENTS = {"SELECT", "WITH", "INSERT", "UPDATE", "DELETE", "MERGE"}


@dataclass(frozen=True)
class WorkspaceContext:
    practice_id: str
    scope_key: str
    workspace_token: str

    def table_name(self, base_table: str) -> str:
        return f"WS_{self.workspace_token}_{base_table}"


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
            "only SELECT, WITH, INSERT, UPDATE, DELETE, or MERGE queries are allowed"
        )
    return statement


def is_read_only_statement(statement_type: str) -> bool:
    return statement_type in {"SELECT", "WITH"}


def extract_mutation_target_table(query: str, statement_type: str) -> str | None:
    patterns = {
        "INSERT": r"^\s*INSERT\s+(?:INTO\s+)?([A-Za-z0-9_#$]+)",
        "UPDATE": r"^\s*UPDATE\s+([A-Za-z0-9_#$]+)",
        "DELETE": r"^\s*DELETE\s+FROM\s+([A-Za-z0-9_#$]+)",
        "MERGE": r"^\s*MERGE\s+INTO\s+([A-Za-z0-9_#$]+)",
    }
    pattern = patterns.get(statement_type)
    if not pattern:
        return None

    match = re.match(pattern, query, flags=re.IGNORECASE)
    if not match:
        return None

    return match.group(1).upper()


def build_workspace_context(practice_id: str, scope_key: str) -> WorkspaceContext:
    normalized_practice_id = normalize_practice_id(practice_id)
    if not scope_key.strip():
        raise WorkspaceValidationError("workspace scope is required")

    digest = hashlib.sha1(
        f"{scope_key}:{normalized_practice_id}".encode("utf-8")
    ).hexdigest()[:8].upper()
    return WorkspaceContext(
        practice_id=normalized_practice_id,
        scope_key=scope_key.strip(),
        workspace_token=digest,
    )


def extract_referenced_base_tables(query: str) -> list[str]:
    tokens = {token.upper() for token in _tokenize_sql_identifiers(query)}
    return [table for table in BASE_TABLES if table in tokens]


def rewrite_query_for_workspace(query: str, workspace: WorkspaceContext) -> str:
    mapping = {table: workspace.table_name(table) for table in BASE_TABLES}
    parts: list[str] = []

    for kind, value in _split_sql_segments(query):
        if kind == "code":
            parts.append(_rewrite_code_segment(value, mapping))
        else:
            parts.append(value)

    return "".join(parts)


def ensure_workspace_tables(
    conn, workspace: WorkspaceContext, base_tables: list[str] | None = None
) -> list[str]:
    target_tables = base_tables or list(BASE_TABLES)
    if not target_tables:
        return []

    existing = _fetch_existing_workspace_tables(conn, workspace)

    with conn.cursor() as cur:
        for base_table in target_tables:
            workspace_table = workspace.table_name(base_table)
            if workspace_table in existing:
                continue
            cur.execute(
                f"CREATE TABLE {workspace_table} AS "
                f"SELECT * FROM MASTER_{base_table}"
            )

    conn.commit()
    return target_tables


def reset_workspace_tables(conn, workspace: WorkspaceContext, base_tables: list[str]) -> None:
    if not base_tables:
        return

    existing = _fetch_existing_workspace_tables(conn, workspace)

    with conn.cursor() as cur:
        for base_table in base_tables:
            workspace_table = workspace.table_name(base_table)
            if workspace_table not in existing:
                cur.execute(
                    f"CREATE TABLE {workspace_table} AS "
                    f"SELECT * FROM MASTER_{base_table}"
                )
                continue

            cur.execute(f"TRUNCATE TABLE {workspace_table}")
            cur.execute(
                f"INSERT INTO {workspace_table} "
                f"SELECT * FROM MASTER_{base_table}"
            )

    conn.commit()


def cleanup_workspace_tables(
    conn, workspace: WorkspaceContext, base_tables: list[str] | None = None
) -> list[str]:
    target_tables = base_tables or list(BASE_TABLES)
    if not target_tables:
        return []

    existing = _fetch_existing_workspace_tables(conn, workspace)
    dropped_tables: list[str] = []

    with conn.cursor() as cur:
        for base_table in target_tables:
            workspace_table = workspace.table_name(base_table)
            if workspace_table not in existing:
                continue
            cur.execute(f"DROP TABLE {workspace_table} PURGE")
            dropped_tables.append(workspace_table)

    conn.commit()
    return dropped_tables


def _fetch_existing_workspace_tables(conn, workspace: WorkspaceContext) -> set[str]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT table_name FROM user_tables WHERE table_name LIKE :prefix",
            {"prefix": f"WS_{workspace.workspace_token}_%"},
        )
        return {row[0] for row in cur.fetchall()}


def _split_sql_segments(sql: str) -> list[tuple[str, str]]:
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
            literal, i = _consume_single_quote(sql, i)
            segments.append(("literal", literal))
            continue

        if ch == '"':
            if buffer:
                segments.append(("code", "".join(buffer)))
                buffer.clear()
            literal, i = _consume_double_quote(sql, i)
            segments.append(("literal", literal))
            continue

        if ch == "-" and next_ch == "-":
            if buffer:
                segments.append(("code", "".join(buffer)))
                buffer.clear()
            literal, i = _consume_line_comment(sql, i)
            segments.append(("comment", literal))
            continue

        if ch == "/" and next_ch == "*":
            if buffer:
                segments.append(("code", "".join(buffer)))
                buffer.clear()
            literal, i = _consume_block_comment(sql, i)
            segments.append(("comment", literal))
            continue

        buffer.append(ch)
        i += 1

    if buffer:
        segments.append(("code", "".join(buffer)))

    return segments


def _consume_single_quote(sql: str, start: int) -> tuple[str, int]:
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


def _consume_double_quote(sql: str, start: int) -> tuple[str, int]:
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


def _consume_line_comment(sql: str, start: int) -> tuple[str, int]:
    i = start
    length = len(sql)
    while i < length and sql[i] != "\n":
        i += 1
    return sql[start:i], i


def _consume_block_comment(sql: str, start: int) -> tuple[str, int]:
    i = start + 2
    length = len(sql)
    while i + 1 < length:
        if sql[i] == "*" and sql[i + 1] == "/":
            i += 2
            break
        i += 1
    return sql[start:i], i


def _rewrite_code_segment(segment: str, mapping: dict[str, str]) -> str:
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


def _tokenize_sql_identifiers(sql: str) -> list[str]:
    tokens: list[str] = []
    for kind, value in _split_sql_segments(sql):
        if kind != "code":
            continue

        token: list[str] = []
        for ch in value:
            if ch.isalnum() or ch in {"_", "$", "#"}:
                token.append(ch)
                continue

            if token:
                tokens.append("".join(token))
                token.clear()

        if token:
            tokens.append("".join(token))

    return tokens
