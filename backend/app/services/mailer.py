from __future__ import annotations

import hashlib
import logging
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
from time import monotonic

from app.core.config import settings
from app.db.logs import (
    submit_external_service_call,
    submit_notification_delivery,
)

logger = logging.getLogger(__name__)


def send_email(
    *,
    to_email: str,
    subject: str,
    text_content: str,
    notification_type: str = "transactional_email",
    request_id: str | None = None,
) -> bool:
    requested_at = datetime.now(timezone.utc)
    destination_ref = "email:" + hashlib.sha256(
        to_email.strip().lower().encode("utf-8")
    ).hexdigest()[:12]
    if not all(
        [
            settings.SMTP_HOST,
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
            settings.MAIL_FROM,
        ]
    ):
        logger.info("smtp not configured; skipping email send")
        submit_notification_delivery(
            notification_type=notification_type,
            channel="EMAIL",
            destination_ref=destination_ref,
            status="FAILED",
            request_id=request_id,
            requested_at=requested_at,
            failed_at=datetime.now(timezone.utc),
            error_code="SMTP_NOT_CONFIGURED",
            error_message="SMTP is not configured",
        )
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.MAIL_FROM
    message["To"] = to_email
    message.set_content(text_content)

    started_at = monotonic()
    success = False
    error_code: str | None = None
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
        success = True
    except Exception as exc:
        error_code = type(exc).__name__[:100]
        logger.exception("failed to send email")
    finally:
        finished_at = datetime.now(timezone.utc)
        duration_ms = round((monotonic() - started_at) * 1000)
        submit_external_service_call(
            service_name="smtp",
            operation="send_email",
            status="SUCCEEDED" if success else "FAILED",
            started_at=requested_at,
            finished_at=finished_at,
            duration_ms=duration_ms,
            request_id=request_id,
            provider_error_code=error_code,
            metadata={"tls_enabled": bool(settings.SMTP_USE_TLS)},
        )
        submit_notification_delivery(
            notification_type=notification_type,
            channel="EMAIL",
            destination_ref=destination_ref,
            status="SENT" if success else "FAILED",
            request_id=request_id,
            requested_at=requested_at,
            sent_at=finished_at if success else None,
            failed_at=None if success else finished_at,
            error_code=error_code,
            error_message=None if success else "Email delivery failed",
        )
    return success
