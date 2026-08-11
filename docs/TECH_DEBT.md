# SolSQLD 기술 부채 레지스터

> 최종 업데이트: 2026-03-14
> 관리자: 개발팀장

이 문서는 SolSQLD 프로젝트의 아키텍처 수준 기술 부채를 추적합니다.
각 항목은 식별 → 해소 → 완료 순으로 관리됩니다.

---

## 범례

| 심각도 | 의미 |
|--------|------|
| CRITICAL | 아키텍처 확장을 근본적으로 막는 구조적 문제 |
| HIGH | 기능 추가/변경 시 매번 비용을 발생시키는 문제 |
| MEDIUM | 유지보수 비용을 높이지만 당장 기능에는 영향 없음 |
| LOW | 코드 품질 개선 수준, 여유 있을 때 해소 |

| 상태 | 의미 |
|------|------|
| OPEN | 식별됨, 미착수 |
| IN_PROGRESS | 해소 작업 진행 중 |
| RESOLVED | 해소 완료 |

---

## CRITICAL

### TD-001: API 추상화 레이어 부재
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: 전체 시스템
- **설명**: 백엔드 연동 시 데이터 접근 포인트가 컴포넌트 곳곳에 산재되어 있어 API 레이어 없이는 백엔드 전환이 불가능
- **현황**:
  - `getExamProblems()` — `src/data/exams/index.ts`
  - `executeMockSQL()` — `SQLPracticePage.tsx` 내부 함수
  - `login/signup` — `AuthContext.tsx` 내부 하드코딩
  - `logEvent()` — `eventLogger.ts` (TODO: POST /api/events)
- **해소 방안**: `src/api/` 디렉토리 생성 후 도메인별 API 모듈 분리 (`exams.ts`, `auth.ts`, `sql.ts`, `events.ts`)

---

## HIGH

### TD-002: 시험 세션 상태 비영속성
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: `ExamTakingPage.tsx`
- **설명**: 시험 중 새로고침하면 `sessionId`, `answers`, `currentPage` 등 모든 진행 상태가 소멸
- **해소 방안**: localStorage 또는 ExamContext에 세션 상태 영속화. 재접속 시 복원 로직 추가

### TD-003: 이벤트 로그 전송 미구현
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: `src/utils/eventLogger.ts:15`
- **설명**: 11개 이벤트가 메모리 배열 + console.debug로만 기록됨. 실제 전송 없음
- **해소 방안**: Amplitude SDK 연동 (Phase 1) → 백엔드 API 이중 저장 (Phase 2). 설계 문서 `papers/md/event_logging_260314.md` 참조

### TD-004: Mock 데이터 산재
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: 5개 이상 파일
- **설명**: 문제 데이터가 여러 파일에 분산되어 단일 진실 공급원(Single Source of Truth)이 없음
  - `src/data/exams/exam1~10.ts` — 모의고사 문제
  - `SQLPracticeListPage.tsx:18-89` — SQL 실습 목록 하드코딩
  - `SQLPracticePage.tsx:10-33` — SQL 문제 상세 하드코딩
  - `DashboardPage.tsx:19-38` — 대시보드 통계 하드코딩
- **해소 방안**: `src/data/`에 도메인별로 통합 정리. API 레이어(TD-001) 해소 시 함께 진행

### TD-005: 컴포넌트 책임 과다 (ExamTakingPage)
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: `ExamTakingPage.tsx` (254줄, 7개 책임)
- **설명**: 타이머, 페이지네이션, 답안 관리, 이벤트 로깅, 레이아웃, 네비게이션, 모달을 하나의 컴포넌트가 담당
- **해소 방안**: 커스텀 훅 추출 (`useExamSession`, `useExamPagination`) + 모달 컴포넌트 분리

---

## MEDIUM

### TD-006: DescriptionRenderer 미적용 페이지
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: `ExamResultPage.tsx`, `SQLPracticePage.tsx`
- **설명**: 문제 설명을 렌더링하는 방식이 페이지마다 다름
  - `ExamTakingPage` — `DescriptionRenderer` 사용 (테이블/SQL/텍스트 파싱)
  - `ExamResultPage` — plain text로 렌더링 (해설에 SQL 포함 시 깨짐)
  - `SQLPracticePage` — `whitespace-pre-line`으로 렌더링
- **해소 방안**: 모든 문제 description/explanation 렌더링에 `DescriptionRenderer` 통일 적용

### TD-007: 하드코딩된 설정값 산재
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: 다수 파일
- **주요 항목**:
  - 시험 시간 90분 (`ExamTakingPage.tsx:14`)
  - 문항당 배점 2점 (`ExamTakingPage.tsx:100`)
  - 합격 기준 60점 (`ExamResultPage.tsx:30`)
  - 타이머 경고 임계값 10분/3분 (`CountdownTimer.tsx:32-33`)
  - 메모장 디바운스 800ms (`Notepad.tsx:21`)
- **해소 방안**: `src/constants/exam.ts` 생성하여 중앙 관리

### TD-008: 이벤트 페이로드 타입 미정의
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: `src/types/index.ts`, `src/utils/eventLogger.ts`
- **설명**: `EventLog.payload`가 `Record<string, unknown>`으로 정의되어 이벤트별 페이로드 구조를 컴파일 타임에 검증할 수 없음
- **해소 방안**: discriminated union 타입으로 이벤트별 페이로드 정의

### TD-009: Error Boundary 부재
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: `App.tsx` 전체 라우팅
- **설명**: React Error Boundary가 없어 단일 컴포넌트 크래시 시 앱 전체 화이트스크린
- **해소 방안**: `src/components/ErrorBoundary.tsx` 생성 후 `App.tsx` 최상위 래핑

---

## LOW

### TD-010: DescriptionRenderer 파서 테스트 불가
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: `src/components/DescriptionRenderer.tsx`
- **설명**: `parseBlocks()`, `isTableRow()` 등 파싱 로직이 컴포넌트 파일 내부에 정의되어 단위 테스트 불가
- **해소 방안**: `src/utils/descriptionParser.ts`로 로직 추출 후 테스트 작성

### TD-011: ChoiceProblem props 타입 인라인 정의
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: `ExamTakingPage.tsx:16-26`
- **설명**: ChoiceProblem의 props가 인라인 타입으로 선언되어 재사용 불가
- **해소 방안**: `src/types/index.ts`에 `ChoiceProblemProps` interface 추출

### TD-012: 키보드 네비게이션 미지원
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: `ExamTakingPage.tsx` 페이지네이션
- **설명**: 좌우 화살표 키로 페이지 이동 불가. `goToPage`는 이미 추출되어 있어 추가 용이
- **해소 방안**: `useEffect`로 `keydown` 이벤트 리스너 추가

---

## 해소 우선순위 로드맵

### Phase 1: 즉시 (백엔드 착수 전)
- [ ] TD-007: 설정값 중앙화 (`src/constants/exam.ts`)
- [ ] TD-006: DescriptionRenderer 통일 적용
- [ ] TD-009: Error Boundary 추가

### Phase 2: 백엔드 연동 시
- [ ] TD-001: API 추상화 레이어 구축
- [ ] TD-003: 이벤트 로그 전송 (Amplitude + API)
- [ ] TD-004: Mock 데이터 → API 전환
- [ ] TD-002: 시험 세션 영속화

### Phase 3: 안정화
- [ ] TD-005: ExamTakingPage 책임 분리
- [ ] TD-008: 이벤트 페이로드 타입 강화
- [ ] TD-010: 파서 로직 추출 및 테스트

### Phase 4: 품질 개선
- [ ] TD-011: Props 타입 정리
- [ ] TD-012: 키보드 접근성
