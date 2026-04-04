# SolSQLD 기술 부채 레지스터

> 최종 업데이트: 2026-03-28
> 관리자: 개발팀장

이 문서는 SolSQLD 프로젝트의 아키텍처 수준 기술 부채를 추적합니다.
각 항목은 식별 → 해소 → 완료 순으로 관리됩니다.

---

## 범례

| 심각도 | 의미 |
|--------|------|
| CRITICAL | 아키텍처 확장을 근본적으로 막는 구조적 문제 또는 보안 위험 |
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
  - `executeSQL()` — `SQLPracticePage.tsx` 내부 함수 (2026-03-28 확인: 여전히 컴포넌트 파일 내부에 위치)
  - `login/signup` — `AuthContext.tsx` 내부 하드코딩
  - `logEvent()` — `eventLogger.ts` (TODO: POST /api/events)
- **해소 방안**: `src/api/` 디렉토리 생성 후 도메인별 API 모듈 분리 (`exams.ts`, `auth.ts`, `sql.ts`, `events.ts`)

### TD-013: 채점 로직이 프론트엔드에 존재 (보안)
- **상태**: OPEN
- **식별일**: 2026-03-28
- **영향 범위**: `SQLPracticePage.tsx` (line 202-203)
- **설명**: `normalize(query) === normalize(problem.answer)` — 정답 SQL이 클라이언트 번들에 포함되어 브라우저 DevTools로 확인 가능. ADR 008(PostgreSQL Golden Set 기반 채점)과 불일치.
- **현재 상태**: 백엔드 채점 API 완성 전 임시 조치. `executeSQL`의 `submit` 액션이 백엔드에서 채점 결과를 반환하도록 변경되면 제거 가능.
- **해소 방안**: 백엔드 `/sql/execute` (action=submit) 응답에 `isCorrect` 필드 추가 → 프론트에서 문자열 비교 로직 제거 → `problem.answer` 클라이언트 전송 중단.

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
- **상태**: OPEN (부분 개선)
- **식별일**: 2026-03-14
- **영향 범위**: 5개 이상 파일
- **설명**: 문제 데이터가 여러 파일에 분산되어 단일 진실 공급원(Single Source of Truth)이 없음
  - `src/data/exams/exam1~10.ts` — 모의고사 문제
  - `src/data/practice/easy.ts, medium.ts, hard.ts` — SQL 실습 문제 (2026-03-28: `data/practice/`로 통합 완료)
  - `DashboardPage.tsx:19-38` — 대시보드 통계 하드코딩
- **해소 방안**: `src/data/`에 도메인별로 통합 정리. API 레이어(TD-001) 해소 시 함께 진행

### TD-005: 컴포넌트 책임 과다
- **상태**: OPEN
- **식별일**: 2026-03-14
- **영향 범위**: `ExamTakingPage.tsx` (254줄, 7개 책임), `SQLPracticePage.tsx` (760줄)
- **설명**:
  - ExamTakingPage: 타이머, 페이지네이션, 답안 관리, 이벤트 로깅, 레이아웃, 네비게이션, 모달을 하나의 컴포넌트가 담당
  - SQLPracticePage (2026-03-28 추가): 헬퍼 컴포넌트(`SectionHeader`, `CollapsibleSection`, `DescriptionRenderer`, `renderInline`)와 `useResizeDrag` 훅이 동일 파일에 동거. 760줄로 분리 시점 근접
- **해소 방안**: 커스텀 훅 추출 (`useExamSession`, `useExamPagination`, `useResizeDrag`) + 헬퍼 컴포넌트를 `components/practice/`로 분리

### TD-014: 이미지 태그 `latest` 전략 — ArgoCD 자동 배포 불가
- **상태**: OPEN
- **식별일**: 2026-03-28
- **영향 범위**: `.github/workflows/frontend-ghcr.yaml`, `infra/frontend/deployment.yaml`
- **관련 문서**: `papers/md/frontend_image_tag_260328.md`
- **설명**: 프론트엔드 Docker 이미지가 `latest` 태그로 push되어 `deployment.yaml`이 변경되지 않음 → ArgoCD가 변경을 감지하지 못해 Pod 재시작이 자동으로 이루어지지 않음. 수동 SYNC 필요.
- **현재 상태**: 보고서 작성 완료, CI 워크플로우 수정은 GitHub OAuth `workflow` 스코프 문제로 pending.
- **해소 방안**: CI에서 이미지 태그를 `sha-xxxxxxx`로 변경하고 `deployment.yaml`을 자동 커밋하는 스텝 추가. 백엔드 개발자(BeolLe)와 협의 필요.

---

## MEDIUM

### TD-006: DescriptionRenderer 미적용 페이지
- **상태**: OPEN (부분 해소)
- **식별일**: 2026-03-14
- **영향 범위**: `ExamResultPage.tsx`
- **설명**: 문제 설명을 렌더링하는 방식이 페이지마다 다름
  - `ExamTakingPage` — `DescriptionRenderer` 사용 (테이블/SQL/텍스트 파싱)
  - `ExamResultPage` — plain text로 렌더링 (해설에 SQL 포함 시 깨짐)
  - ~~`SQLPracticePage` — `whitespace-pre-line`으로 렌더링~~ → 2026-03-28: 자체 `DescriptionRenderer` 적용 완료
- **해소 방안**: `ExamResultPage`에 `DescriptionRenderer` 통일 적용

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
  - 저장 피드백 시간 1500ms (`Notepad.tsx:32`) (2026-03-28 추가)
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

### TD-015: `navigator.platform` 사용 (Deprecated API)
- **상태**: OPEN
- **식별일**: 2026-03-28
- **영향 범위**: `SQLPracticePage.tsx` (line 160)
- **설명**: `navigator.platform`은 W3C에서 deprecated 처리됨. 현재 모든 주요 브라우저에서 동작하나 향후 제거 가능성 있음.
- **해소 방안**: `navigator.userAgentData?.platform ?? navigator.platform` fallback 패턴으로 전환

---

## 해소 우선순위 로드맵

### Phase 1: 즉시 (백엔드 착수 전)
- [ ] TD-007: 설정값 중앙화 (`src/constants/exam.ts`)
- [ ] TD-006: DescriptionRenderer 통일 적용 (ExamResultPage)
- [ ] TD-009: Error Boundary 추가

### Phase 2: 백엔드 연동 시
- [ ] TD-001: API 추상화 레이어 구축
- [ ] TD-013: 채점 로직 백엔드 이관 (보안 — 최우선)
- [ ] TD-003: 이벤트 로그 전송 (Amplitude + API)
- [ ] TD-004: Mock 데이터 → API 전환
- [ ] TD-002: 시험 세션 영속화
- [ ] TD-014: 이미지 태그 SHA 전략 적용

### Phase 3: 안정화
- [ ] TD-005: ExamTakingPage + SQLPracticePage 책임 분리
- [ ] TD-008: 이벤트 페이로드 타입 강화
- [ ] TD-010: 파서 로직 추출 및 테스트

### Phase 4: 품질 개선
- [ ] TD-011: Props 타입 정리
- [ ] TD-012: 키보드 접근성 (ExamTakingPage)
- [ ] TD-015: navigator.platform deprecated 대응

---

## 해결 완료 항목

| ID | 내용 | 해소일 | PR |
|----|------|--------|-----|
| ~~TD-R01~~ | nginx SPA 라우팅 미설정 (새로고침 시 404) | 2026-03-28 | #13 |
| ~~TD-R02~~ | imagePullPolicy: IfNotPresent (새 이미지 미반영) | 2026-03-28 | #12 |
| ~~TD-R03~~ | Mac 키보드 단축키 미작동 + 에디터 밖 단축키 불가 | 2026-03-28 | #15 |
| ~~TD-R04~~ | SQLPracticePage DescriptionRenderer 미적용 | 2026-03-28 | #11 |
| ~~TD-R05~~ | SQL 실습 데이터 `data/practice/`로 통합 | 2026-03-28 | #11 |
