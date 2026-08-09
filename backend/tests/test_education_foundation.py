from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
import unittest
from unittest.mock import MagicMock, patch

from app.db.education import (
    build_curriculum_tree,
    get_published_lesson_by_code,
    save_lesson_progress,
    serialize_progress,
)


class EducationCurriculumTreeTests(unittest.TestCase):
    def test_builds_nested_units_and_deduplicates_lessons(self):
        rows = [
            {
                "unit_id": 2,
                "unit_code": "data-model",
                "unit_title": "데이터 모델링",
                "unit_description": None,
                "unit_sort_order": 1,
                "parent_unit_id": 1,
                "lesson_id": 20,
                "lesson_code": "entity",
                "lesson_sort_order": 2,
                "lesson_title": "엔터티",
                "lesson_summary": None,
                "estimated_minutes": 10,
            },
            {
                "unit_id": 1,
                "unit_code": "subject-1",
                "unit_title": "1과목",
                "unit_description": "데이터 모델링의 이해",
                "unit_sort_order": 1,
                "parent_unit_id": None,
                "lesson_id": None,
                "lesson_code": None,
                "lesson_sort_order": None,
                "lesson_title": None,
                "lesson_summary": None,
                "estimated_minutes": None,
            },
            {
                "unit_id": 2,
                "unit_code": "data-model",
                "unit_title": "데이터 모델링",
                "unit_description": None,
                "unit_sort_order": 1,
                "parent_unit_id": 1,
                "lesson_id": 10,
                "lesson_code": "model",
                "lesson_sort_order": 1,
                "lesson_title": "데이터 모델",
                "lesson_summary": "모델의 기본 개념",
                "estimated_minutes": 8,
            },
            {
                "unit_id": 2,
                "unit_code": "data-model",
                "unit_title": "데이터 모델링",
                "unit_description": None,
                "unit_sort_order": 1,
                "parent_unit_id": 1,
                "lesson_id": 10,
                "lesson_code": "model",
                "lesson_sort_order": 1,
                "lesson_title": "데이터 모델",
                "lesson_summary": "모델의 기본 개념",
                "estimated_minutes": 8,
            },
        ]

        tree = build_curriculum_tree(rows)

        self.assertEqual([unit["unitId"] for unit in tree], [1])
        child = tree[0]["children"][0]
        self.assertEqual(child["unitId"], 2)
        self.assertEqual(
            [lesson["lessonId"] for lesson in child["lessons"]],
            [10, 20],
        )


class EducationProgressTests(unittest.TestCase):
    def test_keeps_unexpired_resume_location(self):
        now = datetime.now(timezone.utc)
        progress = serialize_progress(
            {
                "lesson_id": 10,
                "last_opened_version_id": 100,
                "status": "IN_PROGRESS",
                "last_viewed_at": now,
                "completed_at": None,
                "resume_anchor": "block-12",
                "resume_offset_px": 840,
                "resume_saved_at": now,
                "resume_expires_at": now + timedelta(hours=24),
            }
        )

        self.assertIsNotNone(progress)
        self.assertEqual(progress["resumeAnchor"], "block-12")
        self.assertEqual(progress["resumeOffsetPx"], 840)

    def test_hides_expired_resume_location(self):
        now = datetime.now(timezone.utc)
        progress = serialize_progress(
            {
                "lesson_id": 10,
                "last_opened_version_id": 100,
                "status": "IN_PROGRESS",
                "last_viewed_at": now,
                "completed_at": None,
                "resume_anchor": "block-12",
                "resume_offset_px": 840,
                "resume_saved_at": now - timedelta(days=2),
                "resume_expires_at": now - timedelta(days=1),
            }
        )

        self.assertIsNotNone(progress)
        self.assertIsNone(progress["resumeAnchor"])
        self.assertIsNone(progress["resumeOffsetPx"])
        self.assertIsNone(progress["resumeSavedAt"])
        self.assertIsNone(progress["resumeExpiresAt"])

    def test_saves_resume_location_with_a_server_owned_one_day_ttl(self):
        now = datetime.now(timezone.utc)
        cursor = MagicMock()
        cursor.__enter__.return_value = cursor
        cursor.fetchone.return_value = {
            "lesson_id": 10,
            "last_opened_version_id": 100,
            "status": "IN_PROGRESS",
            "last_viewed_at": now,
            "completed_at": None,
            "resume_anchor": "block-12",
            "resume_offset_px": 840,
            "resume_saved_at": now,
            "resume_expires_at": now + timedelta(days=1),
        }
        connection = MagicMock()
        connection.cursor.return_value = cursor

        @contextmanager
        def fake_connection():
            yield connection

        with patch("app.db.education.get_connection", fake_connection):
            progress = save_lesson_progress(
                user_id="00000000-0000-0000-0000-000000000001",
                lesson_id=10,
                lesson_version_id=100,
                resume_anchor="block-12",
                resume_offset_px=840,
                completed=False,
            )

        query, params = cursor.execute.call_args.args
        self.assertIn("now() + interval '1 day'", query)
        self.assertEqual(params[2:4], ("block-12", 840))
        self.assertEqual(params[-2:], (10, 100))
        self.assertEqual(progress["resumeAnchor"], "block-12")


class EducationLessonLookupTests(unittest.TestCase):
    def test_gets_published_lesson_using_globally_unique_code(self):
        published_at = datetime.now(timezone.utc)
        cursor = MagicMock()
        cursor.__enter__.return_value = cursor
        cursor.fetchone.return_value = {
            "lesson_id": 10,
            "lesson_code": "dm-model",
            "lesson_version_id": 100,
            "version_no": 1,
            "title": "데이터모델의 이해",
            "summary": "데이터 모델링의 핵심 개념",
            "body_markdown": "## 데이터 모델링의 개념",
            "estimated_minutes": 10,
            "published_at": published_at,
            "unit_id": 2,
            "unit_code": "group-data-modeling-understanding",
            "unit_title": "데이터 모델링의 이해",
            "curriculum_code": "sqld-concept",
            "curriculum_title": "SQLD 개념교육",
            "revision_code": "2026.08-v1",
        }
        connection = MagicMock()
        connection.cursor.return_value = cursor

        @contextmanager
        def fake_connection():
            yield connection

        with patch("app.db.education.get_connection", fake_connection):
            lesson = get_published_lesson_by_code(
                lesson_code="dm-model",
            )

        _, params = cursor.execute.call_args.args
        self.assertEqual(params, ("dm-model",))
        self.assertIsNotNone(lesson)
        self.assertEqual(lesson["lessonCode"], "dm-model")
        self.assertEqual(
            lesson["unit"]["unitCode"],
            "group-data-modeling-understanding",
        )
        self.assertEqual(lesson["bodyMarkdown"], "## 데이터 모델링의 개념")


if __name__ == "__main__":
    unittest.main()
