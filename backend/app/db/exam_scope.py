"""Read-only schema capability detection for an additive rollout.

No DDL and no exception-driven fallback: a query is chosen before any writes.
Capabilities are not cached, so a schema upgrade/feature disable is visible on
the next request, including when a content/dashboard response is cached.
"""
from dataclasses import dataclass
import os

from fastapi import HTTPException

from app.core.exam_scope import ExamType, validate_exam_type

MIGRATION_COLUMNS = frozenset({
    ('exam', 'exams', 'exam_type'),
    ('exam', 'exams', 'grading_policy'),
    ('exam', 'exams', 'pass_threshold_percent'),
    ('education', 'curricula', 'exam_type'),
    ('endless', 'problem_categories', 'exam_type'),
    ('logs', 'endless_answers', 'exam_type'),
    ('logs', 'endless_answers', 'request_id'),
    ('logs', 'endless_answers', 'statistics_cleared_at'),
})
REQUIRED_COLUMNS = MIGRATION_COLUMNS | {('exam', 'subjects', 'pass_threshold_percent')}


@dataclass(frozen=True)
class ExamSchema:
    state: str  # legacy, ready, partial

    @property
    def scoped(self):
        return self.state == 'ready'


def adsp_enabled():
    return os.environ.get('ENABLE_ADSP', '').lower() in {'1', 'true', 'yes'}


def read_schema_capabilities(conn) -> ExamSchema:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT table_schema, table_name, column_name
            FROM information_schema.columns
            WHERE (table_schema, table_name) IN
                (('exam', 'exams'), ('exam', 'subjects'), ('education', 'curricula'),
                 ('endless', 'problem_categories'), ('logs', 'endless_answers'))
              AND column_name IN ('exam_type', 'grading_policy', 'pass_threshold_percent',
                                  'request_id', 'statistics_cleared_at')
            """
        )
        present = {tuple(row) for row in cur.fetchall()}
        if not (present & MIGRATION_COLUMNS):
            return ExamSchema('legacy')
        if not REQUIRED_COLUMNS <= present:
            return ExamSchema('partial')
        cur.execute(
            "SELECT EXISTS (SELECT 1 FROM pg_index WHERE indexrelid = "
            "to_regclass('logs.endless_answers_user_request_uniq') AND indisunique AND indisvalid)"
        )
        return ExamSchema('ready' if cur.fetchone()[0] else 'partial')


def unavailable(reason: str, message: str):
    # Existing clients already display string detail. A stable header lets new
    # clients distinguish readiness from unexpected DB/server errors.
    raise HTTPException(status_code=503, detail=message,
                        headers={'X-Exam-Readiness': reason, 'Retry-After': '60'})


def require_exam_schema(conn, exam_type: ExamType = 'sqld') -> bool:
    validate_exam_type(exam_type)
    schema = read_schema_capabilities(conn)
    if schema.state == 'partial':
        unavailable('schema_partial', '시험 서비스 DB 변경이 완료되지 않았습니다. 잠시 후 다시 시도해주세요.')
    if exam_type == 'adsp':
        if not schema.scoped:
            unavailable('schema_upgrade_required', 'ADsP 서비스 준비 중입니다. 현재 SQLD를 이용해주세요.')
        if not adsp_enabled():
            unavailable('feature_disabled', 'ADsP 서비스는 아직 공개되지 않았습니다.')
    return schema.scoped


def scope_filter(scoped: bool, alias: str = '') -> str:
    # alias is supplied only by source code, never by request input.
    return f" AND {alias + '.' if alias else ''}exam_type = %s" if scoped else ''


def scope_params(scoped: bool, exam_type: ExamType):
    return (exam_type,) if scoped else ()
