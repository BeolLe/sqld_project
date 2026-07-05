from __future__ import annotations

import json
import unittest
from unittest.mock import patch

from app.services.ai.service import AIService


ROUTE = {
    "route_id": 1,
    "plan_code": "free",
    "daily_limit": 3,
    "provider_model_id": 1,
    "provider": "google",
    "model": "gemini-3.1-flash-lite",
    "model_tier": "standard",
    "input_token_limit": 6000,
    "max_output_tokens": 900,
    "provider_cache_enabled": True,
}

CLAUDE_ROUTE = {
    **ROUTE,
    "plan_code": "premium",
    "provider": "anthropic",
    "model": "claude-haiku-4-5",
    "model_tier": "premium",
    "max_output_tokens": 1200,
    "provider_cache_enabled": False,
}


class AIServiceCacheTests(unittest.IsolatedAsyncioTestCase):
    async def test_cache_hit_does_not_reserve_or_charge_usage(self):
        service = AIService()
        with (
            patch(
                "app.services.ai.service.ai_db.resolve_model_route",
                return_value=ROUTE,
            ),
            patch(
                "app.services.ai.service.ai_db.get_cached_response",
                return_value={"cache_id": "cache-1", "text": "cached answer"},
            ),
            patch(
                "app.services.ai.service.ai_db.create_cached_request",
                return_value="request-1",
            ),
            patch(
                "app.services.ai.service.ai_db.create_request_and_reserve"
            ) as reserve,
        ):
            prepared = await service.prepare(
                user_id="00000000-0000-0000-0000-000000000001",
                use_case="explanation",
                source_type="exam",
                source_id="1",
                client_request={"attempt_id": "1"},
                context_builder=lambda: {"problem": "test"},
                cache_scope="shared",
                cache_ttl_seconds=3600,
                idempotency_key=None,
                force_refresh=False,
                quality_mode="auto",
            )
            events = [event async for event in service.stream(prepared)]

        reserve.assert_not_called()
        payloads = [json.loads(event.removeprefix("data: ")) for event in events]
        self.assertEqual(payloads[0]["content"], "cached answer")
        self.assertTrue(payloads[1]["cacheHit"])
        self.assertFalse(payloads[1]["usageCharged"])

    async def test_admin_gemini_request_skips_daily_quota(self):
        service = AIService()
        with (
            patch(
                "app.services.ai.service.ai_db.resolve_model_route",
                return_value=ROUTE,
            ),
            patch(
                "app.services.ai.service.ai_db.create_request_and_reserve",
                return_value=(
                    "request-1",
                    {"limit": 0, "used": 0, "reserved": 0, "unlimited": True},
                ),
            ) as reserve,
        ):
            prepared = await service.prepare(
                user_id="00000000-0000-0000-0000-000000000001",
                use_case="explanation",
                source_type="exam",
                source_id="1",
                client_request={"attempt_id": "1"},
                context_builder=lambda: {"problem": "test"},
                cache_scope="shared",
                cache_ttl_seconds=3600,
                idempotency_key=None,
                force_refresh=True,
                quality_mode="auto",
                is_admin=True,
            )

        self.assertTrue(prepared.quota_exempt)
        self.assertTrue(reserve.call_args.kwargs["quota_exempt"])
        await service._release_slot(prepared.user_id)

    async def test_admin_claude_request_keeps_paid_quota(self):
        service = AIService()
        with (
            patch(
                "app.services.ai.service.settings.ANTHROPIC_API_KEY",
                "configured-for-test",
            ),
            patch(
                "app.services.ai.service.ai_db.resolve_model_route",
                return_value=CLAUDE_ROUTE,
            ),
            patch(
                "app.services.ai.service.ai_db.create_request_and_reserve",
                return_value=(
                    "request-2",
                    {"limit": 30, "used": 0, "reserved": 1},
                ),
            ) as reserve,
        ):
            prepared = await service.prepare(
                user_id="00000000-0000-0000-0000-000000000001",
                use_case="explanation",
                source_type="exam",
                source_id="1",
                client_request={"attempt_id": "1"},
                context_builder=lambda: {"problem": "test"},
                cache_scope="shared",
                cache_ttl_seconds=3600,
                idempotency_key=None,
                force_refresh=True,
                quality_mode="auto",
                is_admin=True,
            )

        self.assertFalse(prepared.quota_exempt)
        self.assertFalse(reserve.call_args.kwargs["quota_exempt"])
        await service._release_slot(prepared.user_id)


if __name__ == "__main__":
    unittest.main()
