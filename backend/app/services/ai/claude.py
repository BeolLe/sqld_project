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

        payload = {
            "model": request.model,
            "system": request.system_prompt,
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
                    usage.input_tokens = (data.get("message", {}).get("usage") or {}).get(
                        "input_tokens"
                    )
                elif event_type == "content_block_delta":
                    token = (data.get("delta") or {}).get("text")
                    if token:
                        yield str(token)
                elif event_type == "message_delta":
                    usage.output_tokens = (data.get("usage") or {}).get("output_tokens")
                    usage.raw = data.get("usage") or {}

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None
