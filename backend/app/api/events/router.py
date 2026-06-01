from __future__ import annotations

import re
from datetime import UTC, datetime, timedelta
from typing import Any
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from psycopg.rows import dict_row

from app.api.auth.router import ensure_admin, get_current_user
from app.db.postgres import get_connection

router = APIRouter(prefix="/api/events", tags=["events"])

KST = ZoneInfo("Asia/Seoul")
PHONE_DIGITS_RE = re.compile(r"\D")
PHASE2_PREVIEW_HOSTS = {"test_dummies.selfronny.com"}
PHASE2_PREVIEW_CAMPAIGN_KEY = "sqld_61_phase2"


class PopupCampaignDismissRequest(BaseModel):
    hide_for_today: bool = True
    hide_until_campaign_end: bool = False


class PopupCampaignResponseUpsertRequest(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)
    phone_number: str | None = None
    phone_consent_agreed: bool = False


def normalize_phone_number(raw: str | None) -> str | None:
    if raw is None:
        return None
    digits = PHONE_DIGITS_RE.sub("", raw)
    return digits or None


def parse_datetime_value(raw: str | None) -> datetime | None:
    if not raw:
        return None
    normalized = raw.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed


def extract_request_hostname(value: str | None) -> str | None:
    if not value:
        return None
    candidate = value.split(",")[0].strip()
    if "://" in candidate:
        return urlparse(candidate).hostname
    return candidate.split(":")[0].strip().lower() or None


def is_phase2_preview_request(request) -> bool:
    candidates = (
        extract_request_hostname(request.headers.get("x-forwarded-host")),
        extract_request_hostname(request.headers.get("host")),
        extract_request_hostname(request.headers.get("origin")),
        extract_request_hostname(request.headers.get("referer")),
    )
    return any(host in PHASE2_PREVIEW_HOSTS for host in candidates if host)


def end_of_today_kst() -> datetime:
    now_kst = datetime.now(KST)
    tomorrow = (now_kst + timedelta(days=1)).date()
    return datetime.combine(tomorrow, datetime.min.time(), KST) - timedelta(seconds=1)


def load_user_profile(user_id: str) -> dict:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    u.user_id::text AS user_id,
                    u.created_at,
                    COALESCE(ds.total_points, 0) AS total_points
                FROM auth.users u
                LEFT JOIN dashboard.user_stats ds
                  ON ds.user_id = u.user_id
                WHERE u.user_id = %s
                """,
                (user_id,),
            )
            row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="user not found")
    return row


def has_campaign_response_or_view(*, user_id: str, campaign_key: str) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT 1
                FROM event.popup_campaigns c
                WHERE c.campaign_key = %s
                  AND (
                    EXISTS (
                      SELECT 1
                      FROM event.popup_campaign_responses r
                      WHERE r.campaign_id = c.campaign_id
                        AND r.user_id = %s
                    )
                    OR EXISTS (
                      SELECT 1
                      FROM event.popup_campaign_views v
                      WHERE v.campaign_id = c.campaign_id
                        AND v.user_id = %s
                    )
                  )
                LIMIT 1
                """,
                (campaign_key, user_id, user_id),
            )
            return cur.fetchone() is not None


def is_campaign_eligible(*, campaign: dict, user_profile: dict, allow_phase2_preview: bool = False) -> bool:
    rule = campaign.get("eligibility_rule") or {}
    points = int(user_profile.get("total_points") or 0)
    created_at = user_profile.get("created_at")
    created_at_dt = created_at if isinstance(created_at, datetime) else None

    if campaign["phase_code"] == "cheer":
        return True

    if campaign["phase_code"] == "phase1":
        min_points = int(rule.get("min_points") or 0)
        if points >= min_points:
            return True

        recent_signup_after = parse_datetime_value(rule.get("recent_signup_after"))
        recent_signup_min_points = int(rule.get("recent_signup_min_points") or 0)
        if recent_signup_after and created_at_dt:
            if created_at_dt >= recent_signup_after and points >= recent_signup_min_points:
                return True
        return False

    if campaign["phase_code"] == "phase2":
        if allow_phase2_preview and campaign["campaign_key"] == PHASE2_PREVIEW_CAMPAIGN_KEY:
            return True
        required_campaign_key = rule.get("requires_campaign_key")
        if not required_campaign_key:
            return False
        return has_campaign_response_or_view(
            user_id=user_profile["user_id"],
            campaign_key=required_campaign_key,
        )

    return False


def build_campaign_payload(row: dict, *, eligible: bool) -> dict:
    response_exists = row.get("response_id") is not None
    hidden_until = row.get("hidden_until")
    return {
        "campaignKey": row["campaign_key"],
        "title": row["title"],
        "phaseCode": row["phase_code"],
        "exposureStartAt": row["exposure_start_at"].isoformat() if row["exposure_start_at"] else None,
        "exposureEndAt": row["exposure_end_at"].isoformat() if row["exposure_end_at"] else None,
        "responseOpenAt": row["response_open_at"].isoformat() if row["response_open_at"] else None,
        "responseCloseAt": row["response_close_at"].isoformat() if row["response_close_at"] else None,
        "eligibilityRule": row.get("eligibility_rule") or {},
        "formSchema": row.get("form_schema") or {},
        "eligible": eligible,
        "submitted": response_exists,
        "dismissedUntil": hidden_until.isoformat() if hidden_until else None,
        "showModal": eligible and not response_exists and not hidden_until,
        "response": (
            {
                "responseId": row["response_id"],
                "phoneNumber": row["phone_number"],
                "phoneConsentAgreed": bool(row["phone_consent_agreed"]),
                "answers": row.get("answers") or {},
                "submittedAt": row["submitted_at"].isoformat() if row["submitted_at"] else None,
                "updatedAt": row["response_updated_at"].isoformat() if row["response_updated_at"] else None,
            }
            if response_exists
            else None
        ),
    }


def validate_response_payload(req: PopupCampaignResponseUpsertRequest) -> str:
    phone_number = normalize_phone_number(req.phone_number)
    if not phone_number:
        raise HTTPException(status_code=400, detail="phone number is required")
    if len(phone_number) not in {10, 11}:
        raise HTTPException(status_code=400, detail="phone number is invalid")
    if not req.phone_consent_agreed:
        raise HTTPException(status_code=400, detail="phone consent is required")
    if not req.answers:
        raise HTTPException(status_code=400, detail="answers are required")
    return phone_number


def fetch_visible_campaign_rows(user_id: str, *, allow_phase2_preview: bool = False) -> list[dict]:
    now = datetime.now(UTC)
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    c.campaign_id,
                    c.campaign_key,
                    c.title,
                    c.phase_code,
                    c.exposure_start_at,
                    c.exposure_end_at,
                    c.response_open_at,
                    c.response_close_at,
                    c.eligibility_rule,
                    c.form_schema,
                    r.response_id,
                    r.phone_number,
                    r.phone_consent_agreed,
                    r.answers,
                    r.submitted_at,
                    r.updated_at AS response_updated_at,
                    CASE
                        WHEN v.hidden_until IS NOT NULL AND v.hidden_until > %s THEN v.hidden_until
                        ELSE NULL
                    END AS hidden_until
                FROM event.popup_campaigns c
                LEFT JOIN event.popup_campaign_responses r
                  ON r.campaign_id = c.campaign_id
                 AND r.user_id = %s
                LEFT JOIN event.popup_campaign_views v
                  ON v.campaign_id = c.campaign_id
                 AND v.user_id = %s
                WHERE c.is_active = true
                  AND (
                    (c.exposure_start_at <= %s AND c.exposure_end_at >= %s)
                    OR (%s AND c.campaign_key = %s)
                  )
                ORDER BY
                  CASE c.phase_code
                    WHEN 'cheer' THEN 0
                    WHEN 'phase1' THEN 1
                    WHEN 'phase2' THEN 2
                    ELSE 99
                  END,
                  c.campaign_id ASC
                """,
                (
                    now,
                    user_id,
                    user_id,
                    now,
                    now,
                    allow_phase2_preview,
                    PHASE2_PREVIEW_CAMPAIGN_KEY,
                ),
            )
            return cur.fetchall()


@router.get("/modal")
def get_active_modal(request: Request, current_user: dict = Depends(get_current_user)):
    user_profile = load_user_profile(current_user["user_id"])
    allow_phase2_preview = is_phase2_preview_request(request)
    rows = fetch_visible_campaign_rows(
        current_user["user_id"],
        allow_phase2_preview=allow_phase2_preview,
    )
    items = [
        build_campaign_payload(
            row,
            eligible=is_campaign_eligible(
                campaign=row,
                user_profile=user_profile,
                allow_phase2_preview=allow_phase2_preview,
            ),
        )
        for row in rows
    ]
    active_modal = next((item for item in items if item["showModal"]), None)
    return {"items": items, "activeModal": active_modal}


@router.post("/modal/{campaign_key}/dismiss")
def dismiss_modal_for_today(
    campaign_key: str,
    req: PopupCampaignDismissRequest,
    current_user: dict = Depends(get_current_user),
):
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT campaign_id, campaign_key, exposure_end_at
                FROM event.popup_campaigns
                WHERE campaign_key = %s
                  AND is_active = true
                """,
                (campaign_key,),
            )
            campaign = cur.fetchone()
            if not campaign:
                raise HTTPException(status_code=404, detail="campaign not found")

            if req.hide_until_campaign_end:
                hidden_until = campaign["exposure_end_at"]
            elif req.hide_for_today:
                hidden_until = end_of_today_kst()
            else:
                raise HTTPException(
                    status_code=400,
                    detail="either hide_for_today or hide_until_campaign_end must be true",
                )

            cur.execute(
                """
                INSERT INTO event.popup_campaign_views (
                    campaign_id,
                    user_id,
                    hidden_until,
                    last_seen_at
                )
                VALUES (%s, %s, %s, now())
                ON CONFLICT (campaign_id, user_id) DO UPDATE
                SET
                    hidden_until = EXCLUDED.hidden_until,
                    last_seen_at = now(),
                    updated_at = now()
                """,
                (campaign["campaign_id"], current_user["user_id"], hidden_until),
            )

    return {
        "campaignKey": campaign_key,
        "hiddenUntil": hidden_until.isoformat(),
        "message": "modal dismissed",
    }


@router.post("/modal/{campaign_key}/response", status_code=201)
def submit_modal_response(
    campaign_key: str,
    req: PopupCampaignResponseUpsertRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    user_profile = load_user_profile(current_user["user_id"])
    now = datetime.now(UTC)
    phone_number = validate_response_payload(req)
    allow_phase2_preview = (
        campaign_key == PHASE2_PREVIEW_CAMPAIGN_KEY and is_phase2_preview_request(request)
    )

    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    campaign_id,
                    campaign_key,
                    title,
                    phase_code,
                    exposure_start_at,
                    exposure_end_at,
                    response_open_at,
                    response_close_at,
                    eligibility_rule,
                    form_schema,
                    is_active
                FROM event.popup_campaigns
                WHERE campaign_key = %s
                """,
                (campaign_key,),
            )
            campaign = cur.fetchone()

            if not campaign or not campaign["is_active"]:
                raise HTTPException(status_code=404, detail="campaign not found")
            if (
                not allow_phase2_preview
                and (now < campaign["response_open_at"] or now > campaign["response_close_at"])
            ):
                raise HTTPException(status_code=400, detail="campaign response window is closed")
            if not is_campaign_eligible(
                campaign=campaign,
                user_profile=user_profile,
                allow_phase2_preview=allow_phase2_preview,
            ):
                raise HTTPException(status_code=403, detail="campaign not eligible")

            cur.execute(
                """
                INSERT INTO event.popup_campaign_responses (
                    campaign_id,
                    user_id,
                    phone_number,
                    phone_consent_agreed,
                    answers
                )
                VALUES (%s, %s, %s, %s, %s::jsonb)
                ON CONFLICT (campaign_id, user_id) DO UPDATE
                SET
                    phone_number = EXCLUDED.phone_number,
                    phone_consent_agreed = EXCLUDED.phone_consent_agreed,
                    answers = EXCLUDED.answers,
                    submitted_at = now(),
                    updated_at = now()
                RETURNING
                    response_id,
                    phone_number,
                    phone_consent_agreed,
                    answers,
                    submitted_at,
                    updated_at
                """,
                (
                    campaign["campaign_id"],
                    current_user["user_id"],
                    phone_number,
                    req.phone_consent_agreed,
                    req.model_dump_json(include={"answers"}),
                ),
            )
            response_row = cur.fetchone()

            cur.execute(
                """
                DELETE FROM event.popup_campaign_views
                WHERE campaign_id = %s
                  AND user_id = %s
                """,
                (campaign["campaign_id"], current_user["user_id"]),
            )

    return {
        "campaignKey": campaign["campaign_key"],
        "responseId": response_row["response_id"],
        "phoneNumber": response_row["phone_number"],
        "phoneConsentAgreed": bool(response_row["phone_consent_agreed"]),
        "answers": response_row.get("answers") or {},
        "submittedAt": response_row["submitted_at"].isoformat() if response_row["submitted_at"] else None,
        "updatedAt": response_row["updated_at"].isoformat() if response_row["updated_at"] else None,
        "message": "response saved",
    }


@router.get("/admin/modal/{campaign_key}/responses")
def list_modal_responses(
    campaign_key: str,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    ensure_admin(current_user)
    offset = (page - 1) * size

    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT campaign_id, campaign_key, title, phase_code
                FROM event.popup_campaigns
                WHERE campaign_key = %s
                """,
                (campaign_key,),
            )
            campaign = cur.fetchone()
            if not campaign:
                raise HTTPException(status_code=404, detail="campaign not found")

            cur.execute(
                """
                SELECT COUNT(*) AS total
                FROM event.popup_campaign_responses
                WHERE campaign_id = %s
                """,
                (campaign["campaign_id"],),
            )
            total = int(cur.fetchone()["total"])

            cur.execute(
                """
                SELECT
                    r.response_id,
                    r.user_id::text AS user_id,
                    u.email,
                    u.nickname,
                    u.created_at,
                    COALESCE(ds.total_points, 0) AS total_points,
                    r.phone_number,
                    r.phone_consent_agreed,
                    r.answers,
                    r.submitted_at,
                    r.updated_at
                FROM event.popup_campaign_responses r
                JOIN auth.users u
                  ON u.user_id = r.user_id
                LEFT JOIN dashboard.user_stats ds
                  ON ds.user_id = u.user_id
                WHERE r.campaign_id = %s
                ORDER BY r.submitted_at DESC, r.response_id DESC
                LIMIT %s OFFSET %s
                """,
                (campaign["campaign_id"], size, offset),
            )
            items = [
                {
                    "responseId": row["response_id"],
                    "userId": row["user_id"],
                    "email": row["email"],
                    "nickname": row["nickname"],
                    "createdAt": row["created_at"].isoformat() if row["created_at"] else None,
                    "points": int(row["total_points"] or 0),
                    "phoneNumber": row["phone_number"],
                    "phoneConsentAgreed": bool(row["phone_consent_agreed"]),
                    "answers": row.get("answers") or {},
                    "submittedAt": row["submitted_at"].isoformat() if row["submitted_at"] else None,
                    "updatedAt": row["updated_at"].isoformat() if row["updated_at"] else None,
                }
                for row in cur.fetchall()
            ]

    return {
        "campaignKey": campaign["campaign_key"],
        "phaseCode": campaign["phase_code"],
        "title": campaign["title"],
        "total": total,
        "items": items,
    }
