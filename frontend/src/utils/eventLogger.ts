import * as amplitude from '@amplitude/unified';
import type { EventLog, EventType } from '../types';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY ?? '';

let amplitudeInitialized = false;

export function initAmplitude(): void {
  if (amplitudeInitialized || !AMPLITUDE_API_KEY) {
    if (!AMPLITUDE_API_KEY) {
      console.warn(
        '[Amplitude] VITE_AMPLITUDE_API_KEY가 설정되지 않았습니다. 이벤트가 로컬 로그만 남습니다.'
      );
    }
    return;
  }

  amplitude.initAll(AMPLITUDE_API_KEY, {
    analytics: {
      autocapture: true,
    },
    sessionReplay: {
      sampleRate: 1,
    },
  });

  amplitudeInitialized = true;
  console.debug('[Amplitude] 초기화 완료');
}

export function setAmplitudeUserId(userId: string): void {
  if (!amplitudeInitialized) return;
  amplitude.setUserId(userId);
}

// 실제 서비스에서는 API 호출로 교체
const logs: EventLog[] = [];

export function logEvent(type: EventType, payload: Record<string, unknown>, userId?: string): void {
  const log: EventLog = {
    id: crypto.randomUUID(),
    type,
    userId,
    payload,
    timestamp: new Date().toISOString(),
  };
  logs.push(log);
  console.debug('[EventLog]', log);

  // Amplitude로 이벤트 전송
  if (amplitudeInitialized) {
    amplitude.track(type, payload);
  }
}

export function getLogs(): EventLog[] {
  return [...logs];
}
