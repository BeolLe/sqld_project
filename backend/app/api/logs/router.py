from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.api.auth.router import get_optional_current_user, get_request_id
from app.db.service_logs import insert_service_log_events


router = APIRouter(prefix="/api/logs", tags=["logs"])
logger = logging.getLogger(__name__)

MAX_BATCH_SIZE = 100
MAX_STORED_DATA_BYTES = 16 * 1024
MAX_BATCH_DATA_BYTES = 256 * 1024


class ServiceLogEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_id: str | None = Field(default=None, min_length=1, max_length=100)
    page_id: str = Field(min_length=1, max_length=100)
    url: str = Field(default="", max_length=2048)
    event_type: str = Field(min_length=1, max_length=100)
    schema_version: str = Field(min_length=1, max_length=30)
    object_section_id: str = Field(default="", max_length=100)
    object_type: str = Field(default="", max_length=100)
    page_params: dict[str, Any] = Field(default_factory=dict)
    object_section_idx: int | None = Field(default=None, ge=0)
    object_idx: int | None = Field(default=None, ge=0)
    object_id: str = Field(default="", max_length=200)
    object_url: str = Field(default="", max_length=2048)
    data: dict[str, Any] = Field(default_factory=dict)
    platform: str = Field(min_length=1, max_length=30)
    timestamp: datetime
    user_id: str | None = Field(default=None, max_length=100)
    session_id: str | None = Field(default=None, max_length=100)
    device_id: str | None = Field(default=None, max_length=200)
    visitor_id: str | None = Field(default=None, max_length=200)

    @field_validator("timestamp")
    @classmethod
    def require_timestamp_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("timestamp must include a timezone")
        return value

    @field_validator("page_id", "event_type", "schema_version", "platform")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("value must not be blank")
        return normalized


class ServiceLogBatchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    events: list[ServiceLogEvent] = Field(
        min_length=1,
        max_length=MAX_BATCH_SIZE,
    )


def optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


def serialize_event_data(event: ServiceLogEvent, *, device_id_source: str) -> str:
    stored_data = {
        "url": event.url,
        "page_params": event.page_params,
        "object_url": event.object_url,
        "payload": event.data,
        "collector": {"device_id_source": device_id_source},
    }
    serialized = json.dumps(
        stored_data,
        ensure_ascii=False,
        separators=(",", ":"),
    )
    if len(serialized.encode("utf-8")) > MAX_STORED_DATA_BYTES:
        raise HTTPException(
            status_code=413,
            detail="event data is too large",
        )
    return serialized


@router.post("/events", status_code=202)
def collect_service_log_events(
    payload: ServiceLogBatchRequest,
    request: Request,
    current_user: dict | None = Depends(get_optional_current_user),
):
    request_id = get_request_id(request)
    authenticated_user_id = current_user["user_id"] if current_user else None
    records: list[dict[str, Any]] = []
    stored_data_bytes = 0

    for event in payload.events:
        event_id = optional_text(event.event_id) or str(uuid.uuid4())
        client_device_id = optional_text(event.device_id)
        device_id = client_device_id or f"request:{request_id}"
        serialized_data = serialize_event_data(
            event,
            device_id_source="client" if client_device_id else "request",
        )
        stored_data_bytes += len(serialized_data.encode("utf-8"))
        if stored_data_bytes > MAX_BATCH_DATA_BYTES:
            raise HTTPException(
                status_code=413,
                detail="event batch data is too large",
            )
        records.append(
            {
                "event_id": event_id,
                "page_id": event.page_id.strip(),
                # 클라이언트가 보낸 user_id는 신뢰하지 않고
                # 인증 쿠키 기준으로 확정한다.
                "user_id": authenticated_user_id,
                "device_id": device_id,
                "visitor_id": optional_text(event.visitor_id),
                "session_id": optional_text(event.session_id),
                "object_section_id": optional_text(event.object_section_id),
                "object_section_idx": event.object_section_idx,
                "object_id": optional_text(event.object_id),
                "object_idx": event.object_idx,
                "schema_version": event.schema_version.strip(),
                "platform": event.platform.strip(),
                "event_type": event.event_type.strip(),
                "object_type": optional_text(event.object_type),
                "data": serialized_data,
                "event_at": event.timestamp,
            }
        )

    try:
        inserted = insert_service_log_events(records)
    except Exception as exc:
        logger.exception("service log ingestion failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="event log storage is unavailable",
        ) from exc

    received = len(records)
    return {
        "received": received,
        "inserted": inserted,
        "duplicates": received - inserted,
    }
