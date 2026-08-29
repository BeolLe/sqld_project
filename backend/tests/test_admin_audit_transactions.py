from __future__ import annotations

from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch

from fastapi import HTTPException

from app.api.auth.router import AdminUserRoleUpdateRequest, update_admin_user_role
from app.api.feedback.router import (
    FeedbackAdminStatusUpdateRequest,
    update_feedback_status,
)
from app.db.logs import write_audit_event


def build_request(request_id: str = "request-id") -> SimpleNamespace:
    return SimpleNamespace(
        state=SimpleNamespace(request_id=request_id),
        headers={},
    )


def build_connection(rows: list[tuple]) -> tuple[MagicMock, MagicMock, MagicMock]:
    connection_context = MagicMock()
    connection_context.__exit__.return_value = False
    connection = MagicMock()
    cursor = MagicMock()
    connection_context.__enter__.return_value = connection
    connection.cursor.return_value.__enter__.return_value = cursor
    cursor.fetchone.side_effect = rows
    return connection_context, connection, cursor


class AuditWriterTests(unittest.TestCase):
    def test_transactional_writer_propagates_insert_failure(self):
        connection = MagicMock()
        cursor = MagicMock()
        connection.cursor.return_value.__enter__.return_value = cursor
        cursor.execute.side_effect = RuntimeError("audit insert failed")

        with self.assertRaisesRegex(RuntimeError, "audit insert failed"):
            write_audit_event(
                connection,
                actor_type="ADMIN",
                action="USER_ROLE_UPDATED",
                target_type="auth.user",
                target_id="target-user",
            )


class AdminAuditTransactionTests(unittest.TestCase):
    def test_user_role_change_fails_when_audit_insert_fails(self):
        connection_context, connection, _ = build_connection(
            [(False,), ("target-user", True)]
        )
        current_user = {"user_id": "admin-user", "is_admin": True}

        with (
            patch(
                "app.api.auth.router.get_connection",
                return_value=connection_context,
            ),
            patch(
                "app.api.auth.router.write_audit_event",
                side_effect=RuntimeError("audit insert failed"),
            ) as write_audit,
            patch("app.api.auth.router.insert_audit_failure") as insert_failure,
        ):
            with self.assertRaises(HTTPException) as context:
                update_admin_user_role(
                    "target-user",
                    AdminUserRoleUpdateRequest(is_admin=True),
                    build_request(),
                    current_user,
                )

        self.assertEqual(context.exception.status_code, 500)
        write_audit.assert_called_once()
        self.assertIs(write_audit.call_args.args[0], connection)
        self.assertEqual(
            insert_failure.call_args.kwargs["action"],
            "USER_ROLE_UPDATED",
        )

    def test_feedback_status_change_fails_when_audit_insert_fails(self):
        connection_context, connection, _ = build_connection(
            [("ticket-id", "reviewing")]
        )
        current_user = {"user_id": "admin-user", "is_admin": True}

        with (
            patch(
                "app.api.feedback.router.get_connection",
                return_value=connection_context,
            ),
            patch(
                "app.api.feedback.router.write_audit_event",
                side_effect=RuntimeError("audit insert failed"),
            ) as write_audit,
            patch("app.api.feedback.router.insert_audit_failure") as insert_failure,
        ):
            with self.assertRaises(HTTPException) as context:
                update_feedback_status(
                    "ticket-id",
                    FeedbackAdminStatusUpdateRequest(status="reviewing"),
                    build_request(),
                    current_user,
                )

        self.assertEqual(context.exception.status_code, 500)
        write_audit.assert_called_once()
        self.assertIs(write_audit.call_args.args[0], connection)
        self.assertEqual(
            insert_failure.call_args.kwargs["action"],
            "FEEDBACK_STATUS_UPDATED",
        )


if __name__ == "__main__":
    unittest.main()
