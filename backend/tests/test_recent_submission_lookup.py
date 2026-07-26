from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
import unittest
from unittest.mock import MagicMock, patch

from app.api.sql.router import fetch_submitted_query


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
