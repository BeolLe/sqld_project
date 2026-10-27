import * as amplitude from '@amplitude/unified';
import type { EventLog, EventType } from '../types';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY ?? '';

let amplitudeInitialized = false;

// Telemetry is best-effort: neither SDK errors nor rejected promises may break the UI.
function runTelemetry(action: () => void | Promise<unknown> | { promise: Promise<unknown> }): void {
  try {
    const result = action();
    const pending = result && 'promise' in result ? result.promise : result;
    if (pending) void pending.catch(() => {});
  } catch {
    // Logging failures must not interrupt authentication or rendering.
  }
}

function createEventId(): string {
  try {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    // Continue with the UUID v4 fallback when randomUUID is unavailable.
  }

  const bytes = new Uint8Array(16);
  try {
    // getRandomValues is also available on non-secure HTTP origins.
    globalThis.crypto.getRandomValues(bytes);
  } catch {
    // These IDs are only for telemetry, never authentication or secrets.
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function initAmplitude(): void {
  if (amplitudeInitialized || !AMPLITUDE_API_KEY) {
    if (!AMPLITUDE_API_KEY) {
      console.warn(
        '[Amplitude] VITE_AMPLITUDE_API_KEY가 설정되지 않았습니다. 이벤트가 로컬 로그만 남습니다.'
      );
    }
    return;
  }

  runTelemetry(() => {
    const initialization = amplitude.initAll(AMPLITUDE_API_KEY, {
      analytics: {
        autocapture: true,
      },
      sessionReplay: {
        sampleRate: 1,
      },
    });
    amplitudeInitialized = true;
    console.debug('[Amplitude] 초기화 완료');
    return initialization.catch(() => {
      amplitudeInitialized = false;
    });
  });
}

export function setAmplitudeUserId(userId: string | undefined): void {
  if (!amplitudeInitialized) return;
  runTelemetry(() => amplitude.setUserId(userId));
}

export function resetAmplitudeUserId(): void {
  if (!amplitudeInitialized) return;
  runTelemetry(() => amplitude.reset());
}

// 실제 서비스에서는 API 호출로 교체
const logs: EventLog[] = [];

export function logEvent(type: EventType, payload: Record<string, unknown>, userId?: string): void {
  runTelemetry(() => {
    const log: EventLog = {
      id: createEventId(),
      type,
      userId,
      payload,
      timestamp: new Date().toISOString(),
    };
    logs.push(log);
    console.debug('[EventLog]', log);

    // Amplitude로 이벤트 전송
    if (amplitudeInitialized) return amplitude.track(type, payload);
  });
}

export function getLogs(): EventLog[] {
  return [...logs];
}
