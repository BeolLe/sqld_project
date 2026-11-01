"""Run only against a disposable local PostgreSQL: SQL_POOL_TEST_DSN=... python -m unittest discover -s tests -p integration_sql_workspace_pool.py

Oracle is simulated; all SQL, advisory locks and transactions under test use real PostgreSQL.
"""
from concurrent.futures import ThreadPoolExecutor
from contextlib import ExitStack, contextmanager
import os
import threading
import unittest
from unittest.mock import patch

from fastapi import HTTPException
import psycopg
from psycopg.conninfo import conninfo_to_dict

from app.services import sql_workspace_pool as pool


@unittest.skipUnless(os.getenv("SQL_POOL_TEST_DSN"), "requires disposable local PostgreSQL")
class WorkspacePoolIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.dsn = os.environ["SQL_POOL_TEST_DSN"]
        options = conninfo_to_dict(self.dsn)
        if options.get("host") not in {"127.0.0.1", "localhost", "postgres"} or options.get("dbname") != "sqlpool_test":
            raise RuntimeError("This test only permits a local disposable sqlpool_test database")
        self.stack = ExitStack()
        self.addCleanup(self.stack.close)
        self.stack.enter_context(patch.object(pool.settings, "SQL_WORKSPACE_POOL_NAME", "integration"))
        self.stack.enter_context(patch.object(pool.settings, "SQL_WORKSPACE_POOL_SIZE", 2))
        self.stack.enter_context(patch.object(pool, "get_postgres_connection", self.connect))
        self.tables = {}
        self.fail_create = False
        self.reset_calls = []
        self.stack.enter_context(patch.object(pool, "get_oracle_connection", self.oracle))
        self.stack.enter_context(patch.object(pool, "cleanup_namespace_by_prefix", self.cleanup))
        self.stack.enter_context(patch.object(pool, "prepare_namespace", self.prepare))
        self.stack.enter_context(patch.object(pool, "fetch_namespace_tables", lambda _conn, w: set(self.tables.get(w.namespace_token, {}))))
        pool.initialize_pool()
        with self.connect() as conn:
            conn.execute("DELETE FROM runtime.sql_workspace_slots")
            conn.execute("DELETE FROM runtime.sql_execution_cooldowns")
        pool.initialize_pool()
        self.age()

    def connect(self):
        return psycopg.connect(self.dsn)

    @contextmanager
    def oracle(self):
        yield object()

    def cleanup(self, _conn, prefix):
        self.tables.pop(prefix.split("_")[1], None)

    def prepare(self, _conn, workspace):
        self.assertEqual(workspace.namespace_prefix, workspace.namespace_prefix.upper())
        self.reset_calls.append(workspace.namespace_token)
        self.tables[workspace.namespace_token] = {workspace.table_name(name): ["MASTER"] for name in pool.BASE_TABLES}
        if self.fail_create:
            self.tables[workspace.namespace_token].pop(workspace.table_name("EMP"))
            raise RuntimeError("partial Oracle CTAS")

    def age(self):
        with self.connect() as conn:
            conn.execute("UPDATE runtime.sql_workspace_slots SET updated_at = statement_timestamp() - interval '2 minutes'")

    def ready(self):
        self.age()
        self.assertTrue(pool.maintain_pool())
        self.assertTrue(pool.maintain_pool())

    def slots(self):
        with self.connect() as conn:
            return conn.execute("SELECT slot_id, namespace_token, state FROM runtime.sql_workspace_slots ORDER BY slot_id").fetchall()

    def test_initialization_is_idempotent_across_replicas(self):
        with ThreadPoolExecutor(4) as workers:
            list(workers.map(lambda _: pool.initialize_pool(), range(8)))
        self.assertEqual(len(self.slots()), 2)

    def test_primary_reuse_only_after_reset_otherwise_spare(self):
        self.ready()
        with pool.lease_workspace("user", "problem") as first:
            self.tables[first.namespace_token][first.table_name("EMP")] = ["changed"]
        # No HTTP response callback yet: same environment must stay unavailable.
        with pool.lease_workspace("user", "problem") as second:
            self.assertNotEqual(first.namespace_token, second.namespace_token)
            self.assertEqual(self.tables[second.namespace_token][second.table_name("EMP")], ["MASTER"])
        with self.assertRaises(HTTPException) as full:
            with pool.lease_workspace("other", "problem"):
                self.fail("dirty environment was reused")
        self.assertEqual(full.exception.status_code, 503)
        pool.release_workspace(first.namespace_token)
        self.age()
        pool.maintain_pool()
        with pool.lease_workspace("user", "problem") as fresh:
            self.assertEqual(self.slots()[0][1], fresh.namespace_token)
            self.assertNotEqual(first.namespace_token, fresh.namespace_token)
            self.assertEqual(self.tables[fresh.namespace_token][fresh.table_name("EMP")], ["MASTER"])
            pool.release_workspace(first.namespace_token)  # Late duplicate callback cannot release fresh lease.
            self.assertEqual(self.slots()[0][2], "leased")

    def test_preferred_ready_slot_wins_over_another_ready_slot(self):
        self.ready()
        with pool.lease_workspace("first-user", "problem"):
            pass
        with pool.lease_workspace("preferred-user", "problem") as preferred:
            pool.release_workspace(preferred.namespace_token)
        self.age()
        pool.maintain_pool()
        self.age()
        pool.maintain_pool()
        with pool.lease_workspace("preferred-user", "problem") as preferred_again:
            self.assertEqual(self.slots()[1][1], preferred_again.namespace_token)

    def test_concurrent_requests_get_distinct_slots_then_bounded_capacity(self):
        self.ready()
        barrier = threading.Barrier(2)
        def run(user):
            with pool.lease_workspace(user, "problem") as workspace:
                barrier.wait(timeout=5)
                with self.assertRaises(HTTPException):
                    with pool.lease_workspace("third", "problem"):
                        self.fail("pool exceeded configured capacity")
                return workspace.namespace_token
        with ThreadPoolExecutor(2) as workers:
            tokens = list(workers.map(run, ["one", "two"]))
        self.assertEqual(len(set(tokens)), 2)

    def test_worker_skips_live_execution_and_recovers_abandoned_lease(self):
        self.ready()
        with pool.lease_workspace("user", "problem") as workspace:
            self.age()
            with ThreadPoolExecutor(1) as workers:
                self.assertFalse(workers.submit(pool.maintain_pool).result(timeout=5))
            self.assertIn(workspace.namespace_token, self.tables)
        # Simulate death before response/release: no session lock remains.
        self.assertTrue(pool.maintain_pool())
        self.assertNotIn(workspace.namespace_token, self.tables)
        self.assertEqual(self.slots()[0][2], "ready")

    def test_partial_reset_is_not_ready_and_recovers_on_retry(self):
        self.fail_create = True
        pool.maintain_pool()
        broken_token = self.slots()[0][1]
        self.assertEqual(self.slots()[0][2], "dirty")
        self.fail_create = False
        self.age()
        pool.maintain_pool()
        self.assertNotIn(broken_token, self.tables)
        self.assertEqual(self.slots()[0][2], "ready")

    def test_one_reset_worker_across_processes(self):
        self.ready()
        with self.connect() as conn, pool.try_lock(conn, "sql-workspace-maintenance:integration") as leader:
            self.assertTrue(leader)
            with ThreadPoolExecutor(1) as workers:
                self.assertFalse(workers.submit(pool.maintain_pool).result(timeout=5))

    def test_failed_transaction_does_not_leak_session_lock(self):
        with self.connect() as conn:
            with self.assertRaises(psycopg.errors.DivisionByZero):
                with pool.try_lock(conn, "regression-failed-transaction") as acquired:
                    self.assertTrue(acquired)
                    conn.execute("SELECT 1 / 0")
            with self.connect() as other, pool.try_lock(other, "regression-failed-transaction") as acquired:
                self.assertTrue(acquired)

    def test_cooldown_is_atomic_and_shared_by_execute_and_submit(self):
        def attempt(_):
            try:
                pool.enforce_cooldown("user", "same-problem")
                return 200
            except HTTPException as exc:
                self.assertEqual(exc.headers["Retry-After"], "3")
                return exc.status_code
        with ThreadPoolExecutor(8) as workers:
            statuses = list(workers.map(attempt, range(8)))
        self.assertEqual(statuses.count(200), 1)
        self.assertEqual(statuses.count(429), 7)
        pool.enforce_cooldown("another-user", "same-problem")
        pool.enforce_cooldown("user", "another-problem")
        with self.connect() as conn:
            conn.execute("UPDATE runtime.sql_execution_cooldowns SET next_allowed_at = clock_timestamp() WHERE user_id = 'user' AND practice_id = 'same-problem'")
        pool.enforce_cooldown("user", "same-problem")

    def test_pool_names_do_not_share_slots_or_cooldowns(self):
        self.ready()
        pool.enforce_cooldown("user", "problem")
        with patch.object(pool.settings, "SQL_WORKSPACE_POOL_NAME", "test-deployment"):
            pool.initialize_pool()
            pool.enforce_cooldown("user", "problem")
            with self.assertRaises(HTTPException):
                with pool.lease_workspace("user", "problem"):
                    self.fail("production environment leaked to test pool")
