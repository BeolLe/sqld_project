from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.api.auth.router import get_current_user
from app.core.config import settings
from app.db.postgres import get_connection
from app.services.amplitude import send_amplitude_event

router = APIRouter(prefix="/api", tags=["feedback"])

FeedbackType = Literal["suggestion", "bug", "exam_error", "sql_error"]
FeedbackStatus = Literal["pending", "reviewing", "resolved"]
ErrorSubtype = Literal["wrong_answer", "typo", "explanation_error", "other"]


class FeedbackCreateRequest(BaseModel):
    type: FeedbackType
    title: str
    content: str
    related_exam_id: str | None = None
    related_problem_id: str | None = None
    related_problem_no: int | None = None
    error_subtype: ErrorSubtype | None = None


class FeedbackAdminUpdateRequest(BaseModel):
    status: FeedbackStatus
    admin_reply: str | None = None


def serialize_ticket(row: tuple) -> dict:
    return {
        "ticket_id": str(row[0]),
        "type": row[1],
        "status": row[2],
        "title": row[3],
        "content": row[4],
        "related_exam_id": row[5],
        "related_problem_id": row[6],
        "related_problem_no": row[7],
        "error_subtype": row[8],
        "admin_reply": row[9],
        "replied_at": row[10].isoformat() if row[10] else None,
        "created_at": row[11].isoformat() if row[11] else None,
    }


def ensure_feedback_admin(current_user: dict) -> None:
    if current_user["user_id"] not in settings.FEEDBACK_ADMIN_USER_IDS:
        raise HTTPException(status_code=403, detail="admin access required")


@router.post("/feedback", status_code=201)
def create_feedback(
    req: FeedbackCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    title = req.title.strip()
    content = req.content.strip()

    if not title:
        raise HTTPException(status_code=400, detail="제목을 입력해주세요.")
    if not content:
        raise HTTPException(status_code=400, detail="내용을 입력해주세요.")
    if req.type in {"exam_error", "sql_error"} and not req.error_subtype:
        raise HTTPException(status_code=400, detail="오류 유형을 선택해주세요.")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO feedback.tickets (
                    user_id,
                    type,
                    title,
                    content,
                    related_exam_id,
                    related_problem_id,
                    related_problem_no,
                    error_subtype
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING ticket_id
                """,
                (
                    current_user["user_id"],
                    req.type,
                    title,
                    content,
                    req.related_exam_id,
                    req.related_problem_id,
                    req.related_problem_no,
                    req.error_subtype,
                ),
            )
            ticket_id = cur.fetchone()[0]

    send_amplitude_event(
        event_type="feedback_submitted",
        user_id=current_user["user_id"],
        event_properties={
            "type": req.type,
            "error_subtype": req.error_subtype,
            "related_exam_id": req.related_exam_id,
            "related_problem_id": req.related_problem_id,
        },
        user_properties={
            "email": current_user["email"],
            "nickname": current_user["nickname"],
        },
        insert_id=str(ticket_id),
    )

    return {
        "ticket_id": str(ticket_id),
        "message": "피드백이 접수되었습니다.",
    }


@router.get("/feedback")
def list_feedback(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    offset = (page - 1) * size

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*)
                FROM feedback.tickets
                WHERE user_id = %s
                """,
                (current_user["user_id"],),
            )
            total = int(cur.fetchone()[0])

            cur.execute(
                """
                SELECT
                    ticket_id,
                    type,
                    status,
                    title,
                    content,
                    related_exam_id,
                    related_problem_id,
                    related_problem_no,
                    error_subtype,
                    admin_reply,
                    replied_at,
                    created_at
                FROM feedback.tickets
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
                """,
                (current_user["user_id"], size, offset),
            )
            items = [serialize_ticket(row) for row in cur.fetchall()]

    send_amplitude_event(
        event_type="feedback_list_viewed",
        user_id=current_user["user_id"],
        event_properties={"page": page, "size": size, "total": total},
        user_properties={
            "email": current_user["email"],
            "nickname": current_user["nickname"],
        },
    )

    return {
        "total": total,
        "items": items,
    }


@router.get("/feedback/{ticket_id}")
def get_feedback(ticket_id: str, current_user: dict = Depends(get_current_user)):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    ticket_id,
                    type,
                    status,
                    title,
                    content,
                    related_exam_id,
                    related_problem_id,
                    related_problem_no,
                    error_subtype,
                    admin_reply,
                    replied_at,
                    created_at
                FROM feedback.tickets
                WHERE ticket_id = %s
                  AND user_id = %s
                """,
                (ticket_id, current_user["user_id"]),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="피드백을 찾을 수 없습니다.")

    return serialize_ticket(row)


@router.put("/admin/feedback/{ticket_id}")
def update_feedback_admin(
    ticket_id: str,
    req: FeedbackAdminUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    ensure_feedback_admin(current_user)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE feedback.tickets
                SET
                    status = %s,
                    admin_reply = %s,
                    replied_at = CASE
                        WHEN %s IS NOT NULL AND btrim(%s) <> '' THEN now()
                        ELSE replied_at
                    END,
                    updated_at = now()
                WHERE ticket_id = %s
                RETURNING ticket_id, status
                """,
                (
                    req.status,
                    req.admin_reply,
                    req.admin_reply,
                    req.admin_reply,
                    ticket_id,
                ),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="피드백을 찾을 수 없습니다.")

    return {
        "ticket_id": str(row[0]),
        "status": row[1],
        "message": "답변이 등록되었습니다.",
    }
