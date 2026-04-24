from datetime import datetime, timedelta, timezone
import hashlib
import json
import logging
import secrets
from threading import Lock
from time import monotonic, time
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.request import Request as UrlRequest, urlopen

import jwt
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from jwt import ExpiredSignatureError, InvalidTokenError

from app.core.config import settings
from app.db.logs import ensure_request_id, insert_auth_event, submit_auth_event
from app.db.postgres import get_connection
from app.core.security import (
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
    hash_password,
    verify_password,
    verify_and_update_password,
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
)
from app.services.amplitude import send_amplitude_event, submit_amplitude_event
from app.services.mailer import send_email

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = logging.getLogger(__name__)
_me_cache_lock = Lock()
_me_cache: dict[str, tuple[float, dict]] = {}
_google_oidc_config_lock = Lock()
_google_oidc_config_cache: tuple[float, dict] | None = None
_google_jwk_client_lock = Lock()
_google_jwk_client: jwt.PyJWKClient | None = None
_google_jwk_client_uri: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    nickname: str
    password: str
    terms_agreed: bool
    privacy_agreed: bool
    signup_purpose_code: int | None = None
    signup_purpose_other: str | None = None


class SocialSignupCompleteRequest(BaseModel):
    social_signup_token: str
    nickname: str | None = None
    terms_agreed: bool
    privacy_agreed: bool
    signup_purpose_code: int | None = None
    signup_purpose_other: str | None = None


class NicknameUpdateRequest(BaseModel):
    nickname: str


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str | None = None
    social_delete_token: str | None = None


class EmailVerificationConfirmRequest(BaseModel):
    token: str


class FindEmailRequest(BaseModel):
    nickname: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str


class AdminUserRoleUpdateRequest(BaseModel):
    is_admin: bool


def extract_email_domain(email: str) -> str:
    return email.split("@", 1)[1].lower() if "@" in email else ""


def normalize_signup_purpose(
    signup_purpose_code: int | None,
    signup_purpose_other: str | None,
) -> tuple[int | None, str | None]:
    if signup_purpose_code is None:
        return None, None

    if signup_purpose_code not in {1, 2, 3, 4}:
        raise HTTPException(status_code=400, detail="signup purpose code is invalid")

    normalized_other = (signup_purpose_other or "").strip()
    if signup_purpose_code == 4:
        if not normalized_other:
            raise HTTPException(status_code=400, detail="signup purpose other is required")
        return signup_purpose_code, normalized_other

    return signup_purpose_code, None


def set_auth_cookie(response: Response, access_token: str) -> None:
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=60 * 60,
        path="/",
    )


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE_DAYS,
        path="/",
    )


def set_csrf_cookie(response: Response, csrf_token: str) -> None:
    response.set_cookie(
        key=settings.CSRF_COOKIE_NAME,
        value=csrf_token,
        httponly=False,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE_DAYS,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/",
    )
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/",
    )
    response.delete_cookie(
        key=settings.CSRF_COOKIE_NAME,
        httponly=False,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/",
    )


def issue_auth_cookies(
    response: Response,
    *,
    access_token: str,
    refresh_token: str,
    csrf_token: str | None = None,
) -> str:
    resolved_csrf_token = csrf_token or secrets.token_urlsafe(32)
    set_auth_cookie(response, access_token)
    set_refresh_cookie(response, refresh_token)
    set_csrf_cookie(response, resolved_csrf_token)
    return resolved_csrf_token


def extract_access_token_from_request(request: Request) -> str | None:
    authorization = request.headers.get("authorization")
    if authorization and authorization.lower().startswith("bearer "):
        return authorization.split(" ", 1)[1]

    cookie_token = request.cookies.get(settings.AUTH_COOKIE_NAME)
    if cookie_token:
        return cookie_token

    return None


def extract_refresh_token_from_request(request: Request) -> str | None:
    return request.cookies.get(settings.REFRESH_COOKIE_NAME)


def build_allowed_origin(request: Request) -> str:
    frontend_base_url = get_frontend_base_url(request)
    parsed = urlsplit(frontend_base_url)
    return urlunsplit((parsed.scheme, parsed.netloc, "", "", "")).rstrip("/")


def validate_csrf_request(request: Request) -> None:
    if request.method in {"GET", "HEAD", "OPTIONS"} or not request.url.path.startswith("/api/"):
        return

    csrf_exempt_paths = {
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/social/register",
        "/api/auth/find-email",
        "/api/auth/password-reset/request",
        "/api/auth/password-reset/confirm",
        "/api/auth/google/callback",
    }
    if request.url.path in csrf_exempt_paths:
        return

    allowed_origin = build_allowed_origin(request)
    origin = request.headers.get("origin")
    referer = request.headers.get("referer")
    request_origin = origin
    if not request_origin and referer:
        parsed_referer = urlsplit(referer)
        request_origin = urlunsplit(
            (parsed_referer.scheme, parsed_referer.netloc, "", "", "")
        ).rstrip("/")

    if request_origin != allowed_origin:
        raise HTTPException(status_code=403, detail="invalid request origin")

    csrf_cookie = request.cookies.get(settings.CSRF_COOKIE_NAME)
    csrf_header = request.headers.get("x-csrf-token")
    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise HTTPException(status_code=403, detail="csrf token validation failed")


def normalize_next_path(next_path: str | None) -> str:
    if not next_path:
        return "/"

    parsed = urlsplit(next_path)
    if parsed.scheme or parsed.netloc:
        return "/"

    normalized_path = parsed.path if parsed.path.startswith("/") else "/"
    return urlunsplit(("", "", normalized_path, parsed.query, ""))


def get_frontend_base_url(request: Request) -> str:
    return settings.APP_PUBLIC_BASE_URL or str(request.base_url).rstrip("/")


def build_frontend_redirect_url(
    request: Request,
    next_path: str,
    params: dict[str, str | None],
) -> str:
    base_url = get_frontend_base_url(request)
    target = urlsplit(f"{base_url}{normalize_next_path(next_path)}")
    merged_query = dict(parse_qsl(target.query, keep_blank_values=True))
    for key, value in params.items():
        if value is None:
            continue
        merged_query[key] = value
    return urlunsplit(
        (target.scheme, target.netloc, target.path, urlencode(merged_query), target.fragment)
    )


def require_google_oauth_settings() -> None:
    missing = [
        key
        for key, value in {
            "GOOGLE_OAUTH_CLIENT_ID": settings.GOOGLE_OAUTH_CLIENT_ID,
            "GOOGLE_OAUTH_CLIENT_SECRET": settings.GOOGLE_OAUTH_CLIENT_SECRET,
            "GOOGLE_OAUTH_REDIRECT_URI": settings.GOOGLE_OAUTH_REDIRECT_URI,
        }.items()
        if not value
    ]
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"missing google oauth settings: {', '.join(missing)}",
        )


def create_google_oauth_state(next_path: str) -> str:
    now = int(time())
    payload = {
        "flow": "google_oauth",
        "next": normalize_next_path(next_path),
        "nonce": secrets.token_urlsafe(24),
        "iat": now,
        "exp": now + settings.GOOGLE_OAUTH_STATE_TTL_SECONDS,
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_google_account_delete_state(*, user_id: str, next_path: str) -> str:
    now = int(time())
    payload = {
        "flow": "google_account_delete",
        "user_id": user_id,
        "next": normalize_next_path(next_path),
        "nonce": secrets.token_urlsafe(24),
        "iat": now,
        "exp": now + settings.GOOGLE_OAUTH_STATE_TTL_SECONDS,
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_social_signup_token(
    *,
    provider: str,
    provider_user_id: str,
    email: str,
    nickname: str,
    next_path: str,
) -> str:
    now = int(time())
    payload = {
        "flow": "social_signup",
        "provider": provider,
        "provider_user_id": provider_user_id,
        "email": email,
        "nickname": nickname,
        "next": normalize_next_path(next_path),
        "iat": now,
        "exp": now + 60 * 15,
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_google_state_token(state_token: str) -> dict:
    try:
        payload = jwt.decode(
            state_token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
    except ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="google login state expired")
    except InvalidTokenError:
        raise HTTPException(status_code=400, detail="google login state is invalid")

    if payload.get("flow") not in {"google_oauth", "google_account_delete"}:
        raise HTTPException(status_code=400, detail="google login state is invalid")

    return payload


def decode_google_oauth_state(state_token: str) -> dict:
    payload = decode_google_state_token(state_token)
    if payload.get("flow") != "google_oauth":
        raise HTTPException(status_code=400, detail="google login state is invalid")
    return payload


def decode_social_signup_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
    except ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="social signup token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=400, detail="social signup token is invalid")

    if payload.get("flow") != "social_signup":
        raise HTTPException(status_code=400, detail="social signup token is invalid")

    return payload


def create_account_delete_token(*, user_id: str, provider: str) -> str:
    now = int(time())
    payload = {
        "flow": "account_delete",
        "sub": user_id,
        "provider": provider,
        "iat": now,
        "exp": now + 60 * 10,
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_account_delete_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
    except ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="account delete token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=400, detail="account delete token is invalid")

    if payload.get("flow") != "account_delete":
        raise HTTPException(status_code=400, detail="account delete token is invalid")

    return payload


def fetch_google_oidc_config() -> dict:
    global _google_oidc_config_cache
    with _google_oidc_config_lock:
        if _google_oidc_config_cache and (time() - _google_oidc_config_cache[0] < 3600):
            return _google_oidc_config_cache[1]

        with urlopen("https://accounts.google.com/.well-known/openid-configuration") as response:
            payload = json.loads(response.read().decode("utf-8"))
        _google_oidc_config_cache = (time(), payload)
        return payload


def get_google_jwk_client() -> jwt.PyJWKClient:
    global _google_jwk_client, _google_jwk_client_uri
    oidc_config = fetch_google_oidc_config()
    jwks_uri = oidc_config["jwks_uri"]
    with _google_jwk_client_lock:
        if _google_jwk_client is None or _google_jwk_client_uri != jwks_uri:
            _google_jwk_client = jwt.PyJWKClient(jwks_uri)
            _google_jwk_client_uri = jwks_uri
        return _google_jwk_client


def exchange_google_code_for_tokens(code: str) -> dict:
    oidc_config = fetch_google_oidc_config()
    request_body = urlencode(
        {
            "code": code,
            "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
            "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
    ).encode("utf-8")
    token_request = UrlRequest(
        oidc_config["token_endpoint"],
        data=request_body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with urlopen(token_request) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise HTTPException(status_code=400, detail=f"google token exchange failed: {detail}")
    except URLError as exc:
        raise HTTPException(status_code=502, detail=f"google token exchange failed: {exc.reason}")


def verify_google_id_token(id_token: str, nonce: str) -> dict:
    try:
        signing_key = get_google_jwk_client().get_signing_key_from_jwt(id_token)
        claims = jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.GOOGLE_OAUTH_CLIENT_ID,
            options={"require": ["exp", "iat", "sub"]},
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"google id token is invalid: {exc}")

    if claims.get("iss") not in {"https://accounts.google.com", "accounts.google.com"}:
        raise HTTPException(status_code=400, detail="google id token issuer is invalid")
    if claims.get("nonce") != nonce:
        raise HTTPException(status_code=400, detail="google login nonce is invalid")
    if not claims.get("email"):
        raise HTTPException(status_code=400, detail="google account email is missing")
    if not claims.get("email_verified"):
        raise HTTPException(status_code=400, detail="google account email is not verified")

    return claims


def upsert_social_account(
    *,
    cur,
    user_id: str,
    provider: str,
    provider_user_id: str,
    provider_email: str,
    provider_email_verified: bool,
) -> None:
    cur.execute(
        """
        INSERT INTO auth.social_accounts (
            user_id,
            provider,
            provider_user_id,
            provider_email,
            provider_email_verified,
            last_login_at
        )
        VALUES (%s, %s, %s, %s, %s, now())
        ON CONFLICT (provider, provider_user_id)
        DO UPDATE SET
            user_id = EXCLUDED.user_id,
            provider_email = EXCLUDED.provider_email,
            provider_email_verified = EXCLUDED.provider_email_verified,
            last_login_at = EXCLUDED.last_login_at,
            updated_at = now()
        """,
        (
            user_id,
            provider,
            provider_user_id,
            provider_email,
            provider_email_verified,
        ),
    )


def create_social_user(
    *,
    cur,
    email: str,
    nickname: str,
    signup_purpose_code: int | None,
    signup_purpose_other: str | None,
) -> tuple:
    random_password_hash = hash_password(secrets.token_urlsafe(32))
    cur.execute(
        """
        WITH latest_consents AS (
            SELECT
                MAX(version) FILTER (WHERE consent_type = 'terms') AS terms_version,
                MAX(version) FILTER (WHERE consent_type = 'privacy_policy') AS privacy_version
            FROM auth.consent_versions
            WHERE is_active = true
        )
        INSERT INTO auth.users (
            email,
            nickname,
            password_hash,
            terms_agreed,
            privacy_policy_agreed,
            signup_purpose_code,
            signup_purpose_other,
            terms_version,
            privacy_policy_version,
            email_verified,
            email_verified_at
        )
        SELECT
            %s,
            %s,
            %s,
            true,
            true,
            %s,
            %s,
            COALESCE(latest_consents.terms_version, '2026-04-03'),
            COALESCE(latest_consents.privacy_version, '2026-04-03'),
            true,
            now()
        FROM latest_consents
        RETURNING user_id, email, nickname, is_active
        """,
        (
            email,
            nickname,
            random_password_hash,
            signup_purpose_code,
            signup_purpose_other,
        ),
    )
    user = cur.fetchone()

    cur.execute(
        """
        INSERT INTO auth.user_consents (
            user_id,
            consent_version_id,
            agreed,
            consented_at
        )
        SELECT
            %s,
            cv.id,
            true,
            now()
        FROM auth.consent_versions cv
        WHERE cv.is_active = true
          AND cv.consent_type IN ('terms', 'privacy_policy')
        ON CONFLICT (user_id, consent_version_id) DO NOTHING
        """,
        (user[0],),
    )

    cur.execute(
        """
        INSERT INTO dashboard.user_stats (user_id)
        VALUES (%s)
        ON CONFLICT (user_id) DO NOTHING
        """,
        (user[0],),
    )
    return user


def get_current_user(request: Request):
    token = extract_access_token_from_request(request)
    if not token:
        raise HTTPException(status_code=401, detail="missing access token")

    try:
        payload = decode_access_token(token)
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="invalid token")

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(status_code=401, detail="invalid token payload")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT user_id, email, nickname, is_active, email_verified, email_verified_at, is_admin
                FROM auth.users
                WHERE user_id = %s
                """,
                (user_id,),
            )
            user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="invalid token payload")

    if not user[3]:
        raise HTTPException(status_code=403, detail="deactivated account")

    return {
        "user_id": str(user[0]),
        "email": user[1],
        "nickname": user[2],
        "email_verified": bool(user[4]),
        "email_verified_at": user[5].isoformat() if user[5] else None,
        "is_admin": bool(user[6]),
        "auth_provider": payload.get("auth_provider") or "local",
    }


def ensure_admin(current_user: dict) -> None:
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="admin access required")


def hash_verification_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_email_verification(
    *,
    cur,
    user_id: str,
    email: str,
    purpose: str = "signup_verify",
) -> tuple[str, datetime]:
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_verification_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

    cur.execute(
        """
        UPDATE auth.email_verifications
        SET used_at = now()
        WHERE user_id = %s
          AND email = %s
          AND purpose = %s
          AND used_at IS NULL
        """,
        (user_id, email, purpose),
    )
    cur.execute(
        """
        INSERT INTO auth.email_verifications (
            user_id,
            email,
            purpose,
            token_hash,
            expires_at
        )
        VALUES (%s, %s, %s, %s, %s)
        """,
        (user_id, email, purpose, token_hash, expires_at),
    )
    return raw_token, expires_at


def build_verification_url(token: str) -> str | None:
    if not settings.APP_PUBLIC_BASE_URL:
        return None
    return f"{settings.APP_PUBLIC_BASE_URL}/mypage?verifyToken={token}"


def mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    if not local or not domain:
        return email

    if len(local) <= 2:
        masked_local = local[0] + "*"
    else:
        masked_local = local[0] + ("*" * (len(local) - 2)) + local[-1]

    domain_name, dot, domain_suffix = domain.partition(".")
    if not domain_name:
        return f"{masked_local}@{domain}"

    if len(domain_name) <= 2:
        masked_domain = domain_name[0] + "*"
    else:
        masked_domain = domain_name[0] + ("*" * (len(domain_name) - 2)) + domain_name[-1]

    return f"{masked_local}@{masked_domain}{dot}{domain_suffix}" if dot else f"{masked_local}@{masked_domain}"


def create_password_reset_token(*, cur, user_id: str, email: str) -> tuple[str, datetime]:
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_verification_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    cur.execute(
        """
        UPDATE auth.email_verifications
        SET used_at = now()
        WHERE user_id = %s
          AND email = %s
          AND purpose = 'reset_password'
          AND used_at IS NULL
        """,
        (user_id, email),
    )
    cur.execute(
        """
        INSERT INTO auth.email_verifications (
            user_id,
            email,
            purpose,
            token_hash,
            expires_at
        )
        VALUES (%s, %s, 'reset_password', %s, %s)
        """,
        (user_id, email, token_hash, expires_at),
    )
    return raw_token, expires_at


@router.post("/register")
def register(req: RegisterRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    session_id = request.headers.get("x-session-id")

    if not req.terms_agreed:
        send_amplitude_event(
            event_type="backend_auth_signup_failed",
            event_properties={
                "failure_code": "terms_required",
                "email_domain": extract_email_domain(req.email),
            },
            insert_id=request_id,
        )
        insert_auth_event(
            event_type="signup_failed",
            success=False,
            email=req.email,
            session_id=session_id,
            request_id=request_id,
            page_path=str(request.url.path),
            failure_code="terms_required",
            failure_message="terms agreement is required",
        )
        raise HTTPException(status_code=400, detail="terms agreement is required")

    if not req.privacy_agreed:
        send_amplitude_event(
            event_type="backend_auth_signup_failed",
            event_properties={
                "failure_code": "privacy_required",
                "email_domain": extract_email_domain(req.email),
            },
            insert_id=request_id,
        )
        insert_auth_event(
            event_type="signup_failed",
            success=False,
            email=req.email,
            session_id=session_id,
            request_id=request_id,
            page_path=str(request.url.path),
            failure_code="privacy_required",
            failure_message="privacy agreement is required",
        )
        raise HTTPException(status_code=400, detail="privacy agreement is required")

    signup_purpose_code, signup_purpose_other = normalize_signup_purpose(
        req.signup_purpose_code,
        req.signup_purpose_other,
    )
    hashed_password = hash_password(req.password)

    verification_token: str | None = None
    verification_url: str | None = None
    verification_email_sent = False

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    WITH latest_consents AS (
                        SELECT
                            MAX(version) FILTER (WHERE consent_type = 'terms') AS terms_version,
                            MAX(version) FILTER (WHERE consent_type = 'privacy_policy') AS privacy_version
                        FROM auth.consent_versions
                        WHERE is_active = true
                    )
                    INSERT INTO auth.users (
                        email,
                        nickname,
                        password_hash,
                        terms_agreed,
                        privacy_policy_agreed,
                        signup_purpose_code,
                        signup_purpose_other,
                        terms_version,
                        privacy_policy_version
                    )
                    SELECT
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        COALESCE(latest_consents.terms_version, '2026-04-03'),
                        COALESCE(latest_consents.privacy_version, '2026-04-03')
                    FROM latest_consents
                    RETURNING user_id, email, nickname, created_at
                    """,
                    (
                        req.email,
                        req.nickname,
                        hashed_password,
                        req.terms_agreed,
                        req.privacy_agreed,
                        signup_purpose_code,
                        signup_purpose_other,
                    ),
                )
                user = cur.fetchone()

                cur.execute(
                    """
                    INSERT INTO auth.user_consents (
                        user_id,
                        consent_version_id,
                        agreed,
                        consented_at
                    )
                    SELECT
                        %s,
                        cv.id,
                        true,
                        COALESCE(%s::timestamptz, now())
                    FROM auth.consent_versions cv
                    WHERE cv.is_active = true
                      AND cv.consent_type IN ('terms', 'privacy_policy')
                    ON CONFLICT (user_id, consent_version_id) DO NOTHING
                    """,
                    (user[0], user[3]),
                )

                cur.execute(
                    """
                    INSERT INTO dashboard.user_stats (user_id)
                    VALUES (%s)
                    ON CONFLICT (user_id) DO NOTHING
                    """,
                    (user[0],),
                )
                verification_token, _ = create_email_verification(
                    cur=cur,
                    user_id=str(user[0]),
                    email=user[1],
                )
                verification_url = build_verification_url(verification_token)
    except Exception as e:
        send_amplitude_event(
            event_type="backend_auth_signup_failed",
            event_properties={
                "failure_code": "signup_failed",
                "email_domain": extract_email_domain(req.email),
            },
            insert_id=request_id,
        )
        insert_auth_event(
            event_type="signup_failed",
            success=False,
            email=req.email,
            session_id=session_id,
            request_id=request_id,
            page_path=str(request.url.path),
            failure_code="signup_failed",
            failure_message=str(e),
            metadata={
                "nickname": req.nickname,
                "signup_purpose_code": req.signup_purpose_code,
            },
        )
        raise HTTPException(status_code=400, detail=str(e))

    send_amplitude_event(
        event_type="backend_auth_signup_succeeded",
        user_id=str(user[0]),
        event_properties={
            "email_domain": extract_email_domain(user[1]),
            "nickname_present": bool(user[2]),
            "signup_purpose_code": signup_purpose_code,
        },
        user_properties={
            "email": user[1],
            "nickname": user[2],
        },
        insert_id=request_id,
    )
    insert_auth_event(
        event_type="signup_succeeded",
        success=True,
        email=user[1],
        user_id=str(user[0]),
        session_id=session_id,
        request_id=request_id,
        page_path=str(request.url.path),
        metadata={
            "nickname": user[2],
            "signup_purpose_code": signup_purpose_code,
        },
    )

    if verification_token:
        email_body_lines = [
            "SolSQLD 이메일 인증을 완료해주세요.",
            "",
            f"인증 링크: {verification_url}" if verification_url else "",
            f"인증 토큰: {verification_token}",
            "",
            "링크 또는 토큰은 24시간 동안 유효합니다.",
        ]
        verification_email_sent = send_email(
            to_email=user[1],
            subject="[SolSQLD] 이메일 인증을 완료해주세요",
            text_content="\n".join(line for line in email_body_lines if line),
        )

    return {
        "message": "user created",
        "user": {
            "user_id": str(user[0]),
            "email": user[1],
            "nickname": user[2],
        },
        "email_verification_required": True,
        "delivery_mode": "email" if verification_email_sent else "inline_token",
        **(
            {
                "verification_token": verification_token,
                "verification_url": verification_url,
            }
            if verification_token and not verification_email_sent
            else {}
        ),
    }


@router.get("/google/start")
def google_login_start(request: Request, next: str = "/"):
    require_google_oauth_settings()

    state_token = create_google_oauth_state(next)
    oidc_config = fetch_google_oidc_config()
    authorization_url = (
        f"{oidc_config['authorization_endpoint']}?"
        + urlencode(
            {
                "response_type": "code",
                "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
                "scope": "openid email profile",
                "state": state_token,
                "nonce": decode_google_oauth_state(state_token)["nonce"],
                "prompt": "select_account",
            }
        )
    )
    return RedirectResponse(url=authorization_url, status_code=302)


@router.get("/google/delete/start")
def google_delete_start(
    request: Request,
    next: str = "/mypage",
    current_user: dict = Depends(get_current_user),
):
    require_google_oauth_settings()

    if current_user.get("auth_provider") != "google":
        raise HTTPException(status_code=400, detail="현재 로그인 수단이 구글이 아닙니다.")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT 1
                FROM auth.social_accounts
                WHERE user_id = %s
                  AND provider = 'google'
                LIMIT 1
                """,
                (current_user["user_id"],),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=400, detail="google account is not linked")

    state_token = create_google_account_delete_state(
        user_id=current_user["user_id"],
        next_path=next,
    )
    oidc_config = fetch_google_oidc_config()
    authorization_url = (
        f"{oidc_config['authorization_endpoint']}?"
        + urlencode(
            {
                "response_type": "code",
                "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
                "scope": "openid email profile",
                "state": state_token,
                "nonce": decode_google_state_token(state_token)["nonce"],
                "prompt": "select_account",
            }
        )
    )
    return RedirectResponse(url=authorization_url, status_code=302)


@router.get("/google/callback")
def google_login_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    session_id = request.headers.get("x-session-id")

    if not state:
        raise HTTPException(status_code=400, detail="google login state is required")

    state_payload = decode_google_state_token(state)
    next_path = state_payload["next"]
    redirect_params: dict[str, str | None] = {"auth_provider": "google"}

    if error:
        redirect_params["auth_error"] = "구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요."
        return RedirectResponse(
            url=build_frontend_redirect_url(request, next_path, redirect_params),
            status_code=302,
        )

    if not code:
        redirect_params["auth_error"] = "구글 로그인 코드가 없어 로그인을 완료하지 못했습니다."
        return RedirectResponse(
            url=build_frontend_redirect_url(request, next_path, redirect_params),
            status_code=302,
        )

    try:
        require_google_oauth_settings()
        token_payload = exchange_google_code_for_tokens(code)
        id_token = token_payload.get("id_token")
        if not id_token:
            raise HTTPException(status_code=400, detail="google id token is missing")
        claims = verify_google_id_token(id_token, state_payload["nonce"])
    except HTTPException as exc:
        redirect_params["auth_error"] = "구글 로그인 검증에 실패했습니다. 잠시 후 다시 시도해주세요."
        logger.warning(
            "google login callback failed request_id=%s reason=%s",
            request_id,
            exc.detail,
        )
        submit_amplitude_event(
            event_type="backend_auth_google_login_failed",
            event_properties={"failure_code": "google_callback_failed"},
            insert_id=request_id,
        )
        submit_auth_event(
            event_type="google_login_failed",
            success=False,
            email=None,
            session_id=session_id,
            request_id=request_id,
            page_path=str(request.url.path),
            failure_code="google_callback_failed",
            failure_message=str(exc.detail),
        )
        return RedirectResponse(
            url=build_frontend_redirect_url(request, next_path, redirect_params),
            status_code=302,
        )

    email = claims["email"].strip().lower()
    google_sub = claims["sub"]

    if state_payload.get("flow") == "google_account_delete":
        expected_user_id = str(state_payload.get("user_id") or "")
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT u.user_id, u.is_active
                    FROM auth.users u
                    JOIN auth.social_accounts sa
                      ON sa.user_id = u.user_id
                    WHERE u.user_id = %s
                      AND sa.provider = 'google'
                      AND sa.provider_user_id = %s
                    """,
                    (expected_user_id, google_sub),
                )
                delete_target = cur.fetchone()

        if not delete_target or not delete_target[1]:
            redirect_params["auth_error"] = "구글 재인증에 실패했습니다. 다시 시도해주세요."
            return RedirectResponse(
                url=build_frontend_redirect_url(request, next_path, redirect_params),
                status_code=302,
            )

        redirect_params["account_delete_ready"] = "1"
        redirect_params["account_delete_provider"] = "google"
        redirect_params["account_delete_token"] = create_account_delete_token(
            user_id=expected_user_id,
            provider="google",
        )
        return RedirectResponse(
            url=build_frontend_redirect_url(request, next_path, redirect_params),
            status_code=302,
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.user_id, u.email, u.nickname, u.is_active
                FROM auth.social_accounts sa
                JOIN auth.users u
                  ON u.user_id = sa.user_id
                WHERE sa.provider = 'google'
                  AND sa.provider_user_id = %s
                """,
                (google_sub,),
            )
            user = cur.fetchone()

            if not user:
                cur.execute(
                    """
                    SELECT user_id, email, nickname, is_active
                    FROM auth.users
                    WHERE lower(email) = lower(%s)
                    """,
                    (email,),
                )
                user = cur.fetchone()

            if not user:
                redirect_params["social_signup_required"] = "1"
                redirect_params["social_signup_token"] = create_social_signup_token(
                    provider="google",
                    provider_user_id=google_sub,
                    email=email,
                    nickname=(claims.get("name") or email.split("@", 1)[0]).strip(),
                    next_path=next_path,
                )
                return RedirectResponse(
                    url=build_frontend_redirect_url(request, next_path, redirect_params),
                    status_code=302,
                )

            user_id, resolved_email, nickname, is_active = user
            if not is_active:
                redirect_params["auth_error"] = "비활성화된 계정입니다."
                return RedirectResponse(
                    url=build_frontend_redirect_url(request, next_path, redirect_params),
                    status_code=302,
                )

            upsert_social_account(
                cur=cur,
                user_id=str(user_id),
                provider="google",
                provider_user_id=google_sub,
                provider_email=email,
                provider_email_verified=True,
            )

    access_token = create_access_token(
        user_id=str(user_id),
        email=resolved_email,
        nickname=nickname,
        auth_provider="google",
    )
    refresh_token = create_refresh_token(str(user_id), auth_provider="google")

    submit_amplitude_event(
        event_type="backend_auth_google_login_succeeded",
        user_id=str(user_id),
        event_properties={
            "email_domain": extract_email_domain(resolved_email),
            "provider": "google",
        },
        user_properties={
            "email": resolved_email,
            "nickname": nickname,
        },
        insert_id=request_id,
    )
    submit_auth_event(
        event_type="google_login_succeeded",
        success=True,
        email=resolved_email,
        user_id=str(user_id),
        session_id=session_id,
        request_id=request_id,
        page_path=str(request.url.path),
        metadata={"provider": "google", "nickname": nickname},
    )

    redirect_response = RedirectResponse(
        url=build_frontend_redirect_url(
            request,
            next_path,
            {
                "auth_provider": "google",
                "auth_success": "1",
            },
        ),
        status_code=302,
    )
    issue_auth_cookies(
        redirect_response,
        access_token=access_token,
        refresh_token=refresh_token,
    )
    return redirect_response


@router.post("/social/register")
def complete_social_signup(req: SocialSignupCompleteRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    session_id = request.headers.get("x-session-id")

    if not req.terms_agreed:
        raise HTTPException(status_code=400, detail="terms agreement is required")
    if not req.privacy_agreed:
        raise HTTPException(status_code=400, detail="privacy agreement is required")

    payload = decode_social_signup_token(req.social_signup_token)
    provider = payload.get("provider")
    provider_user_id = payload.get("provider_user_id")
    email = (payload.get("email") or "").strip().lower()
    default_nickname = (payload.get("nickname") or email.split("@", 1)[0]).strip()
    nickname = (req.nickname or default_nickname).strip() or email.split("@", 1)[0]

    if provider != "google" or not provider_user_id or not email:
        raise HTTPException(status_code=400, detail="social signup token is invalid")

    signup_purpose_code, signup_purpose_other = normalize_signup_purpose(
        req.signup_purpose_code,
        req.signup_purpose_other,
    )

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT user_id, email, nickname, is_active
                    FROM auth.users
                    WHERE lower(email) = lower(%s)
                    """,
                    (email,),
                )
                user = cur.fetchone()

                if not user:
                    user = create_social_user(
                        cur=cur,
                        email=email,
                        nickname=nickname,
                        signup_purpose_code=signup_purpose_code,
                        signup_purpose_other=signup_purpose_other,
                    )

                user_id, resolved_email, resolved_nickname, is_active = user
                if not is_active:
                    raise HTTPException(status_code=403, detail="deactivated account")

                upsert_social_account(
                    cur=cur,
                    user_id=str(user_id),
                    provider=provider,
                    provider_user_id=provider_user_id,
                    provider_email=email,
                    provider_email_verified=True,
                )
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning(
            "social signup failed request_id=%s provider=%s email=%s reason=%s",
            request_id,
            provider,
            email,
            exc,
        )
        raise HTTPException(status_code=400, detail=str(exc))

    access_token = create_access_token(
        user_id=str(user_id),
        email=resolved_email,
        nickname=resolved_nickname,
        auth_provider=provider,
    )
    refresh_token = create_refresh_token(str(user_id), auth_provider=provider)

    submit_amplitude_event(
        event_type="backend_auth_social_signup_succeeded",
        user_id=str(user_id),
        event_properties={
            "email_domain": extract_email_domain(resolved_email),
            "provider": provider,
            "signup_purpose_code": signup_purpose_code,
        },
        user_properties={
            "email": resolved_email,
            "nickname": resolved_nickname,
        },
        insert_id=request_id,
    )
    submit_auth_event(
        event_type="social_signup_succeeded",
        success=True,
        email=resolved_email,
        user_id=str(user_id),
        session_id=session_id,
        request_id=request_id,
        page_path=str(request.url.path),
        metadata={"provider": provider, "nickname": resolved_nickname},
    )

    response = Response(
        content=json.dumps(
            {
                "message": "social signup completed",
                "user": {
                    "user_id": str(user_id),
                    "email": resolved_email,
                    "nickname": resolved_nickname,
                },
            }
        ),
        media_type="application/json",
    )
    issue_auth_cookies(
        response,
        access_token=access_token,
        refresh_token=refresh_token,
    )
    return response


@router.post("/login")
def login(req: LoginRequest, request: Request, response: Response):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    session_id = request.headers.get("x-session-id")
    started_at = monotonic()
    timing_marks: dict[str, int] = {}

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT user_id, email, nickname, password_hash, is_active
                FROM auth.users
                WHERE email = %s
                """,
                (req.email,),
            )
            user = cur.fetchone()
    timing_marks["userLoadedMs"] = round((monotonic() - started_at) * 1000)

    if not user:
        logger.info(
            "login failed request_id=%s email=%s timings=%s reason=invalid_credentials_user_not_found",
            request_id,
            req.email,
            timing_marks,
        )
        submit_amplitude_event(
            event_type="backend_auth_login_failed",
            event_properties={
                "failure_code": "invalid_credentials",
                "email_domain": extract_email_domain(req.email),
            },
            insert_id=request_id,
        )
        submit_auth_event(
            event_type="login_failed",
            success=False,
            email=req.email,
            session_id=session_id,
            request_id=request_id,
            page_path=str(request.url.path),
            failure_code="invalid_credentials",
            failure_message="invalid credentials",
        )
        raise HTTPException(status_code=401, detail="invalid credentials")

    user_id, email, nickname, stored_password_hash, is_active = user

    if not is_active:
        raise HTTPException(status_code=403, detail="deactivated account")

    password_verified, updated_password_hash = verify_and_update_password(
        req.password,
        stored_password_hash,
    )
    timing_marks["passwordVerifiedMs"] = round((monotonic() - started_at) * 1000)

    if not password_verified:
        logger.info(
            "login failed request_id=%s user_id=%s timings=%s reason=invalid_credentials_password_mismatch",
            request_id,
            str(user_id),
            timing_marks,
        )
        submit_amplitude_event(
            event_type="backend_auth_login_failed",
            user_id=str(user_id),
            event_properties={
                "failure_code": "invalid_credentials",
                "email_domain": extract_email_domain(req.email),
            },
            insert_id=request_id,
        )
        submit_auth_event(
            event_type="login_failed",
            success=False,
            email=req.email,
            user_id=str(user_id),
            session_id=session_id,
            request_id=request_id,
            page_path=str(request.url.path),
            failure_code="invalid_credentials",
            failure_message="invalid credentials",
        )
        raise HTTPException(status_code=401, detail="invalid credentials")

    if updated_password_hash:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE auth.users
                    SET password_hash = %s
                    WHERE user_id = %s
                    """,
                    (updated_password_hash, str(user_id)),
                )
        timing_marks["passwordRehashedMs"] = round((monotonic() - started_at) * 1000)

    access_token = create_access_token(
        user_id=str(user_id),
        email=email,
        nickname=nickname,
        auth_provider="local",
    )
    refresh_token = create_refresh_token(str(user_id), auth_provider="local")
    timing_marks["tokenCreatedMs"] = round((monotonic() - started_at) * 1000)

    submit_amplitude_event(
        event_type="backend_auth_login_succeeded",
        user_id=str(user_id),
        event_properties={
            "email_domain": extract_email_domain(email),
        },
        user_properties={
            "email": email,
            "nickname": nickname,
        },
        insert_id=request_id,
    )
    submit_auth_event(
        event_type="login_succeeded",
        success=True,
        email=email,
        user_id=str(user_id),
        session_id=session_id,
        request_id=request_id,
        page_path=str(request.url.path),
        metadata={"nickname": nickname},
    )
    timing_marks["loginCompletedMs"] = round((monotonic() - started_at) * 1000)
    logger.info(
        "login succeeded request_id=%s user_id=%s timings=%s",
        request_id,
        str(user_id),
        timing_marks,
    )

    issue_auth_cookies(
        response,
        access_token=access_token,
        refresh_token=refresh_token,
    )

    return {"message": "login succeeded"}


@router.post("/refresh")
def refresh_access_token(request: Request, response: Response):
    refresh_token = extract_refresh_token_from_request(request)
    if not refresh_token:
        raise HTTPException(status_code=401, detail="missing refresh token")

    try:
        payload = decode_refresh_token(refresh_token)
    except ExpiredSignatureError:
        clear_auth_cookie(response)
        raise HTTPException(status_code=401, detail="refresh token expired")
    except InvalidTokenError:
        clear_auth_cookie(response)
        raise HTTPException(status_code=401, detail="refresh token is invalid")

    user_id = payload.get("sub")
    if not user_id:
        clear_auth_cookie(response)
        raise HTTPException(status_code=401, detail="refresh token is invalid")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT user_id, email, nickname, is_active
                FROM auth.users
                WHERE user_id = %s
                """,
                (user_id,),
            )
            user = cur.fetchone()

    if not user:
        clear_auth_cookie(response)
        raise HTTPException(status_code=401, detail="user not found")

    resolved_user_id, email, nickname, is_active = user
    auth_provider = payload.get("auth_provider") or "local"
    if not is_active:
        clear_auth_cookie(response)
        raise HTTPException(status_code=403, detail="deactivated account")

    new_access_token = create_access_token(
        user_id=str(resolved_user_id),
        email=email,
        nickname=nickname,
        auth_provider=auth_provider,
    )
    new_refresh_token = create_refresh_token(
        str(resolved_user_id),
        auth_provider=auth_provider,
    )
    issue_auth_cookies(
        response,
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )
    return {"message": "refresh succeeded"}


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "logout succeeded"}


@router.get("/me")
def me(request: Request, current_user: dict = Depends(get_current_user)):
    cache_key = current_user["user_id"]
    now = monotonic()
    ttl = settings.AUTH_ME_CACHE_TTL_SECONDS

    with _me_cache_lock:
        cached = _me_cache.get(cache_key)
        if cached and now - cached[0] < ttl:
            return cached[1]

    points = 0
    email_verified = current_user["email_verified"]
    email_verified_at = current_user["email_verified_at"]
    is_admin = current_user["is_admin"]
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    COALESCE(ds.total_points, 0) AS total_points,
                    u.email_verified,
                    u.email_verified_at,
                    u.is_admin
                FROM auth.users u
                LEFT JOIN dashboard.user_stats ds
                  ON ds.user_id = u.user_id
                WHERE u.user_id = %s
                """,
                (current_user["user_id"],),
            )
            row = cur.fetchone()
            if row:
                points = int(row[0] or 0)
                email_verified = bool(row[1])
                email_verified_at = row[2].isoformat() if row[2] else None
                is_admin = bool(row[3])
    response = {
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "nickname": current_user["nickname"],
        "points": points,
        "is_admin": is_admin,
        "auth_provider": current_user["auth_provider"],
        "emailVerified": email_verified,
        "emailVerifiedAt": email_verified_at,
        "isAdmin": is_admin,
    }

    with _me_cache_lock:
        _me_cache[cache_key] = (now, response)

    return response


@router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    u.email,
                    u.nickname,
                    u.created_at,
                    COALESCE(ds.total_points, 0) AS total_points,
                    MAX(uc.consented_at) FILTER (WHERE cv.consent_type = 'terms') AS terms_agreed_at,
                    MAX(uc.consented_at) FILTER (WHERE cv.consent_type = 'privacy_policy') AS privacy_agreed_at,
                    u.email_verified,
                    u.email_verified_at,
                    u.is_admin
                FROM auth.users u
                LEFT JOIN dashboard.user_stats ds
                  ON ds.user_id = u.user_id
                LEFT JOIN auth.user_consents uc
                  ON uc.user_id = u.user_id AND uc.agreed = true
                LEFT JOIN auth.consent_versions cv
                  ON cv.id = uc.consent_version_id
                WHERE u.user_id = %s
                GROUP BY
                    u.email,
                    u.nickname,
                    u.created_at,
                    ds.total_points,
                    u.email_verified,
                    u.email_verified_at,
                    u.is_admin
                """,
                (current_user["user_id"],),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="profile not found")

    return {
        "email": row[0],
        "nickname": row[1],
        "createdAt": row[2].isoformat() if row[2] else None,
        "points": int(row[3] or 0),
        "termsAgreedAt": row[4].isoformat() if row[4] else None,
        "privacyAgreedAt": row[5].isoformat() if row[5] else None,
        "emailVerified": bool(row[6]),
        "emailVerifiedAt": row[7].isoformat() if row[7] else None,
        "isAdmin": bool(row[8]),
        "authProvider": current_user["auth_provider"],
    }


@router.put("/nickname")
def update_nickname(
    req: NicknameUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    nickname = req.nickname.strip()
    if not nickname:
        raise HTTPException(status_code=400, detail="닉네임을 입력해주세요.")
    if len(nickname) > 20:
        raise HTTPException(status_code=400, detail="닉네임은 20자 이내로 입력해주세요.")

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE auth.users
                    SET nickname = %s
                    WHERE user_id = %s
                    RETURNING nickname
                    """,
                    (nickname, current_user["user_id"]),
                )
                row = cur.fetchone()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not row:
        raise HTTPException(status_code=404, detail="user not found")

    return {
        "message": "nickname updated",
        "nickname": row[0],
    }


@router.put("/password")
def update_password(
    req: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user),
):
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="새 비밀번호는 8자 이상이어야 합니다.")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT password_hash
                FROM auth.users
                WHERE user_id = %s
                """,
                (current_user["user_id"],),
            )
            row = cur.fetchone()

            if not row or not verify_password(req.current_password, row[0]):
                raise HTTPException(status_code=401, detail="현재 비밀번호가 올바르지 않습니다.")

            cur.execute(
                """
                UPDATE auth.users
                SET password_hash = %s
                WHERE user_id = %s
                """,
                (hash_password(req.new_password), current_user["user_id"]),
            )

    return {"message": "password updated"}


@router.delete("/account")
def delete_account(
    req: DeleteAccountRequest,
    current_user: dict = Depends(get_current_user),
):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT password_hash
                FROM auth.users
                WHERE user_id = %s
                """,
                (current_user["user_id"],),
            )
            row = cur.fetchone()

            if not row:
                raise HTTPException(status_code=404, detail="user not found")

            if req.social_delete_token:
                payload = decode_account_delete_token(req.social_delete_token)
                if (
                    payload.get("sub") != current_user["user_id"]
                    or payload.get("provider") != "google"
                ):
                    raise HTTPException(status_code=401, detail="소셜 탈퇴 인증이 올바르지 않습니다.")
            else:
                if not req.password or not verify_password(req.password, row[0]):
                    raise HTTPException(status_code=401, detail="비밀번호가 올바르지 않습니다.")

            deleted_suffix = current_user["user_id"][:8]
            cur.execute(
                """
                INSERT INTO auth.archived_users (
                    user_id,
                    email,
                    nickname,
                    password_hash,
                    created_at,
                    updated_at,
                    last_login_at,
                    terms_agreed,
                    terms_version,
                    privacy_policy_agreed,
                    privacy_policy_version,
                    email_verified,
                    email_verified_at,
                    deactivated_at,
                    archived_at,
                    archive_reason
                )
                SELECT
                    user_id,
                    email,
                    nickname,
                    password_hash,
                    created_at,
                    updated_at,
                    last_login_at,
                    terms_agreed,
                    terms_version,
                    privacy_policy_agreed,
                    privacy_policy_version,
                    email_verified,
                    email_verified_at,
                    now(),
                    now(),
                    'user_requested_deletion'
                FROM auth.users
                WHERE user_id = %s
                ON CONFLICT (user_id) DO UPDATE
                SET
                    email = EXCLUDED.email,
                    nickname = EXCLUDED.nickname,
                    password_hash = EXCLUDED.password_hash,
                    updated_at = EXCLUDED.updated_at,
                    last_login_at = EXCLUDED.last_login_at,
                    terms_agreed = EXCLUDED.terms_agreed,
                    terms_version = EXCLUDED.terms_version,
                    privacy_policy_agreed = EXCLUDED.privacy_policy_agreed,
                    privacy_policy_version = EXCLUDED.privacy_policy_version,
                    email_verified = EXCLUDED.email_verified,
                    email_verified_at = EXCLUDED.email_verified_at,
                    deactivated_at = EXCLUDED.deactivated_at,
                    archived_at = EXCLUDED.archived_at,
                    archive_reason = EXCLUDED.archive_reason
                """,
                (current_user["user_id"],),
            )
            cur.execute(
                """
                UPDATE auth.users
                SET
                    is_active = false,
                    deactivated_at = now(),
                    archived_at = now(),
                    email = %s,
                    nickname = %s,
                    password_hash = %s,
                    email_verified = false,
                    email_verified_at = null,
                    updated_at = now()
                WHERE user_id = %s
                RETURNING archived_at
                """,
                (
                    f"deleted+{deleted_suffix}@solsqld.local",
                    f"deleted_{deleted_suffix}",
                    hash_password(secrets.token_urlsafe(24)),
                    current_user["user_id"],
                ),
            )
            cur.fetchone()

    return {"message": "account deactivated"}


@router.post("/email-verification/send")
def send_email_verification(current_user: dict = Depends(get_current_user)):
    if current_user["email_verified"]:
        return {
            "message": "이미 이메일 인증이 완료되었습니다.",
            "emailVerified": True,
        }

    verification_token: str | None = None
    verification_url: str | None = None
    email_sent = False

    with get_connection() as conn:
        with conn.cursor() as cur:
            verification_token, _ = create_email_verification(
                cur=cur,
                user_id=current_user["user_id"],
                email=current_user["email"],
            )
            verification_url = build_verification_url(verification_token)

    if verification_token:
        email_body_lines = [
            "SolSQLD 이메일 인증을 완료해주세요.",
            "",
            f"인증 링크: {verification_url}" if verification_url else "",
            f"인증 토큰: {verification_token}",
            "",
            "링크 또는 토큰은 24시간 동안 유효합니다.",
        ]
        email_sent = send_email(
            to_email=current_user["email"],
            subject="[SolSQLD] 이메일 인증을 완료해주세요",
            text_content="\n".join(line for line in email_body_lines if line),
        )

    return {
        "message": "인증 메일이 준비되었습니다." if email_sent else "개발 환경용 인증 토큰이 발급되었습니다.",
        "emailVerified": False,
        "deliveryMode": "email" if email_sent else "inline_token",
        **(
            {
                "verificationToken": verification_token,
                "verificationUrl": verification_url,
            }
            if verification_token and not email_sent
            else {}
        ),
    }


@router.post("/email-verification/confirm")
def confirm_email_verification(req: EmailVerificationConfirmRequest):
    token_hash = hash_verification_token(req.token.strip())

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT user_id, email
                FROM auth.email_verifications
                WHERE token_hash = %s
                  AND used_at IS NULL
                  AND expires_at > now()
                """,
                (token_hash,),
            )
            row = cur.fetchone()

            if not row:
                raise HTTPException(status_code=400, detail="유효하지 않거나 만료된 인증 토큰입니다.")

            cur.execute(
                """
                UPDATE auth.email_verifications
                SET used_at = now()
                WHERE token_hash = %s
                """,
                (token_hash,),
            )
            cur.execute(
                """
                UPDATE auth.users
                SET email_verified = true,
                    email_verified_at = now()
                WHERE user_id = %s
                """,
                (row[0],),
            )

    return {
        "message": "이메일 인증이 완료되었습니다.",
        "email": row[1],
        "emailVerified": True,
    }


@router.post("/find-email")
def request_find_email(req: FindEmailRequest):
    nickname = req.nickname.strip()
    if not nickname:
        raise HTTPException(status_code=400, detail="닉네임을 입력해주세요.")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT user_id, email, nickname
                FROM auth.users
                WHERE nickname = %s
                  AND is_active = true
                ORDER BY created_at ASC
                LIMIT 1
                """,
                (nickname,),
            )
            user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="입력하신 정보에 맞는 계정이 없습니다.")

    return {
        "maskedEmail": mask_email(user[1]),
    }


@router.post("/password-reset/request")
def request_password_reset(req: PasswordResetRequest):
    generic_message = "입력하신 이메일로 비밀번호 재설정 안내를 보냈습니다."
    delivery_mode = "email"
    reset_token: str | None = None

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT user_id, email
                FROM auth.users
                WHERE email = %s
                  AND is_active = true
                """,
                (req.email,),
            )
            user = cur.fetchone()

            if not user:
                return {"message": generic_message, "deliveryMode": delivery_mode}

            cur.execute(
                """
                SELECT 1
                FROM auth.email_verifications
                WHERE user_id = %s
                  AND email = %s
                  AND purpose = 'reset_password'
                  AND used_at IS NULL
                  AND created_at > now() - interval '3 minutes'
                LIMIT 1
                """,
                (user[0], user[1]),
            )
            rate_limited = cur.fetchone() is not None

            if not rate_limited:
                reset_token, _ = create_password_reset_token(
                    cur=cur,
                    user_id=str(user[0]),
                    email=user[1],
                )

    if reset_token:
        sent = send_email(
            to_email=req.email,
            subject="[SolSQLD] 비밀번호 재설정 안내",
            text_content="\n".join(
                [
                    "SolSQLD 비밀번호 재설정을 요청하셨습니다.",
                    "",
                    f"재설정 토큰: {reset_token}",
                    "",
                    "토큰은 5분 동안 유효하며 1회만 사용할 수 있습니다.",
                    "본인이 요청하지 않았다면 이 메일을 무시해주세요.",
                ]
            ),
        )
        if not sent:
            delivery_mode = "inline_token"

    response = {"message": generic_message, "deliveryMode": delivery_mode}
    if reset_token and delivery_mode == "inline_token":
        response["resetToken"] = reset_token
    return response


@router.post("/password-reset/confirm")
def confirm_password_reset(req: PasswordResetConfirmRequest):
    token = req.token.strip()
    if not token:
        raise HTTPException(status_code=400, detail="인증 토큰을 입력해주세요.")
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="새 비밀번호는 8자 이상이어야 합니다.")

    token_hash = hash_verification_token(token)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT user_id, email
                FROM auth.email_verifications
                WHERE token_hash = %s
                  AND purpose = 'reset_password'
                  AND used_at IS NULL
                  AND expires_at > now()
                """,
                (token_hash,),
            )
            row = cur.fetchone()

            if not row:
                raise HTTPException(status_code=400, detail="유효하지 않거나 만료된 인증 토큰입니다.")

            cur.execute(
                """
                UPDATE auth.users
                SET password_hash = %s,
                    updated_at = now()
                WHERE user_id = %s
                  AND is_active = true
                """,
                (hash_password(req.new_password), row[0]),
            )

            if cur.rowcount == 0:
                raise HTTPException(status_code=400, detail="비밀번호를 재설정할 수 없는 계정입니다.")

            cur.execute(
                """
                UPDATE auth.email_verifications
                SET used_at = now()
                WHERE user_id = %s
                  AND email = %s
                  AND purpose = 'reset_password'
                  AND used_at IS NULL
                """,
                (row[0], row[1]),
            )

    return {"message": "비밀번호가 재설정되었습니다."}


@router.get("/admin/users")
def list_admin_users(
    page: int = 1,
    size: int = 20,
    search: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    ensure_admin(current_user)

    page = max(1, page)
    size = min(max(1, size), 100)
    offset = (page - 1) * size
    search_value = f"%{(search or '').strip()}%"
    has_search = bool((search or "").strip())

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*)
                FROM auth.users u
                WHERE u.is_active = true
                  AND (
                    %s = false
                    OR u.email ILIKE %s
                    OR u.nickname ILIKE %s
                  )
                """,
                (has_search, search_value, search_value),
            )
            total = int(cur.fetchone()[0])

            cur.execute(
                """
                SELECT
                    u.user_id,
                    u.email,
                    u.nickname,
                    COALESCE(ds.total_points, 0) AS total_points,
                    u.is_admin,
                    u.created_at
                FROM auth.users u
                LEFT JOIN dashboard.user_stats ds
                  ON ds.user_id = u.user_id
                WHERE u.is_active = true
                  AND (
                    %s = false
                    OR u.email ILIKE %s
                    OR u.nickname ILIKE %s
                  )
                ORDER BY u.created_at DESC, u.email ASC
                LIMIT %s OFFSET %s
                """,
                (has_search, search_value, search_value, size, offset),
            )
            items = [
                {
                    "user_id": str(row[0]),
                    "email": row[1],
                    "nickname": row[2],
                    "points": int(row[3] or 0),
                    "is_admin": bool(row[4]),
                    "created_at": row[5].isoformat() if row[5] else None,
                }
                for row in cur.fetchall()
            ]

    return {
        "total": total,
        "items": items,
    }


@router.patch("/admin/users/{user_id}/role")
def update_admin_user_role(
    user_id: str,
    req: AdminUserRoleUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    ensure_admin(current_user)

    if user_id == current_user["user_id"] and not req.is_admin:
        raise HTTPException(status_code=400, detail="자기 자신의 관리자 권한은 해제할 수 없습니다.")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE auth.users
                SET is_admin = %s
                WHERE user_id = %s
                  AND is_active = true
                RETURNING user_id, is_admin
                """,
                (req.is_admin, user_id),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")

    return {
        "user_id": str(row[0]),
        "is_admin": bool(row[1]),
        "message": "role updated",
    }
