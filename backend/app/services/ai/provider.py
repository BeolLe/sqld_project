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


@dataclass(slots=True)
class AIProviderUsage:
    input_tokens: int | None = None
    output_tokens: int | None = None
    raw: dict[str, Any] = field(default_factory=dict)


class AIProvider(Protocol):
    async def stream(
        self,
        request: AIProviderRequest,
        usage: AIProviderUsage,
    ) -> AsyncIterator[str]: ...

    async def close(self) -> None: ...
