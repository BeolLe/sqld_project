from __future__ import annotations

import json
import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from time import monotonic
from typing import Any
from urllib.error import HTTPError
from urllib import request
from uuid import uuid4

from app.core.config import settings
from app.db.logs import submit_external_service_call

logger = logging.getLogger(__name__)
_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="amplitude")


def send_amplitude_event(
    *,
    event_type: str,
    user_id: str | None = None,
    event_properties: dict[str, Any] | None = None,
    user_properties: dict[str, Any] | None = None,
    insert_id: str | None = None,
) -> bool:
    api_key = settings.AMPLITUDE_API_KEY
    if not api_key:
        logger.info("amplitude api key not configured; skipping event=%s", event_type)
        return False

    event: dict[str, Any] = {
        "event_type": event_type,
        "event_properties": event_properties or {},
        "insert_id": insert_id or str(uuid4()),
        "platform": "Backend",
    }

    if user_id:
        event["user_id"] = user_id
    if user_properties:
        event["user_properties"] = user_properties

    payload = {
        "api_key": api_key,
        "events": [event],
    }

    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = request.Request(
        settings.AMPLITUDE_API_URL,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

    requested_at = datetime.now(timezone.utc)
    started_at = monotonic()
    http_status_code: int | None = None
    error_code: str | None = None
    success = False
    try:
        with request.urlopen(req, timeout=5) as resp:
            http_status_code = resp.status
            success = 200 <= resp.status < 300
            if not success:
                error_code = f"HTTP_{resp.status}"
    except HTTPError as exc:
        http_status_code = exc.code
        error_code = f"HTTP_{exc.code}"
        logger.exception("failed to send amplitude event=%s", event_type)
    except Exception as exc:
        error_code = type(exc).__name__[:100]
        logger.exception("failed to send amplitude event=%s", event_type)
    finally:
        finished_at = datetime.now(timezone.utc)
        submit_external_service_call(
            service_name="amplitude",
            operation="track_event",
            status="SUCCEEDED" if success else "FAILED",
            started_at=requested_at,
            finished_at=finished_at,
            duration_ms=round((monotonic() - started_at) * 1000),
            user_id=user_id,
            http_status_code=http_status_code,
            provider_error_code=error_code,
            metadata={"event_type": event_type},
        )
    return success


def submit_amplitude_event(**kwargs: Any) -> None:
    _executor.submit(send_amplitude_event, **kwargs)
