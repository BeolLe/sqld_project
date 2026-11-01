import re
import unittest
from contextlib import ExitStack, nullcontext
from types import SimpleNamespace
from unittest.mock import DEFAULT, MagicMock, patch

from fastapi import BackgroundTasks, HTTPException, Request

from app.api.sql import router as sql_router
from app.api.sql.router import result_fetch_limit
from app.core.config import settings
from app.db import oracle
from app.services import sql_workspace
from app.services.sql_workspace import WorkspaceValidationError, validate_query_safety


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
    namespace_prefix = "PX_TEST_"

    def table_name(self, logical_name):
        return f"PX_TEST_{logical_name}"


class SQLRuntimeGuardrailTests(unittest.TestCase):
    def test_oracle_connection_applies_call_timeout(self):
        connection = MagicMock()
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

    def test_stage_durations_are_not_cumulative_request_times(self):
        self.assertEqual(
            sql_router.sql_stage_durations({"scopeResolvedMs": 9, "oracleConnectionAcquiredMs": 1110,
                                            "workspacePreparedMs": 1133, "failureMs": 8133}),
            {"scopeResolvedMs": 9, "oracleConnectionAcquiredMs": 1101,
             "workspacePreparedMs": 23, "failureMs": 7000},
        )

    def test_rejects_direct_runtime_table_access(self):
        for query in (
            "SELECT * FROM MASTER_EMP",
            'SELECT * FROM "MASTER_EMP"',
            "SELECT * FROM PX_DEADBEEF_EMP",
            'SELECT * FROM "PX_DEADBEEF_EMP"',
            'SELECT * FROM PX_0123456789AB_EMP',
        ):
            with self.subTest(query=query):
                with self.assertRaises(WorkspaceValidationError):
                    validate_query_safety(query)

    def test_rejects_oracle_optimizer_hints(self):
        for query in (
            "SELECT /*+ PARALLEL(32) */ * FROM EMP",
            "SELECT --+ PARALLEL(32)\n* FROM EMP",
        ):
            with self.subTest(query=query):
                with self.assertRaises(WorkspaceValidationError):
                    validate_query_safety(query)

    def test_blocked_words_inside_literals_are_allowed(self):
        for query in (
            "SELECT 'system' AS label FROM EMP",
            "SELECT '/*+ PARALLEL */' AS label FROM EMP",
            "SELECT '--+ PARALLEL(32)' AS label FROM EMP",
            "SELECT -- ordinary comment\nEMPNO FROM EMP",
            "SELECT /* ordinary comment */ EMPNO FROM EMP",
        ):
            with self.subTest(query=query):
                validate_query_safety(query)

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

    def test_workspace_reset_batches_drop_and_create_statements(self):
        connection = _FakeMutationConnection()
        with patch.object(
            sql_workspace,
            "fetch_namespace_tables",
            return_value={"PX_TEST_OLD"},
        ):
            dropped_tables = sql_workspace.prepare_namespace(
                connection,
                _FakeWorkspace(),
            )

        self.assertEqual(dropped_tables, ["PX_TEST_OLD"])
        self.assertEqual(len(connection.events), 2)
        self.assertTrue(connection.events[0].startswith("BEGIN\n"))
        self.assertEqual(connection.events[0].count("EXECUTE IMMEDIATE"), 13)
        self.assertEqual(connection.events[1], "commit")


class OracleSerialPolicyTests(unittest.TestCase):
    statements = [
        "ALTER SESSION DISABLE PARALLEL QUERY",
        "ALTER SESSION DISABLE PARALLEL DDL",
        "ALTER SESSION DISABLE PARALLEL DML",
    ]

    def setUp(self):
        self.stack = ExitStack()
        self.addCleanup(self.stack.close)
        self.stack.enter_context(patch("socket.socket.connect", side_effect=AssertionError("network prohibited")))
        self.pool = MagicMock()
        self.conn = self.pool.acquire.return_value
        self.cur = self.conn.cursor.return_value
        self.cur.__enter__.return_value = self.cur
        self.stack.enter_context(patch.object(oracle, "oracle_pool", self.pool))
        self.stack.enter_context(patch.object(settings, "ORACLE_CALL_TIMEOUT_MS", 7000))

    def test_policy_applied_on_every_checkout_before_any_workspace_sql(self):
        self.cur.fetchall.return_value = []
        for prepare in (sql_workspace.prepare_namespace, sql_workspace.create_base_tables):
            with self.subTest(prepare=prepare.__name__):
                self.cur.reset_mock()
                observed_timeouts = []
                self.cur.execute.side_effect = lambda *_args: observed_timeouts.append(self.conn.call_timeout)
                connection = oracle.get_oracle_connection()
                prepare(connection, _FakeWorkspace())
                queries = [call.args[0] for call in self.cur.execute.call_args_list]
                self.assertEqual(queries[:3], self.statements)
                self.assertEqual(observed_timeouts[:3], [7000, 7000, 7000])
                self.assertEqual(queries[-1].count("NOPARALLEL AS SELECT /*+ NO_PARALLEL */"), 12)
                self.assertTrue(all(query.startswith("ALTER SESSION") for query in queries[:3]))
                connection.close()
        self.assertEqual(self.pool.acquire.call_count, 2)
        self.assertEqual(self.conn.close.call_count, 2)
        self.pool.drop.assert_not_called()

    def test_each_policy_failure_discards_connection_before_returning_it(self):
        for failed_index in range(3):
            with self.subTest(failed_index=failed_index):
                self.cur.reset_mock()
                self.pool.drop.reset_mock()
                failure = oracle.oracledb.DatabaseError("DPY-4024: setting timeout")
                self.cur.execute.side_effect = [None] * failed_index + [failure]
                with self.assertRaises(oracle.oracledb.DatabaseError) as raised:
                    oracle.get_oracle_connection()
                self.assertIs(raised.exception, failure)
                self.assertEqual(self.cur.execute.call_count, failed_index + 1)
                self.pool.drop.assert_called_once_with(self.conn)

    def test_discard_failure_does_not_replace_policy_failure(self):
        failure = oracle.oracledb.DatabaseError("ORA-01031: policy denied")
        self.cur.execute.side_effect = failure
        self.pool.drop.side_effect = oracle.oracledb.DatabaseError("DPY-1001: already disconnected")
        with self.assertRaises(oracle.oracledb.DatabaseError) as raised:
            oracle.get_oracle_connection()
        self.assertIs(raised.exception, failure)
        self.pool.drop.assert_called_once_with(self.conn)
        self.conn.close.assert_called_once()

    def test_cursor_close_failure_does_not_replace_policy_failure(self):
        failure = oracle.oracledb.DatabaseError("DPY-4024: setting timeout")
        self.cur.execute.side_effect = failure
        self.cur.close.side_effect = oracle.oracledb.DatabaseError("DPY-1001: cursor disconnected")
        # Model the driver's cursor context manager calling close on exit too.
        self.cur.__exit__.side_effect = lambda *_: self.cur.close()
        with self.assertRaises(oracle.oracledb.DatabaseError) as raised:
            oracle.get_oracle_connection()
        self.assertIs(raised.exception, failure)
        self.cur.close.assert_called_once()
        self.pool.drop.assert_called_once_with(self.conn)

    def test_discard_and_fallback_close_failure_preserve_policy_failure(self):
        failure = oracle.oracledb.DatabaseError("ORA-01031: policy denied")
        self.cur.execute.side_effect = failure
        self.pool.drop.side_effect = RuntimeError("drop failed")
        self.conn.close.side_effect = RuntimeError("close failed")
        with self.assertRaises(oracle.oracledb.DatabaseError) as raised:
            oracle.get_oracle_connection()
        self.assertIs(raised.exception, failure)
        self.pool.drop.assert_called_once_with(self.conn)
        self.conn.close.assert_called_once()

    def test_rejects_parallel_ddl_without_rejecting_literals_comments_or_quoted_names(self):
        for query in (
            "CREATE TABLE NOTES PARALLEL AS SELECT * FROM EMP",
            "CREATE TABLE NOTES (ID NUMBER) PARALLEL 32",
            "ALTER TABLE NOTES PARALLEL 32",
            "ALTER /* comment */ TABLE NOTES MOVE PARALLEL",
        ):
            with self.subTest(query=query):
                with self.assertRaises(WorkspaceValidationError):
                    validate_query_safety(query)
        for query in (
            "CREATE TABLE NOTES NOPARALLEL AS SELECT 'PARALLEL' AS LABEL FROM EMP",
            "ALTER TABLE NOTES /* PARALLEL */ ADD LABEL VARCHAR2(20)",
            'CREATE TABLE NOTES ("PARALLEL" NUMBER)',
            "SELECT 'PARALLEL' AS LABEL FROM EMP -- PARALLEL",
        ):
            with self.subTest(query=query):
                validate_query_safety(query)

    def test_partial_ctas_failure_is_not_published_and_next_request_recovers_once(self):
        workspace = sql_workspace.build_workspace_context("sql_medium_01", "test-user")
        tables = set()
        required = {workspace.table_name(name) for name in sql_workspace.BASE_TABLES}
        fail_after_two = True
        blocks = []

        def execute_block(block):
            blocks.append(block)
            for statement in re.findall(r"EXECUTE IMMEDIATE '([^']+)'", block):
                name = statement.split()[2]
                if statement.startswith("DROP TABLE"):
                    tables.remove(name)
                else:
                    if fail_after_two and len(tables) == 2:
                        raise oracle.oracledb.DatabaseError("DPY-4024: partial DDL timeout")
                    tables.add(name)

        self.cur.execute.side_effect = execute_block
        with (
            patch.object(sql_workspace, "fetch_namespace_tables", side_effect=lambda *_: set(tables)),
            patch.object(sql_router, "fetch_namespace_tables", side_effect=lambda *_: set(tables)),
            patch.object(sql_router, "get_namespace", return_value=SimpleNamespace(practice_id=workspace.practice_id)),
            patch.object(sql_router, "upsert_namespace") as publish,
        ):
            arguments = dict(conn=self.conn, workspace=workspace, scope_key="test-user",
                             practice_id=workspace.practice_id, user_id="test-user", session_id=None)
            with self.assertRaises(oracle.oracledb.DatabaseError):
                sql_router.sync_namespace_lifecycle(**arguments)
            self.assertEqual(len(tables), 2)
            publish.assert_not_called()
            self.conn.commit.assert_not_called()

            fail_after_two = False
            sql_router.sync_namespace_lifecycle(**arguments)
            self.assertEqual(tables, required)
            self.assertEqual(blocks[1].count("DROP TABLE"), 2)
            publish.assert_called_once()
            self.conn.commit.assert_called_once()

            tables.add(workspace.table_name("NOTES"))
            sql_router.sync_namespace_lifecycle(**arguments)
            self.assertEqual(len(blocks), 2)
            self.assertIn(workspace.table_name("NOTES"), tables)


class SQLExecutionFailureTests(unittest.TestCase):
    def setUp(self):
        self.stack = ExitStack()
        self.addCleanup(self.stack.close)
        self.stack.enter_context(patch("socket.socket.connect", side_effect=AssertionError("network prohibited")))
        names = (
            "extract_user_id", "insert_sql_request", "insert_sql_response",
            "update_sql_request_status", "insert_learning_event", "send_amplitude_event",
            "get_oracle_connection", "namespace_advisory_lock", "sync_namespace_lifecycle",
            "touch_namespace", "fetch_expected_result", "record_sql_submission_and_award_points",
            "compare_result_sets", "resolve_workspace_scope", "rewrite_query_for_namespace",
            "send_slack_message", "insert_sql_alert_once", "enforce_namespace_limits",
            "prepare_namespace", "cleanup_namespace_tables",
            "enforce_cooldown", "lease_workspace", "release_workspace",
        )
        self.mocks = self.stack.enter_context(patch.multiple(sql_router, **{name: DEFAULT for name in names}))
        self.conn = MagicMock()
        self.conn.__enter__.return_value = self.conn
        self.cur = self.conn.cursor.return_value
        self.cur.__enter__.return_value = self.cur
        self.cur.description = [("EMPNO",)]
        self.cur.fetchmany.return_value = [(1,)]
        self.cur.rowcount = 1
        self.mocks["extract_user_id"].return_value = "test-user"
        self.mocks["insert_sql_request"].return_value = 10
        self.mocks["get_oracle_connection"].return_value = self.conn
        self.mocks["namespace_advisory_lock"].side_effect = lambda *_: nullcontext()
        self.mocks["lease_workspace"].side_effect = lambda *_: nullcontext(SimpleNamespace(namespace_token="0123456789AB"))
        self.mocks["resolve_workspace_scope"].return_value = (SimpleNamespace(), "test-session", "test-user", "test-user")
        self.mocks["rewrite_query_for_namespace"].side_effect = lambda **kwargs: kwargs["query"]
        self.mocks["fetch_expected_result"].return_value = {
            "row_count": 1, "result_columns": ["EMPNO"], "result_rows": [{"EMPNO": 1}],
            "comparison_mode": "ordered", "source_query": "SELECT EMPNO FROM EMP", "title": "test",
        }
        self.mocks["compare_result_sets"].return_value = (True, {"reason": "match", "comparisonMode": "ordered", "rowCount": 1})
        self.mocks["record_sql_submission_and_award_points"].return_value = (10, 20, 30)

    def call(self, action="submit", query="SELECT EMPNO FROM EMP", anonymous=False):
        self.background = BackgroundTasks()
        return sql_router.execute_sql(
            sql_router.SQLExecuteRequest(practice_id="sql_medium_01", query=query, action=action),
            Request({"type": "http", "headers": [] if anonymous else [(b"x-session-id", b"test-session")]}),
            self.background, current_user={"user_id": "test-user"},
        )

    def assert_infrastructure_failure(self, result, stage, kind="timeout"):
        self.assertIsNone(result["isCorrect"])
        self.assertEqual(result["errorType"], kind)
        self.assertEqual(result["failureStage"], stage)
        self.assertEqual(result["rows"], [])
        self.mocks["record_sql_submission_and_award_points"].assert_not_called()
        event = self.mocks["insert_learning_event"].call_args.kwargs
        self.assertIsNone(event["is_correct"])
        self.assertEqual(event["metadata"]["failureStage"], stage)
        response = self.mocks["insert_sql_response"].call_args.kwargs
        self.assertFalse(response["success"])
        self.assertEqual(response["metadata"]["errorType"], kind)
        self.assertIn("failureMs", response["metadata"]["timings"])
        self.assertTrue(all(value >= 0 for value in response["metadata"]["stageDurationsMs"].values()))
        self.mocks["update_sql_request_status"].assert_called_once_with(unittest.mock.ANY, "failed")
        tasks = [task.func for task in self.background.tasks]
        self.assertIn(sql_router.notify_slow_sql_execution, tasks)
        self.assertNotIn(sql_router.cleanup_stale_namespaces, tasks)
        self.mocks["send_slack_message"].assert_not_called()

    def test_oracle_connection_timeout_is_reported_without_grading(self):
        self.mocks["get_oracle_connection"].side_effect = oracle.oracledb.DatabaseError("DPY-4024: timeout")
        self.assert_infrastructure_failure(self.call(), "oracle_connection")
        self.cur.execute.assert_not_called()

    def test_actual_policy_failure_stops_before_workspace_or_user_sql(self):
        pool = MagicMock()
        pool.acquire.return_value = self.conn
        self.cur.execute.side_effect = oracle.oracledb.DatabaseError("DPY-4024: policy timeout")
        self.mocks["get_oracle_connection"].side_effect = oracle.get_oracle_connection
        with patch.object(oracle, "oracle_pool", pool):
            self.assert_infrastructure_failure(self.call(), "oracle_connection")
        self.cur.execute.assert_called_once_with("ALTER SESSION DISABLE PARALLEL QUERY")
        self.mocks["sync_namespace_lifecycle"].assert_not_called()
        pool.drop.assert_called_once_with(self.conn)

    def test_workspace_lease_failure_is_reported_before_user_sql_runs(self):
        self.mocks["lease_workspace"].side_effect = oracle.oracledb.DatabaseError("DPY-4024: timeout")
        self.assert_infrastructure_failure(self.call(), "workspace_lock")
        self.cur.execute.assert_not_called()
        self.mocks["get_oracle_connection"].assert_not_called()

    def test_execute_timeout_is_not_an_incorrect_answer(self):
        self.cur.execute.side_effect = oracle.oracledb.DatabaseError("DPY-4024: timeout")
        self.assert_infrastructure_failure(self.call(), "oracle_execute")
        self.cur.execute.assert_called_once()

    def test_fetch_timeout_is_not_an_incorrect_answer(self):
        self.cur.fetchmany.side_effect = oracle.oracledb.DatabaseError("DPY-4024: timeout")
        self.assert_infrastructure_failure(self.call(), "rows_fetch")
        self.cur.fetchmany.assert_called_once()

    def assert_cursor_cleanup_preserves_timeout(self, operation, stage):
        failure = oracle.oracledb.DatabaseError("DPY-4024: original timeout")
        getattr(self.cur, operation).side_effect = failure
        self.cur.close.side_effect = oracle.oracledb.DatabaseError("DPY-1001: cursor disconnected")
        self.cur.__exit__.side_effect = lambda *_: self.cur.close()
        with patch.object(sql_router.logger, "warning") as warning:
            result = self.call()
        self.assert_infrastructure_failure(result, stage)
        self.assertEqual(result["errorCode"], "DPY-4024")
        logged = self.mocks["insert_sql_response"].call_args.kwargs
        self.assertEqual(logged["oracle_error_code"], "DPY-4024")
        self.assertEqual(logged["oracle_error_message"], str(failure))
        self.assertEqual(warning.call_args.args[-1], str(failure))
        event = self.mocks["insert_learning_event"].call_args.kwargs
        self.assertEqual(event["metadata"]["error"], str(failure))
        self.cur.close.assert_called_once()

    def test_execute_timeout_survives_cursor_close_failure(self):
        self.assert_cursor_cleanup_preserves_timeout("execute", "oracle_execute")

    def test_fetch_timeout_survives_cursor_close_failure(self):
        self.assert_cursor_cleanup_preserves_timeout("fetchmany", "rows_fetch")

    def test_unknown_oracle_failure_is_not_blame_on_user(self):
        self.cur.execute.side_effect = oracle.oracledb.DatabaseError("ORA-04031: unable to allocate shared memory")
        self.assert_infrastructure_failure(self.call(), "oracle_execute", "infrastructure_error")

    def test_rollback_failure_does_not_replace_original_timeout(self):
        self.cur.execute.side_effect = oracle.oracledb.DatabaseError("DPY-4024: timeout")
        self.conn.rollback.side_effect = oracle.oracledb.DatabaseError("DPY-1001: not connected")
        result = self.call()
        self.assert_infrastructure_failure(result, "oracle_execute")
        self.assertEqual(result["errorCode"], "DPY-4024")

    def test_missing_optional_identity_does_not_drop_tables_before_response(self):
        self.mocks["extract_user_id"].return_value = None
        self.mocks["resolve_workspace_scope"].return_value = (SimpleNamespace(), None, None, "request-scope")
        self.cur.execute.side_effect = oracle.oracledb.DatabaseError("DPY-4024: timeout")
        self.mocks["cleanup_namespace_tables"].side_effect = oracle.oracledb.DatabaseError("DPY-1001: not connected")
        result = self.call(anonymous=True)
        self.assert_infrastructure_failure(result, "oracle_execute")
        self.assertEqual(result["errorCode"], "DPY-4024")
        self.mocks["cleanup_namespace_tables"].assert_not_called()
        self.assertEqual(self.background.tasks[0].func, self.mocks["release_workspace"])
        self.conn.__exit__.assert_called_once()

    def test_connection_and_lock_release_failures_preserve_original_timeout(self):
        self.cur.execute.side_effect = oracle.oracledb.DatabaseError("DPY-4024: timeout")
        self.conn.__exit__.side_effect = oracle.oracledb.DatabaseError("DPY-1001: not connected")
        lock = MagicMock()
        lock.__exit__.side_effect = RuntimeError("lock release failed")
        lock.__enter__.return_value = SimpleNamespace(namespace_token="0123456789AB")
        self.mocks["lease_workspace"].side_effect = None
        self.mocks["lease_workspace"].return_value = lock
        result = self.call()
        self.assert_infrastructure_failure(result, "oracle_execute")
        self.assertEqual(result["errorCode"], "DPY-4024")
        self.conn.__exit__.assert_called_once()
        lock.__exit__.assert_called_once()

    def test_lock_failure_does_not_acquire_oracle_connection(self):
        self.mocks["lease_workspace"].side_effect = RuntimeError("private connection details: pool exhausted")
        result = self.call()
        self.assert_infrastructure_failure(result, "workspace_lock", "infrastructure_error")
        self.assertIsNone(result["errorCode"])
        self.assertNotIn("private", result["error"])
        self.mocks["get_oracle_connection"].assert_not_called()

    def test_mutation_commit_timeout_is_not_retried_or_graded(self):
        self.conn.commit.side_effect = oracle.oracledb.DatabaseError("DPY-4024: timeout")
        self.assert_infrastructure_failure(
            self.call(query="UPDATE EMP SET SAL = SAL + 1"), "namespace_mutation"
        )
        self.cur.execute.assert_called_once()
        self.conn.commit.assert_called_once()

    def test_internal_namespace_query_error_is_not_user_sql_error(self):
        self.mocks["enforce_namespace_limits"].side_effect = oracle.oracledb.DatabaseError("ORA-00942: table does not exist")
        self.assert_infrastructure_failure(
            self.call(query="UPDATE EMP SET SAL = SAL + 1"), "namespace_mutation", "infrastructure_error"
        )

    def test_mutation_limit_check_timeout_survives_failed_rollback(self):
        self.mocks["enforce_namespace_limits"].side_effect = oracle.oracledb.DatabaseError("DPY-4024: timeout")
        self.conn.rollback.side_effect = oracle.oracledb.DatabaseError("DPY-1001: not connected")
        result = self.call(query="UPDATE EMP SET SAL = SAL + 1")
        self.assert_infrastructure_failure(result, "namespace_mutation")
        self.assertEqual(result["errorCode"], "DPY-4024")
        self.conn.commit.assert_not_called()

    def test_execute_timeout_has_no_submission_or_points(self):
        self.cur.execute.side_effect = oracle.oracledb.DatabaseError("DPY-4024: timeout")
        self.assert_infrastructure_failure(self.call(action="execute"), "oracle_execute")
        self.mocks["fetch_expected_result"].assert_not_called()
        self.mocks["send_amplitude_event"].assert_not_called()

    def test_invalid_identifier_remains_a_sql_error(self):
        self.cur.execute.side_effect = oracle.oracledb.DatabaseError('ORA-00904: "E"."JOP": invalid identifier')
        result = self.call()
        self.assertFalse(result["isCorrect"])
        self.assertEqual(result["errorType"], "sql_error")
        self.assertIn("ORA-00904", result["error"])
        self.assertFalse(self.mocks["insert_learning_event"].call_args.kwargs["is_correct"])

    def test_lease_database_error_is_not_user_sql_error(self):
        self.mocks["lease_workspace"].side_effect = oracle.oracledb.DatabaseError("ORA-00904: invalid identifier")
        self.assert_infrastructure_failure(self.call(), "workspace_lock", "infrastructure_error")

    def test_cooldown_blocks_execute_and_submit_before_oracle(self):
        self.mocks["enforce_cooldown"].side_effect = HTTPException(429, "wait", headers={"Retry-After": "3"})
        for action in ("execute", "submit"):
            with self.assertRaises(HTTPException) as caught:
                self.call(action=action)
            self.assertEqual(caught.exception.status_code, 429)
        self.mocks["get_oracle_connection"].assert_not_called()
        self.mocks["lease_workspace"].assert_not_called()

    def test_ready_environment_has_no_request_time_ddl(self):
        self.call(action="execute")
        self.mocks["sync_namespace_lifecycle"].assert_not_called()
        self.mocks["prepare_namespace"].assert_not_called()
        self.mocks["cleanup_namespace_tables"].assert_not_called()
        self.mocks["release_workspace"].assert_not_called()
        self.assertEqual(self.background.tasks[0].func, self.mocks["release_workspace"])

    def test_successful_submission_retains_grading_and_points(self):
        result = self.call()
        self.assertTrue(result["isCorrect"])
        self.assertEqual(result["awardedPoints"], 10)
        self.assertEqual(result["rows"], [{"EMPNO": 1}])
        self.assertNotIn("error", result)
        self.mocks["record_sql_submission_and_award_points"].assert_called_once()
        self.conn.rollback.assert_not_called()

    def test_incorrect_result_still_records_submission(self):
        self.mocks["compare_result_sets"].return_value = (False, {"reason": "different", "comparisonMode": "ordered"})
        self.mocks["record_sql_submission_and_award_points"].return_value = (0, 20, 30)
        result = self.call()
        self.assertFalse(result["isCorrect"])
        self.assertEqual(result["awardedPoints"], 0)
        self.assertFalse(self.mocks["record_sql_submission_and_award_points"].call_args.kwargs["is_correct"])
        self.assertNotIn("error", result)

    def test_grading_storage_failure_is_not_reclassified_as_query_failure(self):
        self.mocks["record_sql_submission_and_award_points"].side_effect = RuntimeError("storage failed")
        with self.assertRaisesRegex(RuntimeError, "storage failed"):
            self.call()
        self.mocks["insert_sql_response"].assert_called_once()
        self.assertTrue(self.mocks["insert_sql_response"].call_args.kwargs["success"])
        self.conn.rollback.assert_not_called()

    def test_validation_still_returns_http_400_before_db_access(self):
        with self.assertRaises(HTTPException) as raised:
            self.call(query="SELECT * FROM MASTER_EMP")
        self.assertEqual(raised.exception.status_code, 400)
        self.mocks["get_oracle_connection"].assert_not_called()


if __name__ == "__main__":
    unittest.main()
