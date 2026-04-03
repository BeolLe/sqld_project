# SolSQLD

SolSQLD는 SQLD 시험 대비를 위한 학습 플랫폼입니다. React 기반 프론트엔드, FastAPI 백엔드, Oracle 실습 환경, PostgreSQL 운영 DB, Kubernetes 및 GitOps 배포 구조를 함께 다루는 엔드투엔드 프로젝트입니다.

이 저장소는 애플리케이션 코드 저장소입니다.

- `frontend`: React + Vite 기반 사용자 웹 UI
- `backend`: FastAPI 기반 API 서버 및 인증/모의고사/실습 로직
- `infra`: 앱 레포에서 함께 관리하는 일부 애플리케이션 배포 자산
- `docs`: 프로젝트 문서 및 참고 자료

## 프로젝트 목표

- SQLD 실습 및 모의고사 학습 경험 제공
- Oracle 기반 SQL 실습 샌드박스와 PostgreSQL 기반 운영 데이터를 분리 운영
- Kubernetes, Gateway API, Cloudflare, ArgoCD 기반 실무형 배포 경험 축적
- 인증, 콘텐츠 조회, 시험 저장, 로그, 집계 구조를 실제 서비스처럼 통합

## 현재 아키텍처

```text
Internet
   |
Cloudflare Tunnel / WARP
   |
Envoy Gateway
   |
+-------------------+-------------------+
|                                       |
Frontend (/)
React + Vite + nginx                    Backend (/api)
                                        FastAPI
                                            |
                    +-----------------------+----------------------+
                    |                                              |
          PostgreSQL (운영 DB)                           Oracle Autonomous DB
          auth / exam / practice /                      SQL 실습 실행 환경
          memo / dashboard / logs
```

### 라우팅 구조

- `/` → 프론트엔드
- `/api` → 백엔드

## 주요 기능 범위

### 인증
- 이메일 기반 회원가입 / 로그인
- JWT 기반 인증
- 약관 및 개인정보 처리방침 동의 반영

### 모의고사
- 모의고사 목록 / 문제 조회
- 응시 세션 생성 및 재개
- 답안 즉시 저장
- 메모 저장
- 제출 및 채점 결과 저장

### SQL 실습
- SQL 실습 문제 목록 / 상세 조회
- Oracle 기반 실행 환경 연동
- 실습 로그 저장 구조 반영

### 데이터 구조
- PostgreSQL 운영 스키마 분리
  - `auth`
  - `exam`
  - `practice`
  - `memo`
  - `dashboard`
  - `logs`
  - `runtime`
- 문제 데이터는 초기 mock 데이터를 PostgreSQL에 적재해 운영 기준 데이터로 전환

## 저장소 구조

```text
.
├─ frontend/        # React + Vite 프론트엔드
├─ backend/         # FastAPI 백엔드
├─ infra/           # 앱 레포 기준 배포 리소스
├─ docs/            # 문서 및 참고 자료
└─ README.md
```

## 로컬 개발

### Frontend

```bash
cd frontend
npm install
npm run dev
```

기본 개발 서버는 Vite 기준으로 실행됩니다.

### Backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

기본 API 서버는 `/api` prefix 기준으로 동작합니다.

## 배포 개요

이 저장소의 애플리케이션 코드는 GitHub Actions를 통해 컨테이너 이미지로 빌드되어 GHCR에 푸시됩니다.
실제 배포 기준 상태와 자동 반영은 별도 GitOps 저장소인 `sqld_project_gitops`에서 관리합니다.

배포 흐름은 아래와 같습니다.

```text
코드 변경
→ GitHub Actions 이미지 빌드 및 GHCR push
→ GitOps 레포 write-back
→ ArgoCD sync
→ Kubernetes 반영
```

## 참고 사항

- SQL 실습용 Oracle 테이블 원본은 프론트 mock 파일이 아니라 Oracle 쪽 별도 환경을 기준으로 운영합니다.
- PostgreSQL은 로그 저장소를 넘어 인증, 모의고사, 메모, 집계 데이터를 함께 관리하는 메인 운영 DB 역할을 수행합니다.
- 세부 DB 스키마 문서와 API 명세는 별도 문서에서 관리합니다.
