from __future__ import annotations

import json
import hashlib
import logging
from datetime import datetime, timezone
from time import monotonic
from typing import Any
from urllib.error import HTTPError
from urllib import request

from app.core.config import settings
from app.db.logs import (
    submit_external_service_call,
    submit_notification_delivery,
)

logger = logging.getLogger(__name__)


def send_slack_message(
    *,
    text: str,
    blocks: list[dict[str, Any]] | None = None,
    webhook_url: str | None = None,
    notification_type: str = "slack_message",
    request_id: str | None = None,
) -> bool:
    target_webhook_url = webhook_url or settings.SLACK_WEBHOOK_URL
    requested_at = datetime.now(timezone.utc)
    if not target_webhook_url:
        logger.info("slack webhook not configured; skipping notification")
        submit_notification_delivery(
            notification_type=notification_type,
            channel="SLACK",
            status="FAILED",
            request_id=request_id,
            requested_at=requested_at,
            failed_at=datetime.now(timezone.utc),
            error_code="WEBHOOK_NOT_CONFIGURED",
            error_message="Slack webhook is not configured",
        )
        return False

    destination_ref = "webhook:" + hashlib.sha256(
        target_webhook_url.encode("utf-8")
    ).hexdigest()[:12]

    payload: dict[str, Any] = {"text": text}
    if blocks:
        payload["blocks"] = blocks

    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = request.Request(
        target_webhook_url,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

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
        logger.exception("failed to send slack message")
    except Exception as exc:
        error_code = type(exc).__name__[:100]
        logger.exception("failed to send slack message")
    finally:
        finished_at = datetime.now(timezone.utc)
        duration_ms = round((monotonic() - started_at) * 1000)
        submit_external_service_call(
            service_name="slack",
            operation="incoming_webhook",
            status="SUCCEEDED" if success else "FAILED",
            started_at=requested_at,
            finished_at=finished_at,
            duration_ms=duration_ms,
            request_id=request_id,
            http_status_code=http_status_code,
            provider_error_code=error_code,
            metadata={"has_blocks": bool(blocks)},
        )
        submit_notification_delivery(
            notification_type=notification_type,
            channel="SLACK",
            destination_ref=destination_ref,
            status="SENT" if success else "FAILED",
            request_id=request_id,
            requested_at=requested_at,
            sent_at=finished_at if success else None,
            failed_at=None if success else finished_at,
            error_code=error_code,
            error_message=None if success else "Slack delivery failed",
            metadata={"has_blocks": bool(blocks)},
        )
    return success
