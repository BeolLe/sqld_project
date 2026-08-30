from __future__ import annotations

from datetime import date, datetime, timezone
import unittest
from unittest.mock import MagicMock, patch

from fastapi import HTTPException

from app.api.auth.router import get_admin_user_summary, list_admin_users


def build_connection() -> tuple[MagicMock, MagicMock]:
    connection_context = MagicMock()
    connection_context.__exit__.return_value = False
    connection = MagicMock()
    cursor = MagicMock()
    connection_context.__enter__.return_value = connection
    connection.cursor.return_value.__enter__.return_value = cursor
    return connection_context, cursor


class AdminUserSummaryTests(unittest.TestCase):
    def test_summary_counts_only_active_non_admin_users(self):
        connection_context, cursor = build_connection()
        cursor.fetchone.return_value = (37,)

        with patch(
            "app.api.auth.router.get_connection",
            return_value=connection_context,
        ):
            result = get_admin_user_summary(
                current_user={"user_id": "admin-user", "is_admin": True}
            )

        self.assertEqual(result, {"non_admin_total": 37})
        executed_sql = cursor.execute.call_args.args[0]
        self.assertIn("is_active = true", executed_sql)
        self.assertIn("is_admin = false", executed_sql)


class AdminUserFilterTests(unittest.TestCase):
    def test_filters_are_applied_to_count_and_list_queries(self):
        connection_context, cursor = build_connection()
        created_at = datetime(2026, 8, 20, 3, 0, tzinfo=timezone.utc)
        cursor.fetchone.return_value = (1,)
        cursor.fetchall.return_value = [
            ("user-1", "person@gmail.com", "학습자", 450, False, created_at)
        ]

        with patch(
            "app.api.auth.router.get_connection",
            return_value=connection_context,
        ):
            result = list_admin_users(
                page=1,
                size=20,
                search="학습자",
                registered_from=date(2026, 8, 1),
                registered_to=date(2026, 8, 31),
                email_domain="@GMAIL.COM",
                min_points=100,
                max_points=500,
                role="user",
                current_user={"user_id": "admin-user", "is_admin": True},
            )

        self.assertEqual(result["total"], 1)
        self.assertEqual(result["items"][0]["points"], 450)
        self.assertEqual(result["items"][0]["created_at"], created_at.isoformat())

        count_call, list_call = cursor.execute.call_args_list
        for query_call in (count_call, list_call):
            executed_sql = query_call.args[0]
            self.assertIn("split_part(lower(u.email), '@', 2)", executed_sql)
            self.assertIn("COALESCE(ds.total_points, 0)", executed_sql)
            self.assertIn("u.is_admin = false", executed_sql)

        count_params = count_call.args[1]
        self.assertIn(date(2026, 8, 1), count_params)
        self.assertIn(date(2026, 8, 31), count_params)
        self.assertIn("gmail.com", count_params)
        self.assertIn(100, count_params)
        self.assertIn(500, count_params)
        self.assertIn("user", count_params)

        list_params = list_call.args[1]
        self.assertEqual(list_params[-2:], (20, 0))

    def test_rejects_inverted_registration_period(self):
        with self.assertRaises(HTTPException) as context:
            list_admin_users(
                registered_from=date(2026, 8, 31),
                registered_to=date(2026, 8, 1),
                current_user={"user_id": "admin-user", "is_admin": True},
            )

        self.assertEqual(context.exception.status_code, 400)

    def test_rejects_inverted_point_range(self):
        with self.assertRaises(HTTPException) as context:
            list_admin_users(
                min_points=500,
                max_points=100,
                current_user={"user_id": "admin-user", "is_admin": True},
            )

        self.assertEqual(context.exception.status_code, 400)


if __name__ == "__main__":
    unittest.main()
