"""Disposable CI databases only; verifies real Oracle DDL/reset and PostgreSQL leases."""
from contextlib import ExitStack
import os
import unittest
from unittest.mock import patch

import oracledb
import psycopg
from psycopg.conninfo import conninfo_to_dict

from app.db import oracle
from app.services import sql_workspace_pool as pool


@unittest.skipUnless(os.getenv("SQL_POOL_TEST_ORACLE") == "1", "requires disposable CI Oracle")
class OracleWorkspacePoolIntegrationTests(unittest.TestCase):
    def test_every_request_starts_from_master_after_update_create_and_drop(self):
        dsn = os.environ["SQL_POOL_TEST_DSN"]
        options = conninfo_to_dict(dsn)
        self.assertIn(options.get("host"), {"localhost", "127.0.0.1"})
        self.assertEqual(options.get("dbname"), "sqlpool_test")
        with ExitStack() as stack:
            for key, value in {
                "SQL_WORKSPACE_POOL_NAME": "oracle-ci", "SQL_WORKSPACE_POOL_SIZE": 2,
                "ORACLE_USER": "sqlpool_test", "ORACLE_PASSWORD": "DisposableTest123",
                "ORACLE_DSN": "127.0.0.1:1521/FREEPDB1", "ORACLE_WALLET_PATH": None,
                "ORACLE_WALLET_PASSWORD": None,
            }.items():
                stack.enter_context(patch.object(pool.settings, key, value))
            stack.enter_context(patch.object(pool, "get_postgres_connection", lambda: psycopg.connect(dsn)))
            self.addCleanup(oracle.close_oracle_pool)
            with oracle.get_oracle_connection() as conn, conn.cursor() as cur:
                for name in pool.BASE_TABLES:
                    cur.execute(f"CREATE TABLE MASTER_{name} (id NUMBER, value VARCHAR2(20))")
                    cur.execute(f"INSERT INTO MASTER_{name} VALUES (1, 'original')")
                conn.commit()
            pool.initialize_pool()

            def reset_both():
                with psycopg.connect(dsn) as pg:
                    pg.execute("UPDATE runtime.sql_workspace_slots SET updated_at = statement_timestamp() - interval '2 minutes' WHERE pool_name = 'oracle-ci'")
                self.assertTrue(pool.maintain_pool())
                self.assertTrue(pool.maintain_pool())
                with psycopg.connect(dsn) as pg:
                    self.assertEqual(pg.execute("SELECT count(*) FROM runtime.sql_workspace_slots WHERE pool_name = 'oracle-ci' AND state = 'ready'").fetchone()[0], 2)

            reset_both()
            with pool.lease_workspace("user", "problem") as first, oracle.get_oracle_connection() as conn, conn.cursor() as cur:
                cur.execute(f"UPDATE {first.table_name('EMP')} SET value = 'modified'")
                cur.execute(f"ALTER TABLE {first.table_name('DEPT')} ADD PRIMARY KEY (id)")
                cur.execute(f"CREATE TABLE {first.table_name('EXTRA')} (id NUMBER REFERENCES {first.table_name('DEPT')}(id))")
                cur.execute(f"DROP TABLE {first.table_name('COURSE')} PURGE")
                conn.commit()
            with pool.lease_workspace("user", "problem") as spare, oracle.get_oracle_connection() as conn, conn.cursor() as cur:
                self.assertNotEqual(first.namespace_token, spare.namespace_token)
                cur.execute(f"SELECT value FROM {spare.table_name('EMP')}")
                self.assertEqual(cur.fetchone()[0], "original")
            pool.release_workspace(first.namespace_token)
            pool.release_workspace(spare.namespace_token)
            reset_both()
            with pool.lease_workspace("user", "problem") as fresh, oracle.get_oracle_connection() as conn, conn.cursor() as cur:
                self.assertEqual(pool.fetch_namespace_tables(conn, fresh), {fresh.table_name(n) for n in pool.BASE_TABLES})
                for name in pool.BASE_TABLES:
                    cur.execute(f"SELECT value FROM {fresh.table_name(name)}")
                    self.assertEqual(cur.fetchall(), [("original",)])
                cur.execute("SELECT count(*) FROM user_tables WHERE table_name LIKE :prefix", {"prefix": first.namespace_prefix + "%"})
                self.assertEqual(cur.fetchone()[0], 0)
