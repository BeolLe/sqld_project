from __future__ import annotations

from typing import Any

from app.db.postgres import get_connection


def insert_service_log_events(records: list[dict[str, Any]]) -> int:
    inserted = 0

    with get_connection() as conn:
        with conn.cursor() as cur:
            for record in records:
                cur.execute(
                    """
                    INSERT INTO log.service_log_raw (
                        event_id,
                        page_id,
                        user_id,
                        device_id,
                        visitor_id,
                        session_id,
                        object_section_id,
                        object_section_idx,
                        object_id,
                        object_idx,
                        schema_version,
                        platform,
                        event_type,
                        object_type,
                        data,
                        event_at,
                        event_at_kst,
                        base_dt
                    )
                    VALUES (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        timezone('Asia/Seoul', %s::timestamptz),
                        timezone('Asia/Seoul', %s::timestamptz)::date
                    )
                    ON CONFLICT (event_id) DO NOTHING
                    RETURNING event_id
                    """,
                    (
                        record["event_id"],
                        record["page_id"],
                        record["user_id"],
                        record["device_id"],
                        record["visitor_id"],
                        record["session_id"],
                        record["object_section_id"],
                        record["object_section_idx"],
                        record["object_id"],
                        record["object_idx"],
                        record["schema_version"],
                        record["platform"],
                        record["event_type"],
                        record["object_type"],
                        record["data"],
                        record["event_at"],
                        record["event_at"],
                        record["event_at"],
                    ),
                )
                if cur.fetchone() is not None:
                    inserted += 1

    return inserted
