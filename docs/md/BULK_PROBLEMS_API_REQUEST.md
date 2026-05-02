# 벌크 문제 조회 API 요청서

## 배경

무한풀이 기능(`/endless`)에서 전체 문제를 로드할 때, 현재 프론트엔드는 아래와 같이 N+1 패턴으로 호출합니다.

```
GET /api/content/exams              → 시험 목록 (10건)
GET /api/content/exams/1            → 50문제
GET /api/content/exams/2            → 50문제
...
GET /api/content/exams/10           → 50문제
```

총 11회 HTTP 요청으로 500문제를 수집합니다. 시험이 늘어날수록 요청 수도 비례 증가합니다.

## 요청 사항

전체 시험 문제를 1회 호출로 반환하는 벌크 엔드포인트를 추가해주세요.

### 제안 엔드포인트

```
GET /api/content/exams/problems
```

### 응답 형식

기존 `GET /api/content/exams/{exam_id}` 응답(`Problem[]`)과 동일한 구조의 배열을 반환합니다.

```json
[
  {
    "id": "exam_q_1",
    "title": "...",
    "description": "...",
    "type": "multiple_choice",
    "difficulty": "easy",
    "category": "DML",
    "correctRate": 75.0,
    "answer": "3",
    "explanation": "...",
    "options": ["...", "...", "...", "..."],
    "points": 2
  }
]
```

### 선택적 쿼리 파라미터

필수는 아니지만, 추후 카테고리별 필터링에 활용 가능합니다.

| 파라미터 | 설명 | 예시 |
|----------|------|------|
| `category` | 특정 카테고리만 필터링 | `?category=DML` |

## 프론트 대응 계획

이 엔드포인트가 준비되면 프론트에서 아래와 같이 교체합니다.

```diff
- fetchExamList().then(exams =>
-   Promise.all(exams.map(e => fetchExamProblems(e.id)))
- )
+ apiFetch<Problem[]>('/content/exams/problems')
```

## 우선순위

중간 — 현재 동작에 문제는 없으나, 시험 수 증가 시 성능 저하 예상
