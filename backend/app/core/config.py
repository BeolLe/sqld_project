import os


class Settings:
    APP_NAME = "sqld-backend"
    APP_ENV = os.getenv("APP_ENV", "local")
    APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT = int(os.getenv("APP_PORT", "8000"))
    APP_PUBLIC_BASE_URL = os.getenv("APP_PUBLIC_BASE_URL", "").rstrip("/")

    ORACLE_USER = os.getenv("ORACLE_USER", "")
    ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD", "")
    ORACLE_DSN = os.getenv("ORACLE_DSN", "")
    ORACLE_WALLET_PATH = os.getenv("ORACLE_WALLET_PATH", "")
    ORACLE_WALLET_PASSWORD = os.getenv("ORACLE_WALLET_PASSWORD", "")

    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "")
    POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB = os.getenv("POSTGRES_DB", "")
    POSTGRES_USER = os.getenv("POSTGRES_USER", "")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_POOL_MIN_SIZE = int(os.getenv("POSTGRES_POOL_MIN_SIZE", "5"))
    POSTGRES_POOL_MAX_SIZE = int(os.getenv("POSTGRES_POOL_MAX_SIZE", "20"))

    DASHBOARD_SUMMARY_CACHE_TTL_SECONDS = int(
        os.getenv("DASHBOARD_SUMMARY_CACHE_TTL_SECONDS", "30")
    )
    AUTH_ME_CACHE_TTL_SECONDS = int(
        os.getenv("AUTH_ME_CACHE_TTL_SECONDS", "10")
    )
    CONTENT_LIST_CACHE_TTL_SECONDS = int(
        os.getenv("CONTENT_LIST_CACHE_TTL_SECONDS", "30")
    )

    AMPLITUDE_API_KEY = os.getenv("AMPLITUDE_API_KEY", "")
    AMPLITUDE_API_URL = os.getenv(
        "AMPLITUDE_API_URL",
        "https://api2.amplitude.com/2/httpapi",
    )

    SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
    FEEDBACK_SLACK_WEBHOOK_URL = os.getenv("FEEDBACK_SLACK_WEBHOOK_URL", "")

    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    MAIL_FROM = os.getenv("MAIL_FROM", "")
    FEEDBACK_ADMIN_USER_IDS = [
        user_id.strip()
        for user_id in os.getenv("FEEDBACK_ADMIN_USER_IDS", "").split(",")
        if user_id.strip()
    ]

    GOOGLE_OAUTH_CLIENT_ID = os.getenv("GOOGLE_OAUTH_CLIENT_ID", "")
    GOOGLE_OAUTH_CLIENT_SECRET = os.getenv("GOOGLE_OAUTH_CLIENT_SECRET", "")
    GOOGLE_OAUTH_REDIRECT_URI = os.getenv("GOOGLE_OAUTH_REDIRECT_URI", "")
    GOOGLE_OAUTH_STATE_TTL_SECONDS = int(
        os.getenv("GOOGLE_OAUTH_STATE_TTL_SECONDS", "600")
    )

    AUTH_COOKIE_NAME = os.getenv("AUTH_COOKIE_NAME", "solsqld_access_token")
    REFRESH_COOKIE_NAME = os.getenv("REFRESH_COOKIE_NAME", "solsqld_refresh_token")
    CSRF_COOKIE_NAME = os.getenv("CSRF_COOKIE_NAME", "solsqld_csrf_token")
    AUTH_COOKIE_SECURE = os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true"
    AUTH_COOKIE_SAMESITE = os.getenv("AUTH_COOKIE_SAMESITE", "lax")
    REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "1"))


settings = Settings()
