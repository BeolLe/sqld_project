import re
from decimal import Decimal
from threading import Lock
from time import monotonic

from fastapi import APIRouter, HTTPException
from psycopg.rows import dict_row

from app.core.config import settings
from app.db.postgres import get_connection

router = APIRouter(prefix="/api/content", tags=["content"])
_content_cache_lock = Lock()
_content_cache: dict[str, tuple[float, list[dict]]] = {}

TABLE_REFERENCE_PATTERN = re.compile(
    r"\b(?:FROM|JOIN|INTO|UPDATE|DELETE\s+FROM|MERGE\s+INTO|TRUNCATE\s+TABLE)\s+([A-Za-z0-9_#$]+)",
    re.IGNORECASE,
)
CREATE_TABLE_PATTERN = re.compile(
    r"^\s*CREATE\s+TABLE\s+([A-Za-z0-9_#$]+)",
    re.IGNORECASE,
)
INSERT_TABLE_PATTERN = re.compile(
    r"^\s*INSERT\s+(?:INTO\s+)?([A-Za-z0-9_#$]+)",
    re.IGNORECASE,
)


def normalize_decimal(value):
    if isinstance(value, Decimal):
        return float(value)
    return value


def extract_referenced_tables(query: str) -> set[str]:
    if not query:
        return set()
    return {match.group(1).upper() for match in TABLE_REFERENCE_PATTERN.finditer(query)}


def split_sql_statements(sql_text: str) -> list[str]:
    if not sql_text:
        return []
    return [statement.strip() for statement in sql_text.split(";") if statement.strip()]


def filter_schema_sql(schema_sql: str, referenced_tables: set[str]) -> str:
    statements = split_sql_statements(schema_sql)
    if not statements or not referenced_tables:
        return schema_sql

    filtered_statements: list[str] = []
    for statement in statements:
        match = CREATE_TABLE_PATTERN.match(statement)
        if not match:
            continue
        table_name = match.group(1).upper()
        if table_name in referenced_tables:
            filtered_statements.append(f"{statement};")

    return "\n".join(filtered_statements) if filtered_statements else schema_sql


def filter_sample_data(sample_data: str, referenced_tables: set[str]) -> str:
    statements = split_sql_statements(sample_data)
    if not statements or not referenced_tables:
        return sample_data

    filtered_statements: list[str] = []
    for statement in statements:
        match = INSERT_TABLE_PATTERN.match(statement)
        if not match:
            continue
        table_name = match.group(1).upper()
        if table_name in referenced_tables:
            filtered_statements.append(f"{statement};")

    return "\n".join(filtered_statements) if filtered_statements else sample_data


def build_exam_problem_payload(row: dict) -> dict:
    question_payload = row["question_payload"] or {}
    choice_payload = row["choice_payload"] or []

    return {
        "id": question_payload.get("source_id") or f"exam_q_{row['question_no']}",
        "title": row["title"],
        "description": row["question_text"],
        "type": row["question_type"],
        "difficulty": row["difficulty"],
        "category": question_payload.get("category") or "미분류",
        "correctRate": normalize_decimal(row["correct_rate"])
        if row["correct_rate"] is not None
        else normalize_decimal(row["seed_correct_rate"]),
        "answer": row["correct_answer"],
        "explanation": row["explanation"],
        "options": choice_payload,
        "points": question_payload.get("points", 2),
    }


def build_practice_problem_payload(row: dict) -> dict:
    prompt_payload = row["prompt_payload"] or {}
    answer_payload = row["answer_payload"] or {}
    referenced_tables = extract_referenced_tables(row["expected_answer"] or "")
    schema_sql = filter_schema_sql(prompt_payload.get("schemaSQL") or "", referenced_tables)
    sample_data = filter_sample_data(prompt_payload.get("sampleData") or "", referenced_tables)

    return {
        "id": row["practice_code"],
        "title": row["title"],
        "description": row["prompt_text"] or "",
        "type": "sql",
        "difficulty": row["difficulty"],
        "category": prompt_payload.get("category") or "미분류",
        "correctRate": normalize_decimal(row["correct_rate"])
        if row["correct_rate"] is not None
        else normalize_decimal(row["seed_correct_rate"]),
        "answer": row["expected_answer"],
        "explanation": answer_payload.get("explanation") or row["description"] or "",
        "schemaSQL": schema_sql,
        "sampleData": sample_data,
        "points": prompt_payload.get("points", 10),
    }


@router.get("/exams")
def list_exams():
    cache_key = "exams"
    now = monotonic()
    ttl = settings.CONTENT_LIST_CACHE_TTL_SECONDS

    with _content_cache_lock:
        cached = _content_cache.get(cache_key)
        if cached and now - cached[0] < ttl:
            return cached[1]

    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    e.exam_code,
                    e.title,
                    e.total_question_count,
                    e.duration_seconds,
                    MAX(question_payload->>'avg_difficulty') AS avg_difficulty,
                    COALESCE(MAX((question_payload->>'round')::int), 0) AS round
                FROM exam.exams e
                LEFT JOIN exam.exam_questions q
                  ON q.exam_id = e.id
                WHERE e.exam_code LIKE 'sqld_mock_%'
                GROUP BY e.id, e.exam_code, e.title, e.total_question_count, e.duration_seconds
                ORDER BY round
                """
            )
            rows = cur.fetchall()

    exams = [
        {
            "id": row["exam_code"].replace("sqld_mock_", ""),
            "round": row["round"],
            "title": row["title"],
            "problemCount": row["total_question_count"],
            "avgDifficulty": row["avg_difficulty"] or "medium",
            "timeLimit": int(row["duration_seconds"] / 60),
        }
        for row in rows
    ]

    with _content_cache_lock:
        _content_cache[cache_key] = (now, exams)

    return exams


@router.get("/exams/{exam_id}")
def get_exam(exam_id: str):
    exam_code = f"sqld_mock_{exam_id}"

    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    q.question_no,
                    q.title,
                    q.question_text,
                    q.question_type,
                    q.difficulty,
                    q.question_payload,
                    q.choice_payload,
                    q.correct_rate,
                    q.seed_correct_rate,
                    ak.correct_answer,
                    ak.explanation
                FROM exam.exam_questions q
                JOIN exam.exams e
                  ON e.id = q.exam_id
                JOIN exam.answer_keys ak
                  ON ak.question_id = q.id
                WHERE e.exam_code = %s
                ORDER BY q.question_no
                """,
                (exam_code,),
            )
            rows = cur.fetchall()

    if not rows:
        raise HTTPException(status_code=404, detail="exam not found")

    return [build_exam_problem_payload(row) for row in rows]


@router.get("/sql-practices")
def list_sql_practices():
    cache_key = "sql_practices"
    now = monotonic()
    ttl = settings.CONTENT_LIST_CACHE_TTL_SECONDS

    with _content_cache_lock:
        cached = _content_cache.get(cache_key)
        if cached and now - cached[0] < ttl:
            return cached[1]

    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    practice_code,
                    title,
                    difficulty,
                    prompt_payload,
                    correct_rate,
                    seed_correct_rate
                FROM practice.sql_practices
                WHERE is_active = true
                ORDER BY practice_code
                """
            )
            rows = cur.fetchall()

    practices = [
        {
            "id": row["practice_code"],
            "title": row["title"],
            "category": (row["prompt_payload"] or {}).get("category") or "미분류",
            "difficulty": row["difficulty"],
            "correctRate": normalize_decimal(row["correct_rate"])
            if row["correct_rate"] is not None
            else normalize_decimal(row["seed_correct_rate"]),
        }
        for row in rows
    ]

    with _content_cache_lock:
        _content_cache[cache_key] = (now, practices)

    return practices


@router.get("/sql-practices/{practice_id}")
def get_sql_practice(practice_id: str):
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    practice_code,
                    title,
                    description,
                    difficulty,
                    prompt_text,
                    prompt_payload,
                    expected_answer,
                    answer_payload,
                    correct_rate,
                    seed_correct_rate
                FROM practice.sql_practices
                WHERE practice_code = %s
                  AND is_active = true
                """,
                (practice_id,),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="practice not found")

    return build_practice_problem_payload(row)
