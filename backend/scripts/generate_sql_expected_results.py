from __future__ import annotations

import argparse
import json
import os
import sys

CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.services.sql_expected_results import (
    ExpectedResultGenerationError,
    generate_expected_results,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generate SQL practice expected result sets from expected_answer queries.",
    )
    parser.add_argument(
        "practice_codes",
        nargs="*",
        help="Optional practice_code list. If omitted, generate for all active practices.",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        summaries = generate_expected_results(args.practice_codes or None)
    except ExpectedResultGenerationError as exc:
        print(f"[expected-results] generation failed: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # pragma: no cover - operational entrypoint
        print(f"[expected-results] unexpected failure: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(summaries, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
