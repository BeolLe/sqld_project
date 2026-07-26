from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
import unittest
from unittest.mock import MagicMock, patch

from app.api.exams.router import get_latest_exam_result
from app.api.sql.router import fetch_submitted_query


class RecentExamResultLookupTests(unittest.TestCase):
    def test_fetches_answers_from_the_requested_submitted_attempt(self):
        cursor = MagicMock()
        cursor.__enter__.return_value = cursor
        cursor.fetchone.side_effect = [
            {
                "id": 731,
                "status": "submitted",
                "submitted_at": datetime(2026, 7, 20, tzinfo=timezone.utc),
            },
            {
                "passed": True,
                "failed_by_subject_cutoff": False,
                "score_percent": 82.0,
            },
        ]
        connection = MagicMock()
        connection.cursor.return_value = cursor

        @contextmanager
        def fake_connection():
            yield connection

        with (
            patch("app.api.exams.router.get_connection", fake_connection),
            patch(
                "app.api.exams.router.fetch_exam",
                return_value={"id": 9},
            ),
            patch(
                "app.api.exams.router.build_result_payload",
                return_value={
                    "score": 82,
                    "answers": {"exam_q_1": "2"},
                    "problems": [],
                    "correctCount": 41,
                },
            ) as build_payload,
        ):
            result = get_latest_exam_result(
                exam_id="9",
                attempt_id=731,
                current_user={
                    "user_id": "00000000-0000-0000-0000-000000000001"
                },
            )

        first_query_call = cursor.execute.call_args_list[0]
        self.assertIn("AND ea.id = %s", first_query_call.args[0])
        self.assertEqual(
            first_query_call.args[1],
            [9, "00000000-0000-0000-0000-000000000001", 731],
        )
        build_payload.assert_called_once_with(connection, 731)
        self.assertEqual(result["attemptId"], 731)
        self.assertEqual(result["answers"], {"exam_q_1": "2"})


class RecentSubmissionLookupTests(unittest.TestCase):
    def test_fetches_the_requested_submitted_attempt(self):
        submitted_at = datetime(2026, 7, 20, tzinfo=timezone.utc)
        cursor = MagicMock()
        cursor.__enter__.return_value = cursor
        cursor.fetchone.return_value = {
            "id": 731,
            "submitted_sql": "SELECT * FROM EMP",
            "submitted_at": submitted_at,
        }
        connection = MagicMock()
        connection.cursor.return_value = cursor

        @contextmanager
        def fake_connection():
            yield connection

        with patch("app.api.sql.router.get_connection", fake_connection):
            result = fetch_submitted_query(
                practice_code="sql_001",
                user_id="00000000-0000-0000-0000-000000000001",
                attempt_id=731,
            )

        self.assertEqual(result["attempt_id"], "731")
        self.assertEqual(result["submitted_sql"], "SELECT * FROM EMP")
        self.assertEqual(
            cursor.execute.call_args.args[1],
            (
                "sql_001",
                "00000000-0000-0000-0000-000000000001",
                731,
                731,
            ),
        )
        self.assertIn("spa.id = %s::bigint", cursor.execute.call_args.args[0])

    def test_returns_none_when_the_attempt_does_not_belong_to_the_user(self):
        cursor = MagicMock()
        cursor.__enter__.return_value = cursor
        cursor.fetchone.return_value = None
        connection = MagicMock()
        connection.cursor.return_value = cursor

        @contextmanager
        def fake_connection():
            yield connection

        with patch("app.api.sql.router.get_connection", fake_connection):
            result = fetch_submitted_query(
                practice_code="sql_001",
                user_id="00000000-0000-0000-0000-000000000001",
                attempt_id=999,
            )

        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
