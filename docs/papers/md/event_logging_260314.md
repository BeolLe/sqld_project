# SolSQLD 이벤트 로깅 전략 비교 분석

> 작성일: 2026-03-14
> 프로젝트: SolSQLD (SQLD 모의고사 & SQL 실습 플랫폼)

---

## 1. 현황 분석

### 현재 구현 상태

| 항목 | 상태 |
|------|------|
| 이벤트 타입 정의 | 11개 완료 (`EventType` in `src/types/index.ts`) |
| 이벤트 발화 함수 | `logEvent()` 구현됨 (`src/utils/eventLogger.ts`) |
| 호출 컴포넌트 | 5개 파일에서 호출 중 |
| 실제 전송 | **미구현** (메모리 배열 + console.debug만) |
| 백엔드 | 없음 (Client-only React 앱) |

### 수집 대상 이벤트 (11개)

| # | 이벤트 | 설명 |
|---|--------|------|
| 1 | `user_signup` | 회원가입 성공 |
| 2 | `user_login` | 로그인 성공 |
| 3 | `user_first_visit` | 최초 접속 |
| 4 | `sql_execute` | SQL 쿼리 실행 |
| 5 | `sql_submit` | SQL 제출 (정답 여부 포함) |
| 6 | `choice_select` | 객관식 보기 선택 |
| 7 | `exam_start` | 모의고사 시작 |
| 8 | `exam_submit` | 모의고사 최종 제출 |
| 9 | `notepad_update` | 사이드 메모장 입력 |
| 10 | `points_update` | 포인트 업데이트 (+10점) |
| 11 | `stats_update` | 누적 통계 업데이트 |

### 요구사항

| 항목 | 조건 |
|------|------|
| 수집 목적 | 데이터 축적 후 분석 |
| MAU 규모 | 100명 이하 |
| 백엔드 | 향후 구축 예정 |
| 분석 형태 | 미정 (추후 결정) |
| 비용 | **무료만** |

---

## 2. 대안 비교

### 대안 A: Amplitude 무료 플랜

외부 Analytics SaaS인 Amplitude의 무료 플랜(Starter)을 사용하여 이벤트를 수집한다.

**구현 방식**
- `npm install @amplitude/analytics-browser`
- `src/main.tsx`에서 `amplitude.init(API_KEY)` 호출
- `eventLogger.ts`의 `logEvent()` 내부에 `amplitude.track()` 추가

**장점**
- 즉시 사용 가능 (백엔드 불필요)
- 무료 플랜: 월 1,000만 이벤트, 무제한 보관
- 대시보드, 퍼널, 리텐션, 코호트 분석 기본 제공
- SDK가 자체 배치 전송 및 재시도 로직 내장
- 기존 `logEvent()` 호출 코드 변경 없음

**단점**
- 외부 서비스 의존 (데이터 소유권 없음)
- 무료 플랜은 고급 분석 기능 제한 (Behavioral Cohort 등)
- 커스텀 쿼리 불가 (Amplitude가 제공하는 UI 안에서만 분석)
- 원시 데이터 export가 무료 플랜에서는 제한적

**비용**: 무료 (월 1,000만 이벤트 이내)

---

### 대안 B: 백엔드 자체 구축 (DB 직접 저장)

자체 백엔드 API(`POST /api/events`)를 구축하여 DB에 이벤트를 저장한다.

**구현 방식**
- 백엔드에 이벤트 수집 API 엔드포인트 구현
- `eventLogger.ts`에서 `fetch('/api/events', ...)` 호출
- DB 테이블에 이벤트 로그 저장 (PostgreSQL, MySQL 등)

**장점**
- 데이터 완전 소유 (자체 DB에 원시 데이터 보관)
- SQL로 자유롭게 쿼리 및 분석 가능
- 백엔드 구축 계획과 자연스럽게 통합
- 외부 서비스 의존 없음

**단점**
- **백엔드가 준비될 때까지 로깅 자체가 불가능**
- 분석 대시보드를 직접 만들어야 함 (높은 개발 비용)
- 배치 전송, 재시도, 버퍼링 로직을 직접 구현해야 함
- DB 운영 비용 발생 가능 (무료 티어 활용 시 제한적)

**비용**: DB 호스팅에 따라 다름 (Supabase/PlanetScale 무료 티어 활용 가능)

---

### 대안 C: Google Analytics 4 (GA4)

Google Analytics 4의 커스텀 이벤트 기능을 활용한다.

**구현 방식**
- `gtag.js` 스크립트를 `index.html`에 삽입
- `eventLogger.ts`에서 `gtag('event', eventName, params)` 호출

**장점**
- 완전 무료 (사실상 이벤트 무제한)
- 페이지뷰, 세션, 유입 경로 등 웹 분석 기본 제공
- BigQuery 연동으로 원시 데이터 export 가능 (무료)
- 가장 널리 사용되는 분석 도구

**단점**
- 제품 분석보다는 마케팅/웹 분석에 특화
- 커스텀 이벤트 파라미터 제약 (이벤트당 25개, 문자열 100자)
- 실시간 분석 제한적 (데이터 반영에 24~48시간 지연)
- 이벤트 이름 규칙이 엄격 (snake_case 40자 이내)
- 유저 행동 시퀀스 분석이 Amplitude 대비 약함

**비용**: 무료

---

### 대안 D: Mixpanel 무료 플랜

Amplitude와 유사한 제품 분석 SaaS인 Mixpanel의 무료 플랜을 사용한다.

**구현 방식**
- `npm install mixpanel-browser`
- `mixpanel.init(TOKEN)` 후 `mixpanel.track()` 호출

**장점**
- 무료 플랜: 월 100만 이벤트
- Amplitude와 유사한 제품 분석 기능 (퍼널, 리텐션)
- 직관적인 UI
- SDK 자체 배치 전송 지원

**단점**
- 무료 플랜 이벤트 한도가 Amplitude(1,000만)보다 적음 (100만)
- 무료 플랜에서 데이터 보관 기간 제한
- Amplitude 대비 한국어 자료가 적음
- 코호트 분석 등 고급 기능은 유료

**비용**: 무료 (월 100만 이벤트 이내)

---

### 대안 E: PostHog 오픈소스 (셀프호스팅)

오픈소스 제품 분석 도구인 PostHog을 셀프호스팅하거나 클라우드 무료 플랜을 사용한다.

**구현 방식**
- PostHog Cloud 무료 플랜 또는 Docker로 셀프호스팅
- `npm install posthog-js`
- `posthog.init()` 후 `posthog.capture()` 호출

**장점**
- 오픈소스 (셀프호스팅 시 데이터 완전 소유)
- 클라우드 무료 플랜: 월 100만 이벤트
- 세션 리플레이, 피처 플래그, A/B 테스트 기능 포함
- 자동 이벤트 캡처 (클릭, 페이지뷰 등)

**단점**
- 셀프호스팅 시 서버 운영 부담 (Docker, PostgreSQL, ClickHouse)
- 클라우드 무료 플랜은 이벤트 한도 제한
- Amplitude/Mixpanel 대비 분석 UI 성숙도가 낮음
- 커뮤니티 규모가 상대적으로 작음

**비용**: 클라우드 무료 (월 100만 이벤트) / 셀프호스팅 시 서버 비용

---

## 3. 종합 비교표

| 기준 | A. Amplitude | B. 자체 구축 | C. GA4 | D. Mixpanel | E. PostHog |
|------|:-----------:|:-----------:|:------:|:-----------:|:----------:|
| 즉시 사용 가능 | O | **X** | O | O | O |
| 무료 이벤트 한도 | 1,000만/월 | DB 의존 | 사실상 무제한 | 100만/월 | 100만/월 |
| 제품 분석 특화 | **최강** | 직접 구현 | 약함 | 강함 | 중간 |
| 데이터 소유권 | X | **O** | 부분적 | X | O (셀프호스팅) |
| 대시보드 제공 | O | X | O | O | O |
| 원시 데이터 접근 | 제한적 | **O** | O (BigQuery) | 제한적 | O |
| 기존 코드 변경량 | 최소 | 최소 | 최소 | 최소 | 최소 |
| 백엔드 불필요 | O | **X** | O | O | O |
| 학습 곡선 | 낮음 | 높음 | 낮음 | 낮음 | 중간 |
| 한국어 자료 | 많음 | — | 많음 | 적음 | 적음 |

---

## 4. 추천안

> ### **추천: 대안 A(Amplitude) + 대안 B(자체 구축) 하이브리드 전략**

#### 왜 하이브리드인가?

단일 솔루션의 한계를 상호 보완하기 위함이다.

| Phase | 전략 | 시점 |
|-------|------|------|
| **Phase 1** | Amplitude 무료 플랜 단독 | 지금 즉시 |
| **Phase 2** | Amplitude + 백엔드 DB 이중 저장 | 백엔드 구축 후 |

#### Phase 1: Amplitude 즉시 연동 (현재)

```
[UI 컴포넌트] → logEvent() → [eventLogger.ts]
                                    └─→ amplitude.track() (즉시 전송)
```

- `eventLogger.ts`의 `logEvent()` 내부에 `amplitude.track()` 한 줄 추가
- 기존 11개 이벤트가 즉시 Amplitude로 수집 시작
- 별도 백엔드 없이 바로 분석 가능

**선택 이유:**
1. MAU 100명이면 무료 플랜(월 1,000만 이벤트)으로 **수년간 충분**
2. 백엔드 없이 **즉시 시작** 가능
3. 코드 변경이 `eventLogger.ts` **한 파일**로 한정
4. 대시보드/퍼널/리텐션 분석이 자동 제공되어 분석 방법 미정 상태에서 탐색에 유리

#### Phase 2: 백엔드 DB 이중 저장 (향후)

```
[UI 컴포넌트] → logEvent() → [eventLogger.ts]
                                    ├─→ amplitude.track()
                                    └─→ fetch('/api/events', ...) (백엔드 API)
```

- 백엔드 구축 시 `POST /api/events` 엔드포인트 추가
- `logEvent()`에서 Amplitude와 자체 API에 동시 전송
- 자체 DB에 원시 데이터 축적 → SQL 자유 쿼리 가능
- Amplitude 분석 + 자체 DB 심층 분석 병행

#### GA4, Mixpanel, PostHog을 추천하지 않는 이유

| 대안 | 비추천 사유 |
|------|------------|
| GA4 | 제품 분석보다 마케팅 분석에 특화. 커스텀 이벤트 파라미터 제약이 있고 데이터 반영 지연(24~48h)이 있어 실시간 확인 불편 |
| Mixpanel | Amplitude와 기능 유사하나 무료 이벤트 한도가 1/10 수준(100만). 한국어 자료도 적음 |
| PostHog | 셀프호스팅 시 서버 운영 부담, 클라우드는 이벤트 한도 제한. 분석 UI 성숙도가 Amplitude 대비 낮음 |

---

## 5. 구현 영향도

### 변경 대상 파일

| 파일 | 변경 내용 |
|------|----------|
| `package.json` | `@amplitude/analytics-browser` 의존성 추가 |
| `src/main.tsx` | `amplitude.init(API_KEY)` 초기화 코드 추가 |
| `src/utils/eventLogger.ts` | `logEvent()` 내부에 `amplitude.track()` 호출 추가 |
| `.env` | `VITE_AMPLITUDE_API_KEY` 환경변수 추가 |

### 기존 컴포넌트 영향: **없음**

기존에 `logEvent()`를 호출하는 5개 파일은 수정할 필요가 없다. `eventLogger.ts` 내부 구현만 바뀌므로 호출부는 그대로 유지된다.

---

## 6. 참고 자료

- [Amplitude Pricing (Starter Plan)](https://amplitude.com/pricing)
- [Amplitude Browser SDK Docs](https://www.docs.developers.amplitude.com/data/sdks/browser-2/)
- [GA4 Custom Events](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Mixpanel Pricing](https://mixpanel.com/pricing/)
- [PostHog Open Source](https://posthog.com/docs/self-host)
