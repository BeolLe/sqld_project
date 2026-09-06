import { tracker } from './tracker';
import type { LogEvent } from './types';

/**
 * 로그 전송 경로 (의사결정 INF).
 *
 * 수집 테이블이 아직 확정되지 않았다. 백엔드 `b774f38` 이 만든 `logs` 스키마는
 * api_requests·auth_events·learning_events 등 **서버가 자기 동작을 남기는 운영 로그**라
 * 프론트 행동 로그(pageview·click)를 받을 자리가 없다.
 *
 * 그래서 전송 코드만 준비해 두고 실제 연결은 보류한다.
 * 엔드포인트가 정해지면 `VITE_LOG_ENDPOINT` 를 채우는 것만으로 켜진다.
 */
const LOG_ENDPOINT = import.meta.env.VITE_LOG_ENDPOINT ?? '';

/** 페이지를 떠나는 순간에도 유실되지 않도록 sendBeacon 을 우선 쓴다. */
function post(events: LogEvent[]): void {
  const body = JSON.stringify({ events });

  if (navigator.sendBeacon) {
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
  });
}

export function initLogTransport(): void {
  if (!LOG_ENDPOINT) {
    console.debug('[LogTransport] VITE_LOG_ENDPOINT 미설정 — 콘솔에만 남습니다.');
    return;
  }

  tracker.setFlushCallback(post);

  // 탭을 닫거나 백그라운드로 보낼 때 남은 버퍼를 비운다.
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') tracker.flush();
  });
  window.addEventListener('pagehide', () => tracker.flush());

  console.debug('[LogTransport] 연결됨:', LOG_ENDPOINT);
}
