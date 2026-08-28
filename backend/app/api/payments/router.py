from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import json
from typing import Any
from uuid import NAMESPACE_URL, uuid5

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.api.auth.router import ensure_admin, get_current_user, get_request_id
from app.db import payments as payment_db
from app.db.logs import submit_audit_event
from app.services import toss_payments


router = APIRouter(prefix="/api/payments", tags=["payments"])
MAX_WEBHOOK_BODY_BYTES = 1_000_000


class OrderCreateRequest(BaseModel):
    product_code: str = Field(alias="productCode", min_length=1, max_length=100)


class PaymentConfirmRequest(BaseModel):
    payment_key: str = Field(alias="paymentKey", min_length=1, max_length=200)
    order_id: str = Field(alias="orderId", min_length=6, max_length=64)
    amount: int = Field(gt=0)


class PaymentCancelRequest(BaseModel):
    cancel_reason: str = Field(alias="cancelReason", min_length=1, max_length=200)


def _order_response(order: dict[str, Any]) -> dict[str, Any]:
    return {
        "orderId": order["order_id"],
        "productCode": order["product_code"],
        "orderName": order["product_name"],
        "planCode": order["plan_code"],
        "amount": order["amount"],
        "currency": order["currency"],
        "entitlementDays": order["entitlement_days"],
        "status": order["status"],
        "expiresAt": order["expires_at"].isoformat() if order["expires_at"] else None,
        "approvedAt": order["approved_at"].isoformat() if order["approved_at"] else None,
    }


def _raise_toss_http_error(exc: toss_payments.TossPaymentsError) -> None:
    status_code = 502 if exc.status_code >= 500 else 400
    raise HTTPException(
        status_code=status_code,
        detail={"code": exc.code, "message": exc.message},
    ) from exc


@router.post("/orders")
def create_order(
    request: OrderCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        client_key = toss_payments.public_client_key()
        order = payment_db.create_order(
            user_id=current_user["user_id"],
            product_code=request.product_code,
        )
    except toss_payments.TossPaymentsNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except payment_db.PaymentDataError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return {**_order_response(order), "clientKey": client_key}


@router.get("/orders/{order_id}")
def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
):
    order = payment_db.get_order(
        order_id=order_id,
        user_id=current_user["user_id"],
    )
    if not order:
        raise HTTPException(status_code=404, detail="payment order not found")
    return _order_response(order)


@router.post("/confirm")
def confirm_payment(
    request: PaymentConfirmRequest,
    current_user: dict = Depends(get_current_user),
):
    order = payment_db.get_order(
        order_id=request.order_id,
        user_id=current_user["user_id"],
    )
    if not order:
        raise HTTPException(status_code=404, detail="payment order not found")
    if order["amount"] != request.amount:
        raise HTTPException(status_code=400, detail="payment amount does not match")
    if order["status"] in {"CANCELED", "ABORTED", "EXPIRED"}:
        raise HTTPException(status_code=409, detail="payment order cannot be confirmed")
    if (
        order["status"] == "READY"
        and order["expires_at"]
        and order["expires_at"] <= datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=409, detail="payment order expired")

    try:
        provider_payment = toss_payments.confirm_payment(
            payment_key=request.payment_key,
            order_id=request.order_id,
            amount=order["amount"],
            idempotency_key=order["confirm_idempotency_key"],
        )
        updated_order = payment_db.record_provider_payment(provider_payment)
    except toss_payments.TossPaymentsNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except toss_payments.TossPaymentsError as exc:
        _raise_toss_http_error(exc)
    except payment_db.PaymentDataError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return _order_response(updated_order)


@router.post("/orders/{order_id}/cancel")
def cancel_payment(
    order_id: str,
    payload: PaymentCancelRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    ensure_admin(current_user)
    order = payment_db.get_order(order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="payment order not found")
    payment_key = payment_db.get_payment_key_for_order(order_id)
    if not payment_key:
        raise HTTPException(status_code=409, detail="approved payment not found")

    idempotency_key = str(
        uuid5(NAMESPACE_URL, f"solsqld:toss:cancel:{order_id}:full")
    )
    try:
        provider_payment = toss_payments.cancel_payment(
            payment_key=payment_key,
            cancel_reason=payload.cancel_reason,
            idempotency_key=idempotency_key,
        )
        updated_order = payment_db.record_provider_payment(provider_payment)
    except toss_payments.TossPaymentsNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except toss_payments.TossPaymentsError as exc:
        _raise_toss_http_error(exc)
    except payment_db.PaymentDataError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    submit_audit_event(
        actor_user_id=current_user["user_id"],
        actor_type="ADMIN",
        action="PAYMENT_CANCELED",
        target_type="payment.order",
        target_id=order_id,
        request_id=get_request_id(request),
        after_data={"status": updated_order["status"]},
        reason=payload.cancel_reason,
    )

    return _order_response(updated_order)


@router.post("/webhooks/toss")
async def toss_webhook(request: Request):
    raw_body = await request.body()
    if len(raw_body) > MAX_WEBHOOK_BODY_BYTES:
        raise HTTPException(status_code=413, detail="webhook payload is too large")
    try:
        payload = json.loads(raw_body)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=400, detail="invalid webhook payload") from exc
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="invalid webhook payload")

    event_type = str(payload.get("eventType") or "UNKNOWN")
    data = payload.get("data")
    if not isinstance(data, dict):
        data = {}
    payment_key = data.get("paymentKey")
    order_id = data.get("orderId")
    supported_events = {
        "PAYMENT_STATUS_CHANGED",
        "CANCEL_STATUS_CHANGED",
        "DEPOSIT_CALLBACK",
    }
    if event_type not in supported_events or (not payment_key and not order_id):
        return {"received": True, "ignored": True}

    normalized_payment_key = str(payment_key) if payment_key else None
    normalized_order_id = str(order_id) if order_id else None
    if not payment_db.has_known_payment_reference(
        order_id=normalized_order_id,
        payment_key=normalized_payment_key,
    ):
        return {"received": True, "ignored": True}

    event_hash = hashlib.sha256(raw_body).hexdigest()
    inserted = payment_db.record_webhook_received(
        event_hash=event_hash,
        event_type=event_type,
        payment_key=normalized_payment_key,
        order_id=normalized_order_id,
        payload_redacted=toss_payments.redacted_payment_payload(data),
    )
    if not inserted:
        return {"received": True, "duplicate": True}

    try:
        if payment_key:
            provider_payment = toss_payments.get_payment(str(payment_key))
        else:
            provider_payment = toss_payments.get_payment_by_order_id(str(order_id))
        payment_db.record_provider_payment(provider_payment)
    except payment_db.PaymentDataError:
        payment_db.finish_webhook(
            event_hash=event_hash,
            process_status="IGNORED",
            error_code="ORDER_NOT_FOUND_OR_MISMATCH",
        )
        return {"received": True, "ignored": True}
    except toss_payments.TossPaymentsNotConfigured as exc:
        payment_db.finish_webhook(
            event_hash=event_hash,
            process_status="FAILED",
            error_code="TOSS_NOT_CONFIGURED",
        )
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except toss_payments.TossPaymentsError as exc:
        payment_db.finish_webhook(
            event_hash=event_hash,
            process_status="FAILED",
            error_code=exc.code,
        )
        _raise_toss_http_error(exc)

    payment_db.finish_webhook(
        event_hash=event_hash,
        process_status="PROCESSED",
    )
    return {"received": True}
