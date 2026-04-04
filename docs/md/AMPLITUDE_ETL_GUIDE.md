# Amplitude ETL 가이드 — Airflow DAG + PostgreSQL 적재

> 작성일: 2026-04-04
> 대상: back_dev (백엔드 개발자)
> 인프라: Airflow on K8s (`airflow.int.selfronny.com`), PostgreSQL (기존 sqld DB)

---

## 1. 목적

Amplitude에 수집된 프론트엔드 이벤트 로그를 PostgreSQL로 가져와서:
- 대시보드에서 학습 캘린더(잔디), 일별 학습 요약 등에 활용
- 백엔드 `auth.users.user_id` (UUID)와 JOIN하여 사용자별 행동 분석

---

## 2. 아키텍처

```
[Amplitude Export API]
    ↓  GET /api/2/export (매일 1회, 전일 데이터)
    ↓  응답: gzip → JSONL (이벤트 1건 = 1줄)
[Airflow DAG]
    ↓  파싱 → amplitude.raw_events INSERT
[PostgreSQL - amplitude 스키마]
    ↓  user_id (UUID) 로 JOIN
[auth.users / dashboard.user_stats / ...]
```

---

## 3. PostgreSQL 테이블 DDL

기존 프로젝트 패턴(`CREATE SCHEMA IF NOT EXISTS` + `CREATE TABLE IF NOT EXISTS`)에 맞춰 작성.

```sql
-- 스키마 생성
CREATE SCHEMA IF NOT EXISTS amplitude;

-- 원시 이벤트 테이블
CREATE TABLE IF NOT EXISTS amplitude.raw_events (
    event_id          BIGINT PRIMARY KEY,
    event_type        VARCHAR(100) NOT NULL,
    event_time        TIMESTAMPTZ NOT NULL,
    user_id           UUID,                    -- auth.users.user_id와 JOIN 가능
    device_id         VARCHAR(100),
    session_id        BIGINT,
    event_properties  JSONB,
    user_properties   JSONB,
    city              VARCHAR(100),
    country           VARCHAR(50),
    platform          VARCHAR(50),
    os_name           VARCHAR(50),
    inserted_at       TIMESTAMPTZ DEFAULT now()
);

-- 조회 성능용 인덱스
CREATE INDEX IF NOT EXISTS idx_amp_events_user_id ON amplitude.raw_events (user_id);
CREATE INDEX IF NOT EXISTS idx_amp_events_event_time ON amplitude.raw_events (event_time);
CREATE INDEX IF NOT EXISTS idx_amp_events_event_type ON amplitude.raw_events (event_type);

-- ETL 실행 이력 (중복 실행 방지 + 모니터링)
CREATE TABLE IF NOT EXISTS amplitude.sync_log (
    id              SERIAL PRIMARY KEY,
    sync_start      VARCHAR(20) NOT NULL,      -- '20260403T00' 형식
    sync_end        VARCHAR(20) NOT NULL,
    event_count     INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'running',  -- running / success / failed
    error_message   TEXT,
    started_at      TIMESTAMPTZ DEFAULT now(),
    completed_at    TIMESTAMPTZ
);
```

### user_id 매핑 검증

| 소스 | user_id 형식 | 예시 |
|------|-------------|------|
| `auth.users.user_id` | PostgreSQL UUID | `788e16d5-0db4-497d-97f2-48ecc5e44607` |
| Amplitude `user_id` | 동일 UUID (프론트에서 `setAmplitudeUserId(backendUserId)` 호출) | `788e16d5-0db4-497d-97f2-48ecc5e44607` |

비로그인 이벤트(`common_auth_modal_viewed` 등)는 `user_id`가 NULL이고 `device_id`만 존재. 이는 정상.

---

## 4. Airflow DAG 코드

```python
"""
Amplitude Export API → PostgreSQL ETL DAG

스케줄: 매일 03:00 UTC (한국 12:00) — 전일 데이터 적재
재시도: 2회, 5분 간격
멱등성: event_id 기준 ON CONFLICT DO NOTHING
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.models import Variable
import requests
import json
import gzip
import zipfile
import io
import psycopg


# ──────────────────────────────────────────────
# Secret 관리: Airflow Variable에서 읽기
# Airflow UI > Admin > Variables 에 아래 2개 등록 필요
#   - amplitude_api_key
#   - amplitude_secret_key
# ──────────────────────────────────────────────

def _get_amplitude_credentials():
    return (
        Variable.get("amplitude_api_key"),
        Variable.get("amplitude_secret_key"),
    )


def _get_pg_connection():
    """기존 백엔드와 동일한 PostgreSQL 연결"""
    return psycopg.connect(
        host=Variable.get("postgres_host"),
        port=int(Variable.get("postgres_port", default_var="5432")),
        dbname=Variable.get("postgres_db"),
        user=Variable.get("postgres_user"),
        password=Variable.get("postgres_password"),
    )


def _ensure_tables():
    """amplitude 스키마 및 테이블 생성 (멱등)"""
    with _get_pg_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE SCHEMA IF NOT EXISTS amplitude")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS amplitude.raw_events (
                    event_id          BIGINT PRIMARY KEY,
                    event_type        VARCHAR(100) NOT NULL,
                    event_time        TIMESTAMPTZ NOT NULL,
                    user_id           UUID,
                    device_id         VARCHAR(100),
                    session_id        BIGINT,
                    event_properties  JSONB,
                    user_properties   JSONB,
                    city              VARCHAR(100),
                    country           VARCHAR(50),
                    platform          VARCHAR(50),
                    os_name           VARCHAR(50),
                    inserted_at       TIMESTAMPTZ DEFAULT now()
                )
            """)
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_amp_events_user_id
                ON amplitude.raw_events (user_id)
            """)
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_amp_events_event_time
                ON amplitude.raw_events (event_time)
            """)
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_amp_events_event_type
                ON amplitude.raw_events (event_type)
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS amplitude.sync_log (
                    id              SERIAL PRIMARY KEY,
                    sync_start      VARCHAR(20) NOT NULL,
                    sync_end        VARCHAR(20) NOT NULL,
                    event_count     INTEGER DEFAULT 0,
                    status          VARCHAR(20) DEFAULT 'running',
                    error_message   TEXT,
                    started_at      TIMESTAMPTZ DEFAULT now(),
                    completed_at    TIMESTAMPTZ
                )
            """)
        conn.commit()


def etl_amplitude_to_postgres(**context):
    """메인 ETL: Amplitude Export API → PostgreSQL"""

    # 전일 날짜 계산
    execution_date = context["ds"]
    target_date = datetime.strptime(execution_date, "%Y-%m-%d") - timedelta(days=1)
    start = target_date.strftime("%Y%m%dT00")
    end = target_date.strftime("%Y%m%dT23")

    # 1. 테이블 보장
    _ensure_tables()

    # 2. sync_log 기록 시작
    conn = _get_pg_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO amplitude.sync_log (sync_start, sync_end, status)
        VALUES (%s, %s, 'running') RETURNING id
        """,
        (start, end),
    )
    sync_id = cur.fetchone()[0]
    conn.commit()

    try:
        # 3. Amplitude Export API 호출
        api_key, secret_key = _get_amplitude_credentials()
        url = f"https://amplitude.com/api/2/export?start={start}&end={end}"
        response = requests.get(url, auth=(api_key, secret_key), timeout=300)

        if response.status_code == 404:
            # 해당 시간대에 데이터 없음 — 정상 종료
            cur.execute(
                """
                UPDATE amplitude.sync_log
                SET status = 'success', event_count = 0, completed_at = now()
                WHERE id = %s
                """,
                (sync_id,),
            )
            conn.commit()
            return

        response.raise_for_status()

        # 4. zip 해제 → gzip → JSONL 파싱
        event_count = 0
        insert_sql = """
            INSERT INTO amplitude.raw_events
                (event_id, event_type, event_time, user_id, device_id,
                 session_id, event_properties, user_properties,
                 city, country, platform, os_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (event_id) DO NOTHING
        """

        with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
            for filename in zf.namelist():
                with zf.open(filename) as raw:
                    with gzip.open(raw, "rt", encoding="utf-8") as f:
                        for line in f:
                            event = json.loads(line.strip())

                            # user_id: 비로그인 이벤트는 None
                            raw_uid = event.get("user_id")
                            user_id = raw_uid if raw_uid else None

                            cur.execute(insert_sql, (
                                event.get("event_id"),
                                event.get("event_type"),
                                event.get("event_time"),
                                user_id,
                                event.get("device_id"),
                                event.get("session_id"),
                                json.dumps(event.get("event_properties", {})),
                                json.dumps(event.get("user_properties", {})),
                                event.get("city"),
                                event.get("country"),
                                event.get("platform"),
                                event.get("os_name"),
                            ))
                            event_count += 1

                            # 1000건마다 중간 커밋 (메모리 절약)
                            if event_count % 1000 == 0:
                                conn.commit()

        conn.commit()

        # 5. sync_log 성공 기록
        cur.execute(
            """
            UPDATE amplitude.sync_log
            SET status = 'success', event_count = %s, completed_at = now()
            WHERE id = %s
            """,
            (event_count, sync_id),
        )
        conn.commit()
        print(f"[Amplitude ETL] {start}~{end}: {event_count}건 적재 완료")

    except Exception as e:
        conn.rollback()
        cur.execute(
            """
            UPDATE amplitude.sync_log
            SET status = 'failed', error_message = %s, completed_at = now()
            WHERE id = %s
            """,
            (str(e)[:500], sync_id),
        )
        conn.commit()
        raise

    finally:
        cur.close()
        conn.close()


# ──────────────────────────────────────────────
# DAG 정의
# ──────────────────────────────────────────────

default_args = {
    "owner": "data-team",
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
    "depends_on_past": False,
}

with DAG(
    dag_id="amplitude_export_to_postgres",
    default_args=default_args,
    description="Amplitude 이벤트 로그를 PostgreSQL amplitude.raw_events에 적재",
    schedule_interval="0 3 * * *",   # 매일 03:00 UTC (한국 12:00)
    start_date=datetime(2026, 4, 4),
    catchup=False,
    tags=["amplitude", "etl", "analytics"],
) as dag:

    run_etl = PythonOperator(
        task_id="etl_amplitude_to_postgres",
        python_callable=etl_amplitude_to_postgres,
    )
```

---

## 5. Secret 설정 방법

### 방법 A: Airflow UI에서 Variable 등록 (권장)

`airflow.int.selfronny.com` > Admin > Variables 에서 아래 항목 등록:

| Key | Value | 비고 |
|-----|-------|------|
| `amplitude_api_key` | `6299f50d2d65d37b1f280c3c3bce3326` | Amplitude 프로젝트 API Key |
| `amplitude_secret_key` | `(시크릿키)` | **절대 코드에 하드코딩 금지** |
| `postgres_host` | (기존 백엔드와 동일) | `POSTGRES_HOST` 환경변수 값 |
| `postgres_port` | `5432` | |
| `postgres_db` | (기존 백엔드와 동일) | `POSTGRES_DB` 환경변수 값 |
| `postgres_user` | (기존 백엔드와 동일) | `POSTGRES_USER` 환경변수 값 |
| `postgres_password` | (기존 백엔드와 동일) | `POSTGRES_PASSWORD` 환경변수 값 |

### 방법 B: K8s Secret + 환경변수 (대안)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: amplitude-credentials
  namespace: airflow
type: Opaque
stringData:
  api-key: "6299f50d2d65d37b1f280c3c3bce3326"
  secret-key: "(시크릿키)"
```

이 경우 DAG에서 `Variable.get()` 대신 `os.getenv()`로 읽도록 수정 필요.

---

## 6. 배포 순서

```
1. [DBA/back_dev] PostgreSQL에 amplitude 스키마 + 테이블 생성 (DDL 실행)
       또는 DAG 첫 실행 시 _ensure_tables()가 자동 생성

2. [back_dev] Airflow Variables에 시크릿 등록
       airflow.int.selfronny.com > Admin > Variables

3. [back_dev] DAG 파일을 Airflow DAGs 폴더에 배포
       K8s 환경이면 ConfigMap 또는 Git-sync로 배포

4. [back_dev] Airflow UI에서 DAG 활성화 + 수동 1회 실행하여 검증

5. [back_dev] amplitude.sync_log에서 status = 'success' 확인
       SELECT * FROM amplitude.sync_log ORDER BY id DESC LIMIT 5;

6. [back_dev] amplitude.raw_events에서 데이터 확인
       SELECT event_type, count(*) FROM amplitude.raw_events GROUP BY 1 ORDER BY 2 DESC;
```

---

## 7. 운영 참고

| 항목 | 내용 |
|------|------|
| 스케줄 | 매일 03:00 UTC (한국 12:00), 전일 데이터 |
| 멱등성 | `ON CONFLICT (event_id) DO NOTHING` — 재실행해도 중복 없음 |
| 재시도 | 실패 시 2회 재시도 (5분 간격) |
| 데이터 지연 | Amplitude Export API는 최소 2시간 지연. 전일 데이터를 다음날 적재하므로 문제 없음 |
| 용량 예상 | 현재 일 ~100건 수준. JSONB 포함 행당 ~2KB → 월 ~6MB. 당분간 용량 걱정 없음 |
| 모니터링 | `amplitude.sync_log` 테이블에서 실패 건 확인 |
| 백필 | 과거 데이터 필요 시 `catchup=True`로 변경 후 `start_date` 조정 |
