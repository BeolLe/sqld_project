from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.api.auth.router import get_current_user
from app.core.config import settings
from app.db import ai as ai_db
from app.services.ai import ai_service
from app.services.ai.context_builder import (
    build_explanation_context,
    build_sql_review_context,
    build_study_plan_context,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])


class ExplanationRequest(BaseModel):
    source: Literal["exam", "endless"]
    attempt_id: str | None = None
    problem_id: str
    force_refresh: bool = False
    quality_mode: Literal["auto", "standard", "premium"] = "auto"


class SqlReviewRequest(BaseModel):
    attempt_id: str
    force_refresh: bool = False
    quality_mode: Literal["auto", "standard", "premium"] = "auto"


class StudyPlanRequest(BaseModel):
    mode: Literal["all", "exam", "endless"] = "all"
    force_refresh: bool = False
    quality_mode: Literal["auto", "standard", "premium"] = "auto"


class FeedbackRequest(BaseModel):
    request_id: str
    helpful: bool
    reason_code: Literal["incorrect", "unclear", "too_long", "too_short", "other"] | None = None
    comment: str | None = Field(default=None, max_length=500)


class AdminProviderTestRequest(BaseModel):
    provider: Literal["google", "anthropic"]


def _streaming_response(prepared) -> StreamingResponse:
    return StreamingResponse(
        ai_service.stream(prepared),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.post("/explain")
async def explain(
    payload: ExplanationRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    prepared = await ai_service.prepare(
        user_id=current_user["user_id"],
        use_case="explanation",
        source_type=payload.source,
        source_id=payload.attempt_id,
        client_request=payload.model_dump(),
        context_builder=lambda: build_explanation_context(
            user_id=current_user["user_id"],
            source=payload.source,
            attempt_id=payload.attempt_id,
            problem_id=payload.problem_id,
        ),
        cache_scope="shared",
        cache_ttl_seconds=settings.AI_SHARED_CACHE_TTL_SECONDS,
        idempotency_key=request.headers.get("idempotency-key"),
        force_refresh=payload.force_refresh,
        quality_mode=payload.quality_mode,
        is_admin=current_user["is_admin"],
    )
    return _streaming_response(prepared)


@router.post("/sql-review")
async def sql_review(
    payload: SqlReviewRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    prepared = await ai_service.prepare(
        user_id=current_user["user_id"],
        use_case="sql_review",
        source_type="sql",
        source_id=payload.attempt_id,
        client_request=payload.model_dump(),
        context_builder=lambda: build_sql_review_context(
            user_id=current_user["user_id"], attempt_id=payload.attempt_id
        ),
        cache_scope="user",
        cache_ttl_seconds=settings.AI_USER_CACHE_TTL_SECONDS,
        idempotency_key=request.headers.get("idempotency-key"),
        force_refresh=payload.force_refresh,
        quality_mode=payload.quality_mode,
        is_admin=current_user["is_admin"],
    )
    return _streaming_response(prepared)


@router.post("/study-plan")
async def study_plan(
    payload: StudyPlanRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    prepared = await ai_service.prepare(
        user_id=current_user["user_id"],
        use_case="study_plan",
        source_type="dashboard",
        source_id=payload.mode,
        client_request=payload.model_dump(),
        context_builder=lambda: build_study_plan_context(
            user_id=current_user["user_id"], mode=payload.mode
        ),
        cache_scope="user",
        cache_ttl_seconds=settings.AI_STUDY_PLAN_CACHE_TTL_SECONDS,
        idempotency_key=request.headers.get("idempotency-key"),
        force_refresh=payload.force_refresh,
        quality_mode=payload.quality_mode,
        is_admin=current_user["is_admin"],
    )
    return _streaming_response(prepared)


@router.post("/admin/provider-test")
async def admin_provider_test(
    payload: AdminProviderTestRequest,
    current_user: dict = Depends(get_current_user),
):
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="admin only")
    return StreamingResponse(
        ai_service.stream_admin_provider_test(payload.provider),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/usage")
def usage(current_user: dict = Depends(get_current_user)):
    return ai_db.get_usage(
        current_user["user_id"], is_admin=current_user["is_admin"]
    )


@router.post("/feedback", status_code=204)
def feedback(
    payload: FeedbackRequest,
    current_user: dict = Depends(get_current_user),
):
    saved = ai_db.save_feedback(
        request_id=payload.request_id,
        user_id=current_user["user_id"],
        helpful=payload.helpful,
        reason_code=payload.reason_code,
        comment=payload.comment,
    )
    if not saved:
        raise HTTPException(status_code=404, detail="AI request not found")
    return Response(status_code=204)
