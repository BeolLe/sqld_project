from __future__ import annotations

import json
from collections.abc import AsyncIterator

import httpx

from app.core.config import settings
from app.services.ai.provider import AIProviderRequest, AIProviderUsage


class ClaudeProvider:
    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(settings.AI_PROVIDER_TIMEOUT_SECONDS),
                limits=httpx.Limits(
                    max_connections=settings.AI_MAX_CONCURRENT_REQUESTS,
                    max_keepalive_connections=settings.AI_MAX_CONCURRENT_REQUESTS,
                ),
            )
        return self._client

    async def stream(
        self,
        request: AIProviderRequest,
        usage: AIProviderUsage,
    ) -> AsyncIterator[str]:
        if not settings.ANTHROPIC_API_KEY:
            raise RuntimeError("ANTHROPIC_API_KEY is not configured")

        system_block = {"type": "text", "text": request.system_prompt}
        if request.cache_system_prompt:
            system_block["cache_control"] = {"type": "ephemeral"}

        payload = {
            "model": request.model,
            "system": [system_block],
            "messages": [
                {
                    "role": "user",
                    "content": json.dumps(
                        request.context,
                        ensure_ascii=False,
                        separators=(",", ":"),
                    ),
                }
            ],
            "max_tokens": request.max_output_tokens,
            "temperature": 0.3,
            "stream": True,
        }
        async with self._get_client().stream(
            "POST",
            f"{settings.ANTHROPIC_API_BASE_URL}/messages",
            json=payload,
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
        ) as response:
            response.raise_for_status()
            event_type: str | None = None
            async for line in response.aiter_lines():
                if line.startswith("event:"):
                    event_type = line[6:].strip()
                    continue
                if not line.startswith("data:"):
                    continue
                data = json.loads(line[5:].strip())
                if event_type == "message_start":
                    message_usage = data.get("message", {}).get("usage") or {}
                    usage.input_tokens = message_usage.get("input_tokens")
                    usage.cache_creation_input_tokens = int(
                        message_usage.get("cache_creation_input_tokens") or 0
                    )
                    usage.cache_read_input_tokens = int(
                        message_usage.get("cache_read_input_tokens") or 0
                    )
                elif event_type == "content_block_delta":
                    token = (data.get("delta") or {}).get("text")
                    if token:
                        yield str(token)
                elif event_type == "message_delta":
                    message_usage = data.get("usage") or {}
                    usage.output_tokens = message_usage.get("output_tokens")
                    usage.stop_reason = (data.get("delta") or {}).get("stop_reason")
                    usage.raw = {
                        **message_usage,
                        "cache_creation_input_tokens": usage.cache_creation_input_tokens,
                        "cache_read_input_tokens": usage.cache_read_input_tokens,
                        "stop_reason": usage.stop_reason,
                    }

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None
