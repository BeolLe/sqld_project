import { apiFetch, apiRequest } from '../utils/api';
import type {
  AIUsageResponse,
  AIExplainRequest,
  AISQLReviewRequest,
  AIAdminProviderTestRequest,
  AIStreamEvent,
} from '../types';

export async function fetchAIUsage(): Promise<AIUsageResponse> {
  if (import.meta.env.VITE_AI_MOCK === '1') {
    return {
      explain: { used: 0, limit: 3, remaining: 3 },
      sql_review: { used: 0, limit: 3, remaining: 3 },
      study_plan: { used: 0, limit: 3, remaining: 3 },
      plan_type: 'free',
      reset_at: '2026-07-05T00:00:00+09:00',
    };
  }
  const response = await apiFetch<{
    items: Array<{
      useCase: 'explanation' | 'sql_review' | 'study_plan';
      used: number;
      limit: number;
      remaining: number;
      unlimited?: boolean;
    }>;
    planType: string;
  }>('/ai/usage');
  const usage = Object.fromEntries(
    response.items.map((item) => [item.useCase, item]),
  );
  const empty = { used: 0, limit: 0, remaining: 0 };
  return {
    explain: usage.explanation ?? empty,
    sql_review: usage.sql_review ?? empty,
    study_plan: usage.study_plan ?? empty,
    plan_type: response.planType,
    reset_at: new Date().toISOString(),
  };
}

export interface AIStreamHandlers {
  onToken: (t: string) => void;
  onDone: (u: { input: number; output: number }) => void;
  onError: (m: string) => void;
  onDoneEvent?: (event: AIStreamDoneEvent) => void;
}

export interface AIStreamDoneEvent {
  type: 'done';
  requestId: string;
  cacheHit: boolean;
  modelTier: string;
  usageCharged: boolean;
  usage: {
    input: number;
    output: number;
    cacheCreationInput?: number;
    cacheReadInput?: number;
  };
  performance?: { firstTokenLatencyMs: number | null; stopReason: string | null };
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function mockStream(
  body: AIExplainRequest,
  handlers: AIStreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  const mockText = [
    '① 오답 원인 분석\n',
    `선택하신 ${body.user_answer}번 보기는 `,
    '개념을 혼동하기 쉬운 선택지입니다. ',
    '해당 보기는 표면적으로 유사하나 핵심 조건이 다릅니다.\n\n',
    '② 정답 개념 설명\n',
    `정답 ${body.correct_answer}번이 맞는 이유: `,
    `${body.explanation} `,
    '이 개념은 SQLD 시험에서 자주 출제되는 핵심 내용입니다.\n\n',
    '③ 관련 개념 연결\n',
    '이 문제는 ',
    'SQL의 집합 연산 및 조인 처리와 연결됩니다. ',
    '비슷한 유형의 문제를 추가로 풀어보며 ',
    '개념을 확실히 정리하는 것을 권장합니다.',
  ];

  for (const chunk of mockText) {
    if (signal.aborted) return;
    handlers.onToken(chunk);
    await sleep(80);
  }

  if (!signal.aborted) {
    handlers.onDone({ input: 820, output: 480 });
  }
}

export async function streamAIExplain(
  body: AIExplainRequest,
  handlers: AIStreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  if (import.meta.env.VITE_AI_MOCK === '1') {
    return mockStream(body, handlers, signal);
  }

  return streamAIRequest('/ai/explain', body, handlers, signal);
}

async function mockSQLReviewStream(
  body: AISQLReviewRequest,
  handlers: AIStreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  const wrongText = [
    '**▸ 결과 차이 분석:**\n\n',
    '`GROUP BY`절이 누락되어 집계가 수행되지 않았습니다. ',
    '문제에서 요구하는 것은 **부서별 평균 급여**인데, ',
    '현재 쿼리는 개별 사원 데이터를 반환합니다.\n\n',
    '**▸ 쿼리 효율성:**\n\n',
    '서브쿼리 대신 `JOIN`을 사용하면 실행 계획이 단순해집니다.\n\n',
    '**▸ 개선된 쿼리 제안:**\n\n',
    '```sql\n',
    'SELECT d.DNAME, AVG(e.SAL) AS avg_sal\n',
    'FROM EMP e JOIN DEPT d\n',
    '  ON e.DEPTNO = d.DEPTNO\n',
    'GROUP BY d.DNAME;\n',
    '```\n',
  ];

  const correctText = [
    '**▸ 쿼리 스타일 평가:**\n\n',
    '정답이며 가독성이 좋습니다. ',
    '컬럼 별칭을 사용한 점도 적절합니다.\n\n',
    '**▸ 효율성 분석:**\n\n',
    '현재 쿼리에서 `WHERE`절 없이 전체 테이블을 스캔합니다. ',
    '데이터가 많아지면 `DEPTNO` 인덱스 활용을 고려해보세요.\n\n',
    '**▸ 대안 쿼리:**\n\n',
    '`ROUND(AVG(SAL), 0)`을 사용하면 소수점 없이 깔끔하게 출력할 수 있습니다.',
  ];

  const mockText = body.attempt_id ? correctText : wrongText;

  for (const chunk of mockText) {
    if (signal.aborted) return;
    handlers.onToken(chunk);
    await sleep(80);
  }

  if (!signal.aborted) {
    handlers.onDone({ input: 1200, output: 600 });
  }
}

export async function streamAISQLReview(
  body: AISQLReviewRequest,
  handlers: AIStreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  if (import.meta.env.VITE_AI_MOCK === '1') {
    return mockSQLReviewStream(body, handlers, signal);
  }
  return streamAIRequest('/ai/sql-review', body, handlers, signal);
}

export async function streamAIAdminProviderTest(
  body: AIAdminProviderTestRequest,
  handlers: AIStreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  return streamAIRequest('/ai/admin/provider-test', body, handlers, signal);
}

export async function streamAIRequest(
  path: '/ai/explain' | '/ai/sql-review' | '/ai/study-plan' | '/ai/admin/provider-test',
  body: object,
  handlers: AIStreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await apiRequest(path, {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
      return;
    }
    handlers.onError('AI 서버에 연결할 수 없습니다.');
    return;
  }

  if (!res.ok) {
    let message = `AI 해설 요청 실패 (${res.status})`;
    try {
      const payload = (await res.json()) as { detail?: string; message?: string };
      message = payload.detail ?? payload.message ?? message;
    } catch {
      // ignore parse error
    }
    handlers.onError(message);
    return;
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let leftover = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = leftover + decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      // 마지막 줄은 잘렸을 수 있으므로 leftover로 보존
      leftover = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const jsonStr = trimmed.slice('data:'.length).trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr) as AIStreamEvent;
          if (event.type === 'token') {
            handlers.onToken(event.content);
          } else if (event.type === 'done') {
            const doneEvent = event as AIStreamDoneEvent;
            handlers.onDone(doneEvent.usage);
            handlers.onDoneEvent?.(doneEvent);
          } else if (event.type === 'error') {
            handlers.onError(event.message);
          }
        } catch {
          // 잘못된 JSON은 무시
        }
      }
    }
  } catch (err) {
    if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
      return;
    }
    handlers.onError('스트리밍 연결이 끊겼습니다.');
  }
}
