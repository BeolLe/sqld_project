from __future__ import annotations

import json
from collections.abc import AsyncIterator

import httpx

from app.core.config import settings
from app.services.ai.provider import (
    AIProviderRequest,
    AIProviderUsage,
)


class GeminiProvider:
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
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not configured")

        url = (
            f"{settings.GEMINI_API_BASE_URL}/models/{request.model}:"
            "streamGenerateContent"
        )
        payload = {
            "systemInstruction": {
                "parts": [{"text": request.system_prompt}],
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": json.dumps(
                                request.context,
                                ensure_ascii=False,
                                separators=(",", ":"),
                            )
                        }
                    ],
                }
            ],
            "generationConfig": {
                "maxOutputTokens": request.max_output_tokens,
                "temperature": 0.3,
            },
        }

        async with self._get_client().stream(
            "POST",
            url,
            params={"alt": "sse"},
            json=payload,
            headers={
                "Accept": "text/event-stream",
                "x-goog-api-key": settings.GEMINI_API_KEY,
            },
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data:"):
                    continue
                data = json.loads(line[5:].strip())
                usage_metadata = data.get("usageMetadata") or {}
                if usage_metadata:
                    usage.input_tokens = usage_metadata.get("promptTokenCount")
                    usage.output_tokens = usage_metadata.get("candidatesTokenCount")
                    usage.raw = usage_metadata
                for candidate in data.get("candidates") or []:
                    content = candidate.get("content") or {}
                    for part in content.get("parts") or []:
                        token = part.get("text")
                        if token:
                            yield str(token)

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None
