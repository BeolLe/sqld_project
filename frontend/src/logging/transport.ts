import { tracker } from './tracker';
import type { LogEvent } from './types';

/**
 * 행동 로그 전송 (의사결정 F-1 해소).
 *
 * 수집 API: `POST /api/logs/events` — `{ events: [...] }` 배치 형식.
 * 응답 202, 본문은 `{received, inserted, duplicates}`.
 *
 * 이 API 는 sendBeacon 호환을 위해 CSRF 토큰 대신 허용 Origin 을 검사한다.
 * 로그인 사용자 ID 는 요청 본문이 아니라 인증 쿠키에서 서버가 확정하므로
 * 쿠키가 함께 나가야 한다(same-origin 이라 sendBeacon·fetch 모두 자동으로 보낸다).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** QA·로컬에서 다른 수집처로 돌려보고 싶을 때만 쓰는 우회 경로. */
const LOG_ENDPOINT = import.meta.env.VITE_LOG_ENDPOINT || `${API_BASE_URL}/logs/events`;

/**
 * 수집 API 의 스키마는 `extra="forbid"` 라 정의되지 않은 필드가 하나라도 있으면
 * 배치 전체가 422 로 거절된다. 또 `object_idx`·`object_section_idx` 는 0 이상만
 * 허용하고, 한 이벤트라도 조건을 어기면 같은 배치의 나머지까지 버려진다.
 *
 * 전송 직전에 그 두 가지만 막아 둔다. 값을 고쳐서라도 보내는 편이,
 * 이벤트 하나 때문에 배치 20건을 통째로 잃는 것보다 낫다.
 */
function sanitize(event: LogEvent): LogEvent {
  const safe: LogEvent = { ...event };

  if (typeof safe.object_idx !== 'number' || safe.object_idx < 0) {
    safe.object_idx = 0;
  }
  if (typeof safe.object_section_idx === 'number' && safe.object_section_idx < 0) {
    safe.object_section_idx = undefined;
  }

  return safe;
}

/** 페이지를 떠나는 순간에도 유실되지 않도록 sendBeacon 을 우선 쓴다. */
function post(events: LogEvent[]): void {
  const body = JSON.stringify({ events: events.map(sanitize) });

  // sendBeacon 은 문서가 닫힌 뒤에도 전송을 이어가지만 성공 여부를 알 수 없다.
  // 큐 적재에 실패하면(용량 초과 등) false 를 돌려주므로 그때만 fetch 로 넘긴다.
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon(LOG_ENDPOINT, blob)) return;
  }

  void fetch(LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    credentials: 'include',
    keepalive: true,
  }).catch(() => {
    // 로그 전송 실패가 서비스 동작에 영향을 주지 않도록 삼킨다.
    // 재전송은 하지 않는다. event_id 덕에 중복은 서버가 걸러내지만,
    // 실패를 되돌려 쌓으면 장애 시 큐가 무한히 커진다.
  });
}

export function initLogTransport(): void {
  tracker.setFlushCallback(post);

  // 탭을 닫거나 백그라운드로 보낼 때 남은 버퍼를 비운다.
  // pagehide 는 bfcache 로 들어갈 때도 불리므로 두 이벤트를 함께 쓴다.
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') tracker.flush();
  });
  window.addEventListener('pagehide', () => tracker.flush());

  console.debug('[LogTransport] 연결됨:', LOG_ENDPOINT);
}
