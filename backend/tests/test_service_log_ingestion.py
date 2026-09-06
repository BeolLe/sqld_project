from __future__ import annotations

from contextlib import contextmanager
from datetime import UTC, datetime
import json
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch

from fastapi import HTTPException
from pydantic import ValidationError

from app.api.auth.router import validate_csrf_request
from app.api.logs.router import (
    ServiceLogBatchRequest,
    collect_service_log_events,
)
from app.main import app
from app.db.service_logs import insert_service_log_events


def build_event(**overrides):
    event = {
        "page_id": "dashboard",
        "url": "/dashboard",
        "event_type": "click",
        "schema_version": "1.0",
        "object_section_id": "recent_exams",
        "object_type": "card",
        "page_params": {"mode": "all"},
        "object_section_idx": 7,
        "object_idx": 0,
        "object_id": "exam-1",
        "object_url": "/exams/1",
        "data": {"exam_id": 1},
        "platform": "web",
        "timestamp": "2026-09-06T03:00:00.000Z",
        "user_id": "client-supplied-user",
        "session_id": "session-1",
        "device_id": "device-1",
    }
    event.update(overrides)
    return event


class ServiceLogPayloadTests(unittest.TestCase):
    def test_collection_route_is_registered(self):
        routes = {
            (method, route.path)
            for route in app.routes
            for method in (route.methods or set())
        }

        self.assertIn(("POST", "/api/logs/events"), routes)

    def test_timestamp_requires_timezone(self):
        with self.assertRaises(ValidationError):
            ServiceLogBatchRequest(
                events=[build_event(timestamp="2026-09-06T03:00:00")]
            )

    def test_batch_is_limited_to_one_hundred_events(self):
        with self.assertRaises(ValidationError):
            ServiceLogBatchRequest(events=[build_event() for _ in range(101)])

    def test_required_identifiers_cannot_be_blank(self):
        with self.assertRaises(ValidationError):
            ServiceLogBatchRequest(events=[build_event(page_id="   ")])


class ServiceLogCsrfTests(unittest.TestCase):
    def test_collection_allows_same_origin_without_csrf_header(self):
        request = SimpleNamespace(
            method="POST",
            url=SimpleNamespace(path="/api/logs/events"),
            base_url="https://solsqld.example/",
            headers={"origin": "https://solsqld.example"},
            cookies={},
        )

        validate_csrf_request(request)

    def test_collection_rejects_untrusted_origin(self):
        request = SimpleNamespace(
            method="POST",
            url=SimpleNamespace(path="/api/logs/events"),
            base_url="https://solsqld.example/",
            headers={"origin": "https://attacker.example"},
            cookies={},
        )

        with self.assertRaises(HTTPException) as context:
            validate_csrf_request(request)

        self.assertEqual(context.exception.status_code, 403)


class ServiceLogCollectionTests(unittest.TestCase):
    def test_uses_authenticated_user_and_preserves_frontend_context(self):
        payload = ServiceLogBatchRequest(events=[build_event()])
        request = SimpleNamespace(state=SimpleNamespace(request_id="request-1"))

        with patch(
            "app.api.logs.router.insert_service_log_events",
            return_value=1,
        ) as insert_events:
            result = collect_service_log_events(
                payload=payload,
                request=request,
                current_user={"user_id": "server-authenticated-user"},
            )

        record = insert_events.call_args.args[0][0]
        stored_data = json.loads(record["data"])
        self.assertEqual(record["user_id"], "server-authenticated-user")
        self.assertNotEqual(record["user_id"], "client-supplied-user")
        self.assertEqual(record["event_at"], datetime(2026, 9, 6, 3, tzinfo=UTC))
        self.assertEqual(stored_data["url"], "/dashboard")
        self.assertEqual(stored_data["page_params"], {"mode": "all"})
        self.assertEqual(stored_data["object_url"], "/exams/1")
        self.assertEqual(stored_data["payload"], {"exam_id": 1})
        self.assertEqual(result, {"received": 1, "inserted": 1, "duplicates": 0})

    def test_missing_device_id_uses_request_scoped_fallback(self):
        payload = ServiceLogBatchRequest(events=[build_event(device_id=None)])
        request = SimpleNamespace(state=SimpleNamespace(request_id="request-1"))

        with patch(
            "app.api.logs.router.insert_service_log_events",
            return_value=1,
        ) as insert_events:
            collect_service_log_events(
                payload=payload,
                request=request,
                current_user=None,
            )

        record = insert_events.call_args.args[0][0]
        self.assertEqual(record["device_id"], "request:request-1")
        self.assertIsNone(record["user_id"])


class ServiceLogDatabaseTests(unittest.TestCase):
    def test_duplicate_event_ids_are_not_inserted_twice(self):
        cursor = MagicMock()
        cursor.__enter__.return_value = cursor
        cursor.fetchone.side_effect = [("event-1",), None]
        connection = MagicMock()
        connection.cursor.return_value = cursor

        @contextmanager
        def fake_connection():
            yield connection

        record = {
            "event_id": "event-1",
            "page_id": "dashboard",
            "user_id": None,
            "device_id": "device-1",
            "visitor_id": None,
            "session_id": None,
            "object_section_id": None,
            "object_section_idx": None,
            "object_id": None,
            "object_idx": None,
            "schema_version": "1.0",
            "platform": "web",
            "event_type": "pageview",
            "object_type": None,
            "data": "{}",
            "event_at": datetime(2026, 9, 6, 3, tzinfo=UTC),
        }

        with patch("app.db.service_logs.get_connection", fake_connection):
            inserted = insert_service_log_events([record, record])

        self.assertEqual(inserted, 1)
        self.assertEqual(cursor.execute.call_count, 2)
        query = cursor.execute.call_args_list[0].args[0]
        self.assertIn("INSERT INTO log.service_log_raw", query)
        self.assertIn("ON CONFLICT (event_id) DO NOTHING", query)


if __name__ == "__main__":
    unittest.main()
