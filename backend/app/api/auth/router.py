from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr
from jwt import ExpiredSignatureError, InvalidTokenError

from app.core.config import settings
from app.db.logs import ensure_request_id, insert_auth_event
from app.db.postgres import get_connection
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.services.amplitude import send_amplitude_event
from app.services.mailer import send_email

router = APIRouter(prefix="/api/auth", tags=["auth"])
bearer_scheme = HTTPBearer()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    nickname: str
    password: str
    terms_agreed: bool
    privacy_agreed: bool


class NicknameUpdateRequest(BaseModel):
    nickname: str


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str


class EmailVerificationConfirmRequest(BaseModel):
    token: str


def extract_email_domain(email: str) -> str:
    return email.split("@", 1)[1].lower() if "@" in email else ""


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = credentials.credentials

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
                SELECT user_id, email, nickname, is_active, email_verified, email_verified_at
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
    }


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
                        terms_version,
                        privacy_policy_version
                    )
                    SELECT
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
            metadata={"nickname": req.nickname},
        )
        raise HTTPException(status_code=400, detail=str(e))

    send_amplitude_event(
        event_type="backend_auth_signup_succeeded",
        user_id=str(user[0]),
        event_properties={
            "email_domain": extract_email_domain(user[1]),
            "nickname_present": bool(user[2]),
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
        metadata={"nickname": user[2]},
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


@router.post("/login")
def login(req: LoginRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    session_id = request.headers.get("x-session-id")

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

    if not user:
        send_amplitude_event(
            event_type="backend_auth_login_failed",
            event_properties={
                "failure_code": "invalid_credentials",
                "email_domain": extract_email_domain(req.email),
            },
            insert_id=request_id,
        )
        insert_auth_event(
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

    user_id, email, nickname, password_hash, is_active = user

    if not is_active:
        raise HTTPException(status_code=403, detail="deactivated account")

    if not verify_password(req.password, password_hash):
        send_amplitude_event(
            event_type="backend_auth_login_failed",
            user_id=str(user_id),
            event_properties={
                "failure_code": "invalid_credentials",
                "email_domain": extract_email_domain(req.email),
            },
            insert_id=request_id,
        )
        insert_auth_event(
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

    access_token = create_access_token(
        user_id=str(user_id),
        email=email,
        nickname=nickname,
    )

    send_amplitude_event(
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
    insert_auth_event(
        event_type="login_succeeded",
        success=True,
        email=email,
        user_id=str(user_id),
        session_id=session_id,
        request_id=request_id,
        page_path=str(request.url.path),
        metadata={"nickname": nickname},
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me")
def me(request: Request, current_user: dict = Depends(get_current_user)):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    session_id = request.headers.get("x-session-id")

    insert_auth_event(
        event_type="auth_restored",
        success=True,
        email=current_user["email"],
        user_id=current_user["user_id"],
        session_id=session_id,
        request_id=request_id,
        page_path=str(request.url.path),
        metadata={"nickname": current_user["nickname"]},
    )

    points = 0
    email_verified = current_user["email_verified"]
    email_verified_at = current_user["email_verified_at"]
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    COALESCE(ds.total_points, 0) AS total_points,
                    u.email_verified,
                    u.email_verified_at
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

    send_amplitude_event(
        event_type="backend_auth_restored",
        user_id=current_user["user_id"],
        event_properties={"points": points},
        user_properties={
            "email": current_user["email"],
            "nickname": current_user["nickname"],
        },
        insert_id=request_id,
    )
    return {
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "nickname": current_user["nickname"],
        "points": points,
        "emailVerified": email_verified,
        "emailVerifiedAt": email_verified_at,
    }


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
                    u.email_verified_at
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
                    u.email_verified_at
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

            if not row or not verify_password(req.password, row[0]):
                raise HTTPException(status_code=401, detail="비밀번호가 올바르지 않습니다.")

            deleted_suffix = current_user["user_id"][:8]
            cur.execute(
                """
                UPDATE auth.users
                SET
                    is_active = false,
                    deactivated_at = now(),
                    email = %s,
                    nickname = %s,
                    password_hash = %s
                WHERE user_id = %s
                """,
                (
                    f"deleted+{deleted_suffix}@solsqld.local",
                    f"deleted_{deleted_suffix}",
                    hash_password(secrets.token_urlsafe(24)),
                    current_user["user_id"],
                ),
            )

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
