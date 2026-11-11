"""Verify the application tree changed only in the grading patch."""
from pathlib import Path
import sys


def files(root):
    return {
        p.relative_to(root).as_posix(): p.read_bytes()
        for p in root.rglob('*')
        if p.is_file() and '__pycache__' not in p.parts and p.suffix != '.pyc'
    }


before, after = map(lambda p: files(Path(p)), sys.argv[1:])
changed = {p for p in before.keys() | after.keys() if before.get(p) != after.get(p)}
assert changed == {'api/sql/router.py', 'services/sql_grading.py', 'services/sql_ordering.py'}, changed
line = b'                            source_query=expected_result["source_query"],\n'
assert after['api/sql/router.py'].count(line) == 1
assert after['api/sql/router.py'].replace(line, b'') == before['api/sql/router.py']
print('PASS: only grading service/resolver and one router argument differ from production')
