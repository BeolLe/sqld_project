import os


class Settings:
    APP_NAME = "sqld-backend"
    APP_ENV = os.getenv("APP_ENV", "local")
    APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT = int(os.getenv("APP_PORT", "8000"))

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


settings = Settings()
