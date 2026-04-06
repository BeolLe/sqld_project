from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.api.auth.router import get_current_user, ensure_admin
from app.core.config import settings
from app.db.postgres import get_connection
from app.services.amplitude import send_amplitude_event
from app.services.slack import send_slack_message

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


class FeedbackAdminStatusUpdateRequest(BaseModel):
    status: FeedbackStatus


class FeedbackAdminReplyUpdateRequest(BaseModel):
    admin_reply: str


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


def build_feedback_admin_url(ticket_id: str) -> str | None:
    if not settings.APP_PUBLIC_BASE_URL:
        return None
    return f"{settings.APP_PUBLIC_BASE_URL}/admin/feedback?ticket_id={ticket_id}"


def notify_feedback_slack(
    *,
    ticket_id: str,
    current_user: dict,
    req: FeedbackCreateRequest,
) -> None:
    webhook_url = settings.FEEDBACK_SLACK_WEBHOOK_URL
    if not webhook_url:
        return

    admin_url = build_feedback_admin_url(ticket_id)
    info_lines = [
        f"*유형* `{req.type}`",
        f"*사용자* `{current_user['nickname']}` <{current_user['email']}>",
        f"*제목* {req.title.strip()}",
    ]
    if req.error_subtype:
        info_lines.append(f"*오류 유형* `{req.error_subtype}`")
    if req.related_exam_id:
        info_lines.append(f"*모의고사* `{req.related_exam_id}`")
    if req.related_problem_id:
        info_lines.append(f"*문제 ID* `{req.related_problem_id}`")
    if req.related_problem_no is not None:
        info_lines.append(f"*문항 번호* `{req.related_problem_no}`")

    blocks: list[dict] = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": "새 피드백이 접수되었습니다"},
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": "\n".join(info_lines)},
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*내용*\n{req.content.strip()}"},
        },
    ]

    if admin_url:
        blocks.append(
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "관리자 페이지 열기"},
                        "url": admin_url,
                    }
                ],
            }
        )
    else:
        blocks.append(
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "관리자 페이지 링크는 아직 연결되지 않았습니다. `/admin/feedback` 플레이스홀더만 준비된 상태입니다.",
                    }
                ],
            }
        )

    send_slack_message(
        text=f"[피드백] {req.type} - {req.title.strip()}",
        blocks=blocks,
        webhook_url=webhook_url,
    )


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
    notify_feedback_slack(
        ticket_id=str(ticket_id),
        current_user=current_user,
        req=req,
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
    ensure_admin(current_user)

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


@router.get("/admin/feedback")
def list_admin_feedback(
    tab: Literal["all", "service", "sql", "exam"] = Query("all"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    ensure_admin(current_user)

    offset = (page - 1) * size
    type_filters: dict[str, tuple[str, ...] | None] = {
        "all": None,
        "service": ("suggestion", "bug"),
        "sql": ("sql_error",),
        "exam": ("exam_error",),
    }
    selected_types = type_filters[tab]

    where_clause = ""
    params: list[object] = []
    if selected_types:
        where_clause = "WHERE t.type = ANY(%s)"
        params.append(list(selected_types))

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT COUNT(*)
                FROM feedback.tickets t
                {where_clause}
                """,
                params,
            )
            total = int(cur.fetchone()[0])

            cur.execute(
                f"""
                SELECT
                    t.ticket_id,
                    t.type,
                    t.status,
                    t.title,
                    t.content,
                    t.related_exam_id,
                    t.related_problem_id,
                    t.related_problem_no,
                    t.error_subtype,
                    t.admin_reply,
                    t.replied_at,
                    t.created_at,
                    u.nickname,
                    u.email
                FROM feedback.tickets t
                JOIN auth.users u
                  ON u.user_id = t.user_id
                {where_clause}
                ORDER BY t.created_at DESC
                LIMIT %s OFFSET %s
                """,
                [*params, size, offset],
            )
            items = []
            for row in cur.fetchall():
                ticket = serialize_ticket(row[:12])
                ticket["user_nickname"] = row[12]
                ticket["user_email"] = row[13]
                items.append(ticket)

    return {
        "total": total,
        "items": items,
    }


@router.patch("/admin/feedback/{ticket_id}/status")
def update_feedback_status(
    ticket_id: str,
    req: FeedbackAdminStatusUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    ensure_admin(current_user)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE feedback.tickets
                SET status = %s,
                    updated_at = now()
                WHERE ticket_id = %s
                RETURNING ticket_id, status
                """,
                (req.status, ticket_id),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="피드백을 찾을 수 없습니다.")

    return {
        "ticket_id": str(row[0]),
        "status": row[1],
        "message": "상태가 변경되었습니다.",
    }


@router.patch("/admin/feedback/{ticket_id}/reply")
def update_feedback_reply(
    ticket_id: str,
    req: FeedbackAdminReplyUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    ensure_admin(current_user)

    reply = req.admin_reply.strip()
    if not reply:
        raise HTTPException(status_code=400, detail="답변을 입력해주세요.")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE feedback.tickets
                SET admin_reply = %s,
                    replied_at = now(),
                    status = CASE
                      WHEN status = 'pending' THEN 'reviewing'
                      ELSE status
                    END,
                    updated_at = now()
                WHERE ticket_id = %s
                RETURNING ticket_id, admin_reply, replied_at, status
                """,
                (reply, ticket_id),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="피드백을 찾을 수 없습니다.")

    return {
        "ticket_id": str(row[0]),
        "admin_reply": row[1],
        "replied_at": row[2].isoformat() if row[2] else None,
        "status": row[3],
        "message": "답변이 저장되었습니다.",
    }
