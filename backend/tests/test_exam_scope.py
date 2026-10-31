from contextlib import contextmanager
from copy import deepcopy
from datetime import datetime, timezone
from decimal import Decimal
from threading import Event, Thread
from uuid import UUID
import re
import sqlite3
import unittest
from unittest.mock import MagicMock, patch

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.core.exam_scope import exam_code, public_exam_id, validate_exam_type
from app.services.exam_grading import grade_exam
from app.api.content import router as content
from app.api.exams import router as exams
from app.api.education import router as education
from app.api.endless import router as endless
from app.api.dashboard import router as dashboard
from app.db import education as education_db

USER = {'user_id': '00000000-0000-0000-0000-000000000001'}
ATTEMPT = UUID('00000000-0000-0000-0000-000000000700')


def connection(*, one=None, all_rows=None, old_schema=False):
    cur = MagicMock()
    cur.__enter__.return_value = cur
    cur.fetchone.side_effect = one or []
    cur.fetchall.side_effect = all_rows or []

    def check_params(sql, params=None):
        if not isinstance(params, dict):
            assert sql.count('%s') == len(params or ()), (sql, params)
        if old_schema:
            # Constant SELECT aliases are safe; real new columns must not occur.
            tokens = re.sub(r"'(?:[^']|'')*'", "''", sql)
            tokens = re.sub(r'\bAS\s+(exam_type|grading_policy|pass_threshold_percent)\b', '', tokens, flags=re.I)
            forbidden = r'\b(exam_type|grading_policy|request_id|statistics_cleared_at)\b'
            assert not re.search(forbidden, tokens), f'new column in legacy SQL: {sql}'
            if 'FROM exam.subjects' not in sql:
                assert not re.search(r'\bpass_threshold_percent\b', tokens), sql
    cur.execute.side_effect = check_params
    conn = MagicMock()
    conn.cursor.return_value = cur
    conn.__enter__.return_value = conn
    return conn, cur


def question(number, subject, points=2, answer='1'):
    return {'id': f'q{number}', 'subjectId': subject, 'points': points, 'answer': answer}


class GradingTests(unittest.TestCase):
    def test_total_decimal_threshold_below_equal_and_above(self):
        for earned, expected in [(6000, False), (6001, True), (6002, True)]:
            with self.subTest(earned=earned):
                result = grade_exam([question(1, 1, earned), question(2, 1, 10000-earned)], {'q1': '1'},
                    policy='weighted', total_question_count=2, total_cutoff=Decimal('60.01'),
                    subjects=[{'id': 1, 'pass_threshold_percent': 0}])
                self.assertEqual(result['passed'], expected)

    def test_subject_decimal_threshold_below_equal_and_above(self):
        for earned, expected in [(4000, False), (4001, True), (4002, True)]:
            with self.subTest(earned=earned):
                result = grade_exam([question(1, 1, earned), question(2, 1, 10000-earned), question(3, 2, 10000)],
                    {'q1': '1', 'q3': '1'}, policy='weighted', total_question_count=3, total_cutoff=60,
                    subjects=[{'id': 1, 'pass_threshold_percent': Decimal('40.01')}, {'id': 2, 'pass_threshold_percent': 40}])
                self.assertEqual(result['passed'], expected)
                self.assertEqual(result['failedBySubjectCutoff'], not expected)

    def test_sqld_preserves_legacy_score_even_if_display_points_are_ten(self):
        problems = [question(i, 1 if i < 10 else 2, 10) for i in range(50)]
        result = grade_exam(problems, {f'q{i}': '1' for i in range(40)}, policy='legacy_equal',
                            total_question_count=50, total_cutoff=99,
                            subjects=[{'id': 1, 'pass_threshold_percent': 99}, {'id': 2, 'pass_threshold_percent': 99}])
        self.assertEqual((result['score'], result['scorePercent'], result['passed']), (80, 80, True))

    def test_adsp_uses_three_subjects_and_weighted_counts(self):
        problems = [question(1, 1, 10), question(2, 2, 30), question(3, 3, 60)]
        result = grade_exam(problems, {'q1': '1', 'q2': '1', 'q3': '2'}, policy='weighted',
                            total_question_count=3, total_cutoff=60,
                            subjects=[{'id': i, 'pass_threshold_percent': 40} for i in (1, 2, 3)])
        self.assertEqual(result['correctCount'], 2)
        self.assertEqual(result['scorePercent'], 40)  # Not 2/3 * 100.
        self.assertFalse(result['passed'])
        self.assertEqual(len(result['subjects']), 3)

    def test_subject_cutoff_can_fail_an_overall_pass(self):
        result = grade_exam([question(1, 1, 80), question(2, 2, 20)], {'q1': '1'}, policy='weighted',
                            total_question_count=2, total_cutoff=60,
                            subjects=[{'id': 1, 'pass_threshold_percent': 40}, {'id': 2, 'pass_threshold_percent': 40}])
        self.assertEqual(result['scorePercent'], 80)
        self.assertTrue(result['failedBySubjectCutoff'])
        self.assertFalse(result['passed'])

    def test_invalid_published_grading_config_is_rejected(self):
        for points in [-1, 0, 'NaN', 'Infinity', 'bad']:
            with self.subTest(points=points), self.assertRaises(ValueError):
                grade_exam([question(1, 1, points)], {}, policy='weighted', total_question_count=1,
                           total_cutoff=60, subjects=[{'id': 1, 'pass_threshold_percent': 40}])
        with self.assertRaises(ValueError):
            grade_exam([question(1, 2)], {}, policy='weighted', total_question_count=1,
                       total_cutoff=60, subjects=[{'id': 1, 'pass_threshold_percent': 40}])

    def test_accuracy_and_weighted_subject_score_have_different_denominators(self):
        result = grade_exam([question(1, 1, 90), question(2, 1, 10)], {'q1': '1'}, policy='weighted',
                            total_question_count=2, total_cutoff=60,
                            subjects=[{'id': 1, 'pass_threshold_percent': 40}])
        self.assertEqual(result['subjects'][0]['accuracy_rate'], 50)
        self.assertEqual(result['subjects'][0]['score_percent'], 90)

    def test_legacy_unused_subject_does_not_change_old_grading(self):
        result = grade_exam([question(1, 1, 10)], {'q1': '1'}, policy='legacy_equal', total_question_count=1,
                            total_cutoff=60, subjects=[{'id': 1, 'pass_threshold_percent': 40}, {'id': 2, 'pass_threshold_percent': 40}])
        self.assertTrue(result['passed'])

    def test_legacy_uses_configured_denominator_as_before(self):
        result = grade_exam([question(1, 1)], {'q1': '1'}, policy='legacy_equal', total_question_count=50,
                            total_cutoff=60, subjects=[{'id': 1, 'pass_threshold_percent': 40}])
        self.assertEqual((result['score'], result['scorePercent'], result['maxScore']), (2, 2, 100))


class ScopeTests(unittest.TestCase):
    def test_legacy_alias_is_not_database_primary_key(self):
        self.assertEqual(exam_code('1'), 'sqld_mock_1')
        self.assertEqual(exam_code('1', 'adsp'), 'adsp_mock_1')
        self.assertEqual(public_exam_id('adsp_mock_1', 'adsp'), '1')
        with self.assertRaises(HTTPException):
            validate_exam_type('adsp;DROP TABLE')

    def test_exam_lookup_uses_type_and_code(self):
        conn, cur = connection(one=[None])
        with self.assertRaises(HTTPException) as error:
            exams.fetch_exam(conn, '1', 'adsp')
        self.assertEqual(error.exception.status_code, 404)
        self.assertEqual(cur.execute.call_args.args[1], ('adsp_mock_1', 'adsp'))

    def test_http_invalid_scope_is_rejected_before_connection(self):
        app = FastAPI()
        for module in [content, exams, education, endless, dashboard]:
            app.include_router(module.router)
        with TestClient(app) as client:
            for path in ['/api/content/exams', '/api/education/curricula', '/api/endless/stats',
                         '/api/dashboard/summary', '/api/exams/1/session']:
                with self.subTest(path=path):
                    self.assertEqual(client.get(path + '?exam_type=unknown').status_code, 422)

    def test_content_cache_keeps_both_exam_lists(self):
        content._content_cache.clear()
        def row(code):
            return {'exam_code': code, 'round': 1, 'title': code, 'total_question_count': 50,
                    'duration_seconds': 5400, 'avg_difficulty': None}
        conn, cur = connection(all_rows=[[row('sqld_mock_1')], [row('adsp_mock_1')]])
        with patch.object(content, 'get_connection', return_value=conn):
            sqld = content.list_exams()
            adsp = content.list_exams('adsp')
            self.assertEqual(content.list_exams(), sqld)
        self.assertEqual(sqld[0]['examType'], 'sqld')
        self.assertEqual(adsp[0]['examType'], 'adsp')
        self.assertEqual(cur.execute.call_count, 2)

    def test_ready_list_excludes_unassigned_and_misclassified_sentinel(self):
        # Evaluate the real route's WHERE predicate in memory, then run its real
        # public-ID transformation. This is not a PostgreSQL integration test.
        content._content_cache.clear()
        db = sqlite3.connect(':memory:')
        self.addCleanup(db.close)
        db.execute('CREATE TABLE exams (exam_code TEXT, exam_type TEXT)')
        db.executemany('INSERT INTO exams VALUES (?,?)', [
            ('__UNSORTED__', None), ('__UNSORTED__', 'sqld'),
            ('sqld_mock_1', 'sqld'), ('adsp_mock_1', 'adsp')])
        conn, cur = connection()
        rows = []
        def evaluate_filter(sql, params):
            predicate = sql.split('WHERE ',1)[1].split('GROUP BY',1)[0]
            predicate = predicate.replace("left(e.exam_code, length(e.exam_type || '_mock_'))",
                                          "substr(e.exam_code, 1, length(e.exam_type || '_mock_'))")
            codes = db.execute('SELECT e.exam_code FROM exams e WHERE '+predicate.replace('%s','?'),params).fetchall()
            rows[:] = [{'exam_code':code,'round':1,'title':code,'total_question_count':50,
                        'duration_seconds':5400,'avg_difficulty':None} for (code,) in codes]
        cur.execute.side_effect = evaluate_filter
        cur.fetchall.side_effect = lambda: list(rows)
        with patch.object(content,'get_connection',return_value=conn):
            self.assertEqual([(x['id'],x['examType']) for x in content.list_exams('sqld')],[('1','sqld')])
            self.assertEqual([(x['id'],x['examType']) for x in content.list_exams('adsp')],[('1','adsp')])

    def test_wrong_exam_lesson_cannot_read_or_save_progress(self):
        with patch.object(education, 'get_published_lesson', return_value=None):
            with self.assertRaises(HTTPException) as error:
                education.read_progress(301, USER, 'sqld')
            self.assertEqual(error.exception.status_code, 404)
        conn, cur = connection(one=[None])
        with patch.object(education_db, 'get_connection', return_value=conn):
            result = education_db.save_lesson_progress(user_id=USER['user_id'], lesson_id=301,
                lesson_version_id=901, resume_anchor=None, resume_offset_px=None, completed=True, exam_type='sqld')
        self.assertIsNone(result)
        sql, params = cur.execute.call_args.args
        self.assertIn('curriculum.exam_type = %s', sql)
        self.assertIn('version.lesson_id = lesson.lesson_id', sql)
        self.assertEqual(params[-3:], (301, 901, 'sqld'))

    def test_curricula_and_detail_resolve_scope_through_parents(self):
        conn, cur = connection(one=[None, None], all_rows=[[]])
        with patch.object(education_db, 'get_connection', return_value=conn):
            self.assertEqual(education_db.list_published_curricula('adsp'), [])
            self.assertIsNone(education_db.get_published_curriculum('adsp_concept', 'adsp'))
            self.assertIsNone(education_db.get_published_lesson(301, 'adsp'))
        self.assertEqual([call.args[1][-1] for call in cur.execute.call_args_list], ['adsp'] * 3)


class AttemptTests(unittest.TestCase):
    def test_real_converter_rejects_missing_weighted_points_and_keeps_legacy_default(self):
        row = {'question_no': 1, 'title': 'Question', 'question_text': 'Text', 'question_type': 'multiple_choice',
               'difficulty': 'easy', 'question_payload': {'source_id': 'q1'}, 'choice_payload': ['one', 'two'],
               'correct_rate': None, 'seed_correct_rate': None, 'correct_answer': '1', 'explanation': 'Explanation',
               'selected_choice': '1', 'subject_id': 1}
        for policy in ('weighted', 'legacy_equal'):
            conn, _ = connection(all_rows=[[deepcopy(row)]])
            payload = exams.build_result_payload(conn, 7, grading_policy=policy)
            args = dict(policy=policy, total_question_count=1, total_cutoff=60,
                        subjects=[{'id': 1, 'pass_threshold_percent': 40}])
            if policy == 'weighted':
                self.assertIsNone(payload['problems'][0]['points'])
                with self.assertRaisesRegex(ValueError, 'question points'):
                    grade_exam(payload['problems'], payload['answers'], **args)
            else:
                self.assertEqual(payload['problems'][0]['points'], 2)
                self.assertEqual(grade_exam(payload['problems'], payload['answers'], **args)['score'], 2)

    def test_submit_uses_real_converter_before_rejecting_missing_weight(self):
        row = {'question_no': 1, 'title': 'Question', 'question_text': 'Text', 'question_type': 'multiple_choice',
               'difficulty': 'easy', 'question_payload': {'source_id': 'q1'}, 'choice_payload': [],
               'correct_rate': None, 'seed_correct_rate': None, 'correct_answer': '1', 'explanation': '',
               'selected_choice': '1', 'subject_id': 1}
        conn, cur = connection(all_rows=[[row], [{'id': 1, 'pass_threshold_percent': 40}]])
        exam = {'id': 82, 'exam_type': 'adsp', 'grading_policy': 'weighted', 'total_question_count': 1, 'pass_threshold_percent': 60}
        with patch.object(exams, 'get_connection', return_value=conn), patch.object(exams, 'fetch_exam', return_value=exam), \
             patch.object(exams, 'resolve_attempt', return_value={'id': 7, 'status': 'in_progress'}), patch.object(exams, 'send_amplitude_event') as send:
            with self.assertRaises(HTTPException) as error:
                exams.submit_exam('1', exams.SubmitExamRequest(attemptUuid=ATTEMPT), USER, 'adsp')
        self.assertEqual(error.exception.status_code, 409)
        self.assertTrue(all(c.args[0].lstrip().startswith('SELECT') for c in cur.execute.call_args_list))
        send.assert_not_called()

    def test_uuid_lookup_is_owned_and_locked(self):
        conn, cur = connection(one=[None])
        with patch.object(exams, 'lock_user_progress'), self.assertRaises(HTTPException) as error:
            exams.resolve_attempt(conn, exam={'id': 82, 'exam_type': 'adsp'}, user_id=USER['user_id'], attempt_uuid=ATTEMPT)
        self.assertEqual(error.exception.status_code, 404)
        query, params = cur.execute.call_args.args
        self.assertIn('FOR UPDATE', query)
        self.assertIn('AND exam_id = %s AND user_id = %s::uuid', query)
        self.assertEqual(params, (str(ATTEMPT), 82, USER['user_id']))

    def test_adsp_requires_uuid_and_submitted_answers_cannot_mutate(self):
        conn, _ = connection(one=[{'status': 'submitted'}])
        with patch.object(exams, 'lock_user_progress'):
            with self.assertRaises(HTTPException) as error:
                exams.resolve_attempt(conn, exam={'id': 82, 'exam_type': 'adsp'}, user_id=USER['user_id'], attempt_uuid=None)
            self.assertEqual(error.exception.status_code, 422)
            with self.assertRaises(HTTPException) as error:
                exams.resolve_attempt(conn, exam={'id': 82, 'exam_type': 'adsp'}, user_id=USER['user_id'], attempt_uuid=ATTEMPT)
            self.assertEqual(error.exception.status_code, 409)

    def test_legacy_sqld_writes_still_resolve_current_attempt(self):
        conn, _ = connection()
        with patch.object(exams, 'lock_user_progress'), patch.object(exams, 'get_or_create_attempt', return_value={'id': 7, 'status': 'in_progress'}) as create:
            result = exams.resolve_attempt(conn, exam={'id': 17, 'exam_type': 'sqld'}, user_id=USER['user_id'], attempt_uuid=None)
        self.assertEqual(result['id'], 7)
        create.assert_called_once()

    def test_stored_snapshot_survives_question_changes(self):
        saved = {'score': 80, 'answers': {'q1': '1'}, 'problems': [], 'correctCount': 40}
        with patch.object(exams, 'build_result_payload', side_effect=AssertionError('must not regrade')):
            self.assertEqual(exams.stored_result_payload(None, 7, {'grading_snapshot': {'result': saved}}), saved)

    def test_repeat_submission_does_not_award_or_send_event(self):
        stored = {'passed': True, 'failed_by_subject_cutoff': False, 'score_percent': 80,
                  'grading_snapshot': {'result': {'score': 80, 'correctCount': 40, 'problems': [], 'answers': {}}}}
        conn, cur = connection(one=[stored, {'total_points': 140}])
        with patch.object(exams, 'get_connection', return_value=conn), patch.object(exams, 'fetch_exam', return_value={'id': 82}), \
             patch.object(exams, 'resolve_attempt', return_value={'id': 7, 'status': 'submitted'}), patch.object(exams, 'send_amplitude_event') as send:
            result = exams.submit_exam('1', exams.SubmitExamRequest(attemptUuid=ATTEMPT), USER, 'adsp')
        self.assertEqual((result['awardedPoints'], result['totalPoints']), (0, 140))
        self.assertTrue(all(call.args[0].lstrip().startswith('SELECT') for call in cur.execute.call_args_list))
        send.assert_not_called()

    def test_new_submission_records_snapshot_and_shared_award_once(self):
        conn, cur = connection(one=[{'total_points': 101}], all_rows=[[{'id': 1, 'pass_threshold_percent': 40}]])
        exam = {'id': 82, 'exam_type': 'adsp', 'exam_code': 'adsp_mock_1', 'total_question_count': 1,
                'duration_seconds': 60, 'grading_policy': 'weighted', 'pass_threshold_percent': 60}
        attempt = {'id': 7, 'status': 'in_progress', 'remaining_seconds': 20, 'duration_seconds': 60}
        payload = {'problems': [question(1, 1, 100)], 'answers': {'q1': '1'}, 'correctCount': 1, 'score': 2}
        with patch.object(exams, 'get_connection', return_value=conn), patch.object(exams, 'fetch_exam', return_value=exam), \
             patch.object(exams, 'resolve_attempt', return_value=attempt), patch.object(exams, 'build_result_payload', return_value=payload), \
             patch.object(exams, 'send_amplitude_event') as send:
            result = exams.submit_exam('1', exams.SubmitExamRequest(attemptUuid=ATTEMPT), USER, 'adsp')
        self.assertEqual((result['score'], result['scorePercent'], result['awardedPoints'], result['totalPoints']), (100, 100, 1, 101))
        awards = [c for c in cur.execute.call_args_list if 'INSERT INTO dashboard.user_stats' in c.args[0]]
        self.assertEqual(len(awards), 1)
        self.assertEqual(awards[0].args[1], (USER['user_id'], 1, 40, 1))
        snapshot = next(c.args[1][-1] for c in cur.execute.call_args_list if 'INSERT INTO exam.exam_attempt_results' in c.args[0])
        self.assertIn('"elapsedLearningSeconds": 40', snapshot)
        self.assertIn('"examType": "adsp"', snapshot)
        send.assert_called_once()


class DashboardAndEndlessTests(unittest.TestCase):
    def test_slow_balance_read_does_not_block_another_users_cached_dashboard(self):
        first_entered, release_first, second_finished = Event(), Event(), Event()
        other = {'user_id': '00000000-0000-0000-0000-000000000002'}
        dashboard._summary_cache.clear()
        for user in (USER, other):
            dashboard._summary_cache[(user['user_id'], 'sqld', True)] = (dashboard.monotonic(), {'stats': {'totalPoints': 100}})
        errors, results = [], {}

        class Cursor:
            def __enter__(self): return self
            def __exit__(self, *args): return False
            def execute(self, sql, params):
                self.user = params[0]
                if self.user == USER['user_id']:
                    first_entered.set()
                    if not release_first.wait(3): raise AssertionError('balance read release timed out')
            def fetchone(self): return (140 if self.user == USER['user_id'] else 200,)

        class Connection:
            def __enter__(self): return self
            def __exit__(self, *args): return False
            def cursor(self): return Cursor()

        def request(user, done=None):
            try: results[user['user_id']] = dashboard.get_dashboard_summary(user)
            except BaseException as exc: errors.append(exc)
            finally:
                if done: done.set()

        with patch.object(dashboard, 'get_connection', side_effect=Connection):
            first = Thread(target=request, args=(USER,), daemon=True)
            second = Thread(target=request, args=(other, second_finished), daemon=True)
            first.start()
            try:
                self.assertTrue(first_entered.wait(2))
                second.start()
                self.assertTrue(second_finished.wait(2), 'another user blocked behind the cache lock during DB IO')
            finally:
                release_first.set()
                first.join(3)
                if second.ident is not None: second.join(3)
        self.assertEqual(errors, [])
        self.assertEqual(results[other['user_id']]['stats']['totalPoints'], 200)

    def test_cached_nested_payload_is_not_shared_with_response(self):
        key = (USER['user_id'], 'sqld', True)
        dashboard._summary_cache[key] = (dashboard.monotonic(), {'stats': {'totalPoints': 100}, 'subjectStats': {'all': [{'score': 80}]}})
        conn, _ = connection(one=[(140,)])
        with patch.object(dashboard, 'get_connection', return_value=conn):
            response = dashboard.get_dashboard_summary(USER)
        response['subjectStats']['all'][0]['score'] = 0
        self.assertEqual(dashboard._summary_cache[key][1]['subjectStats']['all'][0]['score'], 80)
        self.assertEqual(dashboard._summary_cache[key][1]['stats']['totalPoints'], 100)

    def test_scoped_counters_preserve_legacy_totals_and_shared_points(self):
        # SQLD historical totals survive even when its old endless logs were deleted.
        conn, cur = connection(one=[(140, 7, 1500, 240, 2, 400, 70, 0)] * 2)
        sqld = dashboard.scoped_counters(cur, USER['user_id'], 'sqld', True)
        adsp = dashboard.scoped_counters(cur, USER['user_id'], 'adsp', True)
        self.assertEqual(sqld, {'totalPoints': 140, 'totalMockExamAttemptCount': 5, 'totalLearningSeconds': 1100, 'totalSolvedQuestionCount': 170})
        self.assertEqual(adsp['totalPoints'], 140)
        self.assertEqual(adsp['totalSolvedQuestionCount'], 70)
        self.assertEqual(cur.execute.call_count, 2)  # Each complete counter read has one snapshot.

    def test_dashboard_cache_is_scoped_but_balance_is_always_fresh(self):
        dashboard._summary_cache.clear()
        now = dashboard.monotonic()
        for exam_type, count in [('sqld', 5), ('adsp', 2)]:
            dashboard._summary_cache[(USER['user_id'], exam_type, True)] = (now, {'examType': exam_type, 'stats': {'totalPoints': 100, 'totalMockExamAttemptCount': count}})
        conn, cur = connection(one=[(140,), (140,)])
        with patch.object(dashboard, 'get_connection', return_value=conn):
            sqld = dashboard.get_dashboard_summary(USER)
            adsp = dashboard.get_dashboard_summary(USER, 'adsp')
        self.assertEqual(sqld['stats']['totalMockExamAttemptCount'], 5)
        self.assertEqual(adsp['stats']['totalMockExamAttemptCount'], 2)
        self.assertEqual((sqld['stats']['totalPoints'], adsp['stats']['totalPoints']), (140, 140))

    def test_dashboard_uncached_queries_have_scoped_parameters_and_empty_states(self):
        for exam_type in ('sqld', 'adsp'):
            with self.subTest(exam_type=exam_type):
                dashboard._summary_cache.clear()
                conn, cur = connection(one=[(True,), (100, 3, 300, 150, 0, 0, 0, 0)], all_rows=[[], [], [], []])
                with patch.object(dashboard, 'get_connection', return_value=conn):
                    result = dashboard.get_dashboard_summary(USER, exam_type)
                self.assertEqual(result['examType'], exam_type)
                self.assertEqual(result['recentSqlAttempts'], [])
                self.assertEqual(result['learningCalendar'], [])
                result['stats']['totalPoints'] = -1
                self.assertEqual(dashboard._summary_cache[(USER['user_id'], exam_type, True)][1]['stats']['totalPoints'], 100)
                scoped_queries = [c for c in cur.execute.call_args_list if 'learning_date' in c.args[0] or 'exam_url_id' in c.args[0]]
                self.assertEqual(len(scoped_queries), 2)
                self.assertTrue(all(exam_type in c.args[1] for c in scoped_queries))

    def test_adsp_new_answer_uses_server_scope_and_common_point_row(self):
        conn, cur = connection(one=[None, {'id': 7}, {'total_points': 101}])
        with patch.object(endless, 'get_connection', return_value=conn), patch.object(endless, 'has_endless_answers_table', return_value=True), \
             patch.object(endless, 'lock_user_progress'), patch.object(endless, 'fetch_endless_question', return_value={'exam_type': 'adsp', 'correct_answer': '1', 'category': 'server-category', 'difficulty': 'easy'}), \
             patch.object(endless, 'build_stats_payload', return_value=endless.empty_stats_payload()), patch.object(endless, 'insert_learning_event'), patch.object(endless, 'send_amplitude_event'):
            result = endless.save_endless_answer(endless.EndlessAnswerRequest(requestId=ATTEMPT, problem_id='adsp_q1', selected_answer='1', category='untrusted'), USER, 'adsp')
        self.assertEqual(result['awardedPoints'], 1)
        self.assertEqual(result['totalPoints'], 101)
        insert = next(c for c in cur.execute.call_args_list if 'INSERT INTO logs.endless_answers' in c.args[0])
        self.assertEqual(insert.args[1][4], 'server-category')
        self.assertEqual(insert.args[1][-2:], ('adsp', str(ATTEMPT)))
        award = next(c for c in cur.execute.call_args_list if 'INSERT INTO dashboard.user_stats' in c.args[0])
        self.assertEqual(award.args[1], (USER['user_id'], 1))

    def test_wrong_exam_endless_problem_is_rejected(self):
        conn, cur = connection(one=[None])
        self.assertIsNone(endless.fetch_endless_question(conn, 'adsp_q1', 'sqld'))
        self.assertEqual(cur.execute.call_args.args[1], ('adsp_q1', 'sqld'))

    def test_endless_replay_does_not_reaward_even_after_stats_reset(self):
        previous = {'id': 7, 'problem_id': 'adsp_q1', 'selected_answer': '1', 'is_correct': True, 'exam_type': 'adsp'}
        conn, cur = connection(one=[previous])
        with patch.object(endless, 'get_connection', return_value=conn), patch.object(endless, 'has_endless_answers_table', return_value=True), \
             patch.object(endless, 'lock_user_progress'), patch.object(endless, 'build_stats_payload', return_value=endless.empty_stats_payload()), \
             patch.object(endless, 'fetch_user_total_points', return_value=101), patch.object(endless, 'send_amplitude_event') as send:
            result = endless.save_endless_answer(endless.EndlessAnswerRequest(requestId=ATTEMPT, problem_id='adsp_q1', selected_answer='1'), USER, 'adsp')
        self.assertEqual((result['awardedPoints'], result['totalPoints'], result['totalAnswered']), (0, 101, 0))
        self.assertEqual(cur.execute.call_count, 1)
        send.assert_not_called()

    def test_endless_key_reuse_for_different_exam_is_conflict(self):
        previous = {'id': 7, 'problem_id': 'q1', 'selected_answer': '1', 'is_correct': True, 'exam_type': 'sqld'}
        conn, _ = connection(one=[previous])
        with patch.object(endless, 'get_connection', return_value=conn), patch.object(endless, 'has_endless_answers_table', return_value=True), patch.object(endless, 'lock_user_progress'):
            with self.assertRaises(HTTPException) as error:
                endless.save_endless_answer(endless.EndlessAnswerRequest(requestId=ATTEMPT, problem_id='q1', selected_answer='1'), USER, 'adsp')
        self.assertEqual(error.exception.status_code, 409)

    def test_reset_only_marks_requested_exam_and_keeps_replay_rows(self):
        conn, cur = connection()
        with patch.object(endless, 'get_connection', return_value=conn), patch.object(endless, 'has_endless_answers_table', return_value=True), \
             patch.object(endless, 'lock_user_progress'), patch.object(endless, 'fetch_user_total_points', return_value=101):
            result = endless.reset_endless_stats(USER, 'adsp')
        query, params = cur.execute.call_args.args
        self.assertIn('UPDATE logs.endless_answers SET statistics_cleared_at', query)
        self.assertEqual(params, (USER['user_id'], 'adsp'))
        self.assertEqual(result['totalPoints'], 101)


if __name__ == '__main__':
    unittest.main()
