"""Run focused tests without loading settings, credentials, pools or outbound clients.

Usage: .venv/bin/python -I -B tests/run_exam_scope_isolated.py
Optional --fallback-backend is only for reviewing a partial source staging copy.
"""
from pathlib import Path
import argparse
import sys
import types
import unittest
from unittest.mock import patch

parser = argparse.ArgumentParser()
parser.add_argument('--fallback-backend', type=Path)
args = parser.parse_args()
backend = Path(__file__).resolve().parents[1]


def guard(event, arguments):
    if event in {'socket.connect', 'socket.connect_ex', 'socket.bind', 'socket.getaddrinfo',
                 'subprocess.Popen', 'os.system', 'os.posix_spawn', 'os.fork'}:
        raise RuntimeError('External access/process blocked by isolated test harness')
    if event == 'open':
        path, mode, flags = arguments
        if isinstance(path, (str, bytes)):
            name = str(path).lower()
            if '/.env' in name or '/.ssh/' in name or '/.aws/' in name or '/.kube/' in name:
                raise RuntimeError('Credential/config file access blocked by isolated test harness')
        if isinstance(mode, str) and any(c in mode for c in 'wax+'):
            raise RuntimeError('Filesystem writes blocked by isolated test harness')


sys.addaudithook(guard)
roots = [backend] + ([args.fallback_backend] if args.fallback_backend else [])
for name in ['app', 'app.api', 'app.api.auth', 'app.api.content', 'app.api.exams',
             'app.api.education', 'app.api.dashboard', 'app.api.endless', 'app.core',
             'app.db', 'app.services']:
    module = types.ModuleType(name)
    module.__path__ = [str(root.joinpath(*name.split('.'))) for root in roots]
    sys.modules[name] = module


def forbidden(*a, **kw):
    raise AssertionError('A test must inject its own connection/outbound fake')


def stub(name, **values):
    module = types.ModuleType(name)
    module.__dict__.update(values)
    sys.modules[name] = module


stub('app.db.postgres', get_connection=forbidden, get_postgres_connection=forbidden)
stub('app.api.auth.router', get_current_user=lambda: {'user_id': '00000000-0000-0000-0000-000000000001'})
stub('app.core.config', settings=types.SimpleNamespace(CONTENT_LIST_CACHE_TTL_SECONDS=30, DASHBOARD_SUMMARY_CACHE_TTL_SECONDS=30))
stub('app.services.amplitude', send_amplitude_event=forbidden)
stub('app.db.logs', insert_learning_event=forbidden)
sys.path.insert(0, str(backend / 'tests'))
suite = unittest.TestSuite()
for name in ['test_exam_scope', 'test_exam_scope_compatibility', 'test_education_foundation']:
    suite.addTests(unittest.defaultTestLoader.loadTestsFromName(name))
from app.db.exam_scope import ExamSchema
with patch('app.db.exam_scope.read_schema_capabilities', return_value=ExamSchema('ready')), \
     patch.dict('os.environ', {'ENABLE_ADSP': 'true'}):
    result = unittest.TextTestRunner(verbosity=2).run(suite)
print(f'Isolated result: run={result.testsRun} failures={len(result.failures)} errors={len(result.errors)}')
raise SystemExit(0 if result.wasSuccessful() else 1)
