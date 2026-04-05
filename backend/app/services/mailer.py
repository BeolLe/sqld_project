from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(*, to_email: str, subject: str, text_content: str) -> bool:
    if not all(
        [
            settings.SMTP_HOST,
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
            settings.MAIL_FROM,
        ]
    ):
        logger.info("smtp not configured; skipping email send")
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.MAIL_FROM
    message["To"] = to_email
    message.set_content(text_content)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
        return True
    except Exception:
        logger.exception("failed to send email")
        return False
