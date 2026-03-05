Commit Message Prefix 규칙

이 저장소는 홈서버 Kubernetes에서 운영되는 포트폴리오 프로젝트이며, 변경 범위를 빠르게 추적하기 위해 커밋 메시지에 prefix 규칙을 사용합니다.

목적

변경이 앱 코드인지 / 배포 설정인지 / 인프라인지 / 문서인지 즉시 구분

나중에 “언제 무엇이 바뀌었는지”를 쉽게 찾기

배포 실패/버그 발생 시 원인 커밋을 빠르게 좁히기

Prefix 목록
app:

애플리케이션 코드 변경 (프론트/백엔드)

포함 예시

React/Vite/TS(X) 코드 변경 (SolSQLD/src/...)

FastAPI 코드 변경 (backend/app/...)

API 스펙/요청·응답 변경

프론트/백 코드 리팩토링, 버그 수정

Dockerfile(앱 런타임) 변경(프론트/백 이미지 관련)

예시 커밋

app: add /api/events endpoint

app: implement SQL execute request from UI

app: fix auth context token refresh

app: add frontend nginx Dockerfile

k8s:

Kubernetes 배포/라우팅/오토스케일 등 “클러스터에 적용되는 리소스” 변경

포함 예시

k8s/ 폴더 내 YAML 수정

Deployment/Service/ConfigMap/Secret/HPA 변경

Gateway/HTTPRoute(/, /api 라우팅) 변경

resource requests/limits, probes, rolling update 전략 변경

namespace, labels/annotations 변경

예시 커밋

k8s: add backend deployment + service

k8s: route /api to backend via HTTPRoute

k8s: tune backend resources and probes

k8s: add backend HPA

infra:

앱 자체 기능이나 K8s 매니페스트가 아니라, “운영을 돕는 인프라/자동화/도구” 변경

포함 예시

CI/CD 스크립트, GitHub Actions, 빌드/배포 자동화

로컬 개발/운영 스크립트(scripts/), Makefile

이미지 태그 전략, 릴리즈 방식, 레포 운영 도구

Cloudflared/Tunnel 관련 운영 파일(이 레포에서 관리하는 경우에 한함)

환경 변수 템플릿, 공통 설정 파일(빌드/배포 파이프라인용)

예시 커밋

infra: add build-and-push script

infra: add github actions for docker build

infra: standardize image tagging scheme

주의: K8s YAML 변경은 k8s:로, 자동화/도구/파이프라인 변경은 infra:로 분류합니다.

docs:

문서 변경(설명, 사용법, 운영 노트)

포함 예시

README.md 업데이트

docs/architecture.md, docs/dev.md, docs/deploy.md 등

트러블슈팅 기록, 운영 메모, 결정 이유(ADR)

예시 커밋

docs: add local dev instructions

docs: document gateway routing and tunnel setup

docs: update troubleshooting notes for UI errors

권장 커밋 메시지 형태
기본 형식
<prefix>: <짧은 변경 요약>
좋은 예

app: add healthz endpoint

k8s: add readiness/liveness probes

infra: add make target for deploy

docs: update deployment steps

피해야 할 예

update (무슨 업데이트인지 알 수 없음)

fix (무엇을 고쳤는지 알 수 없음)

work (변경 범위 불명확)

커밋 단위(Granularity) 가이드

서로 다른 성격의 변경을 한 커밋에 섞지 않습니다.

예: API 코드 변경 + K8s 배포 변경을 한 번에 넣지 않기

분리 예:

app: add /api/sql/execute endpoint

k8s: expose backend service and route /api

문서만 바뀌었으면 docs: 단독 커밋으로 분리합니다.

예시 워크플로

백엔드에 엔드포인트 추가
→ app: add /api/events endpoint

K8s 라우팅을 /api로 연결
→ k8s: route /api to backend via HTTPRoute

배포 방법을 문서에 기록
→ docs: document deploy steps
