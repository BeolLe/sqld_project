from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch
from uuid import UUID

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.api.feedback import router as feedback


TICKET = UUID('7c47a7d9-77b5-4be9-9465-37339bdd8ae0')
ADMIN = {'user_id': 'admin-b', 'nickname': '관리자 B', 'is_admin': True}
NOW = datetime(2026, 11, 8, 5, 30, tzinfo=timezone.utc)
OLD = NOW - timedelta(days=1)
REQUEST = SimpleNamespace(state=SimpleNamespace(request_id='request'), headers={})


class FeedbackReplyTests(unittest.TestCase):
    def setUp(self):
        self.context = MagicMock()
        self.context.__exit__.return_value = False
        self.conn = self.context.__enter__.return_value
        self.cur = self.conn.cursor.return_value.__enter__.return_value
        self.db = self.enterContext(patch.object(feedback, 'get_connection', return_value=self.context))
        self.audit = self.enterContext(patch.object(feedback, 'write_audit_event'))
        self.failure = self.enterContext(patch.object(feedback, 'insert_audit_failure'))

    def writers(self):
        return (
            (feedback.update_feedback_reply, feedback.FeedbackAdminReplyUpdateRequest(admin_reply='  새 답변  '),
             (TICKET, '새 답변', NOW, 'reviewing')),
            (feedback.update_feedback_admin, feedback.FeedbackAdminUpdateRequest(status='resolved', admin_reply='새 답변'),
             (TICKET, 'resolved', '새 답변', NOW)),
        )

    def test_both_writers_save_previous_and_new_text_with_actor_in_same_transaction(self):
        for writer, req, returned in self.writers():
            with self.subTest(writer=writer.__name__):
                self.cur.reset_mock()
                self.audit.reset_mock()
                self.cur.fetchone.side_effect = [('기존 답변', OLD), returned]
                result = writer(str(TICKET), req, REQUEST, ADMIN)
                self.assertEqual(result['ticket_id'], str(TICKET))
                self.assertIn('FOR UPDATE', self.cur.execute.call_args_list[0].args[0])
                self.audit.assert_called_once()
                self.assertIs(self.audit.call_args.args[0], self.conn)
                event = self.audit.call_args.kwargs
                self.assertEqual(event['before_data'], {'admin_reply': '기존 답변', 'replied_at': OLD.isoformat()})
                self.assertEqual(event['after_data']['admin_reply'], '새 답변')
                self.assertEqual(event['after_data']['replied_at'], NOW.isoformat())
                self.assertEqual(event['actor_user_id'], 'admin-b')
                self.assertEqual(event['metadata'], {'actor_nickname': '관리자 B'})

    def test_reply_audit_failure_rolls_back_both_writers(self):
        for writer, req, returned in self.writers():
            with self.subTest(writer=writer.__name__):
                self.cur.fetchone.side_effect = [('기존 답변', OLD), returned]
                self.audit.side_effect = RuntimeError('audit unavailable')
                with self.assertRaises(HTTPException) as caught:
                    writer(str(TICKET), req, REQUEST, ADMIN)
                self.assertEqual(caught.exception.status_code, 500)
                self.assertIs(self.context.__exit__.call_args.args[0], RuntimeError)
                self.assertEqual(self.failure.call_args.kwargs['failure_stage'], 'TRANSACTION')

    def test_missing_ticket_and_empty_reply_do_not_write_audit(self):
        self.cur.fetchone.return_value = None
        with self.assertRaises(HTTPException) as caught:
            feedback.update_feedback_reply(str(TICKET), feedback.FeedbackAdminReplyUpdateRequest(admin_reply='내용'), REQUEST, ADMIN)
        self.assertEqual(caught.exception.status_code, 404)
        self.audit.assert_not_called()
        self.db.reset_mock()
        with self.assertRaises(HTTPException) as caught:
            feedback.update_feedback_reply(str(TICKET), feedback.FeedbackAdminReplyUpdateRequest(admin_reply=' \n'), REQUEST, ADMIN)
        self.assertEqual(caught.exception.status_code, 400)
        self.db.assert_not_called()

    def test_legacy_put_clear_preserves_previous_reply(self):
        self.cur.fetchone.side_effect = [('기존 답변', OLD), (TICKET, 'resolved', None, OLD)]
        feedback.update_feedback_admin(str(TICKET), feedback.FeedbackAdminUpdateRequest(status='resolved'), REQUEST, ADMIN)
        event = self.audit.call_args.kwargs
        self.assertEqual(event['before_data']['admin_reply'], '기존 답변')
        self.assertIsNone(event['after_data']['admin_reply'])
        self.assertFalse(event['after_data']['admin_reply_set'])

    def history(self, ticket, rows, before=None, size=20):
        self.cur.fetchone.return_value = ticket
        self.cur.fetchall.return_value = rows
        return feedback.list_feedback_replies(TICKET, before=before, size=size, current_user=ADMIN)

    def test_current_legacy_reply_uses_matching_actor_but_older_text_is_unknown(self):
        result = self.history(('현재 답변', NOW, 'admin-b', '관리자 B', 2), [
            (2, 'admin-b', '관리자 B', NOW, {'admin_reply_set': True}, None),
            (1, 'admin-a', '관리자 A', OLD, {'admin_reply_set': True}, None),
        ])
        self.assertEqual(result['current_reply']['admin_nickname'], '관리자 B')
        self.assertEqual(result['items'][0]['admin_reply'], '현재 답변')
        self.assertTrue(result['items'][0]['content_available'])
        self.assertEqual(result['items'][1]['admin_nickname'], '관리자 A')
        self.assertIsNone(result['items'][1]['admin_reply'])
        self.assertFalse(result['items'][1]['content_available'])

    def test_previous_snapshot_recovers_legacy_text_only_at_matching_time(self):
        snapshot = {'admin_reply': '수정 전 내용', 'replied_at': OLD.astimezone(timezone(timedelta(hours=9))).isoformat()}
        for stamp, known in ((OLD, True), (NOW, False)):
            with self.subTest(stamp=stamp):
                result = self.history(('새 답변', NOW, 'admin-b', '관리자 B', 3), [
                    (1, 'admin-a', '관리자 A', stamp, {'admin_reply_set': True}, snapshot),
                ])
                self.assertEqual(result['items'][0]['content_available'], known)
                self.assertEqual(result['items'][0]['admin_reply'], '수정 전 내용' if known else None)

    def test_deleted_actor_and_cleared_reply_are_not_missing_history(self):
        result = self.history((None, OLD, None, None, None), [
            (3, 'admin-b', '관리자 B', NOW, {'admin_reply': None}, None),
            (2, None, '탈퇴 전 관리자', OLD, {'admin_reply': '이전 내용'}, None),
        ])
        self.assertIsNone(result['current_reply'])
        self.assertTrue(result['items'][0]['content_available'])
        self.assertIsNone(result['items'][0]['admin_reply'])
        self.assertEqual(result['items'][1]['admin_nickname'], '탈퇴 전 관리자')
        self.assertEqual(result['items'][1]['admin_reply'], '이전 내용')

    def test_unattributed_current_reply_does_not_borrow_an_old_actor(self):
        result = self.history(('기록 외 수정 내용', NOW, None, None, None), [
            (1, 'admin-a', '관리자 A', OLD, {'admin_reply_set': True}, None),
        ])
        self.assertIsNone(result['current_reply']['admin_user_id'])
        self.assertIsNone(result['items'][0]['admin_reply'])

    def test_cursor_limits_response_and_keeps_ids_as_strings(self):
        result = self.history((None, None, None, None, None), [
            (9, 'b', 'B', NOW, {'admin_reply': '새 답변'}, None),
            (8, 'a', 'A', OLD, {'admin_reply': '이전 답변'}, None),
        ], before=10, size=1)
        self.assertEqual(len(result['items']), 1)
        self.assertEqual(result['next_cursor'], '9')
        self.assertEqual(self.cur.execute.call_args.args[1], (str(TICKET), 10, 10, 2))

    def test_history_missing_ticket_returns_404(self):
        with self.assertRaises(HTTPException) as caught:
            self.history(None, [])
        self.assertEqual(caught.exception.status_code, 404)

    def test_http_permission_and_input_boundaries(self):
        app = FastAPI()
        app.include_router(feedback.router)
        app.dependency_overrides[feedback.get_current_user] = lambda: {'is_admin': False}
        with TestClient(app) as client:
            self.assertEqual(client.get(f'/api/admin/feedback/{TICKET}/replies').status_code, 403)
            app.dependency_overrides[feedback.get_current_user] = lambda: ADMIN
            for url in ('not-a-uuid/replies', f'{TICKET}/replies?size=0', f'{TICKET}/replies?before=-1'):
                self.assertEqual(client.get('/api/admin/feedback/' + url).status_code, 422)
        self.db.assert_not_called()

    def test_user_ticket_response_does_not_expose_admin_history(self):
        result = feedback.serialize_ticket((TICKET, 'bug', 'reviewing', '제목', '내용', None, None, None, None, '현재 답변', NOW, OLD))
        self.assertNotIn('admin_user_id', result)
        self.assertNotIn('items', result)
        self.assertNotIn('before_data', result)


if __name__ == '__main__':
    unittest.main()
