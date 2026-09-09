import unittest
from unittest.mock import patch

from app.api.sql import router as sql_router
from app.api.sql.router import result_fetch_limit
from app.core.config import settings
from app.db import oracle
from app.services.sql_workspace import WorkspaceValidationError, validate_query_safety


class _FakeConnection:
    call_timeout = 0


class _FakePool:
    def __init__(self, connection):
        self.connection = connection

    def acquire(self):
        return self.connection


class _FakeCursor:
    def __init__(self, events):
        self.events = events

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def execute(self, query):
        self.events.append(query)


class _FakeMutationConnection:
    def __init__(self):
        self.events = []

    def cursor(self):
        return _FakeCursor(self.events)

    def commit(self):
        self.events.append("commit")

    def rollback(self):
        self.events.append("rollback")


class _FakeWorkspace:
    def table_name(self, logical_name):
        return f"PX_TEST_{logical_name}"


class SQLRuntimeGuardrailTests(unittest.TestCase):
    def test_oracle_connection_applies_call_timeout(self):
        connection = _FakeConnection()
        with (
            patch.object(oracle, "oracle_pool", _FakePool(connection)),
            patch.object(settings, "ORACLE_CALL_TIMEOUT_MS", 7000),
        ):
            self.assertIs(oracle.get_oracle_connection(), connection)

        self.assertEqual(connection.call_timeout, 7000)

    def test_submit_fetches_one_more_than_expected_row_count(self):
        self.assertEqual(result_fetch_limit("submit", {"row_count": 201}), 202)

    def test_execute_fetches_one_more_than_visible_row_limit(self):
        self.assertEqual(result_fetch_limit("execute", None), 51)

    def test_rejects_direct_runtime_table_access(self):
        for query in (
            "SELECT * FROM MASTER_EMP",
            'SELECT * FROM "MASTER_EMP"',
            "SELECT * FROM PX_DEADBEEF_EMP",
            'SELECT * FROM "PX_DEADBEEF_EMP"',
        ):
            with self.subTest(query=query):
                with self.assertRaises(WorkspaceValidationError):
                    validate_query_safety(query)

    def test_rejects_oracle_optimizer_hints(self):
        with self.assertRaises(WorkspaceValidationError):
            validate_query_safety("SELECT /*+ PARALLEL(32) */ * FROM EMP")

    def test_blocked_words_inside_literals_are_allowed(self):
        validate_query_safety("SELECT 'system' AS label FROM EMP")

    def test_namespace_limits_are_checked_before_commit(self):
        connection = _FakeMutationConnection()
        with patch.object(
            sql_router,
            "enforce_namespace_limits",
            side_effect=lambda *_args: connection.events.append("limits"),
        ):
            sql_router.commit_namespace_mutation(
                connection,
                _FakeWorkspace(),
                "INSERT",
                "NOTES",
            )

        self.assertEqual(connection.events, ["limits", "commit"])

    def test_limit_failure_rolls_back_uncommitted_changes(self):
        connection = _FakeMutationConnection()

        def fail_limits(*_args):
            connection.events.append("limits")
            raise WorkspaceValidationError("too many rows")

        with (
            patch.object(sql_router, "enforce_namespace_limits", side_effect=fail_limits),
            self.assertRaises(WorkspaceValidationError),
        ):
            sql_router.commit_namespace_mutation(
                connection,
                _FakeWorkspace(),
                "INSERT",
                "NOTES",
            )

        self.assertEqual(connection.events, ["limits", "rollback"])


if __name__ == "__main__":
    unittest.main()
