from __future__ import annotations

from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Any, Protocol


@dataclass(slots=True)
class AIProviderRequest:
    model: str
    system_prompt: str
    context: dict[str, Any]
    max_output_tokens: int
    cache_system_prompt: bool = False


@dataclass(slots=True)
class AIProviderUsage:
    input_tokens: int | None = None
    output_tokens: int | None = None
    cache_creation_input_tokens: int = 0
    cache_read_input_tokens: int = 0
    stop_reason: str | None = None
    raw: dict[str, Any] = field(default_factory=dict)


class AIProvider(Protocol):
    async def stream(
        self,
        request: AIProviderRequest,
        usage: AIProviderUsage,
    ) -> AsyncIterator[str]: ...

    async def close(self) -> None: ...
