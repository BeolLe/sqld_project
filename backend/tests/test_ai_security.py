from __future__ import annotations

import unittest
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from app.services.ai.security import estimate_tokens, redact_secrets


class AISecurityTests(unittest.TestCase):
    def test_redacts_nested_provider_credentials(self):
        payload = {
            "sql": "select 'api_key=top-secret-value' from dual",
            "items": ["sk-abcdefghijklmnopqrstuvwxyz"],
        }

        redacted = redact_secrets(payload)

        self.assertNotIn("top-secret-value", redacted["sql"])
        self.assertEqual(redacted["items"], ["[REDACTED]"])

    def test_token_estimate_is_conservative_and_nonzero(self):
        self.assertEqual(estimate_tokens(""), 1)
        self.assertEqual(estimate_tokens("a" * 12), 4)

    def test_converts_database_values_to_json_safe_types(self):
        payload = {
            "id": UUID("00000000-0000-0000-0000-000000000001"),
            "created_at": datetime(2026, 7, 5, tzinfo=timezone.utc),
            "score": Decimal("82.50"),
        }

        normalized = redact_secrets(payload)

        self.assertEqual(normalized["id"], "00000000-0000-0000-0000-000000000001")
        self.assertEqual(normalized["created_at"], "2026-07-05T00:00:00+00:00")
        self.assertEqual(normalized["score"], "82.50")


if __name__ == "__main__":
    unittest.main()
