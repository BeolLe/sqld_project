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

    AMPLITUDE_API_KEY = os.getenv("AMPLITUDE_API_KEY", "")
    AMPLITUDE_API_URL = os.getenv(
        "AMPLITUDE_API_URL",
        "https://api2.amplitude.com/2/httpapi",
    )

    SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")

    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    MAIL_FROM = os.getenv("MAIL_FROM", "")


settings = Settings()
