UPDATE event.popup_campaigns
SET
    title = '제61회 SQLD 시험 후 설문 이벤트',
    phase_code = 'phase2',
    exposure_start_at = '2026-06-01 00:00:00+09',
    exposure_end_at = '2026-06-30 23:59:59+09',
    response_open_at = '2026-06-01 00:00:00+09',
    response_close_at = '2026-06-30 23:59:59+09',
    eligibility_rule = '{"requires_campaign_key": "sqld_61_phase1"}'::jsonb,
    form_schema = '{
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
    is_active = true,
    updated_at = now()
WHERE campaign_key = 'sqld_61_phase2';
