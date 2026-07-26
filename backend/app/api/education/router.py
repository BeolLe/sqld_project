from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.auth.router import get_current_user
from app.db.education import (
    get_lesson_progress,
    get_published_curriculum,
    get_published_lesson,
    list_published_curricula,
    save_lesson_progress,
)

router = APIRouter(prefix="/api/education", tags=["education"])


class LessonProgressRequest(BaseModel):
    lesson_version_id: int = Field(alias="lessonVersionId", gt=0)
    resume_anchor: str | None = Field(
        default=None,
        alias="resumeAnchor",
        max_length=128,
    )
    resume_offset_px: int | None = Field(
        default=None,
        alias="resumeOffsetPx",
        ge=0,
    )
    completed: bool = False


@router.get("/curricula")
def list_curricula():
    return {"curricula": list_published_curricula()}


@router.get("/curricula/{curriculum_code}")
def get_curriculum(curriculum_code: str):
    curriculum = get_published_curriculum(curriculum_code)
    if curriculum is None:
        raise HTTPException(status_code=404, detail="curriculum not found")
    return curriculum


@router.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: int):
    lesson = get_published_lesson(lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="lesson not found")
    return lesson


@router.get("/lessons/{lesson_id}/progress")
def read_progress(
    lesson_id: int,
    current_user: dict = Depends(get_current_user),
):
    return {
        "progress": get_lesson_progress(
            user_id=current_user["user_id"],
            lesson_id=lesson_id,
        )
    }


@router.put("/lessons/{lesson_id}/progress")
def write_progress(
    lesson_id: int,
    request: LessonProgressRequest,
    current_user: dict = Depends(get_current_user),
):
    progress = save_lesson_progress(
        user_id=current_user["user_id"],
        lesson_id=lesson_id,
        lesson_version_id=request.lesson_version_id,
        resume_anchor=request.resume_anchor,
        resume_offset_px=request.resume_offset_px,
        completed=request.completed,
    )
    if progress is None:
        raise HTTPException(
            status_code=404,
            detail="published lesson version not found",
        )
    return {"progress": progress}
