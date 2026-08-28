from contextlib import asynccontextmanager
import ipaddress
import re
from time import monotonic

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.api.auth.router import router as auth_router, validate_csrf_request
from app.api.ai.router import router as ai_router
from app.api.content.router import router as content_router
from app.api.dashboard.router import router as dashboard_router
from app.api.education.router import router as education_router
from app.api.endless.router import router as endless_router
from app.api.exams.router import router as exams_router
from app.api.events.router import router as events_router
from app.api.sql.router import router as sql_router
from app.api.feedback.router import router as feedback_router
from app.api.payments.router import router as payments_router
from app.db.oracle import check_oracle, close_oracle_pool, init_oracle_pool
from app.db.logs import (
    ensure_request_id,
    submit_api_request,
    submit_security_event,
)
from app.db.postgres import check_postgres, close_postgres_pool, init_postgres_pool
from app.services.ai import ai_service


REQUEST_ID_RE = re.compile(r"^[A-Za-z0-9._:-]{1,100}$")
UNLOGGED_PATHS = {"/docs", "/openapi.json", "/redoc"}
UNLOGGED_PATH_PREFIXES = ("/api/health",)


def normalize_request_id(value: str | None) -> str:
    if value and REQUEST_ID_RE.fullmatch(value):
        return value
    return ensure_request_id()


def extract_client_ip(request) -> str | None:
    raw_value = request.headers.get("cf-connecting-ip")
    if not raw_value and request.client:
        raw_value = request.client.host
    if not raw_value:
        return None
    try:
        return str(ipaddress.ip_address(raw_value.strip()))
    except ValueError:
        return None


def should_log_request(path: str) -> bool:
    return path not in UNLOGGED_PATHS and not path.startswith(UNLOGGED_PATH_PREFIXES)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_oracle_pool()
    init_postgres_pool()
    try:
        yield
    finally:
        await ai_service.close()
        close_oracle_pool()
        close_postgres_pool()


app = FastAPI(title="sqld-backend", lifespan=lifespan)


@app.middleware("http")
async def csrf_guard_middleware(request, call_next):
    started_at = monotonic()
    request_id = normalize_request_id(request.headers.get("x-request-id"))
    request.state.request_id = request_id
    client_ip = extract_client_ip(request)
    session_id = (request.headers.get("x-session-id") or "")[:100] or None
    error_code = None

    try:
        validate_csrf_request(request)
    except Exception as exc:
        detail = getattr(exc, "detail", "forbidden")
        status_code = getattr(exc, "status_code", 403)
        error_code = "CSRF_VALIDATION_FAILED"
        submit_security_event(
            event_type=error_code,
            severity="MEDIUM",
            request_id=request_id,
            session_id=session_id,
            source_ip=client_ip,
            metadata={
                "method": request.method,
                "path": request.url.path,
                "detail": str(detail)[:200],
            },
        )
        response = JSONResponse(status_code=status_code, content={"detail": detail})
    else:
        try:
            response = await call_next(request)
        except Exception:
            if should_log_request(request.url.path):
                submit_api_request(
                    request_id=request_id,
                    user_id=getattr(request.state, "user_id", None),
                    session_id=session_id,
                    method=request.method[:10],
                    path=request.url.path[:255],
                    route_name=None,
                    status_code=500,
                    latency_ms=round((monotonic() - started_at) * 1000),
                    error_code="INTERNAL_SERVER_ERROR",
                    client_ip=client_ip,
                    user_agent=request.headers.get("user-agent", "")[:1000] or None,
                    app_version=request.headers.get("x-app-version", "")[:50] or None,
                )
            raise

    response.headers["X-Request-ID"] = request_id
    if response.status_code >= 400 and error_code is None:
        error_code = f"HTTP_{response.status_code}"

    if should_log_request(request.url.path):
        route = request.scope.get("route")
        route_name = getattr(route, "name", None)
        submit_api_request(
            request_id=request_id,
            user_id=getattr(request.state, "user_id", None),
            session_id=session_id,
            method=request.method[:10],
            path=request.url.path[:255],
            route_name=str(route_name)[:100] if route_name else None,
            status_code=response.status_code,
            latency_ms=round((monotonic() - started_at) * 1000),
            error_code=error_code,
            client_ip=client_ip,
            user_agent=request.headers.get("user-agent", "")[:1000] or None,
            app_version=request.headers.get("x-app-version", "")[:50] or None,
        )
    return response


app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(dashboard_router)
app.include_router(content_router)
app.include_router(education_router)
app.include_router(endless_router)
app.include_router(exams_router)
app.include_router(events_router)
app.include_router(sql_router)
app.include_router(feedback_router)
app.include_router(payments_router)


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
