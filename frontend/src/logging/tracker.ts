import type { LogEvent } from './types';

const SCHEMA_VERSION = '1.0';
const PLATFORM = 'web';
const BUFFER_FLUSH_SIZE = 20;
const BUFFER_FLUSH_INTERVAL_MS = 10_000;

const DEVICE_ID_KEY = 'solsqld_device_id';
const SESSION_ID_KEY = 'solsqld_session_id';

type FlushCallback = (events: LogEvent[]) => void;

/**
 * 저장소에 UUID 를 한 번 만들어 두고 계속 재사용한다.
 *
 * 시크릿 모드나 저장소 차단 환경에서는 접근 자체가 예외를 던지므로,
 * 그 경우 식별자 없이 동작한다. 로깅이 서비스를 깨뜨려서는 안 된다.
 */
function loadOrCreateId(storage: () => Storage, key: string): string | undefined {
  try {
    const store = storage();
    const saved = store.getItem(key);
    if (saved) return saved;
    const next = crypto.randomUUID();
    store.setItem(key, next);
    return next;
  } catch {
    return undefined;
  }
}

/**
 * 브라우저 단위 식별자 (의사결정 E-2 · B안). localStorage 라 방문이 바뀌어도 유지된다.
 *
 * 비로그인 구간의 퍼널을 잇기 위한 값이다. 개인정보처리방침의
 * "접속 로그(브라우저·기기 정보)" 및 "서비스 이용 이벤트 로그" 고지 범위 안에서 쓴다.
 * 쿠키가 아니며 서버가 발급하지 않는다.
 */
function loadDeviceId(): string | undefined {
  return loadOrCreateId(() => window.localStorage, DEVICE_ID_KEY);
}

/**
 * 방문 단위 식별자. sessionStorage 라 탭을 닫으면 사라진다.
 *
 * device_id(영구) / session_id(방문) / user_id(계정) 3층으로 나뉜다.
 * 서버가 세션 ID 를 내려주는 방식으로 바꿀 경우 setSession() 으로 덮어쓰면 된다.
 */
function loadSessionId(): string | undefined {
  return loadOrCreateId(() => window.sessionStorage, SESSION_ID_KEY);
}

class LogTracker {
  private buffer: LogEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private onFlush: FlushCallback | null = null;
  private userId: string | undefined;
  private sessionId: string | undefined;
  private deviceId: string | undefined;

  constructor() {
    this.deviceId = loadDeviceId();
    this.sessionId = loadSessionId();
    this.startFlushTimer();
  }

  setUser(userId: string | undefined) {
    this.userId = userId;
  }

  setSession(sessionId: string | undefined) {
    this.sessionId = sessionId;
  }

  getDeviceId(): string | undefined {
    return this.deviceId;
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  setFlushCallback(cb: FlushCallback) {
    this.onFlush = cb;
  }

  push(
    event: Omit<
      LogEvent,
      'schema_version' | 'platform' | 'timestamp' | 'user_id' | 'session_id' | 'device_id'
    >
  ) {
    const full: LogEvent = {
      ...event,
      schema_version: SCHEMA_VERSION,
      platform: PLATFORM,
      timestamp: new Date().toISOString(),
      user_id: this.userId,
      session_id: this.sessionId,
      device_id: this.deviceId,
    };

    this.buffer.push(full);
    console.debug(
      '[LogTracker]',
      full.event_type,
      full.page_id,
      full.object_section_id || '',
      full.object_id || '',
      full
    );

    if (this.buffer.length >= BUFFER_FLUSH_SIZE) {
      this.flush();
    }
  }

  flush() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0);
    if (this.onFlush) {
      this.onFlush(batch);
    }
  }

  getBuffer(): readonly LogEvent[] {
    return this.buffer;
  }

  private startFlushTimer() {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flush(), BUFFER_FLUSH_INTERVAL_MS);
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

export const tracker = new LogTracker();
