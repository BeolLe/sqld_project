from __future__ import annotations

from contextlib import contextmanager
from datetime import UTC, datetime
import unittest
from unittest.mock import MagicMock, patch

from app.api.events.router import (
    campaign_priority_key,
    fetch_visible_campaign_rows,
    is_campaign_eligible,
    is_supported_campaign,
)


class PopupRuntimePriorityTests(unittest.TestCase):
    def test_maintenance_outranks_survey_even_with_lower_display_priority(self):
        started_at = datetime(2026, 8, 8, tzinfo=UTC)
        maintenance = {
            "campaign_id": 1,
            "popup_type": "maintenance",
            "display_priority": -1000,
            "exposure_start_at": started_at,
        }
        survey = {
            "campaign_id": 2,
            "popup_type": "survey",
            "display_priority": 1000,
            "exposure_start_at": started_at,
        }

        ordered = sorted(
            [survey, maintenance],
            key=campaign_priority_key,
            reverse=True,
        )

        self.assertIs(ordered[0], maintenance)

    def test_display_priority_orders_campaigns_of_the_same_type(self):
        started_at = datetime(2026, 8, 8, tzinfo=UTC)
        low = {
            "campaign_id": 1,
            "popup_type": "notice",
            "display_priority": 10,
            "exposure_start_at": started_at,
        }
        high = {
            "campaign_id": 2,
            "popup_type": "notice",
            "display_priority": 20,
            "exposure_start_at": started_at,
        }

        ordered = sorted([low, high], key=campaign_priority_key, reverse=True)

        self.assertIs(ordered[0], high)

    def test_public_campaign_is_eligible_without_a_user(self):
        campaign = {
            "audience_code": "public",
            "phase_code": "notice",
        }

        self.assertTrue(
            is_campaign_eligible(campaign=campaign, user_profile=None)
        )

    def test_unregistered_renderer_is_rejected(self):
        campaign = {
            "popup_type": "notice",
            "renderer_key": "../../arbitrary-module",
        }

        self.assertFalse(is_supported_campaign(campaign))

    def test_visibility_window_uses_database_current_time(self):
        cursor = MagicMock()
        cursor.__enter__.return_value = cursor
        cursor.fetchall.return_value = []
        connection = MagicMock()
        connection.cursor.return_value = cursor

        @contextmanager
        def fake_connection():
            yield connection

        with patch("app.api.events.router.get_connection", fake_connection):
            result = fetch_visible_campaign_rows(None)

        query, params = cursor.execute.call_args.args
        self.assertEqual(result, [])
        self.assertIn("CURRENT_TIMESTAMP", query)
        self.assertEqual(
            params,
            (None, None, None, False, "sqld_61_phase2"),
        )


if __name__ == "__main__":
    unittest.main()
