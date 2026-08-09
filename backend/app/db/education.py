from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from psycopg.rows import dict_row

from app.db.postgres import get_connection


def _isoformat(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def build_curriculum_tree(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    units_by_id: dict[int, dict[str, Any]] = {}
    lesson_ids: set[int] = set()

    for row in rows:
        unit_id = row.get("unit_id")
        if unit_id is None:
            continue

        if unit_id not in units_by_id:
            units_by_id[unit_id] = {
                "unitId": unit_id,
                "unitCode": row["unit_code"],
                "title": row["unit_title"],
                "description": row.get("unit_description"),
                "sortOrder": row["unit_sort_order"],
                "parentUnitId": row.get("parent_unit_id"),
                "lessons": [],
                "children": [],
            }

        lesson_id = row.get("lesson_id")
        if lesson_id is None or lesson_id in lesson_ids:
            continue

        lesson_ids.add(lesson_id)
        units_by_id[unit_id]["lessons"].append(
            {
                "lessonId": lesson_id,
                "lessonCode": row["lesson_code"],
                "title": row["lesson_title"],
                "summary": row.get("lesson_summary"),
                "estimatedMinutes": row.get("estimated_minutes"),
                "sortOrder": row["lesson_sort_order"],
            }
        )

    roots: list[dict[str, Any]] = []
    for unit in units_by_id.values():
        unit["lessons"].sort(
            key=lambda lesson: (lesson["sortOrder"], lesson["lessonId"])
        )
        parent = units_by_id.get(unit["parentUnitId"])
        if parent:
            parent["children"].append(unit)
        else:
            roots.append(unit)

    def sort_units(units: list[dict[str, Any]]) -> None:
        units.sort(key=lambda unit: (unit["sortOrder"], unit["unitId"]))
        for unit in units:
            sort_units(unit["children"])

    sort_units(roots)
    return roots


def list_published_curricula() -> list[dict[str, Any]]:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    curriculum.curriculum_code,
                    curriculum.title,
                    curriculum.revision_code,
                    curriculum.description,
                    curriculum.published_at,
                    COUNT(lesson.lesson_id) AS lesson_count
                FROM education.curricula curriculum
                LEFT JOIN education.units unit
                  ON unit.curriculum_id = curriculum.curriculum_id
                 AND unit.status = 'PUBLISHED'
                LEFT JOIN education.lessons lesson
                  ON lesson.unit_id = unit.unit_id
                 AND lesson.status = 'PUBLISHED'
                WHERE curriculum.status = 'PUBLISHED'
                GROUP BY curriculum.curriculum_id
                ORDER BY curriculum.published_at DESC, curriculum.curriculum_id DESC
                """
            )
            rows = cur.fetchall()

    return [
        {
            "curriculumCode": row["curriculum_code"],
            "title": row["title"],
            "revisionCode": row["revision_code"],
            "description": row["description"],
            "publishedAt": _isoformat(row["published_at"]),
            "lessonCount": int(row["lesson_count"]),
        }
        for row in rows
    ]


def get_published_curriculum(curriculum_code: str) -> dict[str, Any] | None:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    curriculum_id,
                    curriculum_code,
                    title,
                    revision_code,
                    description,
                    published_at
                FROM education.curricula
                WHERE curriculum_code = %s
                  AND status = 'PUBLISHED'
                """,
                (curriculum_code,),
            )
            curriculum = cur.fetchone()
            if curriculum is None:
                return None

            cur.execute(
                """
                SELECT
                    unit.unit_id,
                    unit.unit_code,
                    unit.title AS unit_title,
                    unit.description AS unit_description,
                    unit.sort_order AS unit_sort_order,
                    unit.parent_unit_id,
                    lesson.lesson_id,
                    lesson.lesson_code,
                    lesson.sort_order AS lesson_sort_order,
                    version.title AS lesson_title,
                    version.summary AS lesson_summary,
                    version.estimated_minutes
                FROM education.units unit
                LEFT JOIN education.lessons lesson
                  ON lesson.unit_id = unit.unit_id
                 AND lesson.status = 'PUBLISHED'
                LEFT JOIN education.lesson_versions version
                  ON version.lesson_id = lesson.lesson_id
                 AND version.status = 'PUBLISHED'
                WHERE unit.curriculum_id = %s
                  AND unit.status = 'PUBLISHED'
                ORDER BY
                    unit.sort_order,
                    unit.unit_id,
                    lesson.sort_order,
                    lesson.lesson_id
                """,
                (curriculum["curriculum_id"],),
            )
            unit_rows = cur.fetchall()

    return {
        "curriculumCode": curriculum["curriculum_code"],
        "title": curriculum["title"],
        "revisionCode": curriculum["revision_code"],
        "description": curriculum["description"],
        "publishedAt": _isoformat(curriculum["published_at"]),
        "units": build_curriculum_tree(unit_rows),
    }


def get_published_lesson(lesson_id: int) -> dict[str, Any] | None:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    lesson.lesson_id,
                    lesson.lesson_code,
                    version.lesson_version_id,
                    version.version_no,
                    version.title,
                    version.summary,
                    version.body_markdown,
                    version.estimated_minutes,
                    version.published_at,
                    unit.unit_id,
                    unit.unit_code,
                    unit.title AS unit_title,
                    curriculum.curriculum_code,
                    curriculum.title AS curriculum_title,
                    curriculum.revision_code
                FROM education.lessons lesson
                JOIN education.lesson_versions version
                  ON version.lesson_id = lesson.lesson_id
                 AND version.status = 'PUBLISHED'
                JOIN education.units unit
                  ON unit.unit_id = lesson.unit_id
                 AND unit.status = 'PUBLISHED'
                JOIN education.curricula curriculum
                  ON curriculum.curriculum_id = unit.curriculum_id
                 AND curriculum.status = 'PUBLISHED'
                WHERE lesson.lesson_id = %s
                  AND lesson.status = 'PUBLISHED'
                """,
                (lesson_id,),
            )
            row = cur.fetchone()

    return _serialize_lesson(row)


def get_published_lesson_by_code(
    *,
    lesson_code: str,
) -> dict[str, Any] | None:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    lesson.lesson_id,
                    lesson.lesson_code,
                    version.lesson_version_id,
                    version.version_no,
                    version.title,
                    version.summary,
                    version.body_markdown,
                    version.estimated_minutes,
                    version.published_at,
                    unit.unit_id,
                    unit.unit_code,
                    unit.title AS unit_title,
                    curriculum.curriculum_code,
                    curriculum.title AS curriculum_title,
                    curriculum.revision_code
                FROM education.curricula curriculum
                JOIN education.units unit
                  ON unit.curriculum_id = curriculum.curriculum_id
                 AND unit.status = 'PUBLISHED'
                JOIN education.lessons lesson
                  ON lesson.unit_id = unit.unit_id
                 AND lesson.status = 'PUBLISHED'
                JOIN education.lesson_versions version
                  ON version.lesson_id = lesson.lesson_id
                 AND version.status = 'PUBLISHED'
                WHERE lesson.lesson_code = %s
                  AND curriculum.status = 'PUBLISHED'
                """,
                (lesson_code,),
            )
            row = cur.fetchone()

    return _serialize_lesson(row)


def _serialize_lesson(row: dict[str, Any] | None) -> dict[str, Any] | None:
    if row is None:
        return None

    return {
        "lessonId": row["lesson_id"],
        "lessonCode": row["lesson_code"],
        "lessonVersionId": row["lesson_version_id"],
        "versionNo": row["version_no"],
        "title": row["title"],
        "summary": row["summary"],
        "bodyMarkdown": row["body_markdown"],
        "estimatedMinutes": row["estimated_minutes"],
        "publishedAt": _isoformat(row["published_at"]),
        "unit": {
            "unitId": row["unit_id"],
            "unitCode": row.get("unit_code"),
            "title": row["unit_title"],
        },
        "curriculum": {
            "curriculumCode": row["curriculum_code"],
            "title": row["curriculum_title"],
            "revisionCode": row["revision_code"],
        },
    }


def serialize_progress(row: dict[str, Any] | None) -> dict[str, Any] | None:
    if row is None:
        return None

    resume_expires_at = row.get("resume_expires_at")
    now = datetime.now(timezone.utc)
    resume_is_valid = bool(resume_expires_at and resume_expires_at > now)

    return {
        "lessonId": row["lesson_id"],
        "lessonVersionId": row["last_opened_version_id"],
        "status": row["status"],
        "lastViewedAt": _isoformat(row["last_viewed_at"]),
        "completedAt": _isoformat(row.get("completed_at")),
        "resumeAnchor": row.get("resume_anchor") if resume_is_valid else None,
        "resumeOffsetPx": row.get("resume_offset_px") if resume_is_valid else None,
        "resumeSavedAt": _isoformat(row.get("resume_saved_at"))
        if resume_is_valid
        else None,
        "resumeExpiresAt": _isoformat(resume_expires_at)
        if resume_is_valid
        else None,
    }


def get_lesson_progress(*, user_id: str, lesson_id: int) -> dict[str, Any] | None:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    lesson_id,
                    last_opened_version_id,
                    status,
                    last_viewed_at,
                    completed_at,
                    resume_anchor,
                    resume_offset_px,
                    resume_saved_at,
                    resume_expires_at
                FROM education.user_lesson_progress
                WHERE user_id = %s::uuid
                  AND lesson_id = %s
                """,
                (user_id, lesson_id),
            )
            row = cur.fetchone()
    return serialize_progress(row)


def save_lesson_progress(
    *,
    user_id: str,
    lesson_id: int,
    lesson_version_id: int,
    resume_anchor: str | None,
    resume_offset_px: int | None,
    completed: bool,
) -> dict[str, Any] | None:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO education.user_lesson_progress (
                    user_id,
                    lesson_id,
                    last_opened_version_id,
                    status,
                    first_opened_at,
                    last_viewed_at,
                    resume_anchor,
                    resume_offset_px,
                    resume_saved_at,
                    resume_expires_at,
                    completed_version_id,
                    completed_at
                )
                SELECT
                    %s::uuid,
                    lesson.lesson_id,
                    version.lesson_version_id,
                    CASE WHEN %s THEN 'COMPLETED' ELSE 'IN_PROGRESS' END,
                    now(),
                    now(),
                    %s,
                    %s,
                    now(),
                    now() + interval '1 day',
                    CASE WHEN %s THEN version.lesson_version_id ELSE NULL END,
                    CASE WHEN %s THEN now() ELSE NULL END
                FROM education.lessons lesson
                JOIN education.lesson_versions version
                  ON version.lesson_id = lesson.lesson_id
                WHERE lesson.lesson_id = %s
                  AND version.lesson_version_id = %s
                  AND lesson.status = 'PUBLISHED'
                  AND version.status = 'PUBLISHED'
                ON CONFLICT (user_id, lesson_id) DO UPDATE
                SET
                    last_opened_version_id = EXCLUDED.last_opened_version_id,
                    status = CASE
                        WHEN education.user_lesson_progress.status = 'COMPLETED'
                          OR EXCLUDED.status = 'COMPLETED'
                        THEN 'COMPLETED'
                        ELSE 'IN_PROGRESS'
                    END,
                    last_viewed_at = now(),
                    resume_anchor = EXCLUDED.resume_anchor,
                    resume_offset_px = EXCLUDED.resume_offset_px,
                    resume_saved_at = EXCLUDED.resume_saved_at,
                    resume_expires_at = EXCLUDED.resume_expires_at,
                    completed_version_id = COALESCE(
                        education.user_lesson_progress.completed_version_id,
                        EXCLUDED.completed_version_id
                    ),
                    completed_at = COALESCE(
                        education.user_lesson_progress.completed_at,
                        EXCLUDED.completed_at
                    )
                RETURNING
                    lesson_id,
                    last_opened_version_id,
                    status,
                    last_viewed_at,
                    completed_at,
                    resume_anchor,
                    resume_offset_px,
                    resume_saved_at,
                    resume_expires_at
                """,
                (
                    user_id,
                    completed,
                    resume_anchor,
                    resume_offset_px,
                    completed,
                    completed,
                    lesson_id,
                    lesson_version_id,
                ),
            )
            row = cur.fetchone()
    return serialize_progress(row)
