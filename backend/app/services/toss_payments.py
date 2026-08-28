from __future__ import annotations

from datetime import datetime, timezone
from time import monotonic
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings
from app.db.logs import submit_external_service_call


class TossPaymentsNotConfigured(RuntimeError):
    pass


class TossPaymentsError(RuntimeError):
    def __init__(self, *, status_code: int, code: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


def is_configured() -> bool:
    return bool(
        settings.TOSS_PAYMENTS_CLIENT_KEY
        and settings.TOSS_PAYMENTS_SECRET_KEY
    )


def public_client_key() -> str:
    if not is_configured():
        raise TossPaymentsNotConfigured("toss payments is not configured")
    return settings.TOSS_PAYMENTS_CLIENT_KEY


def _request(
    method: str,
    path: str,
    *,
    operation: str,
    json_body: dict[str, Any] | None = None,
    idempotency_key: str | None = None,
) -> dict[str, Any]:
    if not is_configured():
        raise TossPaymentsNotConfigured("toss payments is not configured")

    headers = {"Accept-Language": "en-US"}
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key

    requested_at = datetime.now(timezone.utc)
    started_at = monotonic()
    try:
        response = httpx.request(
            method,
            f"{settings.TOSS_PAYMENTS_API_BASE_URL}{path}",
            auth=(settings.TOSS_PAYMENTS_SECRET_KEY, ""),
            headers=headers,
            json=json_body,
            timeout=settings.TOSS_PAYMENTS_TIMEOUT_SECONDS,
        )
    except httpx.RequestError as exc:
        finished_at = datetime.now(timezone.utc)
        submit_external_service_call(
            service_name="toss_payments",
            operation=operation,
            status="TIMED_OUT" if isinstance(exc, httpx.TimeoutException) else "FAILED",
            started_at=requested_at,
            finished_at=finished_at,
            duration_ms=round((monotonic() - started_at) * 1000),
            provider_error_code="TOSS_NETWORK_ERROR",
            metadata={"idempotency_key_used": bool(idempotency_key)},
        )
        raise TossPaymentsError(
            status_code=502,
            code="TOSS_NETWORK_ERROR",
            message="toss payments request failed",
        ) from exc

    try:
        payload = response.json()
    except ValueError:
        payload = {}

    if not response.is_success:
        finished_at = datetime.now(timezone.utc)
        error_payload = payload if isinstance(payload, dict) else {}
        error_code = str(error_payload.get("code") or "TOSS_API_ERROR")
        submit_external_service_call(
            service_name="toss_payments",
            operation=operation,
            status="FAILED",
            started_at=requested_at,
            finished_at=finished_at,
            duration_ms=round((monotonic() - started_at) * 1000),
            http_status_code=response.status_code,
            provider_error_code=error_code,
            metadata={"idempotency_key_used": bool(idempotency_key)},
        )
        raise TossPaymentsError(
            status_code=response.status_code,
            code=error_code,
            message=str(
                error_payload.get("message") or "toss payments request failed"
            )[:510],
        )

    if not isinstance(payload, dict):
        finished_at = datetime.now(timezone.utc)
        submit_external_service_call(
            service_name="toss_payments",
            operation=operation,
            status="FAILED",
            started_at=requested_at,
            finished_at=finished_at,
            duration_ms=round((monotonic() - started_at) * 1000),
            http_status_code=response.status_code,
            provider_error_code="INVALID_TOSS_RESPONSE",
            metadata={"idempotency_key_used": bool(idempotency_key)},
        )
        raise TossPaymentsError(
            status_code=502,
            code="INVALID_TOSS_RESPONSE",
            message="toss payments returned an invalid response",
        )

    finished_at = datetime.now(timezone.utc)
    submit_external_service_call(
        service_name="toss_payments",
        operation=operation,
        status="SUCCEEDED",
        started_at=requested_at,
        finished_at=finished_at,
        duration_ms=round((monotonic() - started_at) * 1000),
        http_status_code=response.status_code,
        metadata={"idempotency_key_used": bool(idempotency_key)},
    )
    return payload


def confirm_payment(
    *,
    payment_key: str,
    order_id: str,
    amount: int,
    idempotency_key: str,
) -> dict[str, Any]:
    return _request(
        "POST",
        "/payments/confirm",
        operation="confirm_payment",
        json_body={
            "paymentKey": payment_key,
            "orderId": order_id,
            "amount": amount,
        },
        idempotency_key=idempotency_key,
    )


def get_payment(payment_key: str) -> dict[str, Any]:
    return _request(
        "GET",
        f"/payments/{quote(payment_key, safe='')}",
        operation="get_payment",
    )


def get_payment_by_order_id(order_id: str) -> dict[str, Any]:
    return _request(
        "GET",
        f"/payments/orders/{quote(order_id, safe='')}",
        operation="get_payment_by_order_id",
    )


def cancel_payment(
    *,
    payment_key: str,
    cancel_reason: str,
    idempotency_key: str,
) -> dict[str, Any]:
    return _request(
        "POST",
        f"/payments/{quote(payment_key, safe='')}/cancel",
        operation="cancel_payment",
        json_body={"cancelReason": cancel_reason},
        idempotency_key=idempotency_key,
    )


def redacted_payment_payload(payload: dict[str, Any]) -> dict[str, Any]:
    receipt = payload.get("receipt")
    safe_receipt = None
    if isinstance(receipt, dict):
        safe_receipt = {"url": receipt.get("url")}

    return {
        "paymentKey": payload.get("paymentKey"),
        "orderId": payload.get("orderId"),
        "orderName": payload.get("orderName"),
        "status": payload.get("status"),
        "method": payload.get("method"),
        "totalAmount": payload.get("totalAmount"),
        "balanceAmount": payload.get("balanceAmount"),
        "requestedAt": payload.get("requestedAt"),
        "approvedAt": payload.get("approvedAt"),
        "receipt": safe_receipt,
    }
