from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from jwt import ExpiredSignatureError, InvalidTokenError

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
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str


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
    username = payload.get("username")

    if not user_id or not username:
        raise HTTPException(status_code=401, detail="invalid token payload")

    return {
        "user_id": user_id,
        "username": username,
    }


@router.post("/register")
def register(req: RegisterRequest):
    hashed_password = hash_password(req.password)

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO auth.users (username, password_hash)
                    VALUES (%s, %s)
                    RETURNING user_id, username
                    """,
                    (req.username, hashed_password),
                )
                user = cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "message": "user created",
        "user": {
            "user_id": str(user[0]),
            "username": user[1],
        },
    }


@router.post("/login")
def login(req: LoginRequest):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT user_id, username, password_hash
                FROM auth.users
                WHERE username = %s
                """,
                (req.username,),
            )
            user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")

    user_id, username, password_hash = user

    if not verify_password(req.password, password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")

    access_token = create_access_token(user_id=str(user_id), username=username)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
    }
