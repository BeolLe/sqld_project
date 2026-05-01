# 무한풀이 백엔드 API 요구사항

> 작성일: 2026-05-01
> 대상: back_dev (현석님)
> 프론트 상태: MVP 구현 완료 (정적 데이터 기반, 기록 미저장)

---

## 1. 개요

무한풀이는 기존 모의고사 500문항을 랜덤 셔플하여 1문제씩 무한히 풀 수 있는 기능입니다.
현재 프론트엔드는 정적 데이터로 동작하며, 아래 API가 구현되면 서버 기록 저장으로 전환합니다.

---

## 2. 필요 API

### 2.1 풀이 기록 저장

```
POST /endless/answer
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "problem_id": "exam1_p1",
  "selected_answer": "2",
  "is_correct": true,
  "category": "데이터모델링",
  "difficulty": "easy"
}
```

**Response:**
```json
{
  "total_answered": 13,
  "total_correct": 10,
  "correct_rate": 76.9
}
```

### 2.2 풀이 통계 조회

```
GET /endless/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_answered": 128,
  "total_correct": 95,
  "correct_rate": 74.2,
  "by_category": {
    "JOIN": { "answered": 18, "correct": 14, "rate": 77.8 },
    "서브쿼리": { "answered": 15, "correct": 9, "rate": 60.0 }
  },
  "by_difficulty": {
    "easy": { "answered": 45, "correct": 40, "rate": 88.9 },
    "medium": { "answered": 52, "correct": 38, "rate": 73.1 },
    "hard": { "answered": 31, "correct": 17, "rate": 54.8 }
  }
}
```

### 2.3 풀이 기록 초기화 (선택)

```
DELETE /endless/stats
Authorization: Bearer {token}
```

---

## 3. DB 스키마 제안

`logs` 스키마에 테이블 추가:

```sql
CREATE TABLE IF NOT EXISTS logs.endless_answers (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(user_id),
    problem_id      VARCHAR(20) NOT NULL,
    selected_answer VARCHAR(5) NOT NULL,
    is_correct      BOOLEAN NOT NULL,
    category        VARCHAR(30),
    difficulty      VARCHAR(10),
    answered_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_endless_user_id ON logs.endless_answers (user_id);
CREATE INDEX IF NOT EXISTS idx_endless_answered_at ON logs.endless_answers (answered_at);
```

**참고:** `category` 컬럼은 현재 프론트 문제 데이터의 `category` 필드값 그대로 저장합니다.
카테고리 목록: `데이터모델링`, `정규화`, `JOIN`, `서브쿼리`, `함수`, `윈도우함수`, `DML`, `DDL`, `DCL/TCL`, `집합연산`, `GROUP BY`, `ORDER BY`, `계층형쿼리`, `PIVOT/UNPIVOT`, `TOP N 쿼리`, `정규표현식`

---

## 4. 프론트 연동 계획

백엔드 API 완성 시 프론트에서 변경할 부분:
- 선택지 클릭 시 `POST /endless/answer` 호출 추가
- 페이지 마운트 시 `GET /endless/stats` 호출하여 누적 통계 표시
- 초기화 버튼에 `DELETE /endless/stats` 연동

기존 정적 데이터 기반 문제 출제 로직은 그대로 유지 (문제 셔플은 프론트에서 처리).
