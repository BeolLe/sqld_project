# 관리자 페이지 — 백엔드 구현 요구사항

> 프론트엔드 커밋: `feat: 관리자 페이지 프론트엔드 구현 (피드백 관리 + 유저 관리)`
> 작성일: 2026-04-06
> 기획서: `docs/md/ADMIN_PAGE_SPEC.md`

---

## 1. DB 마이그레이션

### 1-1. `auth.users` 테이블 변경

```sql
ALTER TABLE auth.users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
```

### 1-2. 피드백 테이블 신규 생성

```sql
CREATE SCHEMA IF NOT EXISTS feedback;

CREATE TABLE feedback.tickets (
    ticket_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES auth.users(user_id),
    type               VARCHAR(20) NOT NULL,
    status             VARCHAR(20) NOT NULL DEFAULT 'pending',
    title              VARCHAR(200) NOT NULL,
    content            TEXT NOT NULL,
    related_exam_id    VARCHAR(50),
    related_problem_id VARCHAR(50),
    related_problem_no INTEGER,
    error_subtype      VARCHAR(30),
    admin_reply        TEXT,
    replied_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 2. JWT 토큰 변경

- `create_access_token()`에서 `is_admin` 필드를 payload에 포함
- `GET /api/auth/me` 응답에 `is_admin: boolean` 추가

---

## 3. 관리자 인증 미들웨어

```python
def get_admin_user(credentials):
    user = get_current_user(credentials)
    # DB에서 is_admin 확인, false면 403 Forbidden
```

---

## 4. 필요 API 엔드포인트 (총 6개)

### 4-1. 관리자 피드백 목록 조회

| 항목 | 내용 |
| --- | --- |
| Method | `GET` |
| Endpoint | `/api/admin/feedback?tab=all&page=1&size=20` |
| Request Body | — |
| Response | `{ total: number, items: FeedbackTicket[] }` |
| 설명 | 관리자 피드백 목록. tab: `all` / `service` / `sql` / `exam`. items에 `user_nickname`, `user_email` 포함 |
| 인증 | `get_admin_user` |

### 4-2. 피드백 상태 변경

| 항목 | 내용 |
| --- | --- |
| Method | `PATCH` |
| Endpoint | `/api/admin/feedback/:ticket_id/status` |
| Request Body | `{ status: "pending" \| "reviewing" \| "resolved" }` |
| Response | `{ message: string }` |
| 설명 | 피드백 상태 변경 |
| 인증 | `get_admin_user` |

### 4-3. 피드백 답변 작성

| 항목 | 내용 |
| --- | --- |
| Method | `PATCH` |
| Endpoint | `/api/admin/feedback/:ticket_id/reply` |
| Request Body | `{ admin_reply: string }` |
| Response | `{ message: string }` |
| 설명 | 답변 작성. `replied_at`도 자동 갱신 |
| 인증 | `get_admin_user` |

### 4-4. 일반 유저 피드백 제출

| 항목 | 내용 |
| --- | --- |
| Method | `POST` |
| Endpoint | `/api/feedback` |
| Request Body | `{ type: string, title: string, content: string }` |
| Response | `{ message: string }` |
| 설명 | 일반 유저 피드백 제출 (기존 프론트에서 호출 중) |
| 인증 | `get_current_user` |

### 4-5. 유저 목록 조회

| 항목 | 내용 |
| --- | --- |
| Method | `GET` |
| Endpoint | `/api/admin/users?search=&page=1&size=20` |
| Request Body | — |
| Response | `{ total: number, items: AdminUserItem[] }` |
| 설명 | 유저 목록. search로 이메일/닉네임 ILIKE 검색. items: `{ user_id, email, nickname, points, is_admin, created_at }` |
| 인증 | `get_admin_user` |

### 4-6. 관리자 승격/해제

| 항목 | 내용 |
| --- | --- |
| Method | `PATCH` |
| Endpoint | `/api/admin/users/:user_id/role` |
| Request Body | `{ is_admin: boolean }` |
| Response | `{ message: string }` |
| 설명 | 관리자 승격/해제 |
| 인증 | `get_admin_user` |

---

## 5. 탭 필터 매핑 (GET /api/admin/feedback)

| tab 값 | SQL WHERE 조건 |
| --- | --- |
| `all` | 없음 |
| `service` | `type IN ('suggestion', 'bug')` |
| `sql` | `type = 'sql_error'` |
| `exam` | `type = 'exam_error'` |

> 모든 `/api/admin/*` 엔드포인트는 `get_admin_user` 미들웨어로 보호 필요.
