from __future__ import annotations

import asyncio
import hashlib
import json
from collections import deque
from collections.abc import AsyncIterator, Callable
from dataclasses import dataclass
from time import monotonic
from typing import Any

import httpx
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.db import ai as ai_db
from app.services.ai.claude import ClaudeProvider
from app.services.ai.gemini import GeminiProvider
from app.services.ai.prompts import SYSTEM_PROMPTS
from app.services.ai.provider import AIProviderRequest, AIProviderUsage
from app.services.ai.security import estimate_tokens, redact_secrets


@dataclass(slots=True)
class PreparedRequest:
    user_id: str
    use_case: str
    source_type: str
    source_id: str | None
    route: dict[str, Any]
    context: dict[str, Any]
    client_request: dict[str, Any]
    cache_key: str
    context_hash: str
    cache_scope: str
    cache_ttl_seconds: int
    request_id: str
    usage: dict[str, int] | None
    cached_text: str | None
    owns_slot: bool


def _sse(payload: dict[str, Any]) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def _sanitize_error(exc: BaseException) -> str:
    detail = str(exc)
    for secret in (settings.GEMINI_API_KEY, settings.ANTHROPIC_API_KEY):
        if secret:
            detail = detail.replace(secret, "[REDACTED]")
    return detail


class AIService:
    def __init__(self) -> None:
        self._providers = {
            "google": GeminiProvider(),
            "anthropic": ClaudeProvider(),
        }
        self._semaphore = asyncio.Semaphore(settings.AI_MAX_CONCURRENT_REQUESTS)
        self._active_users: set[str] = set()
        self._active_users_lock = asyncio.Lock()
        self._provider_request_times: dict[str, deque[float]] = {
            "google": deque(),
            "anthropic": deque(),
        }
        self._provider_rate_lock = asyncio.Lock()

    async def close(self) -> None:
        await asyncio.gather(*(provider.close() for provider in self._providers.values()))

    async def _acquire_slot(self, user_id: str) -> None:
        async with self._active_users_lock:
            if user_id in self._active_users:
                raise HTTPException(status_code=409, detail="AI_REQUEST_IN_PROGRESS")
            if self._semaphore.locked():
                raise HTTPException(status_code=429, detail="AI_CONCURRENCY_LIMIT")
            self._active_users.add(user_id)
        try:
            await self._semaphore.acquire()
        except BaseException:
            async with self._active_users_lock:
                self._active_users.discard(user_id)
            raise

    async def _release_slot(self, user_id: str) -> None:
        self._semaphore.release()
        async with self._active_users_lock:
            self._active_users.discard(user_id)

    async def _reserve_provider_rate(self, provider: str) -> None:
        now = monotonic()
        request_times = self._provider_request_times.setdefault(provider, deque())
        limit = (
            settings.AI_ANTHROPIC_RPM_LIMIT
            if provider == "anthropic"
            else settings.AI_GEMINI_RPM_LIMIT
        )
        async with self._provider_rate_lock:
            while request_times and now - request_times[0] >= 60:
                request_times.popleft()
            if len(request_times) >= limit:
                retry_after = max(
                    1,
                    round(60 - (now - request_times[0])),
                )
                raise HTTPException(
                    status_code=429,
                    detail="AI_PROVIDER_RATE_LIMIT",
                    headers={"Retry-After": str(retry_after)},
                )
            request_times.append(now)

    async def prepare(
        self,
        *,
        user_id: str,
        use_case: str,
        source_type: str,
        source_id: str | None,
        client_request: dict[str, Any],
        context_builder: Callable[[], dict[str, Any]],
        cache_scope: str,
        cache_ttl_seconds: int,
        idempotency_key: str | None,
        force_refresh: bool,
        quality_mode: str,
    ) -> PreparedRequest:
        context = redact_secrets(await run_in_threadpool(context_builder))
        if quality_mode == "standard":
            route = await run_in_threadpool(ai_db.resolve_free_model_route, use_case)
        else:
            route = await run_in_threadpool(ai_db.resolve_model_route, user_id, use_case)
        if route["provider"] == "anthropic" and not settings.ANTHROPIC_API_KEY:
            route = await run_in_threadpool(ai_db.resolve_free_model_route, use_case)
        estimated_input_tokens = estimate_tokens(SYSTEM_PROMPTS[use_case], context)
        if estimated_input_tokens > route["input_token_limit"]:
            raise HTTPException(status_code=413, detail="AI_INPUT_TOKEN_LIMIT")
        context_json = json.dumps(context, ensure_ascii=False, sort_keys=True, default=str)
        context_hash = hashlib.sha256(context_json.encode()).hexdigest()
        owner = user_id if cache_scope == "user" else "shared"
        cache_material = "|".join(
            [
                owner,
                use_case,
                context_hash,
                route["provider"],
                route["model"],
                "prompt-v1",
            ]
        )
        cache_key = hashlib.sha256(cache_material.encode()).hexdigest()

        if not force_refresh:
            cached = await run_in_threadpool(
                ai_db.get_cached_response,
                cache_key=cache_key,
                user_id=user_id,
                cache_scope=cache_scope,
            )
            if cached:
                request_id = await run_in_threadpool(
                    ai_db.create_cached_request,
                    user_id=user_id,
                    use_case=use_case,
                    source_type=source_type,
                    source_id=source_id,
                    route=route,
                    client_request=client_request,
                    context=context,
                    response_text=cached["text"],
                )
                return PreparedRequest(
                    user_id, use_case, source_type, source_id, route, context,
                    client_request, cache_key, context_hash, cache_scope,
                    cache_ttl_seconds, request_id, None, cached["text"], False,
                )

        await self._acquire_slot(user_id)
        try:
            await self._reserve_provider_rate(route["provider"])
            request_id, usage = await run_in_threadpool(
                ai_db.create_request_and_reserve,
                user_id=user_id,
                use_case=use_case,
                source_type=source_type,
                source_id=source_id,
                idempotency_key=idempotency_key,
                route=route,
                client_request=client_request,
                context={
                    "systemPrompt": SYSTEM_PROMPTS[use_case],
                    "data": context,
                },
            )
        except ValueError as exc:
            if (
                str(exc) == "AI_DAILY_QUOTA_EXCEEDED"
                and route["plan_code"] != "free"
            ):
                route = await run_in_threadpool(ai_db.resolve_free_model_route, use_case)
                cache_material = "|".join(
                    [
                        owner,
                        use_case,
                        context_hash,
                        route["provider"],
                        route["model"],
                        "prompt-v1",
                    ]
                )
                cache_key = hashlib.sha256(cache_material.encode()).hexdigest()
                if not force_refresh:
                    cached = await run_in_threadpool(
                        ai_db.get_cached_response,
                        cache_key=cache_key,
                        user_id=user_id,
                        cache_scope=cache_scope,
                    )
                    if cached:
                        await self._release_slot(user_id)
                        request_id = await run_in_threadpool(
                            ai_db.create_cached_request,
                            user_id=user_id,
                            use_case=use_case,
                            source_type=source_type,
                            source_id=source_id,
                            route=route,
                            client_request=client_request,
                            context=context,
                            response_text=cached["text"],
                        )
                        return PreparedRequest(
                            user_id, use_case, source_type, source_id, route,
                            context, client_request, cache_key, context_hash,
                            cache_scope, cache_ttl_seconds, request_id, None,
                            cached["text"], False,
                        )
                try:
                    request_id, usage = await run_in_threadpool(
                        ai_db.create_request_and_reserve,
                        user_id=user_id,
                        use_case=use_case,
                        source_type=source_type,
                        source_id=source_id,
                        idempotency_key=idempotency_key,
                        route=route,
                        client_request=client_request,
                        context={
                            "systemPrompt": SYSTEM_PROMPTS[use_case],
                            "data": context,
                        },
                    )
                except BaseException:
                    await self._release_slot(user_id)
                    raise
            else:
                await self._release_slot(user_id)
                if str(exc) == "AI_DAILY_QUOTA_EXCEEDED":
                    raise HTTPException(status_code=429, detail=str(exc)) from exc
                raise
        except BaseException:
            await self._release_slot(user_id)
            raise

        return PreparedRequest(
            user_id, use_case, source_type, source_id, route, context,
            client_request, cache_key, context_hash, cache_scope,
            cache_ttl_seconds, request_id, usage, None, True,
        )

    async def stream(self, prepared: PreparedRequest) -> AsyncIterator[str]:
        if prepared.cached_text is not None:
            yield _sse({"type": "token", "content": prepared.cached_text})
            yield _sse(
                {
                    "type": "done",
                    "requestId": prepared.request_id,
                    "cacheHit": True,
                    "modelTier": prepared.route["model_tier"],
                    "usageCharged": False,
                    "usage": {"input": 0, "output": 0},
                }
            )
            return

        provider = self._providers.get(prepared.route["provider"])
        if provider is None:
            raise RuntimeError(f"unsupported AI provider: {prepared.route['provider']}")

        started = monotonic()
        provider_started = monotonic()
        first_token_latency_ms: int | None = None
        response_parts: list[str] = []
        provider_usage = AIProviderUsage()
        try:
            request = AIProviderRequest(
                model=prepared.route["model"],
                system_prompt=SYSTEM_PROMPTS[prepared.use_case],
                context=prepared.context,
                max_output_tokens=min(
                    prepared.route["max_output_tokens"],
                    settings.AI_MAX_OUTPUT_TOKENS,
                ),
                cache_system_prompt=(
                    prepared.route["provider"] == "anthropic"
                    and prepared.route["provider_cache_enabled"]
                    and settings.AI_CLAUDE_PROMPT_CACHE_ENABLED
                ),
            )
            await run_in_threadpool(
                ai_db.mark_provider_requested,
                request_id=prepared.request_id,
                provider_request={
                    "provider": prepared.route["provider"],
                    "model": prepared.route["model"],
                    "systemPrompt": request.system_prompt,
                    "context": request.context,
                    "maxOutputTokens": request.max_output_tokens,
                    "estimatedInputTokens": estimate_tokens(
                        request.system_prompt, request.context
                    ),
                    "providerCacheEnabled": request.cache_system_prompt,
                },
            )
            async for token in provider.stream(request, provider_usage):
                if first_token_latency_ms is None:
                    first_token_latency_ms = round(
                        (monotonic() - provider_started) * 1000
                    )
                response_parts.append(token)
                yield _sse({"type": "token", "content": token})

            response_text = "".join(response_parts)
            provider_latency_ms = round((monotonic() - provider_started) * 1000)
            total_latency_ms = round((monotonic() - started) * 1000)
            usage = await run_in_threadpool(
                ai_db.complete_request,
                request_id=prepared.request_id,
                user_id=prepared.user_id,
                use_case=prepared.use_case,
                response_text=response_text,
                provider_response=provider_usage.raw,
                input_tokens=provider_usage.input_tokens,
                output_tokens=provider_usage.output_tokens,
                cache_creation_input_tokens=provider_usage.cache_creation_input_tokens,
                cache_read_input_tokens=provider_usage.cache_read_input_tokens,
                first_token_latency_ms=first_token_latency_ms,
                stop_reason=provider_usage.stop_reason,
                provider_latency_ms=provider_latency_ms,
                total_latency_ms=total_latency_ms,
            )
            await run_in_threadpool(
                ai_db.save_cache,
                cache_key=prepared.cache_key,
                cache_scope=prepared.cache_scope,
                owner_user_id=(
                    prepared.user_id if prepared.cache_scope == "user" else None
                ),
                use_case=prepared.use_case,
                route=prepared.route,
                context_hash=prepared.context_hash,
                response_text=response_text,
                response_payload=provider_usage.raw,
                ttl_seconds=prepared.cache_ttl_seconds,
            )
            yield _sse(
                {
                    "type": "done",
                    "requestId": prepared.request_id,
                    "cacheHit": False,
                    "modelTier": prepared.route["model_tier"],
                    "usageCharged": True,
                    "usage": {
                        "input": provider_usage.input_tokens or 0,
                        "output": provider_usage.output_tokens or 0,
                        "cacheCreationInput": provider_usage.cache_creation_input_tokens,
                        "cacheReadInput": provider_usage.cache_read_input_tokens,
                    },
                    "performance": {
                        "firstTokenLatencyMs": first_token_latency_ms,
                        "stopReason": provider_usage.stop_reason,
                    },
                    "quota": {
                        **usage,
                        "remaining": max(usage["limit"] - usage["used"] - usage["reserved"], 0),
                    },
                }
            )
        except asyncio.CancelledError:
            await run_in_threadpool(
                ai_db.fail_request,
                request_id=prepared.request_id,
                user_id=prepared.user_id,
                use_case=prepared.use_case,
                status="cancelled",
                error_code="CLIENT_DISCONNECTED",
                error_detail="SSE client disconnected",
                response_text="".join(response_parts),
            )
            raise
        except (httpx.TimeoutException, TimeoutError) as exc:
            await run_in_threadpool(
                ai_db.fail_request,
                request_id=prepared.request_id,
                user_id=prepared.user_id,
                use_case=prepared.use_case,
                status="timed_out",
                error_code="AI_PROVIDER_TIMEOUT",
                error_detail=_sanitize_error(exc),
                response_text="".join(response_parts),
            )
            yield _sse({"type": "error", "code": "AI_PROVIDER_TIMEOUT", "message": "AI 응답 시간이 초과되었습니다."})
        except Exception as exc:
            await run_in_threadpool(
                ai_db.fail_request,
                request_id=prepared.request_id,
                user_id=prepared.user_id,
                use_case=prepared.use_case,
                status="provider_failed",
                error_code="AI_PROVIDER_FAILED",
                error_detail=_sanitize_error(exc),
                response_text="".join(response_parts),
            )
            yield _sse({"type": "error", "code": "AI_PROVIDER_FAILED", "message": "AI 응답 생성에 실패했습니다."})
        finally:
            if prepared.owns_slot:
                await self._release_slot(prepared.user_id)


ai_service = AIService()
