from __future__ import annotations

import hashlib
import json
from datetime import date, datetime
from decimal import Decimal
from typing import Any


def normalize_scalar(value: Any) -> Any:
    if isinstance(value, Decimal):
        normalized = float(value)
        if normalized.is_integer():
            return int(normalized)
        return normalized
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, str):
        return value.strip()
    return value


def normalize_columns(columns: list[str] | None) -> list[str]:
    return [str(column).strip().upper() for column in (columns or [])]


def normalize_rows(rows: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    normalized_rows: list[dict[str, Any]] = []

    for row in rows or []:
        normalized_rows.append(
            {
                str(key).strip().upper(): normalize_scalar(value)
                for key, value in row.items()
            }
        )

    return normalized_rows


def canonicalize_rows(
    rows: list[dict[str, Any]],
    *,
    columns: list[str],
    comparison_mode: str,
) -> list[str]:
    serialized_rows = [
        json.dumps(
            {column: row.get(column) for column in columns},
            sort_keys=True,
            ensure_ascii=False,
            separators=(",", ":"),
        )
        for row in rows
    ]

    if comparison_mode == "unordered":
        serialized_rows.sort()

    return serialized_rows


def build_result_hash(
    columns: list[str],
    rows: list[dict[str, Any]],
    comparison_mode: str,
) -> str:
    payload = {
        "columns": columns,
        "rows": canonicalize_rows(rows, columns=columns, comparison_mode=comparison_mode),
        "comparisonMode": comparison_mode,
    }
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    ).hexdigest()


def compare_result_sets(
    *,
    user_columns: list[str] | None,
    user_rows: list[dict[str, Any]] | None,
    expected_columns: list[str] | None,
    expected_rows: list[dict[str, Any]] | None,
    comparison_mode: str = "unordered",
) -> tuple[bool, dict[str, Any]]:
    normalized_user_columns = normalize_columns(user_columns)
    normalized_expected_columns = normalize_columns(expected_columns)

    normalized_user_rows = normalize_rows(user_rows)
    normalized_expected_rows = normalize_rows(expected_rows)

    comparison_mode = comparison_mode if comparison_mode in {"ordered", "unordered"} else "unordered"

    if normalized_user_columns != normalized_expected_columns:
        return False, {
            "reason": "column_mismatch",
            "userColumns": normalized_user_columns,
            "expectedColumns": normalized_expected_columns,
            "comparisonMode": comparison_mode,
        }

    if len(normalized_user_rows) != len(normalized_expected_rows):
        return False, {
            "reason": "row_count_mismatch",
            "userRowCount": len(normalized_user_rows),
            "expectedRowCount": len(normalized_expected_rows),
            "comparisonMode": comparison_mode,
        }

    canonical_user_rows = canonicalize_rows(
        normalized_user_rows,
        columns=normalized_expected_columns,
        comparison_mode=comparison_mode,
    )
    canonical_expected_rows = canonicalize_rows(
        normalized_expected_rows,
        columns=normalized_expected_columns,
        comparison_mode=comparison_mode,
    )

    is_correct = canonical_user_rows == canonical_expected_rows

    return is_correct, {
        "reason": "matched" if is_correct else "row_value_mismatch",
        "comparisonMode": comparison_mode,
        "userHash": build_result_hash(
            normalized_user_columns,
            normalized_user_rows,
            comparison_mode,
        ),
        "expectedHash": build_result_hash(
            normalized_expected_columns,
            normalized_expected_rows,
            comparison_mode,
        ),
        "rowCount": len(normalized_expected_rows),
    }
