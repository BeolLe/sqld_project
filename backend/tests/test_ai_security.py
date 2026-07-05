from __future__ import annotations

import unittest

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


if __name__ == "__main__":
    unittest.main()
