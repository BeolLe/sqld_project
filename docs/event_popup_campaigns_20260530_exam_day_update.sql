ALTER TABLE event.popup_campaigns
DROP CONSTRAINT IF EXISTS popup_campaigns_phase_code_check;

ALTER TABLE event.popup_campaigns
ADD CONSTRAINT popup_campaigns_phase_code_check
CHECK (phase_code IN ('phase1', 'phase2', 'cheer'));

UPDATE event.popup_campaigns
SET
    title = '제61회 SQLD 시험 응원 팝업',
    phase_code = 'cheer',
    exposure_start_at = '2026-05-31 00:00:00+09',
    exposure_end_at = '2026-05-31 10:00:00+09',
    response_open_at = '2026-05-31 00:00:00+09',
    response_close_at = '2026-05-31 10:00:00+09',
    eligibility_rule = '{}'::jsonb,
    form_schema = '{}'::jsonb,
    is_active = true,
    updated_at = now()
WHERE campaign_key = 'sqld_61_phase1';
