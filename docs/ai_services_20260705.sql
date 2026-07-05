BEGIN;

CREATE SCHEMA IF NOT EXISTS ai;

CREATE TABLE IF NOT EXISTS ai.plans (
    plan_code TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai.provider_models (
    provider_model_id BIGSERIAL PRIMARY KEY,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'anthropic')),
    model_code TEXT NOT NULL,
    model_tier TEXT NOT NULL CHECK (model_tier IN ('standard', 'premium')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, model_code)
);

CREATE TABLE IF NOT EXISTS ai.model_routes (
    route_id BIGSERIAL PRIMARY KEY,
    plan_code TEXT NOT NULL REFERENCES ai.plans(plan_code),
    use_case TEXT NOT NULL CHECK (
        use_case IN ('explanation', 'sql_review', 'study_plan')
    ),
    provider_model_id BIGINT NOT NULL
        REFERENCES ai.provider_models(provider_model_id),
    daily_limit INTEGER NOT NULL CHECK (daily_limit >= 0),
    priority INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (plan_code, use_case, priority)
);

CREATE TABLE IF NOT EXISTS ai.user_entitlements (
    entitlement_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    plan_code TEXT NOT NULL REFERENCES ai.plans(plan_code),
    source_type TEXT NOT NULL DEFAULT 'manual' CHECK (
        source_type IN ('manual', 'payment', 'promotion')
    ),
    source_reference TEXT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (ends_at IS NULL OR ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS ix_ai_user_entitlements_active
    ON ai.user_entitlements (user_id, starts_at DESC, ends_at);

CREATE TABLE IF NOT EXISTS ai.prompt_templates (
    prompt_template_id BIGSERIAL PRIMARY KEY,
    use_case TEXT NOT NULL CHECK (
        use_case IN ('explanation', 'sql_review', 'study_plan')
    ),
    version INTEGER NOT NULL CHECK (version > 0),
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (use_case, version)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_prompt_templates_active
    ON ai.prompt_templates (use_case)
    WHERE is_active = true;

CREATE TABLE IF NOT EXISTS ai.requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    use_case TEXT NOT NULL CHECK (
        use_case IN ('explanation', 'sql_review', 'study_plan')
    ),
    source_type TEXT NULL CHECK (
        source_type IS NULL OR source_type IN ('exam', 'endless', 'sql', 'dashboard')
    ),
    source_id TEXT NULL,
    idempotency_key TEXT NULL,
    provider_model_id BIGINT NOT NULL REFERENCES ai.provider_models(provider_model_id),
    prompt_template_id BIGINT NULL REFERENCES ai.prompt_templates(prompt_template_id),
    model_tier TEXT NOT NULL CHECK (model_tier IN ('standard', 'premium')),
    status TEXT NOT NULL CHECK (
        status IN (
            'received', 'provider_requested', 'succeeded', 'cache_hit',
            'rejected', 'provider_failed', 'timed_out', 'cancelled'
        )
    ),
    cache_hit BOOLEAN NOT NULL DEFAULT false,
    input_tokens INTEGER NULL CHECK (input_tokens IS NULL OR input_tokens >= 0),
    output_tokens INTEGER NULL CHECK (output_tokens IS NULL OR output_tokens >= 0),
    provider_latency_ms INTEGER NULL CHECK (
        provider_latency_ms IS NULL OR provider_latency_ms >= 0
    ),
    total_latency_ms INTEGER NULL CHECK (
        total_latency_ms IS NULL OR total_latency_ms >= 0
    ),
    error_code TEXT NULL,
    error_detail TEXT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS ix_ai_requests_user_requested
    ON ai.requests (user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS ix_ai_requests_status_requested
    ON ai.requests (status, requested_at DESC);

CREATE TABLE IF NOT EXISTS ai.request_contents (
    request_id UUID PRIMARY KEY REFERENCES ai.requests(request_id) ON DELETE CASCADE,
    client_request JSONB NOT NULL,
    context_payload JSONB NOT NULL,
    provider_request JSONB NULL,
    provider_response JSONB NULL,
    response_text TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai.daily_usage (
    user_id UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    use_case TEXT NOT NULL CHECK (
        use_case IN ('explanation', 'sql_review', 'study_plan')
    ),
    usage_date DATE NOT NULL,
    daily_limit INTEGER NOT NULL CHECK (daily_limit >= 0),
    used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    reserved_count INTEGER NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, use_case, usage_date),
    CHECK (used_count + reserved_count <= daily_limit)
);

CREATE TABLE IF NOT EXISTS ai.usage_events (
    usage_event_id BIGSERIAL PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES ai.requests(request_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    use_case TEXT NOT NULL,
    usage_date DATE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('reserve', 'consume', 'refund')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (request_id, event_type)
);

CREATE TABLE IF NOT EXISTS ai.response_cache (
    cache_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL UNIQUE,
    cache_scope TEXT NOT NULL CHECK (cache_scope IN ('shared', 'user')),
    owner_user_id UUID NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    use_case TEXT NOT NULL,
    provider_model_id BIGINT NOT NULL REFERENCES ai.provider_models(provider_model_id),
    prompt_template_id BIGINT NULL REFERENCES ai.prompt_templates(prompt_template_id),
    context_hash TEXT NOT NULL,
    response_text TEXT NOT NULL,
    response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    hit_count BIGINT NOT NULL DEFAULT 0,
    last_hit_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    CHECK (
        (cache_scope = 'shared' AND owner_user_id IS NULL)
        OR (cache_scope = 'user' AND owner_user_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS ix_ai_response_cache_lookup
    ON ai.response_cache (cache_key, expires_at);

CREATE TABLE IF NOT EXISTS ai.feedback (
    feedback_id BIGSERIAL PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES ai.requests(request_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    helpful BOOLEAN NOT NULL,
    reason_code TEXT NULL CHECK (
        reason_code IS NULL OR reason_code IN (
            'incorrect', 'unclear', 'too_long', 'too_short', 'other'
        )
    ),
    comment TEXT NULL CHECK (comment IS NULL OR char_length(comment) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (request_id, user_id)
);

INSERT INTO ai.plans (plan_code, display_name, is_paid)
VALUES ('free', '무료', false), ('premium', '유료', true)
ON CONFLICT (plan_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_paid = EXCLUDED.is_paid,
    updated_at = now();

INSERT INTO ai.provider_models (provider, model_code, model_tier, is_active)
VALUES
    ('google', 'gemini-3.1-flash-lite', 'standard', true),
    ('anthropic', 'claude-haiku-4-5', 'premium', true)
ON CONFLICT (provider, model_code) DO UPDATE SET
    model_tier = EXCLUDED.model_tier,
    is_active = EXCLUDED.is_active,
    updated_at = now();

INSERT INTO ai.model_routes (
    plan_code, use_case, provider_model_id, daily_limit, priority
)
SELECT 'free', use_case, models.provider_model_id, 3, 100
FROM ai.provider_models AS models
CROSS JOIN (VALUES ('explanation'), ('sql_review'), ('study_plan')) AS cases(use_case)
WHERE models.provider = 'google'
  AND models.model_code = 'gemini-3.1-flash-lite'
ON CONFLICT (plan_code, use_case, priority) DO UPDATE SET
    provider_model_id = EXCLUDED.provider_model_id,
    daily_limit = EXCLUDED.daily_limit,
    is_active = true,
    updated_at = now();

INSERT INTO ai.model_routes (
    plan_code, use_case, provider_model_id, daily_limit, priority
)
SELECT 'premium', use_case, models.provider_model_id, 30, 100
FROM ai.provider_models AS models
CROSS JOIN (VALUES ('explanation'), ('sql_review'), ('study_plan')) AS cases(use_case)
WHERE models.provider = 'anthropic'
  AND models.model_code = 'claude-haiku-4-5'
ON CONFLICT (plan_code, use_case, priority) DO UPDATE SET
    provider_model_id = EXCLUDED.provider_model_id,
    daily_limit = EXCLUDED.daily_limit,
    is_active = true,
    updated_at = now();

COMMIT;
