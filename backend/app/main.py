from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.content.router import router as content_router
from app.api.exams.router import router as exams_router
from app.api.sql.router import router as sql_router
from app.api.feedback.router import router as feedback_router
from app.db.oracle import check_oracle, close_oracle_pool, init_oracle_pool
from app.db.postgres import check_postgres
from app.api.auth.router import router as auth_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_oracle_pool()
    try:
        yield
    finally:
        close_oracle_pool()


app = FastAPI(title="sqld-backend", lifespan=lifespan)


app.include_router(auth_router)
app.include_router(content_router)
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
