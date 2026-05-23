CREATE SCHEMA IF NOT EXISTS event;

CREATE TABLE IF NOT EXISTS event.popup_campaigns (
    campaign_id BIGSERIAL PRIMARY KEY,
    campaign_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    phase_code TEXT NOT NULL,
    exposure_start_at TIMESTAMPTZ NOT NULL,
    exposure_end_at TIMESTAMPTZ NOT NULL,
    response_open_at TIMESTAMPTZ NOT NULL,
    response_close_at TIMESTAMPTZ NOT NULL,
    eligibility_rule JSONB NOT NULL DEFAULT '{}'::jsonb,
    form_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT popup_campaigns_phase_code_check
        CHECK (phase_code IN ('phase1', 'phase2')),
    CONSTRAINT popup_campaigns_exposure_window_check
        CHECK (exposure_start_at <= exposure_end_at),
    CONSTRAINT popup_campaigns_response_window_check
        CHECK (response_open_at <= response_close_at)
);

CREATE TABLE IF NOT EXISTS event.popup_campaign_responses (
    response_id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES event.popup_campaigns(campaign_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    phone_number TEXT NULL,
    phone_consent_agreed BOOLEAN NOT NULL DEFAULT false,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT popup_campaign_responses_campaign_user_unique UNIQUE (campaign_id, user_id)
);

CREATE TABLE IF NOT EXISTS event.popup_campaign_views (
    view_id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES event.popup_campaigns(campaign_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    hidden_until TIMESTAMPTZ NULL,
    last_seen_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT popup_campaign_views_campaign_user_unique UNIQUE (campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_popup_campaigns_active_window
    ON event.popup_campaigns (is_active, exposure_start_at, exposure_end_at);

CREATE INDEX IF NOT EXISTS idx_popup_campaign_responses_campaign_id
    ON event.popup_campaign_responses (campaign_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_popup_campaign_responses_user_id
    ON event.popup_campaign_responses (user_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_popup_campaign_views_campaign_id
    ON event.popup_campaign_views (campaign_id, updated_at DESC);

CREATE OR REPLACE FUNCTION event.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_popup_campaigns_updated_at ON event.popup_campaigns;
CREATE TRIGGER trg_popup_campaigns_updated_at
BEFORE UPDATE ON event.popup_campaigns
FOR EACH ROW
EXECUTE FUNCTION event.set_updated_at();

DROP TRIGGER IF EXISTS trg_popup_campaign_responses_updated_at ON event.popup_campaign_responses;
CREATE TRIGGER trg_popup_campaign_responses_updated_at
BEFORE UPDATE ON event.popup_campaign_responses
FOR EACH ROW
EXECUTE FUNCTION event.set_updated_at();

DROP TRIGGER IF EXISTS trg_popup_campaign_views_updated_at ON event.popup_campaign_views;
CREATE TRIGGER trg_popup_campaign_views_updated_at
BEFORE UPDATE ON event.popup_campaign_views
FOR EACH ROW
EXECUTE FUNCTION event.set_updated_at();

COMMENT ON TABLE event.popup_campaigns IS
'SQLD 이벤트 모달 캠페인 정의';

COMMENT ON TABLE event.popup_campaign_responses IS
'SQLD 이벤트 모달 사용자 응답';

COMMENT ON TABLE event.popup_campaign_views IS
'오늘 하루 안 보기 등 사용자별 모달 노출 상태';

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
) VALUES
(
    'sqld_61_phase1',
    '제61회 SQLD 시험 전 설문 이벤트',
    'phase1',
    '2026-05-23 00:00:00+09',
    '2026-05-30 23:59:59+09',
    '2026-05-23 00:00:00+09',
    '2026-05-30 23:59:59+09',
    '{"min_points": 100, "recent_signup_after": "2026-05-16T00:00:00+09:00", "recent_signup_min_points": 10}'::jsonb,
    '{
      "modalType": "sqld_phase1",
      "fields": [
        {"key": "will_take_exam", "label": "61회차 SQLD 시험에 응시하실 예정인가요?", "type": "boolean", "required": true},
        {"key": "phone_number", "label": "전화번호", "type": "phone", "required": true},
        {"key": "phone_consent_agreed", "label": "개인정보 수집 및 이용에 동의합니다.", "type": "boolean", "required": true},
        {"key": "notice", "type": "text", "value": "시험 종료 후 일주일 뒤 기프티콘 안내가 갈 수 있습니다."}
      ]
    }'::jsonb,
    true
),
(
    'sqld_61_phase2',
    '제61회 SQLD 시험 후 설문 이벤트',
    'phase2',
    '2026-05-31 00:00:00+09',
    '2026-06-30 23:59:59+09',
    '2026-05-31 00:00:00+09',
    '2026-06-30 23:59:59+09',
    '{"requires_campaign_key": "sqld_61_phase1"}'::jsonb,
    '{
      "modalType": "sqld_phase2",
      "fields": [
        {"key": "took_exam", "label": "61회차 SQLD 시험에 응시하셨나요?", "type": "boolean", "required": true},
        {"key": "felt_improvement", "label": "성적 향상이 있었다고 느끼셨나요?", "type": "boolean", "required": true},
        {"key": "passed_exam", "label": "합격하셨나요?", "type": "boolean", "required": true},
        {"key": "phone_number", "label": "전화번호", "type": "phone", "required": true},
        {"key": "phone_consent_agreed", "label": "개인정보 수집 및 이용에 동의합니다.", "type": "boolean", "required": true},
        {"key": "notice", "type": "text", "value": "시험 종료 후 일주일 뒤 기프티콘 안내가 갈 수 있습니다."}
      ]
    }'::jsonb,
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
