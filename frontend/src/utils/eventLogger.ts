import type { EventLog, EventType } from '../types';

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
  // TODO: POST /api/events
  console.debug('[EventLog]', log);
}

export function getLogs(): EventLog[] {
  return [...logs];
}
