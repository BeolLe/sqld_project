#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path


TABLE_SETS: dict[str, list[str]] = {
    "emp": ["DEPT", "EMP", "SALGRADE", "SAL_HISTORY"],
    "order": ["CUSTOMER", "PRODUCT", "ORDERS", "ORDER_DETAIL"],
    "student": ["PROFESSOR", "STUDENT", "COURSE", "ENROLLMENT"],
}


def build_name_map(table_names: list[str]) -> dict[str, str]:
    return {name: f"MASTER_{name}" for name in table_names}


def replace_table_names(sql_text: str, name_map: dict[str, str]) -> str:
    updated = sql_text
    for source_name in sorted(name_map, key=len, reverse=True):
        target_name = name_map[source_name]
        updated = re.sub(rf"\b{re.escape(source_name)}\b", target_name, updated)
    return updated


def read_sql(table_root: Path, dataset_id: str, file_name: str) -> str:
    return (table_root / dataset_id / file_name).read_text(encoding="utf-8").strip()


def build_drop_block(table_names: list[str]) -> str:
    lines = ["-- Drop existing MASTER tables for rerun"]
    for table_name in reversed(table_names):
        master_name = f"MASTER_{table_name}"
        lines.extend(
            [
                "BEGIN",
                f"    EXECUTE IMMEDIATE 'DROP TABLE {master_name} CASCADE CONSTRAINTS';",
                "EXCEPTION",
                "    WHEN OTHERS THEN",
                "        IF SQLCODE != -942 THEN",
                "            RAISE;",
                "        END IF;",
                "END;",
                "/",
                "",
            ]
        )
    return "\n".join(lines).rstrip()


def build_dataset_script(table_root: Path, dataset_id: str, table_names: list[str]) -> str:
    name_map = build_name_map(table_names)
    schema_sql = replace_table_names(read_sql(table_root, dataset_id, "schema.sql"), name_map)
    data_sql = replace_table_names(read_sql(table_root, dataset_id, "data.sql"), name_map)

    sections = [
        f"-- Auto-generated Oracle seed script for dataset: {dataset_id}",
        "-- Source: frontend/src/data/tables",
        "",
        build_drop_block(table_names),
        "",
        "-- Create MASTER tables",
        schema_sql,
        "",
        "-- Insert seed data into MASTER tables",
        data_sql,
        "",
        "COMMIT;",
    ]
    return "\n".join(section.rstrip() for section in sections if section is not None).rstrip() + "\n"


def write_dataset_scripts(project_root: Path, output_dir: Path) -> None:
    table_root = project_root / "src" / "data" / "tables"
    output_dir.mkdir(parents=True, exist_ok=True)

    generated_paths: list[Path] = []
    for dataset_id, table_names in TABLE_SETS.items():
        script_text = build_dataset_script(table_root, dataset_id, table_names)
        output_path = output_dir / f"{dataset_id}_master.sql"
        output_path.write_text(script_text, encoding="utf-8")
        generated_paths.append(output_path)

    all_output = output_dir / "all_master.sql"
    combined = []
    for path in generated_paths:
        combined.append(f"PROMPT ==== Running {path.name} ====")
        combined.append(f"@@{path.name}")
        combined.append("")
    all_output.write_text("\n".join(combined).rstrip() + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate Oracle MASTER_* seed SQL from frontend table definitions."
    )
    default_output_dir = Path(__file__).resolve().parent / "generated"
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=default_output_dir,
        help=f"Directory to write generated SQL files. Default: {default_output_dir}",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    project_root = Path(__file__).resolve().parent.parent
    write_dataset_scripts(project_root, args.output_dir.resolve())
    print(f"Generated Oracle seed scripts in: {args.output_dir.resolve()}")


if __name__ == "__main__":
    main()
