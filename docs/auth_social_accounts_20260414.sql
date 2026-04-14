CREATE TABLE IF NOT EXISTS auth.social_accounts (
    social_account_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    provider_email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT social_accounts_provider_user_key UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id
    ON auth.social_accounts (user_id);

CREATE INDEX IF NOT EXISTS idx_social_accounts_provider_email
    ON auth.social_accounts (provider, provider_email);

COMMENT ON TABLE auth.social_accounts IS
'Google, Kakao, Naver 등 소셜 로그인 계정과 auth.users를 매핑하는 테이블';
