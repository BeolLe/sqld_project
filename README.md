# SolSQLD

SQLD 개념 학습, 모의고사, Oracle SQL 실습을 제공하는 학습 플랫폼입니다. 서비스에서 생성되는 가입·로그인·풀이 데이터를 PostgreSQL에 저장하고, dbt로 정제·집계한 지표를 Airflow 기반 일일 리포트에 활용합니다.

이 저장소에는 애플리케이션 코드가 있습니다. **dbt 모델과 Airflow DAG는 [airflow-practice의 solsqld 디렉터리](https://github.com/BeolLe/airflow-practice/tree/main/solsqld)**, 배포 설정은 [sqld_project_gitops](https://github.com/BeolLe/sqld_project_gitops)에서 확인할 수 있습니다.

> 코드 열람 안내: `airflow-practice` 링크는 현재 비로그인 상태에서 열리지 않습니다. 애플리케이션과 GitOps 코드는 공개 저장소에서 확인할 수 있습니다.

공개된 분석 실행 환경은 GitOps의 [dbt 컨테이너 정의](https://github.com/BeolLe/sqld_project_gitops/blob/main/images/dbt-runner/Dockerfile), [이미지 빌드](https://github.com/BeolLe/sqld_project_gitops/blob/main/.github/workflows/dbt-runner-ghcr.yaml), [Airflow 배포 설정](https://github.com/BeolLe/sqld_project_gitops/blob/main/infra/airflow/values.yaml), [Redash 배포 구성](https://github.com/BeolLe/sqld_project_gitops/tree/main/infra/analytics/redash)에서 확인할 수 있습니다. 모델·DAG 코드와 실행 환경을 저장소별로 분리했습니다.

## 담당 범위와 코드

**서현석 담당:** 백엔드 API, PostgreSQL 데이터 구조, dbt 분석 모델, Airflow 파이프라인, Kubernetes·GitOps 배포 구성. 프론트엔드는 협업하여 개발했습니다.

| 담당 영역 | 구현 내용 | 관련 코드 |
| --- | --- | --- |
| dbt 데이터 모델링 | 운영 데이터를 Bronze·Silver·Gold로 분리하고, 사용자·활동 데이터에서 일별 지표 생성 | [Bronze](https://github.com/BeolLe/airflow-practice/tree/main/solsqld/analytics/dbt/models/brz) · [Silver](https://github.com/BeolLe/airflow-practice/tree/main/solsqld/analytics/dbt/models/siv) · [Gold](https://github.com/BeolLe/airflow-practice/tree/main/solsqld/analytics/dbt/models/gold) |
| 데이터 품질 검증 | 키 중복·NULL·참조 관계 검사, 원천 대비 정제 건수와 집계 결과 대조 | [모델 테스트 정의](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/analytics/dbt/models/siv/schema.yml) · [SQL 검증 테스트](https://github.com/BeolLe/airflow-practice/tree/main/solsqld/analytics/dbt/tests) |
| Airflow 배치·리포트 | Kubernetes Pod에서 dbt build 실행, Gold 지표 조회 후 Slack 일일 리포트 발송 | [dbt 실행 DAG](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/analytics_dbt.py) · [리포트 DAG](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/slack_daily_report_dag.py) · [리포트 조회·발송](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/slack_daily_report.py) |
| 로그 명세 동기화 | YAML 설정에서 DAG 생성, Google Sheets 명세 검증 및 PostgreSQL 행 추가·갱신 | [동적 DAG 생성](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/log_schema_dynamic_dags.py) · [동기화 로직](https://github.com/BeolLe/airflow-practice/tree/main/solsqld/sqld_log_schema_sync) |
| 백엔드·로그 수집 | 인증·모의고사·SQL 실습 API, 사용자 행동 로그 배치 수집과 event_id 중복 방지 | [백엔드](https://github.com/BeolLe/sqld_project/tree/main/backend/app) · [로그 수집 API](https://github.com/BeolLe/sqld_project/blob/main/backend/app/api/logs/router.py) · [로그 저장](https://github.com/BeolLe/sqld_project/blob/main/backend/app/db/service_logs.py) |
| 배포·운영 | GitHub Actions·GHCR 이미지 빌드, ArgoCD 배포 및 Airflow 실행 환경 구성 | [앱 빌드 워크플로우](https://github.com/BeolLe/sqld_project/tree/main/.github/workflows) · [GitOps 담당 범위와 코드](https://github.com/BeolLe/sqld_project_gitops#담당-범위와-코드) |

## 분석 데이터 흐름

`PostgreSQL 운영 데이터 → dbt Bronze(brz) → Silver(siv) → Gold(gold) → Redash 조회·Slack 리포트`

- **Bronze:** 운영 테이블을 분석 스키마로 가져오고 적재 시각·원천 정보를 추가합니다.
- **Silver:** 사용자 차원과 로그인·모의고사·SQL 실습·학습 이벤트 등의 활동 팩트를 구성합니다. KST 기준 날짜, 사용자 키, 중복 제거 기준을 모델에 정의합니다.
- **Gold:** 로그인 기반 DAU·WAU·MAU, 활동 유형별 건수, 모의고사 이용자 수, 일일 리포트 지표를 생성합니다. 일별 모델은 날짜 키 기준 증분 적재와 기간 지정 재처리를 지원합니다.

대표 구현은 [일일 리포트 모델](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/analytics/dbt/models/gold/dm_daily_report.sql)입니다. 관리자 계정을 제외하고 가입·로그인·학습 지표를 집계하며, SQL 실행·제출은 성공 이벤트를 기준으로 셉니다. Slack 리포트는 이 모델의 결과를 조회합니다.

[Airflow dbt DAG](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/analytics_dbt.py)는 매일 **00:00 KST**에 `dbt build`를 실행하도록 설정되어 있습니다. [리포트 DAG](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/slack_daily_report_dag.py)는 **01:00 KST**에 전일 지표를 읽는 별도 DAG입니다.

품질 검증에는 dbt의 `unique`, `not_null`, `relationships` 테스트와 함께 [원천↔Silver 건수 대조](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/analytics/dbt/tests/assert_silver_activity_counts_reconciled.sql), [Silver↔Gold 활동 집계 대조](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/analytics/dbt/tests/assert_dm_dashboard_activity_daily_reconciled.sql)를 사용합니다.

## Google Sheets 로그 명세 동기화

`Google Sheets 이벤트 명세 → Airflow 검증·변경 계획·적용 → log.event_specifications`

YAML 설정을 읽어 DAG를 생성하고, 수동 실행 시 Google Sheets의 여러 이벤트 탭을 하나의 테이블로 병합합니다. 각 행에는 원본 탭 이름인 `tab_name`을 함께 저장합니다.

- `validate`: 헤더·자료형·필수값·spec_id 중복을 검사합니다.
- `plan`: DB 구조와 데이터의 변경 내용을 계산합니다.
- `apply_safe`: 허용된 구조 변경과 spec_id 기준 행 추가·갱신을 적용하고, 적용 후 검증 실패 시 롤백합니다. DB에만 남은 행은 자동 삭제하지 않습니다.

필수값이 누락된 행은 건너뛰고 탭 이름·원본 행 번호·누락 컬럼을 WARNING 로그와 XCom에 남깁니다. 정상 행만 적재하며, 명세의 `object_idx`는 `1~n`, `0~4` 같은 범위 예시를 보존하도록 문자열로 관리합니다.

설명용 탭은 제외 목록으로 관리합니다. 처리 대상 탭의 헤더 불일치·자료형 오류·중복 spec_id는 실행을 중단시킵니다. [설정 파일](https://github.com/BeolLe/airflow-practice/blob/main/solsqld/sqld_log_schema_sync/configs/log_event_specs.yaml)과 [회귀 테스트](https://github.com/BeolLe/airflow-practice/tree/main/tests/log_schema_sync)에서 확인할 수 있습니다.

이 동기화는 이벤트 **명세**를 관리하는 별도 흐름입니다. 사용자 행동 로그는 `log.service_log_raw`에 수집하며, 현재 dbt 지표는 `auth`, `exam`, `practice`, `logs` 등의 운영 데이터를 원천으로 사용합니다.

## 서비스와 저장소 구성

- **사용자 기능:** 개념 학습·시뮬레이션, 모의고사 응시·채점, SQL 실습, 학습 이력 조회
- **애플리케이션:** React·Vite 프론트엔드와 FastAPI 백엔드
- **데이터베이스:** PostgreSQL 운영 DB와 Oracle Autonomous DB SQL 실습 환경
- **분석·배치:** dbt, Airflow, Redash, Slack
- **배포:** Kubernetes, GitHub Actions, GHCR, ArgoCD, Cloudflare

```text
sqld_project/          애플리케이션
├─ frontend/           React 사용자 화면
├─ backend/            FastAPI API·DB 연동
├─ infra/              앱 관련 배포 자산
└─ docs/               기존 프로젝트 참고 자료

airflow-practice/solsqld/
├─ analytics/dbt/      분석 모델·데이터 품질 테스트
├─ analytics_dbt.py    dbt 실행 DAG
├─ slack_daily_report* 일일 리포트 DAG·조회·발송
├─ log_schema_dynamic_dags.py
└─ sqld_log_schema_sync/  로그 명세 동기화

sqld_project_gitops/   클러스터·배포 설정과 배치 실행 이미지 빌드
```

## 로컬 개발·배포

프론트엔드:

```bash
cd frontend
npm install
npm run dev
```

백엔드:

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

백엔드 API는 `/api` 경로를 사용하며, 실행에는 별도의 DB 연결 및 환경 설정이 필요합니다.

앱 자동 배포는 `GitHub Actions → GHCR → GitOps 이미지 정보 갱신 → ArgoCD → Kubernetes` 흐름으로 구성했습니다. 자동 갱신 대상과 공개 서비스(`app-public`) 매니페스트의 구분은 [GitOps 배포 흐름](https://github.com/BeolLe/sqld_project_gitops#앱-배포-흐름)에 정리했습니다.

Airflow DAG는 `airflow-practice`의 코드를 git-sync로 가져오며, dbt는 별도 실행 이미지의 Kubernetes Pod에서 수행합니다.
