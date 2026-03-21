from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(req: LoginRequest):
    # TODO: DB 연동 전 임시
    if req.username != "admin" or req.password != "admin":
        raise HTTPException(status_code=401, detail="invalid credentials")

    return {
        "access_token": "test-token",
        "token_type": "bearer"
    }


@router.post("/register")
def register(req: RegisterRequest):
    # TODO: DB 저장
    return {
        "message": "user created",
        "username": req.username
    }


@router.get("/me")
def me():
    # TODO: JWT 검증
    return {
        "username": "admin"
    }
