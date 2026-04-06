# 관리자 페이지 기획안 v1.0

> 작성일: 2026-04-06

## 1. 개요

| 항목 | 내용 |
|------|------|
| 기능명 | 관리자 대시보드 (Admin Panel) |
| 경로 | `/admin` (같은 SPA 내, role 기반 접근 제어) |
| 목적 | 유저 피드백 처리 + 유저 권한 관리 |
| 접근 권한 | `auth.users.is_admin = true`인 사용자만 |

---

## 2. 데이터 모델 변경

### 2-1. `auth.users` 테이블

```sql
ALTER TABLE auth.users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
```

### 2-2. 피드백 테이블 (신규)

```sql
CREATE TABLE feedback.tickets (
    ticket_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(user_id),
    type         VARCHAR(20) NOT NULL,        -- suggestion | bug | exam_error | sql_error
    status       VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | reviewing | resolved
    title        VARCHAR(200) NOT NULL,
    content      TEXT NOT NULL,
    related_exam_id    VARCHAR(50),
    related_problem_id VARCHAR(50),
    related_problem_no INTEGER,
    error_subtype      VARCHAR(30),           -- wrong_answer | typo | explanation_error | other
    admin_reply  TEXT,
    replied_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2-3. JWT 토큰 변경

`is_admin` 값을 JWT payload에 포함시켜 프론트에서 role 판별 가능하도록 함.

---

## 3. 백엔드 API

### 3-1. 관리자 인증 미들웨어

```
get_admin_user(token) → is_admin=true 확인, 아니면 403
```

### 3-2. 피드백 관리 API (관리자 전용)

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/admin/feedback?tab=all&page=1&size=20` | 전체 피드백 목록 (페이지네이션) |
| `GET` | `/api/admin/feedback?tab=service` | 서비스 탭 (`suggestion` + `bug`) |
| `GET` | `/api/admin/feedback?tab=sql` | SQL 탭 (`sql_error`) |
| `GET` | `/api/admin/feedback?tab=exam` | 모의고사 탭 (`exam_error`) |
| `PATCH` | `/api/admin/feedback/:ticket_id/status` | 상태 변경 (`{ status: 'reviewing' }`) |
| `PATCH` | `/api/admin/feedback/:ticket_id/reply` | 답변 작성 (`{ admin_reply: '...' }`) |

### 3-3. 유저 관리 API (관리자 전용)

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/admin/users?search=&page=1&size=20` | 유저 목록 (이메일/닉네임 검색) |
| `PATCH` | `/api/admin/users/:user_id/role` | 관리자 승격/해제 (`{ is_admin: true/false }`) |

### 3-4. 일반 유저 피드백 API (기존 프론트 연동용)

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/feedback` | 피드백 제출 |
| `GET` | `/api/feedback` | 내 피드백 목록 조회 |

---

## 4. 프론트엔드 화면 설계

### 4-1. 접근 제어

- `AuthContext`의 `User` 타입에 `isAdmin: boolean` 추가
- `/admin/*` 경로 접근 시 `isAdmin` 체크 → `false`면 `/` 리다이렉트
- Header에 관리자 전용 메뉴("관리자") 조건부 노출

### 4-2. 관리자 페이지 레이아웃

```
/admin
├── 사이드 탭 또는 상단 탭
│   ├── 피드백 관리
│   └── 유저 관리
```

### 4-3. 피드백 관리 화면 (`/admin/feedback`)

**상단 탭 (4개)**

| 탭 | 필터 조건 | 표시 라벨 |
|----|-----------|-----------|
| 전체 | 없음 (모든 피드백) | `전체` + 건수 뱃지 |
| 서비스 | `type IN (suggestion, bug)` | `서비스` + 건수 뱃지 |
| SQL | `type = sql_error` | `SQL` + 건수 뱃지 |
| 모의고사 | `type = exam_error` | `모의고사` + 건수 뱃지 |

**피드백 목록 테이블**

| 컬럼 | 내용 |
|------|------|
| 상태 | 뱃지 (접수됨 / 확인 중 / 처리 완료) |
| 유형 | 서비스 건의 / 버그 제보 / 모의고사 오류 / SQL 오류 |
| 제목 | 클릭 시 상세 패널 열림 |
| 작성자 | 닉네임 (이메일) |
| 작성일 | YYYY-MM-DD |

**상세 패널 (행 클릭 시 확장 또는 사이드 드로어)**

| 영역 | 내용 |
|------|------|
| 피드백 본문 | `content` 전문 |
| 관련 문제 | `related_exam_id`, `related_problem_no` (있을 경우) |
| 상태 변경 드롭다운 | `pending` → `reviewing` → `resolved` (역방향 허용) |
| 답변 입력란 | textarea + 저장 버튼. 저장 시 `admin_reply` 업데이트 + `replied_at` 자동 기록 |
| 기존 답변 표시 | 이미 답변이 있으면 표시 (수정 가능) |

### 4-4. 유저 관리 화면 (`/admin/users`)

**상단 검색바**: 이메일 또는 닉네임으로 검색

**유저 목록 테이블**

| 컬럼 | 내용 |
|------|------|
| 닉네임 | - |
| 이메일 | - |
| 가입일 | YYYY-MM-DD |
| 포인트 | 총 보유 포인트 |
| 역할 | `일반` / `관리자` 뱃지 |
| 액션 | 관리자 승격/해제 토글 버튼 |

**관리자 승격/해제 플로우**:
1. 토글 버튼 클릭
2. 확인 모달: "OOO님을 관리자로 승격/해제하시겠습니까?"
3. 확인 → API 호출 → 성공 시 뱃지 즉시 업데이트

---

## 5. 라우팅 추가

```
/admin              → AdminPage (피드백 관리가 기본 탭)
/admin/feedback     → 피드백 관리 탭
/admin/users        → 유저 관리 탭
```

---

## 6. 작업 순서 및 의존성

```
[1단계] 백엔드
  ├── DB 마이그레이션 (is_admin 컬럼, feedback 테이블)
  ├── JWT에 is_admin 포함
  ├── 관리자 인증 미들웨어
  ├── 피드백 CRUD API
  └── 유저 관리 API

[2단계] 프론트엔드 (백엔드 완료 후)
  ├── User 타입 + AuthContext에 isAdmin 추가
  ├── 관리자 라우트 가드
  ├── AdminFeedbackPage 구현
  ├── AdminUsersPage 구현
  └── Header에 관리자 메뉴 추가

[3단계] QA
  └── 관리자/비관리자 접근 제어 테스트, 피드백 CRUD 테스트
```

---

## 7. 스코프 외 (다음에)

- 유저 비활성화/탈퇴 처리
- 유저 상세 정보 조회 (학습 현황 등)
- 피드백 삭제 기능
- 피드백 통계 대시보드
- 관리자 활동 로그
