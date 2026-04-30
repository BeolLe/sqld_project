CREATE SCHEMA IF NOT EXISTS schedule;

CREATE TABLE IF NOT EXISTS schedule.exam_schedules (
    schedule_id BIGSERIAL PRIMARY KEY,
    schedule_year INTEGER NOT NULL,
    exam_type TEXT NOT NULL,
    round_label TEXT NOT NULL,
    application_start_at TIMESTAMPTZ NULL,
    application_end_at TIMESTAMPTZ NULL,
    ticket_start_at TIMESTAMPTZ NULL,
    ticket_end_at TIMESTAMPTZ NULL,
    exam_start_at TIMESTAMPTZ NULL,
    exam_end_at TIMESTAMPTZ NULL,
    score_open_start_at TIMESTAMPTZ NULL,
    score_open_end_at TIMESTAMPTZ NULL,
    pass_announcement_start_at TIMESTAMPTZ NULL,
    pass_announcement_end_at TIMESTAMPTZ NULL,
    qualification_submission_start_at TIMESTAMPTZ NULL,
    qualification_submission_end_at TIMESTAMPTZ NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (schedule_year, exam_type, round_label)
);

CREATE INDEX IF NOT EXISTS exam_schedules_year_type_idx
    ON schedule.exam_schedules (schedule_year, exam_type, display_order);

CREATE OR REPLACE FUNCTION schedule.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_exam_schedules_updated_at ON schedule.exam_schedules;

CREATE TRIGGER trg_exam_schedules_updated_at
BEFORE UPDATE ON schedule.exam_schedules
FOR EACH ROW
EXECUTE FUNCTION schedule.set_updated_at();

/*
스크린샷 기준 초안입니다.
형님이 실제 공지 표와 한 번 대조한 뒤 실행하는 것을 권장합니다.

매핑 기준:
- exam_type: 구분
- round_label: 회차
- application_*: 원서접수
- ticket_*: 수험표발급
- exam_*: 시험일
- score_open_*: 사전점수공개 및 재검토 접수
- pass_announcement_*: 합격(예정)자 발표
- qualification_submission_*: 응시자격 서류제출(합격자 결정)
*/

INSERT INTO schedule.exam_schedules (
    schedule_year,
    exam_type,
    round_label,
    application_start_at,
    application_end_at,
    ticket_start_at,
    ticket_end_at,
    exam_start_at,
    exam_end_at,
    score_open_start_at,
    score_open_end_at,
    pass_announcement_start_at,
    pass_announcement_end_at,
    qualification_submission_start_at,
    qualification_submission_end_at,
    display_order
) VALUES
(
    2026,
    'SQL 개발자',
    '제60회',
    NULL,
    NULL,
    '2026-02-02 00:00:00+09',
    '2026-02-06 23:59:59+09',
    '2026-02-20 00:00:00+09',
    '2026-02-20 23:59:59+09',
    '2026-03-07 00:00:00+09',
    '2026-03-07 23:59:59+09',
    '2026-03-20 00:00:00+09',
    '2026-03-24 23:59:59+09',
    '2026-03-27 00:00:00+09',
    '2026-03-27 23:59:59+09',
    60
),
(
    2026,
    'SQL 개발자',
    '제61회',
    NULL,
    NULL,
    '2026-04-27 00:00:00+09',
    '2026-05-01 23:59:59+09',
    '2026-05-15 00:00:00+09',
    '2026-05-15 23:59:59+09',
    '2026-05-31 00:00:00+09',
    '2026-05-31 23:59:59+09',
    '2026-06-12 00:00:00+09',
    '2026-06-16 23:59:59+09',
    '2026-06-19 00:00:00+09',
    '2026-06-19 23:59:59+09',
    61
),
(
    2026,
    'SQL 개발자',
    '제62회',
    NULL,
    NULL,
    '2026-07-20 00:00:00+09',
    '2026-07-24 23:59:59+09',
    '2026-08-07 00:00:00+09',
    '2026-08-07 23:59:59+09',
    '2026-08-22 00:00:00+09',
    '2026-08-22 23:59:59+09',
    '2026-09-04 00:00:00+09',
    '2026-09-08 23:59:59+09',
    '2026-09-11 00:00:00+09',
    '2026-09-11 23:59:59+09',
    62
),
(
    2026,
    'SQL 개발자',
    '제63회',
    NULL,
    NULL,
    '2026-10-12 00:00:00+09',
    '2026-10-16 23:59:59+09',
    '2026-10-30 00:00:00+09',
    '2026-10-30 23:59:59+09',
    '2026-11-14 00:00:00+09',
    '2026-11-14 23:59:59+09',
    '2026-11-27 00:00:00+09',
    '2026-12-01 23:59:59+09',
    '2026-12-04 00:00:00+09',
    '2026-12-04 23:59:59+09',
    63
)
ON CONFLICT (schedule_year, exam_type, round_label) DO UPDATE
SET
    application_start_at = EXCLUDED.application_start_at,
    application_end_at = EXCLUDED.application_end_at,
    ticket_start_at = EXCLUDED.ticket_start_at,
    ticket_end_at = EXCLUDED.ticket_end_at,
    exam_start_at = EXCLUDED.exam_start_at,
    exam_end_at = EXCLUDED.exam_end_at,
    score_open_start_at = EXCLUDED.score_open_start_at,
    score_open_end_at = EXCLUDED.score_open_end_at,
    pass_announcement_start_at = EXCLUDED.pass_announcement_start_at,
    pass_announcement_end_at = EXCLUDED.pass_announcement_end_at,
    qualification_submission_start_at = EXCLUDED.qualification_submission_start_at,
    qualification_submission_end_at = EXCLUDED.qualification_submission_end_at,
    display_order = EXCLUDED.display_order,
    updated_at = now();
