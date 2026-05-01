# 분석계 DB 테이블 네이밍 컨벤션

> 작성일: 2026-05-01
> 적용 대상: 분석계 PostgreSQL (운영계와 별도 인스턴스)
> 변환 도구: dbt
> 아키텍처: 메달리온 (Bronze → Silver → Gold)

---

## 1. 메달리온 레이어 정의

| 레이어 | 스키마명 | 역할 | 테이블 타입 |
|--------|---------|------|-----------|
| Bronze | `brz` | 소스 원본 그대로 적재 (EL) | — |
| Silver | `siv` | 정제 + 스타 스키마 구성 | `df` (팩트), `dd` (디멘션) |
| Gold | `gold` | 비즈니스 집계, 리포트용 마트 | `dm` (마트) |

### 레이어 간 의존 규칙

```
brz → siv → gold
```

- Silver는 Bronze만 참조한다. 운영계 DB를 직접 참조하지 않는다.
- Gold는 Silver만 참조한다. Bronze를 직접 참조하지 않는다.
- 같은 레이어 내 참조는 허용한다. (예: Silver 팩트가 Silver 디멘션을 JOIN)

---

## 2. 스키마 네이밍

분석계 DB 내부에 레이어별 PostgreSQL 스키마를 생성한다.

```sql
CREATE SCHEMA IF NOT EXISTS brz;
CREATE SCHEMA IF NOT EXISTS siv;
CREATE SCHEMA IF NOT EXISTS gold;
```

스키마가 레이어를 표현하므로, 테이블명에는 레이어 prefix를 붙이지 않는다.

| O (사용) | X (사용 안 함) |
|----------|---------------|
| `brz.auth_users` | `brz.brz_auth_users` |
| `siv.df_activity_submissions` | `siv.siv_df_activity_submissions` |

---

## 3. 테이블 네이밍 컨벤션

### 3.1 공통 규칙

- **snake_case** 사용 (소문자 + 언더스코어)
- 영문만 사용, 한글/특수문자 금지
- 약어는 소스 약칭 가이드(§5)에 등록된 것만 사용
- 단어 구분은 언더스코어(`_`) 한 개, 의미 구분(소스/도메인/테이블 경계)도 언더스코어 한 개

### 3.2 Bronze 레이어

소스 시스템의 원본 데이터를 그대로 적재한다. 변환 없이 1:1 복제.

**패턴:**

```
{소스약칭}_{원본테이블명}
```

**예시:**

| 운영계 원본 | Bronze 테이블 | 풀네임 |
|------------|--------------|--------|
| `auth.users` | `auth_users` | `brz.auth_users` |
| `reference.problems` | `ref_problems` | `brz.ref_problems` |
| `logs.exam_sessions` | `logs_exam_sessions` | `brz.logs_exam_sessions` |
| `amplitude.raw_events` | `amp_raw_events` | `brz.amp_raw_events` |

### 3.3 Silver 레이어

정제된 데이터를 스타 스키마(팩트 + 디멘션)로 구성한다.

**패턴:**

```
{타입}_{도메인}_{테이블명}
```

| 타입 | prefix | 설명 |
|------|--------|------|
| 팩트 | `df` | 측정 가능한 이벤트/트랜잭션 (언제, 누가, 무엇을) |
| 디멘션 | `dd` | 팩트를 설명하는 속성 (누구인지, 어떤 문제인지) |

**팩트 테이블 예시:**

| 테이블명 | 풀네임 | 설명 |
|----------|--------|------|
| `df_activity_exam_submissions` | `siv.df_activity_exam_submissions` | 모의고사 제출 이력 |
| `df_activity_sql_executions` | `siv.df_activity_sql_executions` | SQL 실행 이력 |
| `df_event_page_views` | `siv.df_event_page_views` | 페이지 조회 이벤트 |
| `df_event_funnel_steps` | `siv.df_event_funnel_steps` | 퍼널 단계 이벤트 |

**디멘션 테이블 예시:**

| 테이블명 | 풀네임 | 설명 |
|----------|--------|------|
| `dd_user_users` | `siv.dd_user_users` | 유저 마스터 |
| `dd_content_problems` | `siv.dd_content_problems` | 문제 마스터 |
| `dd_content_exams` | `siv.dd_content_exams` | 모의고사 마스터 |
| `dd_common_dates` | `siv.dd_common_dates` | 날짜 디멘션 |

### 3.4 Gold 레이어

비즈니스 관점의 집계 테이블(마트)을 구성한다.

**패턴:**

```
dm_{도메인}_{테이블명}
```

**예시:**

| 테이블명 | 풀네임 | 설명 |
|----------|--------|------|
| `dm_dashboard_daily_study` | `gold.dm_dashboard_daily_study` | 일별 학습 현황 (대시보드용) |
| `dm_dashboard_user_streak` | `gold.dm_dashboard_user_streak` | 유저별 연속 학습일 (잔디) |
| `dm_exam_score_distribution` | `gold.dm_exam_score_distribution` | 모의고사 점수 분포 |
| `dm_funnel_signup_conversion` | `gold.dm_funnel_signup_conversion` | 가입 전환 퍼널 |

---

## 4. 도메인 분류

| 도메인 | 설명 | 주요 소스 |
|--------|------|----------|
| `user` | 유저 계정, 인증, 프로필 | `auth` |
| `content` | 문제, 정답, 모의고사 메타 | `reference` |
| `activity` | 제출, 채점, 세션 등 유저 행동 이력 | `logs` |
| `event` | 프론트엔드 이벤트 로그 | `amplitude` |
| `common` | 날짜, 코드 등 공통 디멘션 | 자체 생성 |
| `dashboard` | 대시보드 전용 집계 | Silver 조합 |
| `funnel` | 퍼널 분석 전용 집계 | Silver 조합 |
| `exam` | 모의고사 분석 전용 집계 | Silver 조합 |

새 도메인 추가 시 이 표에 등록한 뒤 사용한다.

---

## 5. 소스 시스템 약칭 가이드

Bronze 레이어에서 소스 시스템을 구분할 때 사용하는 약칭이다.

| 소스 시스템 | 풀네임 | 약칭 | 비고 |
|------------|--------|------|------|
| PostgreSQL `auth` 스키마 | auth | `auth` | 유저 계정 (이미 짧아서 그대로 사용) |
| PostgreSQL `reference` 스키마 | reference | `ref` | 문제/정답 Golden Set |
| PostgreSQL `logs` 스키마 | logs | `logs` | 세션/채점/활동 이력 (이미 짧아서 그대로 사용) |
| Amplitude | amplitude | `amp` | 프론트엔드 이벤트 로그 |

### 약칭 작성 규칙

새로운 소스 시스템이 추가될 때 아래 규칙을 따른다:

1. **3~4글자**를 기본으로 한다
2. 풀네임이 이미 4글자 이하이면 그대로 사용한다 (예: `auth`, `logs`)
3. 풀네임이 5글자 이상이면 축약한다 (예: `reference` → `ref`, `amplitude` → `amp`)
4. 축약 시 **앞 3~4글자를 자르거나**, 자음 기반으로 줄인다
5. 기존 약칭과 충돌하지 않도록 이 표에서 확인 후 등록한다

**향후 추가 예시:**

| 소스 시스템 | 약칭 후보 |
|------------|----------|
| Google Analytics | `ga` |
| AWS Athena | `ath` |
| Hive | `hive` |
| Snowflake | `sf` |
| Google Sheets | `gsheet` |

---

## 6. 컬럼 네이밍 컨벤션

### 6.1 공통 규칙

- **snake_case** 사용 (소문자 + 언더스코어)
- 축약어 금지 (예: `usr` → `user`, `cnt` → `count`, `amt` → `amount`, `dt` → `date`)
- 예약어를 컬럼명으로 사용하지 않는다 (예: `date`, `time`, `user`, `order`)
  - 예약어가 필요하면 의미를 구체화한다: `date` → `event_date`, `order` → `sort_order`

### 6.2 식별자 (ID)

| 규칙 | 패턴 | 예시 |
|------|------|------|
| PK (자기 테이블) | `{테이블 단수형}_id` | `user_id`, `problem_id`, `exam_id` |
| FK (참조 테이블) | `{참조 테이블 단수형}_id` | `user_id`, `exam_id` |
| 서로게이트 키 | `{테이블}_sk` | `user_sk`, `problem_sk` |

- 운영계에서 넘어온 원본 ID는 Silver에서 서로게이트 키(`_sk`)와 함께 보존한다
- 서로게이트 키는 디멘션 테이블에만 생성한다

### 6.3 타임스탬프

| 유형 | suffix | 예시 |
|------|--------|------|
| 시각 (날짜+시간) | `_at` | `created_at`, `submitted_at`, `logged_in_at` |
| 날짜 (날짜만) | `_date` | `event_date`, `exam_date`, `birth_date` |

- `_at` 컬럼은 `TIMESTAMPTZ` 타입을 사용한다
- `_date` 컬럼은 `DATE` 타입을 사용한다

### 6.4 불리언

| 규칙 | prefix | 예시 |
|------|--------|------|
| 상태 여부 | `is_` | `is_passed`, `is_active`, `is_deleted` |
| 보유 여부 | `has_` | `has_nickname`, `has_submitted` |

### 6.5 수치

| 유형 | suffix | 예시 |
|------|--------|------|
| 개수 | `_count` | `attempt_count`, `correct_count` |
| 금액/수량 | `_amount` | `point_amount` |
| 비율/퍼센트 | `_rate` / `_ratio` | `correct_rate`, `conversion_ratio` |
| 소요 시간 | `_duration_ms` / `_duration_sec` | `execution_duration_ms` |

### 6.6 메타 컬럼 (dbt 관리용)

모든 테이블에 아래 메타 컬럼을 포함한다:

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `loaded_at` | `TIMESTAMPTZ` | dbt가 해당 행을 적재/갱신한 시각 |

Bronze에만 추가:

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `source_system` | `VARCHAR` | 소스 시스템 식별자 (예: `auth`, `amplitude`) |

---

## 7. 전체 흐름 예시

유저의 모의고사 제출 데이터가 Bronze → Silver → Gold로 변환되는 흐름:

```
[운영계]                    [분석계 Bronze]              [분석계 Silver]                [분석계 Gold]
auth.users           →  brz.auth_users           →  siv.dd_user_users           ─┐
reference.exams      →  brz.ref_exams            →  siv.dd_content_exams         ├→ gold.dm_dashboard_daily_study
logs.exam_sessions   →  brz.logs_exam_sessions   →  siv.df_activity_exam_submissions ─┘
amplitude.raw_events →  brz.amp_raw_events       →  siv.df_event_funnel_steps   → gold.dm_funnel_signup_conversion
```

---

## 8. 네이밍 체크리스트

새 테이블을 만들기 전에 아래를 확인한다:

- [ ] snake_case로 작성했는가?
- [ ] 올바른 스키마(`brz` / `siv` / `gold`)에 배치했는가?
- [ ] Bronze: 소스 약칭이 §5 가이드에 등록되어 있는가?
- [ ] Silver: 타입 prefix(`df` / `dd`)를 올바르게 붙였는가?
- [ ] Gold: `dm_` prefix를 붙였는가?
- [ ] 도메인이 §4 분류에 등록되어 있는가?
- [ ] 컬럼명이 §6 규칙을 따르는가? (`_at`, `_id`, `is_` 등)
- [ ] 메타 컬럼(`loaded_at`, `source_system`)을 포함했는가?
- [ ] 레이어 간 의존 규칙(§1)을 위반하지 않는가?

---

## 부록: 운영계와 분석계

**운영계(OLTP)** 는 서비스가 실시간으로 읽고 쓰는 DB다. 유저가 회원가입하고, 모의고사를 제출하고, SQL을 실행할 때 데이터가 쌓이는 곳이다. 빠른 읽기/쓰기에 최적화되어 있고, 행 단위 트랜잭션이 핵심이다.

**분석계(OLAP)** 는 쌓인 데이터를 집계하고 분석하기 위한 DB다. "이번 주 가입 전환율은?", "어떤 문제의 정답률이 가장 낮은가?" 같은 질문에 답하는 곳이다. 대량의 행을 한꺼번에 읽는 집계 쿼리에 최적화되어 있다.

둘을 분리하는 이유는 단순하다. 분석용 집계 쿼리는 무겁고, 이것이 운영계에서 실행되면 서비스 응답 속도에 영향을 준다. 반대로 운영계의 정규화된 스키마는 분석 쿼리를 작성하기 어렵게 만든다. 역할을 나누면 서비스는 안정적으로 운영되고, 분석은 자유롭게 수행할 수 있다.
