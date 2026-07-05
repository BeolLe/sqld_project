from __future__ import annotations

from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from psycopg.types.json import Jsonb

from app.db.postgres import get_connection


def resolve_model_route(user_id: str, use_case: str) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                WITH current_plan AS (
                    SELECT COALESCE((
                        SELECT entitlement.plan_code
                        FROM ai.user_entitlements AS entitlement
                        JOIN ai.plans AS plan
                          ON plan.plan_code = entitlement.plan_code
                         AND plan.is_active = true
                        WHERE entitlement.user_id = %s::uuid
                          AND entitlement.starts_at <= now()
                          AND (entitlement.ends_at IS NULL OR entitlement.ends_at > now())
                        ORDER BY entitlement.starts_at DESC
                        LIMIT 1
                    ), 'free') AS plan_code
                )
                SELECT
                    route.route_id,
                    route.plan_code,
                    route.daily_limit,
                    model.provider_model_id,
                    model.provider,
                    model.model_code,
                    model.model_tier
                FROM ai.model_routes AS route
                JOIN ai.provider_models AS model
                  ON model.provider_model_id = route.provider_model_id
                 AND model.is_active = true
                CROSS JOIN current_plan
                WHERE route.use_case = %s
                  AND route.is_active = true
                  AND route.plan_code IN (current_plan.plan_code, 'free')
                ORDER BY
                    (route.plan_code = current_plan.plan_code) DESC,
                    route.priority ASC
                LIMIT 1
                """,
                (user_id, use_case),
            )
            row = cur.fetchone()
    if not row:
        raise RuntimeError(f"no AI model route configured for {use_case}")
    return {
        "route_id": row[0],
        "plan_code": row[1],
        "daily_limit": row[2],
        "provider_model_id": row[3],
        "provider": row[4],
        "model": row[5],
        "model_tier": row[6],
    }


def resolve_free_model_route(use_case: str) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    route.route_id, route.plan_code, route.daily_limit,
                    model.provider_model_id, model.provider,
                    model.model_code, model.model_tier
                FROM ai.model_routes AS route
                JOIN ai.provider_models AS model
                  ON model.provider_model_id = route.provider_model_id
                 AND model.is_active = true
                WHERE route.plan_code = 'free'
                  AND route.use_case = %s
                  AND route.is_active = true
                ORDER BY route.priority
                LIMIT 1
                """,
                (use_case,),
            )
            row = cur.fetchone()
    if not row:
        raise RuntimeError(f"no free AI model route configured for {use_case}")
    return {
        "route_id": row[0], "plan_code": row[1], "daily_limit": row[2],
        "provider_model_id": row[3], "provider": row[4], "model": row[5],
        "model_tier": row[6],
    }


def get_cached_response(
    *, cache_key: str, user_id: str, cache_scope: str
) -> dict[str, Any] | None:
    owner_clause = "owner_user_id IS NULL"
    params: list[Any] = [cache_key]
    if cache_scope == "user":
        owner_clause = "owner_user_id = %s::uuid"
        params.append(user_id)
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                UPDATE ai.response_cache
                SET hit_count = hit_count + 1,
                    last_hit_at = now()
                WHERE cache_key = %s
                  AND cache_scope = '{cache_scope}'
                  AND {owner_clause}
                  AND expires_at > now()
                RETURNING cache_id, response_text, response_payload
                """,
                params,
            )
            row = cur.fetchone()
    if not row:
        return None
    return {"cache_id": str(row[0]), "text": row[1], "payload": row[2] or {}}


def create_cached_request(
    *,
    user_id: str,
    use_case: str,
    source_type: str,
    source_id: str | None,
    route: dict[str, Any],
    client_request: dict[str, Any],
    context: dict[str, Any],
    response_text: str,
) -> str:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ai.requests (
                    user_id, use_case, source_type, source_id,
                    provider_model_id, model_tier, status, cache_hit, completed_at
                )
                VALUES (%s::uuid, %s, %s, %s, %s, %s, 'cache_hit', true, now())
                RETURNING request_id
                """,
                (
                    user_id,
                    use_case,
                    source_type,
                    source_id,
                    route["provider_model_id"],
                    route["model_tier"],
                ),
            )
            request_id = str(cur.fetchone()[0])
            cur.execute(
                """
                INSERT INTO ai.request_contents (
                    request_id, client_request, context_payload, response_text
                ) VALUES (%s::uuid, %s, %s, %s)
                """,
                (request_id, Jsonb(client_request), Jsonb(context), response_text),
            )
    return request_id


def create_request_and_reserve(
    *,
    user_id: str,
    use_case: str,
    source_type: str,
    source_id: str | None,
    idempotency_key: str | None,
    route: dict[str, Any],
    client_request: dict[str, Any],
    context: dict[str, Any],
) -> tuple[str, dict[str, int]]:
    usage_date = datetime.now(ZoneInfo("Asia/Seoul")).date()
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ai.requests (
                    user_id, use_case, source_type, source_id, idempotency_key,
                    provider_model_id, model_tier, status
                )
                VALUES (%s::uuid, %s, %s, %s, %s, %s, %s, 'received')
                RETURNING request_id
                """,
                (
                    user_id,
                    use_case,
                    source_type,
                    source_id,
                    idempotency_key,
                    route["provider_model_id"],
                    route["model_tier"],
                ),
            )
            request_id = str(cur.fetchone()[0])
            cur.execute(
                """
                INSERT INTO ai.daily_usage (
                    user_id, use_case, usage_date, daily_limit, reserved_count
                ) VALUES (%s::uuid, %s, %s, %s, 1)
                ON CONFLICT (user_id, use_case, usage_date)
                DO UPDATE SET
                    daily_limit = EXCLUDED.daily_limit,
                    reserved_count = ai.daily_usage.reserved_count + 1,
                    updated_at = now()
                WHERE ai.daily_usage.used_count + ai.daily_usage.reserved_count
                    < EXCLUDED.daily_limit
                RETURNING daily_limit, used_count, reserved_count
                """,
                (user_id, use_case, usage_date, route["daily_limit"]),
            )
            usage = cur.fetchone()
            if not usage:
                raise ValueError("AI_DAILY_QUOTA_EXCEEDED")
            cur.execute(
                """
                INSERT INTO ai.request_contents (
                    request_id, client_request, context_payload
                ) VALUES (%s::uuid, %s, %s)
                """,
                (request_id, Jsonb(client_request), Jsonb(context)),
            )
            cur.execute(
                """
                INSERT INTO ai.usage_events (
                    request_id, user_id, use_case, usage_date, event_type
                ) VALUES (%s::uuid, %s::uuid, %s, %s, 'reserve')
                """,
                (request_id, user_id, use_case, usage_date),
            )
    return request_id, {
        "limit": usage[0],
        "used": usage[1],
        "reserved": usage[2],
    }


def complete_request(
    *,
    request_id: str,
    user_id: str,
    use_case: str,
    response_text: str,
    provider_response: dict[str, Any],
    input_tokens: int | None,
    output_tokens: int | None,
    provider_latency_ms: int,
    total_latency_ms: int,
) -> dict[str, int]:
    usage_date = datetime.now(ZoneInfo("Asia/Seoul")).date()
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE ai.daily_usage
                SET reserved_count = reserved_count - 1,
                    used_count = used_count + 1,
                    updated_at = now()
                WHERE user_id = %s::uuid AND use_case = %s AND usage_date = %s
                  AND reserved_count > 0
                RETURNING daily_limit, used_count, reserved_count
                """,
                (user_id, use_case, usage_date),
            )
            usage = cur.fetchone()
            if not usage:
                raise RuntimeError("AI quota reservation disappeared")
            cur.execute(
                """
                INSERT INTO ai.usage_events (
                    request_id, user_id, use_case, usage_date, event_type
                ) VALUES (%s::uuid, %s::uuid, %s, %s, 'consume')
                ON CONFLICT (request_id, event_type) DO NOTHING
                """,
                (request_id, user_id, use_case, usage_date),
            )
            cur.execute(
                """
                UPDATE ai.requests
                SET status = 'succeeded', input_tokens = %s, output_tokens = %s,
                    provider_latency_ms = %s, total_latency_ms = %s,
                    completed_at = now(), updated_at = now()
                WHERE request_id = %s::uuid
                """,
                (
                    input_tokens,
                    output_tokens,
                    provider_latency_ms,
                    total_latency_ms,
                    request_id,
                ),
            )
            cur.execute(
                """
                UPDATE ai.request_contents
                SET provider_response = %s, response_text = %s, updated_at = now()
                WHERE request_id = %s::uuid
                """,
                (Jsonb(provider_response), response_text, request_id),
            )
    return {"limit": usage[0], "used": usage[1], "reserved": usage[2]}


def mark_provider_requested(
    *, request_id: str, provider_request: dict[str, Any]
) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE ai.requests
                SET status = 'provider_requested', updated_at = now()
                WHERE request_id = %s::uuid
                """,
                (request_id,),
            )
            cur.execute(
                """
                UPDATE ai.request_contents
                SET provider_request = %s, updated_at = now()
                WHERE request_id = %s::uuid
                """,
                (Jsonb(provider_request), request_id),
            )


def fail_request(
    *, request_id: str, user_id: str, use_case: str, status: str,
    error_code: str, error_detail: str, response_text: str,
) -> None:
    usage_date = datetime.now(ZoneInfo("Asia/Seoul")).date()
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE ai.daily_usage
                SET reserved_count = reserved_count - 1, updated_at = now()
                WHERE user_id = %s::uuid AND use_case = %s AND usage_date = %s
                  AND reserved_count > 0
                """,
                (user_id, use_case, usage_date),
            )
            cur.execute(
                """
                INSERT INTO ai.usage_events (
                    request_id, user_id, use_case, usage_date, event_type
                ) VALUES (%s::uuid, %s::uuid, %s, %s, 'refund')
                ON CONFLICT (request_id, event_type) DO NOTHING
                """,
                (request_id, user_id, use_case, usage_date),
            )
            cur.execute(
                """
                UPDATE ai.requests SET status = %s, error_code = %s,
                    error_detail = %s, completed_at = now(), updated_at = now()
                WHERE request_id = %s::uuid
                """,
                (status, error_code, error_detail[:2000], request_id),
            )
            cur.execute(
                """
                UPDATE ai.request_contents SET response_text = %s, updated_at = now()
                WHERE request_id = %s::uuid
                """,
                (response_text, request_id),
            )


def save_cache(
    *, cache_key: str, cache_scope: str, owner_user_id: str | None,
    use_case: str, route: dict[str, Any], context_hash: str,
    response_text: str, response_payload: dict[str, Any], ttl_seconds: int,
) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ai.response_cache (
                    cache_key, cache_scope, owner_user_id, use_case,
                    provider_model_id, context_hash, response_text,
                    response_payload, expires_at
                ) VALUES (%s, %s, %s::uuid, %s, %s, %s, %s, %s,
                    now() + make_interval(secs => %s))
                ON CONFLICT (cache_key) DO UPDATE SET
                    response_text = EXCLUDED.response_text,
                    response_payload = EXCLUDED.response_payload,
                    expires_at = EXCLUDED.expires_at
                """,
                (
                    cache_key, cache_scope, owner_user_id, use_case,
                    route["provider_model_id"], context_hash, response_text,
                    Jsonb(response_payload), ttl_seconds,
                ),
            )


def get_usage(user_id: str) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                WITH current_plan AS (
                    SELECT COALESCE((
                        SELECT entitlement.plan_code
                        FROM ai.user_entitlements AS entitlement
                        WHERE entitlement.user_id = %s::uuid
                          AND entitlement.starts_at <= now()
                          AND (entitlement.ends_at IS NULL OR entitlement.ends_at > now())
                        ORDER BY entitlement.starts_at DESC
                        LIMIT 1
                    ), 'free') AS plan_code
                ), routes AS (
                    SELECT DISTINCT ON (route.use_case)
                        route.use_case,
                        route.daily_limit,
                        route.plan_code
                    FROM ai.model_routes AS route
                    CROSS JOIN current_plan
                    WHERE route.plan_code IN (current_plan.plan_code, 'free')
                      AND route.is_active = true
                    ORDER BY route.use_case,
                        (route.plan_code = current_plan.plan_code) DESC,
                        route.priority
                )
                SELECT
                    routes.use_case,
                    routes.daily_limit,
                    COALESCE(usage.used_count, 0),
                    COALESCE(usage.reserved_count, 0),
                    (SELECT plan_code FROM current_plan)
                FROM routes
                LEFT JOIN ai.daily_usage AS usage
                  ON usage.user_id = %s::uuid
                 AND usage.use_case = routes.use_case
                 AND usage.usage_date = (now() AT TIME ZONE 'Asia/Seoul')::date
                ORDER BY routes.use_case
                """,
                (user_id, user_id),
            )
            rows = cur.fetchall()
    items = [
        {
            "useCase": row[0], "limit": row[1], "used": row[2],
            "reserved": row[3], "remaining": max(row[1] - row[2] - row[3], 0),
        }
        for row in rows
    ]
    return {"items": items, "planType": rows[0][4] if rows else "free"}


def save_feedback(
    *, request_id: str, user_id: str, helpful: bool,
    reason_code: str | None, comment: str | None,
) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ai.feedback (
                    request_id, user_id, helpful, reason_code, comment
                )
                SELECT request_id, user_id, %s, %s, %s
                FROM ai.requests
                WHERE request_id = %s::uuid AND user_id = %s::uuid
                ON CONFLICT (request_id, user_id) DO UPDATE SET
                    helpful = EXCLUDED.helpful,
                    reason_code = EXCLUDED.reason_code,
                    comment = EXCLUDED.comment,
                    updated_at = now()
                RETURNING feedback_id
                """,
                (helpful, reason_code, comment, request_id, user_id),
            )
            return cur.fetchone() is not None
