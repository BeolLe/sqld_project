from datetime import datetime, timedelta, timezone
import os
import secrets

import jwt
from jwt import InvalidTokenError
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

# 운영 부하를 감안해 Argon2 비용을 한 단계 완화합니다.
# 기존 해시는 verify_and_update()로 점진적으로 새 파라미터로 재해시합니다.
password_hash = PasswordHash(
    (
        Argon2Hasher(
            time_cost=3,
            memory_cost=32768,
            parallelism=2,
        ),
    )
)

def _load_jwt_secret(name: str, *, local_fallback: str | None = None) -> str:
    value = os.getenv(name, "").strip()
    if value:
        return value

    app_env = os.getenv("APP_ENV", "local").strip().lower()
    if app_env in {"local", "test", "development"}:
        return local_fallback or secrets.token_urlsafe(48)

    raise RuntimeError(f"{name} must be configured through a secret")


JWT_SECRET_KEY = _load_jwt_secret("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)
JWT_REFRESH_SECRET_KEY = _load_jwt_secret(
    "JWT_REFRESH_SECRET_KEY",
    local_fallback=JWT_SECRET_KEY,
)
JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(
    os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "1")
)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def verify_and_update_password(password: str, hashed_password: str) -> tuple[bool, str | None]:
    return password_hash.verify_and_update(password, hashed_password)


def create_access_token(
    user_id: str,
    email: str,
    nickname: str,
    auth_provider: str = "local",
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "email": email,
        "nickname": nickname,
        "auth_provider": auth_provider,
        "typ": "access",
        "exp": expire,
    }

    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def decode_access_token(token: str) -> dict:
    payload = jwt.decode(
        token,
        JWT_SECRET_KEY,
        algorithms=[JWT_ALGORITHM],
    )
    token_type = payload.get("typ")
    if token_type not in (None, "access"):
        raise InvalidTokenError("invalid token type")
    return payload


def create_refresh_token(user_id: str, auth_provider: str = "local") -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=JWT_REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload = {
        "sub": user_id,
        "auth_provider": auth_provider,
        "typ": "refresh",
        "exp": expire,
    }
    return jwt.encode(payload, JWT_REFRESH_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_refresh_token(token: str) -> dict:
    payload = jwt.decode(
        token,
        JWT_REFRESH_SECRET_KEY,
        algorithms=[JWT_ALGORITHM],
    )
    if payload.get("typ") != "refresh":
        raise InvalidTokenError("invalid token type")
    return payload
