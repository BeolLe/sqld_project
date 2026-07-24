from __future__ import annotations

from typing import Any
from uuid import uuid4

from psycopg.types.json import Jsonb

from app.db.postgres import get_connection


ORDER_STATUSES = {
    "READY",
    "IN_PROGRESS",
    "WAITING_FOR_DEPOSIT",
    "DONE",
    "PARTIAL_CANCELED",
    "CANCELED",
    "ABORTED",
    "EXPIRED",
}


class PaymentDataError(RuntimeError):
    pass


def _order_dict(row) -> dict[str, Any]:
    return {
        "order_id": row[0],
        "user_id": str(row[1]) if row[1] else None,
        "product_code": row[2],
        "product_name": row[3],
        "plan_code": row[4],
        "amount": int(row[5]),
        "currency": row[6],
        "entitlement_days": int(row[7]),
        "status": row[8],
        "confirm_idempotency_key": str(row[9]),
        "expires_at": row[10],
        "approved_at": row[11],
        "created_at": row[12],
    }


def create_order(*, user_id: str, product_code: str) -> dict[str, Any]:
    order_id = f"SOL_{uuid4().hex}"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO payment.orders (
                    order_id, user_id, product_code, product_name,
                    plan_code, amount, currency, entitlement_days
                )
                SELECT
                    %s, %s::uuid, product.product_code, product.display_name,
                    product.plan_code, product.amount, product.currency,
                    product.entitlement_days
                FROM payment.products AS product
                WHERE product.product_code = %s
                  AND product.is_active = true
                RETURNING
                    order_id, user_id, product_code, product_name,
                    plan_code, amount, currency, entitlement_days,
                    status, confirm_idempotency_key, expires_at,
                    approved_at, created_at
                """,
                (order_id, user_id, product_code),
            )
            row = cur.fetchone()
    if not row:
        raise PaymentDataError("payment product not found or inactive")
    return _order_dict(row)


def get_order(*, order_id: str, user_id: str | None = None) -> dict[str, Any] | None:
    params: list[Any] = [order_id]
    user_clause = ""
    if user_id is not None:
        user_clause = "AND user_id = %s::uuid"
        params.append(user_id)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT
                    order_id, user_id, product_code, product_name,
                    plan_code, amount, currency, entitlement_days,
                    status, confirm_idempotency_key, expires_at,
                    approved_at, created_at
                FROM payment.orders
                WHERE order_id = %s
                  {user_clause}
                """,
                params,
            )
            row = cur.fetchone()
    return _order_dict(row) if row else None


def get_payment_key_for_order(order_id: str) -> str | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT payment_key
                FROM payment.transactions
                WHERE order_id = %s
                """,
                (order_id,),
            )
            row = cur.fetchone()
    return row[0] if row else None


def has_known_payment_reference(
    *,
    order_id: str | None,
    payment_key: str | None,
) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    EXISTS (
                        SELECT 1
                        FROM payment.orders
                        WHERE order_id = %s
                    )
                    OR EXISTS (
                        SELECT 1
                        FROM payment.transactions
                        WHERE payment_key = %s
                    )
                """,
                (order_id, payment_key),
            )
            row = cur.fetchone()
    return bool(row and row[0])


def _provider_status(payment: dict[str, Any]) -> str:
    status = str(payment.get("status") or "")
    if status not in ORDER_STATUSES:
        raise PaymentDataError(f"unsupported toss payment status: {status}")
    return status


def _validate_provider_payment(order: dict[str, Any], payment: dict[str, Any]) -> None:
    if payment.get("orderId") != order["order_id"]:
        raise PaymentDataError("toss order id does not match")
    if int(payment.get("totalAmount") or -1) != order["amount"]:
        raise PaymentDataError("toss payment amount does not match")
    if not payment.get("paymentKey"):
        raise PaymentDataError("toss payment key is missing")


def _upsert_transaction(cur, payment: dict[str, Any]) -> None:
    receipt = payment.get("receipt")
    receipt_url = receipt.get("url") if isinstance(receipt, dict) else None
    cur.execute(
        """
        INSERT INTO payment.transactions (
            payment_key, order_id, status, method,
            total_amount, balance_amount, requested_at,
            approved_at, receipt_url, last_synced_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, now())
        ON CONFLICT (payment_key) DO UPDATE SET
            status = EXCLUDED.status,
            method = EXCLUDED.method,
            total_amount = EXCLUDED.total_amount,
            balance_amount = EXCLUDED.balance_amount,
            requested_at = EXCLUDED.requested_at,
            approved_at = EXCLUDED.approved_at,
            receipt_url = EXCLUDED.receipt_url,
            last_synced_at = now(),
            updated_at = now()
        """,
        (
            payment["paymentKey"],
            payment["orderId"],
            payment["status"],
            payment.get("method"),
            int(payment.get("totalAmount") or 0),
            int(payment.get("balanceAmount") or 0),
            payment.get("requestedAt"),
            payment.get("approvedAt"),
            receipt_url,
        ),
    )


def _upsert_cancellations(cur, payment: dict[str, Any]) -> None:
    cancellations = payment.get("cancels")
    if not isinstance(cancellations, list):
        return
    for cancellation in cancellations:
        if not isinstance(cancellation, dict) or not cancellation.get("transactionKey"):
            continue
        cur.execute(
            """
            INSERT INTO payment.cancellations (
                transaction_key, payment_key, cancel_amount,
                cancel_reason, cancel_status, canceled_at
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (transaction_key) DO UPDATE SET
                cancel_amount = EXCLUDED.cancel_amount,
                cancel_reason = EXCLUDED.cancel_reason,
                cancel_status = EXCLUDED.cancel_status,
                canceled_at = EXCLUDED.canceled_at,
                updated_at = now()
            """,
            (
                cancellation["transactionKey"],
                payment["paymentKey"],
                int(cancellation.get("cancelAmount") or 0),
                cancellation.get("cancelReason"),
                cancellation.get("cancelStatus") or "UNKNOWN",
                cancellation.get("canceledAt"),
            ),
        )


def _grant_entitlement(cur, order: dict[str, Any]) -> None:
    if not order["user_id"]:
        return
    cur.execute(
        "SELECT pg_advisory_xact_lock(hashtextextended(%s, 0))",
        (order["user_id"],),
    )
    cur.execute(
        """
        WITH entitlement_start AS (
            SELECT GREATEST(
                now(),
                COALESCE(
                    MAX(ends_at) FILTER (
                        WHERE revoked_at IS NULL
                          AND ends_at IS NOT NULL
                          AND ends_at > now()
                    ),
                    now()
                )
            ) AS starts_at
            FROM ai.user_entitlements
            WHERE user_id = %s::uuid
              AND plan_code = %s
        )
        INSERT INTO ai.user_entitlements (
            user_id, plan_code, source_type, source_reference,
            starts_at, ends_at
        )
        SELECT
            %s::uuid, %s, 'payment', %s,
            starts_at,
            starts_at + make_interval(days => %s)
        FROM entitlement_start
        ON CONFLICT DO NOTHING
        """,
        (
            order["user_id"],
            order["plan_code"],
            order["user_id"],
            order["plan_code"],
            order["order_id"],
            order["entitlement_days"],
        ),
    )


def _revoke_entitlement(cur, order_id: str) -> None:
    cur.execute(
        """
        UPDATE ai.user_entitlements
        SET revoked_at = COALESCE(revoked_at, now()),
            updated_at = now()
        WHERE source_type = 'payment'
          AND source_reference = %s
        """,
        (order_id,),
    )


def record_provider_payment(payment: dict[str, Any]) -> dict[str, Any]:
    order_id = str(payment.get("orderId") or "")
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    order_id, user_id, product_code, product_name,
                    plan_code, amount, currency, entitlement_days,
                    status, confirm_idempotency_key, expires_at,
                    approved_at, created_at
                FROM payment.orders
                WHERE order_id = %s
                FOR UPDATE
                """,
                (order_id,),
            )
            row = cur.fetchone()
            if not row:
                raise PaymentDataError("payment order not found")
            order = _order_dict(row)
            _validate_provider_payment(order, payment)
            status = _provider_status(payment)

            _upsert_transaction(cur, payment)
            _upsert_cancellations(cur, payment)
            cur.execute(
                """
                UPDATE payment.orders
                SET status = %s,
                    approved_at = CASE
                        WHEN %s = 'DONE' THEN COALESCE(%s::timestamptz, approved_at, now())
                        ELSE approved_at
                    END,
                    updated_at = now()
                WHERE order_id = %s
                """,
                (status, status, payment.get("approvedAt"), order_id),
            )

            if status == "DONE":
                _grant_entitlement(cur, order)
            elif status == "CANCELED":
                _revoke_entitlement(cur, order_id)

    updated_order = get_order(order_id=order_id)
    if not updated_order:
        raise PaymentDataError("payment order disappeared after update")
    return updated_order


def record_webhook_received(
    *,
    event_hash: str,
    event_type: str,
    payment_key: str | None,
    order_id: str | None,
    payload_redacted: dict[str, Any],
) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO payment.webhook_events (
                    event_hash, event_type, payment_key,
                    order_id, payload_redacted
                )
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (event_hash) DO UPDATE SET
                    process_status = 'RECEIVED',
                    error_code = NULL,
                    received_at = now(),
                    processed_at = NULL
                WHERE payment.webhook_events.process_status = 'FAILED'
                   OR (
                       payment.webhook_events.process_status = 'RECEIVED'
                       AND payment.webhook_events.received_at < now() - interval '30 seconds'
                   )
                RETURNING event_hash
                """,
                (
                    event_hash,
                    event_type,
                    payment_key,
                    order_id,
                    Jsonb(payload_redacted),
                ),
            )
            return cur.fetchone() is not None


def finish_webhook(
    *,
    event_hash: str,
    process_status: str,
    error_code: str | None = None,
) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE payment.webhook_events
                SET process_status = %s,
                    error_code = %s,
                    processed_at = now()
                WHERE event_hash = %s
                """,
                (process_status, error_code, event_hash),
            )


def expire_open_orders_for_user(cur, user_id: str) -> None:
    cur.execute(
        """
        UPDATE payment.orders
        SET status = 'EXPIRED',
            updated_at = now()
        WHERE user_id = %s::uuid
          AND status IN ('READY', 'IN_PROGRESS')
        """,
        (user_id,),
    )
