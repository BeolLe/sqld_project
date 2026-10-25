"""Explicit old-schema/new-schema contracts, using no real database."""
from datetime import datetime, timezone
from unittest.mock import patch
import unittest

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.db import exam_scope as capabilities
from test_exam_scope import USER, ATTEMPT, connection, question, content, exams, education, education_db, endless, dashboard

REAL_DETECT = capabilities.read_schema_capabilities


def progress():
    return {'lesson_id': 301, 'last_opened_version_id': 901, 'status': 'COMPLETED',
            'last_viewed_at': datetime.now(timezone.utc), 'completed_at': datetime.now(timezone.utc)}


def exam_row():
    return {'id': 17, 'exam_type': 'sqld', 'exam_code': 'sqld_mock_1', 'total_question_count': 1,
            'duration_seconds': 60, 'grading_policy': 'legacy_equal', 'pass_threshold_percent': 60}


def attempt_row():
    return {'id': 7, 'status': 'in_progress', 'remaining_seconds': 20, 'duration_seconds': 60,
            'current_page_no': 1, 'attempt_uuid': ATTEMPT}


class DetectionTests(unittest.TestCase):
    def test_all_new_marker_combinations_are_partial_unless_complete(self):
        markers = sorted(capabilities.MIGRATION_COLUMNS)
        existing_subject_column = ('exam', 'subjects', 'pass_threshold_percent')
        for mask in range(1, 1 << len(markers)):
            selected = [column for i, column in enumerate(markers) if mask & (1 << i)]
            with self.subTest(markers=selected):
                conn, _ = connection(all_rows=[selected + [existing_subject_column]], one=[(True,)])
                expected = 'ready' if len(selected) == len(markers) else 'partial'
                self.assertEqual(REAL_DETECT(conn).state, expected)

    def test_preexisting_subject_configuration_alone_is_legacy(self):
        conn, _ = connection(all_rows=[[('exam', 'subjects', 'pass_threshold_percent')]])
        self.assertEqual(REAL_DETECT(conn).state, 'legacy')

    def test_weighted_schema_without_subject_cutoff_is_partial(self):
        conn, _ = connection(all_rows=[list(capabilities.MIGRATION_COLUMNS)])
        self.assertEqual(REAL_DETECT(conn).state, 'partial')

    def test_dedup_only_partial_schema_cannot_enter_legacy_delete_reset(self):
        conn, cur = connection(all_rows=[[('logs', 'endless_answers', 'request_id')]])
        with patch.object(capabilities, 'read_schema_capabilities', REAL_DETECT), patch.object(endless, 'get_connection', return_value=conn):
            with self.assertRaises(HTTPException) as error:
                endless.reset_endless_stats(USER)
        self.assertEqual(error.exception.headers['X-Exam-Readiness'], 'schema_partial')
        self.assertEqual(cur.execute.call_count, 1)
        self.assertTrue(cur.execute.call_args.args[0].lstrip().startswith('SELECT'))

    def test_detects_old_schema_without_referencing_application_columns(self):
        conn, cur = connection(all_rows=[[]])
        self.assertEqual(REAL_DETECT(conn).state, 'legacy')
        self.assertEqual(cur.execute.call_count, 1)
        self.assertIn('information_schema.columns', cur.execute.call_args.args[0])

    def test_full_schema_requires_replay_unique_index(self):
        for present, expected in [(True, 'ready'), (False, 'partial')]:
            conn, _ = connection(all_rows=[list(capabilities.REQUIRED_COLUMNS)], one=[(present,)])
            self.assertEqual(REAL_DETECT(conn).state, expected)

    def test_partial_schema_fails_closed_without_write(self):
        conn, cur = connection(all_rows=[[('exam', 'exams', 'exam_type')]])
        with patch.object(capabilities, 'read_schema_capabilities', REAL_DETECT):
            with self.assertRaises(HTTPException) as error:
                capabilities.require_exam_schema(conn, 'sqld')
        self.assertEqual(error.exception.status_code, 503)
        self.assertEqual(error.exception.headers['X-Exam-Readiness'], 'schema_partial')
        self.assertEqual(cur.execute.call_count, 1)

    def test_real_database_failure_is_not_converted_to_readiness(self):
        conn, cur = connection()
        cur.execute.side_effect = RuntimeError('simulated unexpected database failure')
        with patch.object(capabilities, 'read_schema_capabilities', REAL_DETECT), self.assertRaisesRegex(RuntimeError, 'unexpected database failure'):
            capabilities.require_exam_schema(conn, 'sqld')

    def test_feature_flag_defaults_to_disabled(self):
        with patch.dict('os.environ', {}, clear=True):
            self.assertFalse(capabilities.adsp_enabled())
            with self.assertRaises(HTTPException) as error:
                capabilities.require_exam_schema(None, 'adsp')
        self.assertEqual(error.exception.headers['X-Exam-Readiness'], 'feature_disabled')


class LegacySQLDTests(unittest.TestCase):
    def setUp(self):
        self.cap = patch.object(capabilities, 'read_schema_capabilities', return_value=capabilities.ExamSchema('legacy'))
        self.cap.start()
        self.addCleanup(self.cap.stop)
        content._content_cache.clear()
        dashboard._summary_cache.clear()

    def test_content_list_and_detail_use_only_old_columns(self):
        listing = {'exam_code': 'sqld_mock_1', 'round': 1, 'title': 'SQLD', 'total_question_count': 1,
                   'duration_seconds': 60, 'avg_difficulty': None}
        conn, _ = connection(all_rows=[[listing], [{'question_no': 1}]], old_schema=True)
        with patch.object(content, 'get_connection', return_value=conn), patch.object(content, 'build_exam_problem_payload', return_value={'id': 'q1'}):
            self.assertEqual(content.list_exams()[0]['id'], '1')
            self.assertEqual(content.get_exam('1'), [{'id': 'q1'}])

    def test_session_and_answer_save_operate_on_old_schema(self):
        conn, _ = connection(one=[exam_row(), attempt_row(), None], all_rows=[[]], old_schema=True)
        with patch.object(exams, 'get_connection', return_value=conn):
            session = exams.get_exam_session('1', USER)
        self.assertEqual(session['examType'], 'sqld')
        conn, _ = connection(one=[exam_row(), attempt_row(), {'id': 1}], old_schema=True)
        with patch.object(exams, 'get_connection', return_value=conn):
            self.assertEqual(exams.save_exam_answer('1', exams.AnswerSaveRequest(problem_id='q1', selected_answer='1'), USER), {'ok': True})

    def test_legacy_submit_keeps_points_and_new_snapshot_in_existing_columns(self):
        conn, cur = connection(one=[exam_row(), attempt_row(), {'total_points': 101}],
                               all_rows=[[{'id': 1, 'pass_threshold_percent': 40}]], old_schema=True)
        payload = {'problems': [question(1, 1, 10)], 'answers': {'q1': '1'}, 'correctCount': 1, 'score': 2}
        with patch.object(exams, 'get_connection', return_value=conn), patch.object(exams, 'build_result_payload', return_value=payload), patch.object(exams, 'send_amplitude_event'):
            result = exams.submit_exam('1', exams.SubmitExamRequest(), USER)
        self.assertEqual((result['score'], result['awardedPoints'], result['totalPoints']), (2, 1, 101))
        self.assertTrue(any('FOR UPDATE' in c.args[0] for c in cur.execute.call_args_list))
        self.assertFalse(any('FROM exam.subjects' in c.args[0] for c in cur.execute.call_args_list))
        award = next(c for c in cur.execute.call_args_list if 'INSERT INTO dashboard.user_stats' in c.args[0] and 'total_points' in c.args[0])
        self.assertEqual(award.args[1][2], 60)  # Legacy omitted remaining_seconds behavior.

    def test_legacy_result_lookup_and_session_updates_use_old_columns(self):
        stored = {'passed': True, 'failed_by_subject_cutoff': False, 'score_percent': 80, 'grading_snapshot': {'source': 'submit'}}
        conn, _ = connection(one=[exam_row(), {'id': 7}, stored], old_schema=True)
        with patch.object(exams, 'get_connection', return_value=conn), patch.object(exams, 'build_result_payload', return_value={'score': 80}):
            self.assertEqual(exams.get_latest_exam_result('1', 7, USER)['score'], 80)
        for name, request in [('save_exam_memo', exams.MemoSaveRequest(content='memo')), ('sync_exam_session', exams.SessionSyncRequest(remaining_seconds=10))]:
            conn, _ = connection(one=[exam_row(), attempt_row()], old_schema=True)
            with patch.object(exams, 'get_connection', return_value=conn):
                self.assertEqual(getattr(exams, name)('1', request, USER), {'ok': True})

    def test_education_list_lookup_and_progress_use_only_old_columns(self):
        conn, _ = connection(one=[None, None, progress(), progress()], all_rows=[[]], old_schema=True)
        with patch.object(education_db, 'get_connection', return_value=conn):
            self.assertEqual(education_db.list_published_curricula(), [])
            self.assertIsNone(education_db.get_published_curriculum('sqld_concept'))
            self.assertIsNone(education_db.get_published_lesson(301))
            self.assertEqual(education_db.get_lesson_progress(user_id=USER['user_id'], lesson_id=301)['status'], 'COMPLETED')
            saved = education_db.save_lesson_progress(user_id=USER['user_id'], lesson_id=301, lesson_version_id=901,
                                                     resume_anchor=None, resume_offset_px=None, completed=True)
            self.assertEqual(saved['status'], 'COMPLETED')

    def test_endless_legacy_list_answer_stats_and_reset(self):
        conn, _ = connection(all_rows=[[]], old_schema=True)
        with patch.object(endless, 'get_connection', return_value=conn):
            self.assertEqual(endless.get_endless_problems(USER), [])
        q = {'exam_type': 'sqld', 'correct_answer': '1', 'category': 'SQL', 'difficulty': 'easy'}
        conn, cur = connection(one=[{'reg': True}, q, {'id': 7}, {'total_points': 101}, {'total_answered': 1, 'total_correct': 1}], all_rows=[[], []], old_schema=True)
        with patch.object(endless, 'get_connection', return_value=conn), patch.object(endless, 'insert_learning_event'), patch.object(endless, 'send_amplitude_event'):
            result = endless.save_endless_answer(endless.EndlessAnswerRequest(problem_id='q1', selected_answer='1'), USER)
        self.assertEqual((result['totalAnswered'], result['awardedPoints']), (1, 1))
        conn, cur = connection(one=[{'reg': True}, {'total_points': 101}], old_schema=True)
        with patch.object(endless, 'get_connection', return_value=conn):
            result = endless.reset_endless_stats(USER)
        self.assertTrue(any('DELETE FROM logs.endless_answers' in c.args[0] for c in cur.execute.call_args_list))
        self.assertEqual(result['totalPoints'], 101)

    def test_legacy_dashboard_preserves_exact_lifetime_values(self):
        conn, _ = connection(one=[(True,), (140, 7, 1500, 240)], all_rows=[[], [], [], []], old_schema=True)
        with patch.object(dashboard, 'get_connection', return_value=conn):
            result = dashboard.get_dashboard_summary(USER)
        self.assertEqual(result['stats'], {'totalPoints': 140, 'totalMockExamAttemptCount': 7,
                                         'totalLearningSeconds': 1500, 'totalSolvedQuestionCount': 240})

    def test_new_replay_feature_is_not_silently_ignored_on_old_schema(self):
        conn, cur = connection(one=[{'reg': True}], old_schema=True)
        with patch.object(endless, 'get_connection', return_value=conn):
            with self.assertRaises(HTTPException) as error:
                endless.save_endless_answer(endless.EndlessAnswerRequest(requestId=ATTEMPT, problem_id='q1', selected_answer='1'), USER)
        self.assertEqual(error.exception.headers['X-Exam-Readiness'], 'schema_upgrade_required')
        self.assertTrue(all(c.args[0].lstrip().startswith('SELECT') for c in cur.execute.call_args_list))


class ReadinessHTTPTests(unittest.TestCase):
    def app(self):
        app = FastAPI()
        for module in [content, exams, education, endless, dashboard]:
            app.include_router(module.router)
        return app

    def test_adsp_unavailable_is_explicit_for_all_read_and_write_routes(self):
        routes = [
            ('GET', '/api/content/exams', None), ('GET', '/api/content/exams/1', None),
            ('GET', '/api/education/curricula', None), ('GET', '/api/education/curricula/adsp_concept', None),
            ('GET', '/api/education/lessons/301', None), ('GET', '/api/education/lessons/301/progress', None),
            ('PUT', '/api/education/lessons/301/progress', {'lessonVersionId': 901, 'completed': True}),
            ('GET', '/api/exams/1/session', None), ('GET', '/api/exams/1/result', None),
            ('PUT', '/api/exams/1/answers', {'attemptUuid': str(ATTEMPT), 'problem_id': 'q1', 'selected_answer': '1'}),
            ('PUT', '/api/exams/1/memo', {'attemptUuid': str(ATTEMPT), 'content': 'memo'}),
            ('PUT', '/api/exams/1/session', {'attemptUuid': str(ATTEMPT), 'remaining_seconds': 10}),
            ('POST', '/api/exams/1/submit', {'attemptUuid': str(ATTEMPT)}),
            ('GET', '/api/endless/problems', None), ('GET', '/api/endless/stats', None),
            ('DELETE', '/api/endless/stats', None),
            ('POST', '/api/endless/answer', {'requestId': str(ATTEMPT), 'problem_id': 'q1', 'selected_answer': '1'}),
            ('GET', '/api/dashboard/summary', None),
        ]
        for state, flag, reason in [('legacy', 'true', 'schema_upgrade_required'), ('ready', 'false', 'feature_disabled')]:
            conn, cur = connection()
            patches = [patch.object(module, 'get_connection', return_value=conn) for module in [content, exams, education_db, endless, dashboard]]
            for p in patches: p.start()
            try:
                with patch.object(capabilities, 'read_schema_capabilities', return_value=capabilities.ExamSchema(state)), \
                     patch.dict('os.environ', {'ENABLE_ADSP': flag}), TestClient(self.app()) as client:
                    for method, path, body in routes:
                        with self.subTest(state=state, path=path, method=method):
                            response = client.request(method, path + '?exam_type=adsp', json=body)
                            self.assertEqual(response.status_code, 503, response.text)
                            self.assertEqual(response.headers['X-Exam-Readiness'], reason)
                            self.assertIsInstance(response.json()['detail'], str)
                cur.execute.assert_not_called()  # Capability fixture is read-only; no content/point writes.
            finally:
                for p in reversed(patches): p.stop()

    def test_disabled_adsp_cannot_be_returned_from_an_old_cache_entry(self):
        conn, _ = connection()
        content._content_cache['exams:adsp:True'] = (content.monotonic(), [{'id': 'cached'}])
        with patch.dict('os.environ', {'ENABLE_ADSP': 'false'}), patch.object(content, 'get_connection', return_value=conn):
            with self.assertRaises(HTTPException) as error:
                content.list_exams('adsp')
        self.assertEqual(error.exception.headers['X-Exam-Readiness'], 'feature_disabled')

    def test_authentication_is_still_required_before_session_write(self):
        app = self.app()
        def denied_user():
            raise HTTPException(status_code=401, detail='not authenticated')
        app.dependency_overrides[exams.get_current_user] = denied_user
        with patch.object(exams, 'get_connection') as connect, TestClient(app) as client:
            response = client.post('/api/exams/1/submit?exam_type=sqld', json={})
        self.assertEqual(response.status_code, 401)
        connect.assert_not_called()

    def test_capability_endpoint_reports_state_without_enabling_adsp(self):
        conn, cur = connection()
        with patch.object(content, 'get_connection', return_value=conn), patch.object(content, 'read_schema_capabilities', return_value=capabilities.ExamSchema('legacy')), TestClient(self.app()) as client:
            response = client.get('/api/content/exam-capabilities')
        self.assertEqual(response.json(), {'schemaState': 'legacy', 'sqld': {'available': True}, 'adsp': {'available': False}})
        cur.execute.assert_not_called()
