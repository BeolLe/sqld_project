from fastapi import FastAPI
from app.db.oracle import check_oracle
from app.db.postgres import check_postgres

app = FastAPI(title="sqld-backend")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/health/db/oracle")
def health_oracle():
    result = check_oracle()
    return {"status": result}


@app.get("/api/health/db/postgres")
def health_postgres():
    result = check_postgres()
    return {"status": result}
