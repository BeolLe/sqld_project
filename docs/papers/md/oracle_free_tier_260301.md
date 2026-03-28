# Oracle SQL 실습 환경 무료 구현 방안 검토

**작성일:** 2026-03-01
**목적:** SolSQLD 핵심 기능(Oracle SQL 실습)을 비용 0원으로 구현하기 위한 접근방식 비교 및 결정

---

## 배경

SolSQLD의 핵심 가치는 유저가 **실제 Oracle SQL 문법**을 직접 실행하고 결과를 확인할 수 있다는 점이다.
SQLD 자격증 시험이 Oracle 기반이므로, Oracle 호환성은 타협 불가 요소다.

현재 프론트엔드의 SQL 실행은 `executeMockSQL()` 더미 함수로 하드코딩된 결과를 반환하는 상태이며,
실제 Oracle DB와 연동하는 백엔드 구현이 필요하다.

---

## 접근방식 비교

### 방식 A: Oracle Cloud Free Tier (Autonomous DB)

ADR에서 현재 채택한 방식.

| 항목 | 내용 |
|------|------|
| **방식** | Oracle Autonomous Database (클라우드 관리형) |
| **비용** | 영구 무료 (Always Free) |
| **Oracle 호환** | 100% |
| **스펙** | 1 OCPU, 20GB 스토리지 |
| **동시 세션** | **최대 20개** (하드 리밋) |
| **7일 미사용 시** | 자동 정지 (DB 연결/CPU 사용으로 리셋) |
| **관리 부담** | 낮음 (Oracle 관리형) |

**장점:**
- 설치/운영 부담 최소
- Oracle이 인프라 관리 (패치, 백업 자동)
- K8s 리소스 절약 (외부 위임)

**단점:**
- 동시 세션 20개 하드 리밋 → 유저 증가 시 병목
- 7일 미사용 자동 정지 → Airflow 헬스체크 필요 (ADR 7.1)
- 네트워크 레이턴시 (클라우드 ↔ 로컬 K8s)

---

### 방식 B: Oracle 23ai Free (Docker / K8s Pod)

셀프호스팅 방식.

| 항목 | 내용 |
|------|------|
| **방식** | `gvenzl/oracle-free` Docker 이미지를 K8s Pod에 배포 |
| **비용** | 무료 (셀프호스팅) |
| **Oracle 호환** | 100% (Oracle 23ai) |
| **스펙** | RAM 2GB + CPU 2코어 (Oracle Free 자체 제한) |
| **유저 데이터** | 12GB 제한 |
| **동시 세션** | **서버 리소스에 따라 유연** (20명 제한 없음) |
| **관리 부담** | 중간 (직접 백업, 모니터링, Pod 관리) |

**장점:**
- 동시 세션 제한 해소 (클라우드 20개 리밋 없음)
- K8s 인프라와 동일 네트워크 → 레이턴시 최소
- 7일 자동 정지 없음

**단점:**
- 로컬 머신의 RAM 2GB + CPU 2코어 점유
- 백업/복구 직접 관리
- K8s Pod 장애 시 직접 대응 필요

---

### 방식 C: Oracle FreeSQL (LiveSQL) 연동

Oracle 공식 무료 웹 SQL 환경 활용.

| 항목 | 내용 |
|------|------|
| **방식** | Oracle 공식 freesql.com (구 LiveSQL) |
| **비용** | 무료 |
| **Oracle 호환** | 100% (Oracle 23ai) |
| **회원가입** | 불필요 |
| **관리 부담** | 없음 |

**장점:**
- 인프라 관리 부담 제로
- Oracle 23ai 최신 환경

**치명적 단점:**
- **API 미제공** → 자체 플랫폼에 통합 불가
- 외부 링크 연결만 가능 → "유저가 우리 플랫폼에서 SQL을 치고 결과를 받는" 핵심 기능 구현 불가
- 유저별 격리, 채점 등 커스텀 로직 적용 불가

---

## 결정: A + B 하이브리드 전략

### 1단계 — MVP (현재 → 초기 서비스)

**Oracle Cloud Free Tier (방식 A)** 사용

- 빠르게 실서비스 연동 가능
- 관리 부담 최소로 MVP 검증에 집중
- ADR의 Airflow 헬스체크 + Rate Limiting으로 제약사항 대응

### 2단계 — 스케일업 (유저 증가 시)

**Oracle 23ai Free Docker (방식 B)** 로 전환

- 동시 세션 20개 리밋이 실제 병목이 되는 시점에 전환
- K8s 인프라가 이미 있으므로 전환 비용 낮음
- FastAPI의 DB 연결 설정만 변경하면 됨 (동일 Oracle SQL 문법)

### 방식 C 제외 사유

- API 미제공으로 플랫폼 핵심 기능 통합 불가

---

## ADR과의 정합성

이미 수립된 ADR의 대응책이 이 전략과 잘 맞물린다:

| ADR | 내용 | 1단계(A) | 2단계(B) |
|-----|------|----------|----------|
| 004 | Oracle + PostgreSQL 이중 구조 | 적용 | 적용 |
| 004-1-1 | CTAS 기반 유저 격리 | 적용 | 적용 |
| 004-1-2 | 제출 후 무조건 리셋 | 적용 | 적용 |
| 007 | 한글 에러 매핑 | 적용 | 적용 |
| 008 | 결과 30행 제한 | 적용 | 적용 |
| 009 | Rate Limiting 3초/1회 | 적용 (필수) | 적용 (권장) |
| 7.1 | Airflow 헬스체크 | **필수** | 불필요 |

---

## 참고 자료

- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Always Free Autonomous Database 문서](https://docs.oracle.com/en/cloud/paas/autonomous-database/serverless/adbsb/autonomous-always-free.html)
- [gvenzl/oracle-free Docker 이미지](https://hub.docker.com/r/gvenzl/oracle-free)
- [Oracle FreeSQL (구 LiveSQL)](https://freesql.com)
- [Oracle Database 23ai Free](https://www.oracle.com/database/free/faq/)
