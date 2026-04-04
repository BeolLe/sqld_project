from __future__ import annotations

import json
import logging
from typing import Any
from urllib import request

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_slack_message(*, text: str, blocks: list[dict[str, Any]] | None = None) -> bool:
    webhook_url = settings.SLACK_WEBHOOK_URL
    if not webhook_url:
        logger.info("slack webhook not configured; skipping notification")
        return False

    payload: dict[str, Any] = {"text": text}
    if blocks:
        payload["blocks"] = blocks

    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = request.Request(
        webhook_url,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=5) as resp:
            return 200 <= resp.status < 300
    except Exception:
        logger.exception("failed to send slack message")
        return False
