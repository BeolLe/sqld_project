# Slack Bot 연동 구축 기록

**작성일:** 2026-03-01
**대상:** Claude Code 작업 완료 알림 → Slack 채널

---

## 개요

Claude Code에서 작업 완료 시 Slack으로 알림을 보내는 시스템을 구축했다.
매 응답이 아닌, 작업이 최종 완료된 시점에 사용자 확인 후 1회만 전송한다.

---

## 아키텍처

```
Claude Code 작업 완료
  → 사용자에게 "슬랙 알림을 받으시겠습니까?" 질문
  → 수락 시 notify-slack.sh 호출
  → Slack Incoming Webhook → Slack 채널
```

---

## 구성 요소

### 1. Slack Incoming Webhook

**생성 절차:**

1. https://api.slack.com/apps 접속
2. "Create New App" → "From scratch" 선택
3. 앱 이름 (예: `Claude Code Bot`), 워크스페이스 선택 후 생성
4. 좌측 메뉴 "Incoming Webhooks" → Activate: On
5. "Add New Webhook to Workspace" → 알림 받을 채널 선택
6. 생성된 Webhook URL 복사

### 2. 알림 스크립트

**경로:** `~/.claude/hooks/notify-slack.sh`

```bash
#!/bin/bash

# Usage: notify-slack.sh <task_name> <summary> <status>
# Example: notify-slack.sh "ESLint 설정" "ESLint + Prettier 구성 완료" "success"

WEBHOOK_URL="https://hooks.slack.com/services/T.../B.../..."

TASK_NAME="${1:-N/A}"
SUMMARY="${2:-N/A}"
STATUS="${3:-success}"

FINISHED_AT=$(date '+%Y-%m-%d %H:%M:%S')
PROJECT_NAME=$(basename "$(pwd)")

if [ "$STATUS" = "success" ]; then
  STATUS_EMOJI="white_check_mark"
  STATUS_TEXT="Success"
else
  STATUS_EMOJI="x"
  STATUS_TEXT="Failed"
fi

PAYLOAD=$(jq -n \
  --arg project "$PROJECT_NAME" \
  --arg task "$TASK_NAME" \
  --arg summary "$SUMMARY" \
  --arg finished "$FINISHED_AT" \
  --arg emoji "$STATUS_EMOJI" \
  --arg status "$STATUS_TEXT" \
  '{
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: ("Claude Code - " + $project), emoji: true }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: ("*Task:*\n" + $task) },
          { type: "mrkdwn", text: ("*Status:*\n:" + $emoji + ": " + $status) }
        ]
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: ("*Summary:*\n" + $summary) }
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: ("Finished at " + $finished) }
        ]
      }
    ]
  }')

curl -s -o /dev/null -X POST \
  -H 'Content-type: application/json' \
  --data "$PAYLOAD" \
  "$WEBHOOK_URL"
```

**인자:**

| 순서 | 이름 | 설명 | 예시 |
|------|------|------|------|
| $1 | task_name | 작업 이름 | "ESLint + Prettier 설정" |
| $2 | summary | 작업 요약 | "린트/포매팅/CI 구성 완료" |
| $3 | status | 성공 여부 | "success" 또는 "fail" |

### 3. 작업 완료 절차 (CLAUDE.md에 명시)

1. 작업 결과를 사용자에게 요약 보고
2. **"슬랙 알림을 받으시겠습니까?"** 질문
3. 수락 → `notify-slack.sh` 호출
4. 거절 → 알림 미전송

---

## Slack 알림 메시지 구조

```
┌─────────────────────────────────────┐
│ Claude Code - <프로젝트명>           │
├─────────────────────────────────────┤
│ Task:          │ Status:            │
│ <작업명>       │ ✅ Success         │
├─────────────────────────────────────┤
│ Summary:                            │
│ <작업 요약 내용>                     │
├─────────────────────────────────────┤
│ Finished at 2026-03-01 13:30:00     │
└─────────────────────────────────────┘
```

---

## 의사결정 기록

| 결정 사항 | 선택 | 이유 |
|-----------|------|------|
| 알림 방식 | Incoming Webhook | Bot 대비 설정이 간단하고 단방향 알림에 적합 |
| 트리거 방식 | 수동 호출 (Stop 훅 제거) | 매 응답마다 알림이 가는 문제 해결 |
| 스크립트 위치 | `~/.claude/hooks/` | 프로젝트 무관하게 공용 사용, git 추적 불필요 |
| 사용자 확인 | CLAUDE.md에 절차 명시 | 불필요한 알림 방지 |

---

## 의존성

- `jq` — JSON payload 생성 (macOS 기본 설치 또는 `brew install jq`)
- `curl` — HTTP 요청
