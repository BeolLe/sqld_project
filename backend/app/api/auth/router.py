from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.postgres import get_connection
import hashlib

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(req: LoginRequest):
    password_hash = hashlib.sha256(req.password.encode()).hexdigest()

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM users WHERE username=%s AND password_hash=%s",
                (req.username, password_hash)
            )
            user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")

    return {
        "access_token": "test-token",
        "token_type": "bearer"
    }



@router.post("/register")
def register(req: RegisterRequest):
    password_hash = hashlib.sha256(req.password.encode()).hexdigest()

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
                    (req.username, password_hash)
                )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "user created"}



@router.get("/me")
def me():
    # TODO: JWT 검증
    return {
        "username": "admin"
    }
