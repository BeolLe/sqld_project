import unittest

from app.services.sql_grading import compare_result_sets
from app.services.sql_ordering import result_order_keys


class OrderResolverTests(unittest.TestCase):
    def test_reference_order_keys(self):
        cases = [
            ('SELECT NAME, SAL FROM EMP ORDER BY SAL DESC', ('NAME', 'SAL'), ('SAL',)),
            ('SELECT E.NAME, E.SAL FROM EMP E ORDER BY E.SAL DESC', ('NAME', 'SAL'), ('SAL',)),
            ('SELECT E.NAME, E.SAL AS PAY FROM EMP E ORDER BY E.SAL DESC', ('NAME', 'PAY'), ('PAY',)),
            ('SELECT E.NAME, E.SAL PAY FROM EMP E ORDER BY PAY DESC', ('NAME', 'PAY'), ('PAY',)),
            ('SELECT DEPT, SAL, NAME FROM EMP ORDER BY DEPT ASC, SAL DESC NULLS LAST', ('DEPT', 'SAL', 'NAME'), ('DEPT', 'SAL')),
            ('SELECT NAME, SAL FROM EMP ORDER BY 2 DESC, 1', ('NAME', 'SAL'), ('SAL', 'NAME')),
            ('SELECT NAME, SUM(SAL) AS TOTAL FROM EMP GROUP BY NAME ORDER BY SUM(SAL) DESC', ('NAME', 'TOTAL'), ('TOTAL',)),
            ('SELECT NAME, SAL FROM EMP ORDER BY SAL DESC FETCH FIRST 5 ROWS ONLY', ('NAME', 'SAL'), ('SAL',)),
            ('SELECT NAME, SAL FROM EMP ORDER BY SAL DESC OFFSET 2 ROWS FETCH NEXT 5 ROWS ONLY', ('NAME', 'SAL'), ('SAL',)),
            ('WITH T AS (SELECT NAME, SAL FROM EMP ORDER BY NAME) SELECT NAME, SAL FROM T ORDER BY SAL DESC', ('NAME', 'SAL'), ('SAL',)),
            ('SELECT NAME FROM EMP UNION ALL SELECT NAME FROM EMP2 ORDER BY NAME', ('NAME',), ('NAME',)),
            ('SELECT "Name", SAL FROM EMP ORDER BY "Name", SAL', ('NAME', 'SAL'), ('NAME', 'SAL')),
            ("SELECT 'ORDER BY WRONG' AS TXT, SAL FROM EMP /* ORDER BY WRONG */ ORDER BY SAL -- DESC\n", ('TXT', 'SAL'), ('SAL',)),
            ('SELECT NAME, SAL FROM (SELECT NAME, SAL FROM EMP ORDER BY SAL DESC) WHERE ROWNUM <= 5', ('NAME', 'SAL'), ('SAL',)),
            ('SELECT ROW_NUMBER() OVER (ORDER BY SAL DESC) AS RN, NAME FROM EMP', ('RN', 'NAME'), ()),
            ('SELECT NAME FROM EMP WHERE SAL > (SELECT MAX(SAL) FROM EMP ORDER BY MAX(SAL))', ('NAME',), ()),
            ('SELECT NAME FROM EMP ORDER BY SAL', ('NAME',), None),
            ('SELECT E.NAME FROM EMP E JOIN EMP M ON E.MGR=M.ID ORDER BY M.NAME', ('NAME',), None),
            ('SELECT NAME FROM EMP ORDER BY UPPER(NAME)', ('NAME',), None),
            ('SELECT NAME FROM EMP ORDER BY 0', ('NAME',), None),
            ('SELECT NAME FROM EMP ORDER BY 2', ('NAME',), None),
            ('SELECT NAME FROM EMP ORDER SIBLINGS BY NAME', ('NAME',), None),
        ]
        for query, columns, keys in cases:
            with self.subTest(query=query):
                self.assertEqual(result_order_keys(query, columns), keys)


class GradingOrderTests(unittest.TestCase):
    def check(self, expected, actual, query='SELECT NAME, DEPT, SAL FROM EMP ORDER BY DEPT, SAL DESC', **options):
        return compare_result_sets(
            user_columns=['NAME', 'DEPT', 'SAL'], expected_columns=['NAME', 'DEPT', 'SAL'],
            expected_rows=expected, user_rows=actual, source_query=query,
            comparison_mode=options.get('mode', 'ordered'),
        )

    def setUp(self):
        self.rows = [
            {'NAME': 'A', 'DEPT': 10, 'SAL': 3000},
            {'NAME': 'B', 'DEPT': 10, 'SAL': 3000},
            {'NAME': 'C', 'DEPT': 10, 'SAL': 2000},
            {'NAME': 'D', 'DEPT': 20, 'SAL': 3000},
            {'NAME': 'E', 'DEPT': 20, 'SAL': 3000},
        ]

    def test_all_sort_keys_must_tie(self):
        actual = [self.rows[i] for i in [1, 0, 2, 4, 3]]
        correct, detail = self.check(self.rows, actual)
        self.assertTrue(correct)
        self.assertEqual(detail['orderKeys'], ['DEPT', 'SAL'])
        self.assertNotEqual(detail['userHash'], detail['expectedHash'])
        self.assertFalse(self.check(self.rows, [self.rows[i] for i in [3, 1, 2, 0, 4]])[0])

    def test_wrong_direction_and_split_tie_group_rejected(self):
        self.assertFalse(self.check(self.rows, list(reversed(self.rows)))[0])
        self.assertFalse(self.check(self.rows, [self.rows[i] for i in [0, 2, 1, 3, 4]])[0])

    def test_additional_required_key_is_not_ignored(self):
        query = 'SELECT NAME, DEPT, SAL FROM EMP ORDER BY DEPT, SAL DESC, NAME'
        self.assertFalse(self.check(self.rows, [self.rows[i] for i in [1, 0, 2, 3, 4]], query)[0])

    def test_missing_extra_duplicate_changed_rows_rejected(self):
        for actual in (self.rows[:-1], self.rows + [self.rows[0]],
                       [self.rows[0], self.rows[0], *self.rows[2:]],
                       [{**self.rows[0], 'NAME': 'WRONG'}, *self.rows[1:]]):
            with self.subTest(actual=actual):
                self.assertFalse(self.check(self.rows, actual)[0])

    def test_legitimate_duplicates_are_preserved(self):
        expected = [self.rows[0], self.rows[0], self.rows[1]]
        self.assertTrue(self.check(expected, [self.rows[1], self.rows[0], self.rows[0]])[0])

    def test_null_group_can_swap_but_cannot_move(self):
        expected = [{**self.rows[0], 'SAL': None}, {**self.rows[1], 'SAL': None}, self.rows[2]]
        self.assertTrue(self.check(expected, [expected[1], expected[0], expected[2]])[0])
        self.assertFalse(self.check(expected, [expected[2], expected[0], expected[1]])[0])

    def test_analytic_order_does_not_require_output_order(self):
        query = 'SELECT NAME, DEPT, SUM(SAL) OVER (ORDER BY NAME) AS SAL FROM EMP'
        self.assertTrue(self.check(self.rows, list(reversed(self.rows)), query)[0])

    def test_window_value_changes_remain_wrong(self):
        actual = [{**self.rows[0], 'SAL': 9999}, *self.rows[1:]]
        self.assertFalse(self.check(self.rows, actual)[0])

    def test_no_reference_or_unresolved_key_keeps_legacy_order(self):
        actual = [self.rows[1], self.rows[0], *self.rows[2:]]
        for query in (None, 'SELECT NAME, DEPT, SAL FROM EMP ORDER BY MISSING'):
            self.assertFalse(self.check(self.rows, actual, query)[0])

    def test_unordered_policy_still_accepts_any_order(self):
        self.assertTrue(self.check(self.rows, list(reversed(self.rows)), mode='unordered')[0])

    def test_columns_still_checked(self):
        result = compare_result_sets(user_columns=['SAL'], user_rows=[{'SAL': 1}],
            expected_columns=['PAY'], expected_rows=[{'PAY': 1}], comparison_mode='ordered',
            source_query='SELECT SAL AS PAY FROM EMP ORDER BY SAL')
        self.assertFalse(result[0])
        self.assertEqual(result[1]['reason'], 'column_mismatch')


if __name__ == '__main__':
    unittest.main()
