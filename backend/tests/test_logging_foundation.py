from __future__ import annotations

from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch

from app import main
from app.services import mailer, slack


class RequestLoggingHelperTests(unittest.TestCase):
    def test_rejects_unbounded_client_request_id(self):
        request_id = main.normalize_request_id("x" * 101)

        self.assertNotEqual(request_id, "x" * 101)
        self.assertLessEqual(len(request_id), 100)

    def test_excludes_health_checks_from_api_logs(self):
        self.assertFalse(main.should_log_request("/api/health"))
        self.assertFalse(main.should_log_request("/api/health/db/postgres"))
        self.assertTrue(main.should_log_request("/api/education/curricula"))

    def test_accepts_only_valid_client_ip(self):
        valid_request = SimpleNamespace(
            headers={"cf-connecting-ip": "203.0.113.10"},
            client=None,
        )
        invalid_request = SimpleNamespace(
            headers={"cf-connecting-ip": "not-an-ip"},
            client=None,
        )

        self.assertEqual(main.extract_client_ip(valid_request), "203.0.113.10")
        self.assertIsNone(main.extract_client_ip(invalid_request))


class NotificationLoggingTests(unittest.TestCase):
    def test_slack_success_records_delivery_without_storing_webhook(self):
        response = MagicMock()
        response.status = 200
        context = MagicMock()
        context.__enter__.return_value = response
        webhook_url = "https://hooks.slack.com/services/T/B/secret"

        with (
            patch("app.services.slack.request.urlopen", return_value=context),
            patch(
                "app.services.slack.submit_external_service_call"
            ) as submit_external,
            patch(
                "app.services.slack.submit_notification_delivery"
            ) as submit_notification,
        ):
            sent = slack.send_slack_message(
                text="test",
                webhook_url=webhook_url,
                notification_type="test_alert",
            )

        self.assertTrue(sent)
        self.assertEqual(submit_external.call_args.kwargs["status"], "SUCCEEDED")
        delivery = submit_notification.call_args.kwargs
        self.assertEqual(delivery["status"], "SENT")
        self.assertNotIn(webhook_url, delivery["destination_ref"])
        self.assertNotIn("secret", delivery["destination_ref"])

    def test_email_success_records_hashed_destination(self):
        smtp = MagicMock()
        smtp_context = MagicMock()
        smtp_context.__enter__.return_value = smtp

        with (
            patch.object(mailer.settings, "SMTP_HOST", "smtp.example.com"),
            patch.object(mailer.settings, "SMTP_PORT", 587),
            patch.object(mailer.settings, "SMTP_USERNAME", "user"),
            patch.object(mailer.settings, "SMTP_PASSWORD", "password"),
            patch.object(mailer.settings, "MAIL_FROM", "noreply@example.com"),
            patch.object(mailer.settings, "SMTP_USE_TLS", True),
            patch("app.services.mailer.smtplib.SMTP", return_value=smtp_context),
            patch(
                "app.services.mailer.submit_external_service_call"
            ) as submit_external,
            patch(
                "app.services.mailer.submit_notification_delivery"
            ) as submit_notification,
        ):
            sent = mailer.send_email(
                to_email="member@example.com",
                subject="test",
                text_content="test",
            )

        self.assertTrue(sent)
        self.assertEqual(submit_external.call_args.kwargs["status"], "SUCCEEDED")
        delivery = submit_notification.call_args.kwargs
        self.assertEqual(delivery["status"], "SENT")
        self.assertNotIn("member@example.com", delivery["destination_ref"])


if __name__ == "__main__":
    unittest.main()
