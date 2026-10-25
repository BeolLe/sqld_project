"""Pure grading rules; rewards remain one shared point per correct answer."""

from decimal import Decimal, InvalidOperation


def _number(value, label):
    try:
        number = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValueError(f"invalid {label}") from exc
    if not number.is_finite():
        raise ValueError(f"invalid {label}")
    return number


def grade_exam(problems, answers, *, policy, total_question_count, total_cutoff, subjects):
    if policy not in {'legacy_equal', 'weighted'}:
        raise ValueError("unknown grading policy")
    if policy == 'weighted':
        if not problems or len(problems) != total_question_count:
            raise ValueError("published question count does not match exam configuration")
        if len({p['id'] for p in problems}) != len(problems):
            raise ValueError("duplicate question source ids in exam")
    rows = {s['id']: {'subject_id': s['id'], 'question_count': 0, 'correct_count': 0,
                      'earned': Decimal(0), 'maximum': Decimal(0),
                      'cutoff': Decimal(40) if policy == 'legacy_equal' else _number(s['pass_threshold_percent'], 'subject cutoff')} for s in subjects}
    earned = maximum = Decimal(0)
    correct_count = 0
    for problem in problems:
        if problem['subjectId'] not in rows:
            raise ValueError("question subject does not belong to exam")
        if problem['answer'] is None or str(problem['answer']) == '':
            raise ValueError("published question has no answer key")
        try:
            weight = Decimal(2) if policy == 'legacy_equal' else Decimal(str(problem['points']))
        except (InvalidOperation, TypeError, ValueError) as exc:
            raise ValueError("invalid question points") from exc
        if not weight.is_finite() or weight <= 0:
            raise ValueError("question points must be positive and finite")
        correct = answers.get(problem['id']) == problem['answer']
        correct_count += int(correct)
        maximum += weight
        earned += weight if correct else 0
        row = rows[problem['subjectId']]
        row['question_count'] += 1
        row['correct_count'] += int(correct)
        row['maximum'] += weight
        row['earned'] += weight if correct else 0
    if policy == 'legacy_equal':
        # Existing SQLD used the configured question count as its denominator.
        percent_decimal = (Decimal(correct_count) / Decimal(total_question_count) * 100) if total_question_count else Decimal(0)
        maximum = Decimal(total_question_count * 2)
    else:
        percent_decimal = earned / maximum * 100
    percent_decimal = percent_decimal.quantize(Decimal('0.01'))
    cutoff = Decimal(60) if policy == 'legacy_equal' else _number(total_cutoff, 'total cutoff')
    if not cutoff.is_finite() or not 0 <= cutoff <= 100:
        raise ValueError("invalid total cutoff")
    passed_total = percent_decimal >= cutoff
    subject_results = []
    for row in rows.values():
        if not row['question_count']:
            if policy == 'legacy_equal':
                continue  # Legacy grading grouped only subjects used by questions.
            raise ValueError("configured subject has no questions")
        subject_cutoff = Decimal(40) if policy == 'legacy_equal' else row['cutoff']
        if not subject_cutoff.is_finite() or not 0 <= subject_cutoff <= 100:
            raise ValueError("invalid subject cutoff")
        subject_percent_decimal = (row['earned'] / row['maximum'] * 100).quantize(Decimal('0.01'))
        subject_results.append({
            'subject_id': row['subject_id'], 'question_count': row['question_count'],
            'correct_count': row['correct_count'], 'score_percent': float(subject_percent_decimal),
            'accuracy_rate': round(row['correct_count'] / row['question_count'] * 100, 2),
            'is_failed_cutoff': passed_total and subject_percent_decimal < subject_cutoff,
            'earned_points': float(row['earned']), 'max_points': float(row['maximum']),
            'cutoff': float(subject_cutoff),
        })
    failed = any(r['is_failed_cutoff'] for r in subject_results)
    return {'score': float(earned), 'maxScore': float(maximum), 'scorePercent': float(percent_decimal),
            'correctCount': correct_count, 'passed': passed_total and not failed,
            'failedBySubjectCutoff': failed, 'subjects': subject_results,
            'totalCutoff': float(cutoff), 'policy': policy}
