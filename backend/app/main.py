from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.api.auth.router import router as auth_router, validate_csrf_request
from app.api.content.router import router as content_router
from app.api.dashboard.router import router as dashboard_router
from app.api.endless.router import router as endless_router
from app.api.exams.router import router as exams_router
from app.api.sql.router import router as sql_router
from app.api.feedback.router import router as feedback_router
from app.db.oracle import check_oracle, close_oracle_pool, init_oracle_pool
from app.db.postgres import check_postgres, close_postgres_pool, init_postgres_pool


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_oracle_pool()
    init_postgres_pool()
    try:
        yield
    finally:
        close_oracle_pool()
        close_postgres_pool()


app = FastAPI(title="sqld-backend", lifespan=lifespan)


@app.middleware("http")
async def csrf_guard_middleware(request, call_next):
    try:
        validate_csrf_request(request)
    except Exception as exc:
        detail = getattr(exc, "detail", "forbidden")
        status_code = getattr(exc, "status_code", 403)
        return JSONResponse(status_code=status_code, content={"detail": detail})
    return await call_next(request)


app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(content_router)
app.include_router(endless_router)
app.include_router(exams_router)
app.include_router(sql_router)
app.include_router(feedback_router)


@app.get("/api/health")
def health():
    return {"status": "ok_test2"}


@app.get("/api/health/db/oracle")
def health_oracle():
    result = check_oracle()
    return {"status": result}


@app.get("/api/health/db/postgres")
def health_postgres():
    result = check_postgres()
    return {"status": result}
