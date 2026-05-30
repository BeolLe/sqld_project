ALTER TABLE event.popup_campaigns
DROP CONSTRAINT IF EXISTS popup_campaigns_phase_code_check;

ALTER TABLE event.popup_campaigns
ADD CONSTRAINT popup_campaigns_phase_code_check
CHECK (phase_code IN ('phase1', 'phase2', 'cheer'));

UPDATE event.popup_campaigns
SET
    title = '제61회 SQLD 시험 전 설문 이벤트',
    phase_code = 'phase1',
    exposure_start_at = '2026-05-23 00:00:00+09',
    exposure_end_at = '2026-05-30 23:59:59+09',
    response_open_at = '2026-05-23 00:00:00+09',
    response_close_at = '2026-05-30 23:59:59+09',
    eligibility_rule = '{"min_points": 100, "recent_signup_after": "2026-05-16T00:00:00+09:00", "recent_signup_min_points": 10}'::jsonb,
    form_schema = '{
      "modalType": "sqld_phase1",
      "fields": [
        {"key": "will_take_exam", "label": "61회차 SQLD 시험에 응시하실 예정인가요?", "type": "boolean", "required": true},
        {"key": "phone_number", "label": "전화번호", "type": "phone", "required": true},
        {"key": "phone_consent_agreed", "label": "개인정보 수집 및 이용에 동의합니다.", "type": "boolean", "required": true},
        {"key": "notice", "type": "text", "value": "시험 종료 후 일주일 뒤 기프티콘 안내가 갈 수 있습니다."}
      ]
    }'::jsonb,
    is_active = true,
    updated_at = now()
WHERE campaign_key = 'sqld_61_phase1';

INSERT INTO event.popup_campaigns (
    campaign_key,
    title,
    phase_code,
    exposure_start_at,
    exposure_end_at,
    response_open_at,
    response_close_at,
    eligibility_rule,
    form_schema,
    is_active
) VALUES (
    'sqld_61_exam_day_cheer',
    '제61회 SQLD 시험 응원 팝업',
    'cheer',
    '2026-05-31 00:00:00+09',
    '2026-05-31 10:00:00+09',
    '2026-05-31 00:00:00+09',
    '2026-05-31 10:00:00+09',
    '{}'::jsonb,
    '{}'::jsonb,
    true
)
ON CONFLICT (campaign_key) DO UPDATE
SET
    title = EXCLUDED.title,
    phase_code = EXCLUDED.phase_code,
    exposure_start_at = EXCLUDED.exposure_start_at,
    exposure_end_at = EXCLUDED.exposure_end_at,
    response_open_at = EXCLUDED.response_open_at,
    response_close_at = EXCLUDED.response_close_at,
    eligibility_rule = EXCLUDED.eligibility_rule,
    form_schema = EXCLUDED.form_schema,
    is_active = EXCLUDED.is_active,
    updated_at = now();
