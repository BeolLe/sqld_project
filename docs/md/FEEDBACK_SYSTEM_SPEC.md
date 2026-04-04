# 피드백 & 오류 제보 시스템 기획서

> 작성일: 2026-04-04
> 작성자: Product Manager (Claude)
> 대상: front_dev, back_dev

---

## 1. 개요

### 요청 배경
1. 사용자가 서비스 개선 건의/불편사항을 전달할 수 있는 채널 필요
2. 모의고사/SQL 실습 문제의 오류(오답, 오타, 해설 오류)를 즉시 제보할 수 있어야 함
3. 제보에 대한 처리 결과를 사용자에게 피드백해야 함

### 핵심 결정 사항
- **비공개 1:1 접수 방식** (다른 사용자에게 노출 안 됨)
- **처리 상태 알림** 제공 (접수 → 확인 중 → 처리 완료)
- 문제 오류 제보는 **풀이 화면에서 바로 접근** 가능해야 함

---

## 2. 피드백 유형

| 유형 | 코드 | 진입점 | 자동 첨부 정보 |
|------|------|--------|---------------|
| 서비스 건의 | `suggestion` | 헤더 또는 푸터의 "피드백" 링크 | 없음 |
| 버그 제보 | `bug` | 피드백 페이지에서 유형 선택 | 없음 |
| 모의고사 문제 오류 | `exam_error` | 모의고사 풀이 화면 "오류 제보" 버튼 | exam_id, 회차, 문항 번호, 문제 제목 |
| SQL 실습 문제 오류 | `sql_error` | SQL 실습 화면 "오류 제보" 버튼 | practice_id, 문제 제목, 난이도 |

---

## 3. 사용자 흐름

### 3-1. 서비스 건의 / 버그 제보

```
헤더 "피드백" 링크 클릭
  → /feedback 페이지 이동
  → 유형 선택: [서비스 건의] [버그 제보]
  → 제목 + 내용 입력
  → [제출]
  → "접수되었습니다. 내 피드백에서 처리 상태를 확인할 수 있습니다."
```

### 3-2. 문제 오류 제보 (모의고사)

**방식: 페이지에 버튼 1개 + 문항 번호 드롭다운**

시험 정보 바(상단)에 "오류 제보" 버튼 1개를 배치. 클릭 시 모달이 열리며, 문항 번호는 현재 보고 있는 페이지 기준으로 기본 선택됨.

```
모의고사 풀이 중
  → 상단 바의 "오류 제보" 버튼 클릭 (Flag 아이콘)
  → 모달 팝업:
    ┌────────────────────────────────┐
    │  문제 오류 제보                  │
    │  모의고사 1회                    │
    │                                │
    │  문항 번호: [23번 ▼]            │  ← 드롭다운 (1~50번)
    │            현재 보던 문항 기본선택 │
    │                                │
    │  오류 유형:                      │
    │  ○ 정답이 틀림                   │
    │  ○ 문제 오타/표현 오류           │
    │  ○ 해설 오류                     │
    │  ○ 기타                         │
    │                                │
    │  상세 설명:                      │
    │  [                             ]│
    │  [                             ]│
    │                                │
    │  [취소]         [제보하기]       │
    └────────────────────────────────┘
  → 제출 후 "제보가 접수되었습니다." 확인 화면
```

### 3-3. 문제 오류 제보 (SQL 실습)

SQL 실습은 문제 1개씩 표시되므로, 상단 네비게이션 바에 "오류 제보" 버튼 1개.
클릭 시 문제 ID와 제목이 자동 첨부되며, 문항 드롭다운은 불필요.

### 3-4. 내 피드백 조회

```
마이페이지 또는 피드백 페이지에서 "내 피드백" 탭
  → 내가 제출한 피드백 목록 (최신순)
  → 각 항목:
    ┌────────────────────────────────────────────┐
    │ [exam_error] 모의고사 1회 - 23번 문항        │
    │ 정답이 틀림 · 2026-04-04                     │
    │ 상태: 🟡 확인 중                              │
    │                                              │
    │ ▼ 운영자 답변 (2026-04-05)                   │
    │ "확인 결과 정답이 2번에서 3번으로 수정되었습니다. │
    │  감사합니다!"                                 │
    └────────────────────────────────────────────┘
```

---

## 4. 피드백 상태 관리

### 상태 흐름

```
[접수됨] → [확인 중] → [처리 완료]
  pending     reviewing    resolved
```

| 상태 | 코드 | 표시 | 설명 |
|------|------|------|------|
| 접수됨 | `pending` | 회색 | 제보 직후 기본 상태 |
| 확인 중 | `reviewing` | 노란색 | 운영자가 확인을 시작함 |
| 처리 완료 | `resolved` | 초록색 | 답변 작성 완료 |

### 운영자 답변

- 운영자가 백오피스(또는 DB 직접)에서 상태 변경 + 답변 작성
- 답변이 작성되면 사용자가 "내 피드백" 목록에서 확인 가능
- **MVP에서는 이메일/푸시 알림 없음** — 사용자가 직접 조회

> 향후 확장: 답변 등록 시 알림 배지 (헤더에 빨간 점), 이메일 알림 (SMTP 구축 후)

---

## 5. 페이지 레이아웃

### 5-1. 피드백 페이지 (`/feedback`)

```
┌─────────────────────────────────────────────────┐
│  피드백                                          │
│  서비스 개선 의견이나 문제 오류를 알려주세요.         │
├─────────────────────────────────────────────────┤
│                                                  │
│  [피드백 작성]          [내 피드백 N건]            │
│                                                  │
│  ── 피드백 작성 ──────────────────────────────    │
│                                                  │
│  유형:  ○ 서비스 건의  ○ 버그 제보                │
│                                                  │
│  제목:  [                                    ]   │
│                                                  │
│  내용:  [                                    ]   │
│         [                                    ]   │
│         [                                    ]   │
│                                                  │
│              [제출하기]                            │
│                                                  │
│  ── 내 피드백 ──────────────────────────────     │
│                                                  │
│  ┌─ 서비스 건의 ──────────────────────────┐      │
│  │ 다크모드 지원 요청                       │      │
│  │ 2026-04-04 · 상태: 접수됨               │      │
│  └────────────────────────────────────────┘      │
│  ┌─ 모의고사 문제 오류 ──────────────────┐       │
│  │ 1회 23번 - 정답이 틀림                  │       │
│  │ 2026-04-03 · 상태: ✅ 처리 완료         │       │
│  │ ▼ 답변: "수정 반영했습니다. 감사합니다!" │       │
│  └────────────────────────────────────────┘      │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 5-2. 진입점

| 위치 | 형태 | 동작 |
|------|------|------|
| 헤더 네비게이션 | "피드백" 텍스트 링크 (로그인 시만 표시) | `/feedback` 이동 |
| 모의고사 풀이 화면 | 시험 정보 바에 Flag 아이콘 + "오류 제보" 버튼 **1개** | 오류 제보 모달 (문항 드롭다운 포함) |
| SQL 실습 화면 | 상단 네비게이션 바에 Flag 아이콘 + "오류 제보" 버튼 **1개** | 오류 제보 모달 |
| 모의고사 결과 화면 | 향후 추가 예정 | - |

---

## 6. DB 스키마

### 신규 테이블: `feedback.tickets`

```sql
CREATE SCHEMA IF NOT EXISTS feedback;

CREATE TABLE feedback.tickets (
    ticket_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL,       -- 'suggestion', 'bug', 'exam_error', 'sql_error'
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'reviewing', 'resolved'
    title           VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL,

    -- 문제 오류 제보 시 자동 첨부
    related_exam_id     VARCHAR(50),            -- 모의고사 ID (nullable)
    related_problem_id  VARCHAR(50),            -- 문제 ID (nullable)
    related_problem_no  INTEGER,                -- 문항 번호 (nullable)
    error_subtype       VARCHAR(30),            -- 'wrong_answer', 'typo', 'explanation_error', 'other'

    -- 운영자 답변
    admin_reply     TEXT,
    replied_at      TIMESTAMPTZ,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_user_id ON feedback.tickets(user_id);
CREATE INDEX idx_tickets_status ON feedback.tickets(status);
CREATE INDEX idx_tickets_type ON feedback.tickets(type);
```

---

## 7. API 엔드포인트

### 7-1. POST /api/feedback (인증 필요)

피드백 제출.

```
Authorization: Bearer {token}

Request:
{
  "type": "exam_error",
  "title": "1회 23번 - 정답 오류",
  "content": "정답이 2번이라고 되어있는데 3번이 맞는 것 같습니다.",
  "related_exam_id": "exam-1",
  "related_problem_id": "problem-23",
  "related_problem_no": 23,
  "error_subtype": "wrong_answer"
}

Response 201:
{
  "ticket_id": "uuid...",
  "message": "피드백이 접수되었습니다."
}

Error:
400 { "detail": "제목을 입력해주세요." }
400 { "detail": "내용을 입력해주세요." }
```

### 7-2. GET /api/feedback (인증 필요)

내 피드백 목록 조회.

```
Authorization: Bearer {token}
Query: ?page=1&size=20

Response 200:
{
  "total": 3,
  "items": [
    {
      "ticket_id": "uuid...",
      "type": "exam_error",
      "status": "resolved",
      "title": "1회 23번 - 정답 오류",
      "error_subtype": "wrong_answer",
      "related_problem_no": 23,
      "admin_reply": "확인 후 수정 반영했습니다. 감사합니다!",
      "replied_at": "2026-04-05T...",
      "created_at": "2026-04-04T..."
    }
  ]
}
```

### 7-3. GET /api/feedback/{ticket_id} (인증 필요)

피드백 상세 조회.

```
Authorization: Bearer {token}

Response 200:
{
  "ticket_id": "uuid...",
  "type": "exam_error",
  "status": "resolved",
  "title": "1회 23번 - 정답 오류",
  "content": "정답이 2번이라고 되어있는데...",
  "related_exam_id": "exam-1",
  "related_problem_id": "problem-23",
  "related_problem_no": 23,
  "error_subtype": "wrong_answer",
  "admin_reply": "확인 후 수정 반영했습니다.",
  "replied_at": "2026-04-05T...",
  "created_at": "2026-04-04T..."
}

Error:
404 { "detail": "피드백을 찾을 수 없습니다." }
```

### 7-4. PUT /api/admin/feedback/{ticket_id} (관리자 전용)

운영자가 상태 변경 + 답변 작성.

```
Authorization: Bearer {admin_token}

Request:
{
  "status": "resolved",
  "admin_reply": "확인 후 수정 반영했습니다. 감사합니다!"
}

Response 200:
{
  "ticket_id": "uuid...",
  "status": "resolved",
  "message": "답변이 등록되었습니다."
}
```

> MVP 단계에서 관리자 인증은 별도 role 컬럼 또는 특정 user_id 화이트리스트로 처리.
> 백오피스 UI가 없으면 DB 직접 UPDATE 또는 간단한 admin API로 대체 가능.

---

## 8. 이벤트 로그

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `feedback_submitted` | 피드백 제출 | `user_id`, `type`, `error_subtype` |
| `feedback_list_viewed` | 내 피드백 목록 조회 | `user_id` |

---

## 9. 프론트엔드 작업 목록

| 순서 | 작업 | 상세 |
|------|------|------|
| 1 | `/feedback` 페이지 생성 | 피드백 작성 폼 + 내 피드백 목록 |
| 2 | 헤더에 "피드백" 링크 추가 | 로그인 시만 표시, 모의고사/SQL 실습/학습현황 옆 |
| 3 | 오류 제보 모달 컴포넌트 | 공용 `ReportErrorModal` — 문제 정보 자동 첨부 |
| 4 | 모의고사 풀이 화면에 신고 버튼 | `ExamTakingPage` 문제 영역에 Flag 아이콘 |
| 5 | SQL 실습 화면에 신고 버튼 | `SQLPracticePage` 문제 영역에 Flag 아이콘 |
| 6 | 모의고사 결과 화면에 신고 링크 | `ExamResultPage` 해설 영역에 "오류 제보" 텍스트 |
| 7 | App.tsx에 `/feedback` 라우트 추가 | |
| 8 | types/index.ts에 Feedback 타입 추가 | `FeedbackTicket`, `FeedbackType`, `FeedbackStatus` |

---

## 10. 작업 우선순위 및 의존성

```
[Phase 1: 백엔드]
  DB 스키마 생성 (feedback.tickets)
  POST /api/feedback + GET /api/feedback + GET /api/feedback/{id}
  PUT /api/admin/feedback/{id} (간단한 관리자 API)
      ↓
[Phase 2: 프론트엔드]
  /feedback 페이지 + 헤더 링크
  오류 제보 모달 + 풀이 화면 연동
      ↓
[Phase 3: QA]
  제보 → 조회 → 관리자 답변 → 사용자 확인 E2E 검증
```

**현재 백로그와의 관계**: 마이페이지 백엔드 API, 소셜 로그인 이후에 구현.

---

## 11. 제외 항목 (다음 단계)

| 항목 | 제외 이유 |
|------|-----------|
| 답변 알림 (배지/이메일) | SMTP 미구축, 알림 시스템 없음. MVP에서는 사용자가 직접 조회 |
| 이미지 첨부 | 파일 업로드 인프라 필요. 텍스트만으로 충분히 제보 가능 |
| 공개 QnA | 비공개 방침. 커뮤니티 기능은 사용자 규모 확대 후 재검토 |
| 백오피스 UI | 관리자 페이지 별도 구축 부담. DB 직접 또는 admin API로 대체 |
| 제보 중복 감지 | 같은 문제에 대한 중복 제보 자동 병합은 복잡도 대비 효용 낮음 |

---

## 12. 완료 조건 (Definition of Done)

- [ ] `/feedback` 페이지에서 서비스 건의/버그 제보 가능
- [ ] 모의고사 풀이 화면에서 문제 오류 제보 가능 (문제 ID 자동 첨부)
- [ ] SQL 실습 화면에서 문제 오류 제보 가능
- [ ] "내 피드백" 목록에서 제보 상태(접수/확인 중/처리 완료) 확인 가능
- [ ] 운영자 답변이 등록되면 사용자가 조회 가능
- [ ] 비로그인 상태에서 피드백 기능 접근 불가 (로그인 유도)
