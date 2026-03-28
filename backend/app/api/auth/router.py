from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr
from jwt import ExpiredSignatureError, InvalidTokenError

from app.db.logs import ensure_request_id, insert_auth_event
from app.db.postgres import get_connection
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

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
    email = payload.get("email")
    nickname = payload.get("nickname")

    if not user_id or not email or not nickname:
        raise HTTPException(status_code=401, detail="invalid token payload")

    return {
        "user_id": user_id,
        "email": email,
        "nickname": nickname,
    }


@router.post("/register")
def register(req: RegisterRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    session_id = request.headers.get("x-session-id")

    if not req.terms_agreed:
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

    hashed_password = hash_password(req.password)

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO auth.users (
                        email,
                        nickname,
                        password_hash,
                        terms_agreed
                    )
                    VALUES (%s, %s, %s, %s)
                    RETURNING user_id, email, nickname
                    """,
                    (req.email, req.nickname, hashed_password, req.terms_agreed),
                )
                user = cur.fetchone()
    except Exception as e:
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

    return {
        "message": "user created",
        "user": {
            "user_id": str(user[0]),
            "email": user[1],
            "nickname": user[2],
        },
    }


@router.post("/login")
def login(req: LoginRequest, request: Request):
    request_id = ensure_request_id(request.headers.get("x-request-id"))
    session_id = request.headers.get("x-session-id")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT user_id, email, nickname, password_hash
                FROM auth.users
                WHERE email = %s
                """,
                (req.email,),
            )
            user = cur.fetchone()

    if not user:
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

    user_id, email, nickname, password_hash = user

    if not verify_password(req.password, password_hash):
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

    return {
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "nickname": current_user["nickname"],
    }
