# 대시보드 탭 리디자인 기획서

> 작성일: 2026-04-04
> 작성자: Product Manager (Claude)
> 대상: front_dev, back_dev

---

## 1. 현황 분석

### 현재 대시보드 문제점

| 항목 | 문제 |
|------|------|
| 요약 통계 4개 카드 | 모의고사 합격(2회), 총 학습 시간(4h 32m), 푼 문제 수(127문제)가 **하드코딩 목업** |
| 과목별 정답률 레이더 | 하드코딩 목업. 실제 과목(1과목: 데이터 모델링, 2과목: SQL 기본/활용)과 매핑 안 됨 |
| 모의고사 점수 추이 | 하드코딩 목업 3건 |
| 최근 모의고사 / SQL 실습 | 하드코딩 목업 |
| 보유 포인트 | 유일하게 실제 데이터 (`user.points`) 사용 |

### 백엔드에 이미 존재하는 데이터

백엔드 `dashboard` 스키마에 아래 집계 테이블이 존재:

| 테이블 | 필드 | 갱신 시점 |
|--------|------|-----------|
| `user_stats` | total_points, total_sql_practice_count, total_learning_seconds, total_solved_question_count, total_mock_exam_attempt_count, last_sql_practice_at, last_mock_exam_at | 모의고사 제출 / SQL 정답 제출 시 |
| `user_subject_stats` | subject_id, solved_count, correct_count, accuracy_rate | 모의고사 제출 시 |
| `user_exam_stats` | exam_id, attempt_count, best_score, last_score, last_attempt_at | 모의고사 제출 시 |

추가로 활용 가능한 raw 데이터:
- `exam_attempt_results`: 회차별 점수, 합격 여부, 과락 여부
- `exam_attempt_subject_results`: 회차별 과목별 정답률
- `sql_practice_attempts`: 문제별 정답 여부, 제출 SQL, 소요 시간

---

## 2. 리디자인 방향

### 원칙
- **실제 데이터만 표시**: 목업 제거, 백엔드 집계 데이터 연동
- **최소 기능**: 학습자가 "다음에 뭘 해야 하는지" 알 수 있는 정보만
- **점진적 공개**: 데이터가 없을 때는 빈 상태(empty state) + 행동 유도(CTA)

### 대상 사용자 시나리오
1. **첫 방문**: 아직 아무것도 안 풀었음 → "시작하기" CTA
2. **학습 중**: 모의고사 1~3회 풀고, SQL 몇 문제 풀어봄 → 약점 파악
3. **반복 학습**: 여러 회차 풀며 점수 추이 확인 → 성장 확인

---

## 3. 화면 구성 (섹션별 상세)

### 3-1. 요약 통계 카드 (4개 → 4개 유지)

| 카드 | 데이터 소스 | 비고 |
|------|------------|------|
| 보유 포인트 | `user.points` (기존 유지) | |
| 모의고사 응시 | `user_stats.total_mock_exam_attempt_count` | "합격" 대신 "응시"로 변경 (합격 횟수는 별도 API 필요하므로 MVP에서 제외) |
| 총 학습 시간 | `user_stats.total_learning_seconds` | 분 단위로 표시 (예: 4h 32m) |
| 푼 문제 수 | `user_stats.total_solved_question_count` | 모의고사 + SQL 실습 합산 |

**빈 상태**: 모두 0이면 "아직 학습 기록이 없습니다. 모의고사를 시작해보세요!" + CTA 버튼

### 3-2. 과목별 정답률 (레이더 차트 유지)

- **데이터 소스**: `user_subject_stats` (subject_id별 accuracy_rate)
- **과목 매핑**: SQLD 실제 시험 과목 기준
  - 1과목: 데이터 모델링의 이해
  - 2과목 세부: SQL 기본, SQL 활용, 관리 구문
- **빈 상태**: 모의고사 1회 이상 제출 후 표시. 미응시 시 "모의고사를 응시하면 과목별 분석을 볼 수 있습니다" 안내

### 3-3. 모의고사 점수 추이 (막대 차트 유지)

- **데이터 소스**: `exam_attempt_results` (최근 10회 응시 기록)
- **표시**: X축=응시 순서(최근→과거), Y축=점수(0~100), 합격선 60점 기준선
- **개선점**: 같은 회차를 여러 번 풀었을 때 모두 표시 (재응시 추적 가능)
- **빈 상태**: "아직 모의고사 응시 기록이 없습니다" + 모의고사 목록 이동 버튼

### 3-4. 최근 활동 (2열 → 2열 유지)

**최근 모의고사** (좌측)
- **데이터 소스**: `user_exam_stats` + `exam_attempt_results` JOIN
- 최근 5건: 회차명, 응시일, 점수, 합격/불합격 뱃지
- 클릭 시 해당 결과 페이지(`/exams/:id/result`)로 이동

**최근 SQL 실습** (우측)
- **데이터 소스**: `sql_practice_attempts` 최근 5건
- 문제명, 응시일, 정답/오답 뱃지
- 클릭 시 해당 문제(`/practice/:id`)로 이동

**빈 상태**: 각각 "아직 기록이 없습니다" + 해당 목록 페이지 CTA

---

## 4. 필요한 백엔드 작업

### 신규 API 엔드포인트 (1개)

```
GET /api/dashboard/summary
Authorization: Bearer {token}
```

**응답 구조:**
```json
{
  "stats": {
    "totalPoints": 120,
    "totalMockExamAttemptCount": 5,
    "totalLearningSeconds": 16320,
    "totalSolvedQuestionCount": 127
  },
  "subjectStats": [
    { "subjectId": "modeling", "subjectName": "데이터 모델링의 이해", "solvedCount": 40, "correctCount": 32, "accuracyRate": 80.0 },
    { "subjectId": "sql_basic", "subjectName": "SQL 기본", "solvedCount": 30, "correctCount": 24, "accuracyRate": 80.0 }
  ],
  "recentExamResults": [
    { "examId": "1", "examTitle": "SQLD 모의고사 1회", "attemptNo": 1, "scorePercent": 78, "passed": true, "submittedAt": "2026-02-20T..." }
  ],
  "recentSqlAttempts": [
    { "practiceId": "3", "title": "GROUP BY와 HAVING 절", "isCorrect": true, "submittedAt": "2026-02-22T..." }
  ]
}
```

**근거**: 프론트에서 4개 API를 따로 호출하는 대신 1개로 합쳐서 로딩 성능 최적화. 기존 집계 테이블을 JOIN하면 단일 쿼리로 가능.

---

## 5. 필요한 프론트엔드 작업

| 순서 | 작업 | 상세 |
|------|------|------|
| 1 | API 연동 함수 작성 | `GET /api/dashboard/summary` 호출, 응답 타입 정의 (`src/types/index.ts`) |
| 2 | DashboardPage 리팩토링 | 하드코딩 목업 데이터 제거, API 데이터로 교체 |
| 3 | 빈 상태(Empty State) UI | 각 섹션별 데이터 없을 때 안내 문구 + CTA 버튼 |
| 4 | 로딩 상태 | API 호출 중 스켈레톤 UI 또는 스피너 |
| 5 | 최근 활동 클릭 네비게이션 | 결과 페이지 / 문제 페이지로 이동 |

---

## 6. 제외 항목 (다음 단계)

아래는 MVP에서 제외하고, 사용자 피드백 후 추가 검토:

| 항목 | 제외 이유 |
|------|-----------|
| 합격률 / 합격 횟수 카드 | 별도 집계 로직 필요, 응시 횟수로 대체 |
| 오답 노트 | 별도 페이지로 분리하는 것이 적절 (대시보드에 넣으면 복잡) |
| 학습 캘린더 (잔디) | 일별 학습 기록 테이블이 없음, 추후 이벤트 로그 집계로 가능 |
| 랭킹 / 다른 사용자 비교 | 개인정보 이슈 + 현재 사용자 수 부족 |
| AI 기반 약점 분석 | 데이터 충분히 쌓인 후 검토 |

---

## 7. 작업 우선순위 및 의존성

```
[back_dev] GET /api/dashboard/summary 구현
    ↓
[front_dev] DashboardPage API 연동 + 목업 제거
    ↓
[front_dev] 빈 상태 UI + 로딩 상태 + 클릭 네비게이션
    ↓
[qa_dev] 검증: 빈 데이터 / 1건 / 다건 시나리오 테스트
```

---

## 8. 완료 조건 (Definition of Done)

- [ ] 대시보드 모든 섹션이 실제 백엔드 데이터를 표시한다
- [ ] 하드코딩된 목업 데이터가 코드에 존재하지 않는다
- [ ] 데이터가 없는 사용자에게 빈 상태 UI + CTA가 표시된다
- [ ] API 로딩 중 로딩 상태가 표시된다
- [ ] 최근 활동 항목 클릭 시 해당 상세 페이지로 이동한다
- [ ] TypeScript strict 모드에서 타입 에러가 없다
