from __future__ import annotations

from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from fastapi import HTTPException

from app.api.auth.router import validate_csrf_request
from app.services import toss_payments


class TossPaymentsClientTests(unittest.TestCase):
    def test_confirm_uses_basic_auth_and_idempotency_key(self):
        response = Mock()
        response.is_success = True
        response.json.return_value = {
            "paymentKey": "payment-key",
            "orderId": "SOL_order",
            "status": "DONE",
            "totalAmount": 10000,
        }

        with (
            patch.object(toss_payments.settings, "TOSS_PAYMENTS_CLIENT_KEY", "client"),
            patch.object(toss_payments.settings, "TOSS_PAYMENTS_SECRET_KEY", "secret"),
            patch.object(
                toss_payments.settings,
                "TOSS_PAYMENTS_API_BASE_URL",
                "https://api.tosspayments.com/v1",
            ),
            patch("app.services.toss_payments.httpx.request", return_value=response) as request,
        ):
            result = toss_payments.confirm_payment(
                payment_key="payment-key",
                order_id="SOL_order",
                amount=10000,
                idempotency_key="idempotency-key",
            )

        self.assertEqual(result["status"], "DONE")
        self.assertEqual(request.call_args.kwargs["auth"], ("secret", ""))
        self.assertEqual(
            request.call_args.kwargs["headers"]["Idempotency-Key"],
            "idempotency-key",
        )
        self.assertEqual(request.call_args.kwargs["json"]["amount"], 10000)

    def test_redacted_payload_excludes_payment_method_details(self):
        redacted = toss_payments.redacted_payment_payload(
            {
                "paymentKey": "payment-key",
                "orderId": "SOL_order",
                "status": "DONE",
                "totalAmount": 10000,
                "card": {"number": "1234****5678", "approveNo": "12345678"},
                "secret": "webhook-secret",
            }
        )

        self.assertNotIn("card", redacted)
        self.assertNotIn("secret", redacted)
        self.assertEqual(redacted["orderId"], "SOL_order")


class PaymentCsrfTests(unittest.TestCase):
    def test_toss_webhook_is_the_only_payment_post_csrf_exception(self):
        webhook_request = SimpleNamespace(
            method="POST",
            url=SimpleNamespace(path="/api/payments/webhooks/toss"),
            headers={},
            cookies={},
        )
        validate_csrf_request(webhook_request)

        confirm_request = SimpleNamespace(
            method="POST",
            url=SimpleNamespace(path="/api/payments/confirm"),
            base_url="https://solsqld.example/",
            headers={},
            cookies={},
        )
        with self.assertRaises(HTTPException) as context:
            validate_csrf_request(confirm_request)
        self.assertEqual(context.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
