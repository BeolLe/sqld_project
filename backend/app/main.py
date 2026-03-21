from fastapi import FastAPI
from app.db.oracle import check_oracle
from app.db.postgres import check_postgres
from app.api.auth.router import router as auth_router


app = FastAPI(title="sqld-backend")


app.include_router(auth_router)


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
