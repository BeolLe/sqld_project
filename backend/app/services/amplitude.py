from __future__ import annotations

import json
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Any
from urllib import request
from uuid import uuid4

from app.core.config import settings

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

    try:
        with request.urlopen(req, timeout=5) as resp:
            return 200 <= resp.status < 300
    except Exception:
        logger.exception("failed to send amplitude event=%s", event_type)
        return False


def submit_amplitude_event(**kwargs: Any) -> None:
    _executor.submit(send_amplitude_event, **kwargs)
