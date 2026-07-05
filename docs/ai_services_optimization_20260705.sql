BEGIN;

ALTER TABLE ai.model_routes
    ADD COLUMN IF NOT EXISTS input_token_limit INTEGER NOT NULL DEFAULT 6000,
    ADD COLUMN IF NOT EXISTS max_output_tokens INTEGER NOT NULL DEFAULT 900,
    ADD COLUMN IF NOT EXISTS provider_cache_enabled BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE ai.requests
    ADD COLUMN IF NOT EXISTS cache_creation_input_tokens INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cache_read_input_tokens INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS first_token_latency_ms INTEGER NULL,
    ADD COLUMN IF NOT EXISTS stop_reason TEXT NULL,
    ADD COLUMN IF NOT EXISTS quota_exempt BOOLEAN NOT NULL DEFAULT false;

UPDATE ai.model_routes
SET input_token_limit = CASE WHEN use_case = 'sql_review' THEN 8000 ELSE 6000 END,
    max_output_tokens = CASE
        WHEN plan_code = 'premium' AND use_case = 'explanation' THEN 1200
        WHEN plan_code = 'premium' AND use_case = 'sql_review' THEN 1600
        WHEN plan_code = 'premium' AND use_case = 'study_plan' THEN 1200
        WHEN use_case = 'sql_review' THEN 1100
        ELSE 900
    END,
    provider_cache_enabled = (plan_code <> 'premium'),
    updated_at = now();

COMMIT;
