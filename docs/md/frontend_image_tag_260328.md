# 프론트엔드 이미지 태그 전략 변경 제안

**작성일:** 2026-03-28
**대상 프로젝트:** SolSQLD (BeolLe/sqld_project)
**관련 파일:** `.github/workflows/frontend-ghcr.yaml`, `infra/frontend/deployment.yaml`

---

## 현재 문제

프론트엔드 코드를 수정하고 main에 머지해도, **실제 서비스에 자동 반영되지 않는다.**
ArgoCD에서 수동으로 SYNC를 눌러야 하고, 그마저도 반영이 안 되는 경우가 있다.

---

## 원인 분석

### 현재 배포 흐름

```
코드 머지 → GitHub Actions 이미지 빌드 → ghcr.io/beolle/sqld-frontend:latest 로 push
                                                        ↓
                              deployment.yaml 에는 항상 image: ...sqld-frontend:latest 고정
                                                        ↓
                              ArgoCD: "deployment.yaml 변경 없음" → Pod 재시작 안 함
```

### 핵심 원인

| 항목 | 현재 값 | 문제점 |
|------|---------|--------|
| 이미지 태그 | `latest` | 내용이 바뀌어도 이름이 같아서 ArgoCD가 변경을 감지 못함 |
| deployment.yaml | 항상 동일 | ArgoCD는 매니페스트 변경 기반으로 동작 — 파일이 안 바뀌면 할 일 없다고 판단 |
| imagePullPolicy | `Always` (수정 완료) | Pod가 재시작되면 새 이미지를 받지만, 재시작 트리거 자체가 없음 |

### ArgoCD Image Updater 상태

- `infra/argocd/front-image-updater.yaml`에 Image Updater가 설정되어 있음
- `.argocd-source-front-k8s.yaml`에 digest(`sha256:...`)를 기록하고 있음
- 하지만 이 digest가 실제 deployment.yaml의 이미지 태그를 변경하지 않아 Pod 재시작으로 이어지지 않음
- `build: automatic update of front-k8s` 커밋이 매번 생성되지만, 실질적인 배포 트리거가 되지 않는 상태

---

## 제안: 이미지 태그를 git SHA로 변경

### 변경 후 배포 흐름

```
코드 머지 → GitHub Actions 이미지 빌드 → ghcr.io/beolle/sqld-frontend:sha-be933e6 로 push
                                                        ↓
                              CI가 deployment.yaml 태그를 sha-be933e6 으로 자동 수정 후 커밋
                                                        ↓
                              ArgoCD: "deployment.yaml 바뀌었다!" → Pod 재시작 → 새 이미지 배포
```

### 수정 대상 파일

| 파일 | 변경 내용 | 영향 범위 |
|------|-----------|-----------|
| `.github/workflows/frontend-ghcr.yaml` | 이미지 빌드 후 deployment.yaml 태그를 SHA로 업데이트하는 스텝 추가, `contents: write` 권한 추가 | 프론트 CI만 |
| `infra/frontend/deployment.yaml` | CI가 매 빌드마다 이미지 태그를 자동 갱신 | 프론트 배포만 |

**백엔드 코드, 백엔드 CI, 백엔드 배포 파일은 변경 없음.**

### 구체적 코드 변경

**frontend-ghcr.yaml에 추가할 스텝:**

```yaml
      - name: Update deployment image tag
        run: |
          SHORT_SHA=$(echo "${{ github.sha }}" | cut -c1-7)
          sed -i "s|image: ghcr.io/beolle/sqld-frontend:.*|image: ghcr.io/beolle/sqld-frontend:sha-${SHORT_SHA}|" infra/frontend/deployment.yaml
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add infra/frontend/deployment.yaml
          git commit -m "build: automatic update of front-k8s"
          git push
```

---

## 기대 효과

| 항목 | Before | After |
|------|--------|-------|
| 배포 자동화 | 수동 SYNC 필요, 반영 안 되는 경우 있음 | 머지 → 빌드 → 배포 완전 자동 |
| 이미지 추적 | 어떤 코드가 배포됐는지 알 수 없음 (`latest`) | 커밋 SHA로 정확히 추적 가능 |
| 롤백 | 이전 이미지 특정 불가 | `sha-xxxxxxx` 태그로 즉시 롤백 가능 |

---

## 참고: 현재까지의 임시 조치

| PR | 내용 | 상태 |
|----|------|------|
| #12 | `imagePullPolicy: IfNotPresent → Always` 변경 | 머지 완료 (임시 조치) |
| 수동 SYNC | ArgoCD에서 매번 REFRESH → SYNC 수동 실행 | 반복 필요 |

이 제안이 적용되면 위 임시 조치 없이 자동 배포가 동작한다.

---

## 선행 조건

- GitHub OAuth 토큰에 `workflow` 스코프 추가 필요 (`gh auth refresh -s workflow --hostname github.com`)
- 또는 GitHub 웹 에디터에서 직접 workflow 파일 수정
