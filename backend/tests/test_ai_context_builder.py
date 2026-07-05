from __future__ import annotations

import unittest
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

from app.services.ai.context_builder import build_explanation_context


class AIExplanationContextTests(unittest.TestCase):
    def test_exam_context_supports_unanswered_question(self):
        cursor = MagicMock()
        cursor.__enter__.return_value = cursor
        cursor.fetchone.return_value = {
            "problem_id": "exam_q_1",
            "question_text": "문제",
            "options": ["1", "2"],
            "user_answer": "미답변",
            "correct_answer": "1",
            "explanation": "해설",
        }
        connection = MagicMock()
        connection.cursor.return_value = cursor

        @contextmanager
        def fake_connection():
            yield connection

        with patch(
            "app.services.ai.context_builder.get_connection",
            fake_connection,
        ):
            context = build_explanation_context(
                user_id="00000000-0000-0000-0000-000000000001",
                source="exam",
                attempt_id="1",
                problem_id="exam_q_1",
            )

        query = cursor.execute.call_args.args[0]
        self.assertIn("LEFT JOIN exam.exam_attempt_answers", query)
        self.assertIn("COALESCE(answer.selected_choice, '미답변')", query)
        self.assertEqual(context["user_answer"], "미답변")


if __name__ == "__main__":
    unittest.main()
