SolSQLD

SolSQLD는 SQLD 시험 대비를 위한 SQL 학습 플랫폼입니다.
사용자는 웹 UI에서 SQL 문제를 풀고 결과를 확인할 수 있으며, 전체 시스템은 Kubernetes 기반 홈서버 환경에서 운영되는 실제 서비스 구조를 목표로 설계되었습니다.

이 프로젝트는 단순한 웹 애플리케이션이 아니라 다음을 포함한 엔드투엔드 포트폴리오 프로젝트입니다.

React 기반 웹 서비스

FastAPI 백엔드 API

Kubernetes 배포 환경

Gateway 기반 트래픽 라우팅

GitOps 기반 배포 관리

Airflow 기반 데이터 파이프라인

프로젝트 목적

이 프로젝트의 목표는 다음과 같습니다.

SQLD 시험 대비를 위한 SQL 문제 풀이 플랫폼 구현

실제 서비스 구조에 가까운 웹 + API + 인프라 통합 아키텍처 구축

Kubernetes 기반 DevOps / Data Engineering 포트폴리오 구현

Airflow를 활용한 데이터 파이프라인 연동

아키텍처 (Architecture)
Internet
   │
Cloudflare Tunnel
   │
Envoy Gateway (Gateway API)
   │
 ┌───────────────┐
 │               │
Frontend       Backend
(React + Vite) (FastAPI)
   │               │
   │               │
   └───────API─────┘
트래픽 흐름
/      → Frontend (React)
/api   → Backend (FastAPI)

Cloudflare Tunnel을 통해 외부 트래픽이 클러스터로 전달되며
Envoy Gateway가 경로 기반 라우팅을 수행합니다.

기술 스택 (Tech Stack)
Frontend

React

Vite

TypeScript

TailwindCSS

Backend

FastAPI

Gunicorn

Uvicorn Worker

Infrastructure

Kubernetes

Envoy Gateway (Gateway API)

Cloudflare Tunnel

ArgoCD (GitOps)

Data Engineering

Apache Airflow

저장소 구조 (Repository Structure)
.
├─ SolSQLD/      # React + Vite 프론트엔드
├─ backend/      # FastAPI 백엔드
├─ k8s/          # Kubernetes 배포 설정
└─ docs/         # 프로젝트 문서
로컬 실행 방법 (Local Development)
Frontend
cd SolSQLD
npm install
npm run dev

개발 서버 실행 후 아래 주소에서 확인할 수 있습니다.

http://localhost:3000
Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

API 서버

http://localhost:8000
배포 (Deployment)

Docker 이미지를 빌드한 후 Kubernetes에 배포합니다.

Docker 이미지 빌드
docker build -t solsqld-backend ./backend
docker build -t solsqld-frontend ./SolSQLD
Kubernetes 배포
kubectl apply -f k8s/
커밋 메시지 규칙 (Commit Message Convention)

이 저장소에서는 변경 범위를 명확히 하기 위해 커밋 메시지 prefix 규칙을 사용합니다.

형식

<prefix>: 변경 내용 요약

예시

app: SQL 실행 API 추가
k8s: backend deployment 추가
infra: docker build workflow 추가
docs: 배포 방법 문서 업데이트
Prefix 종류
Prefix	설명
app:	애플리케이션 코드 변경 (프론트엔드 / 백엔드)
k8s:	Kubernetes 매니페스트 및 배포 설정
infra:	빌드 스크립트, CI/CD, 운영 관련 설정
docs:	문서 수정
향후 계획 (Roadmap)

SQL 실행 엔진 구현

문제 채점 시스템

사용자 인증 시스템

SQL 문제 데이터셋 구축

Airflow 기반 문제 데이터 파이프라인 구축
