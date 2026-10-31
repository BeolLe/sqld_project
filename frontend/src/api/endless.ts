import { apiFetch } from '../utils/api';
import type { Problem } from '../types';
import type { ExamSchemaState } from './content';
import type { ExamType } from '../constants/examTypes';
import { withExamType } from '../utils/examPath';
import { ALL_PRACTICE_PROBLEMS } from '../data/practice';
import { EXAM_1_PROBLEMS } from '../data/exams/exam1';
import { ADSP_ENDLESS_PROBLEMS } from '../data/adsp/endless';

const IS_MOCK = import.meta.env.VITE_AI_MOCK === '1';

// mock용 문제 풀 (실습 + exam1 첫 20문제 혼합)
const MOCK_PROBLEMS: Problem[] = [
  ...ALL_PRACTICE_PROBLEMS,
  ...EXAM_1_PROBLEMS.slice(0, 20),
];

const mockStats = {
  totalAnswered: 0,
  totalCorrect: 0,
  byCategory: {} as Record<string, { answered: number; correct: number; rate: number }>,
  byDifficulty: {} as Record<string, { answered: number; correct: number; rate: number }>,
};

export interface EndlessStatsResponse {
  totalAnswered: number;
  totalCorrect: number;
  correctRate: number;
  totalPoints?: number | null;
  awardedPoints?: number;
  isCorrect?: boolean;
  answerId?: number;
  byCategory: Record<string, { answered: number; correct: number; rate: number }>;
  byDifficulty: Record<string, { answered: number; correct: number; rate: number }>;
}

export function fetchEndlessProblems(examType: ExamType = 'sqld'): Promise<Problem[]> {
  if (IS_MOCK) return Promise.resolve(examType === 'adsp' ? ADSP_ENDLESS_PROBLEMS : MOCK_PROBLEMS);
  return apiFetch<Problem[]>(withExamType('/endless/problems', examType));
}

export function fetchEndlessStats(examType: ExamType = 'sqld'): Promise<EndlessStatsResponse> {
  if (IS_MOCK) {
    return Promise.resolve({
      ...mockStats,
      correctRate: mockStats.totalAnswered > 0
        ? Math.round((mockStats.totalCorrect / mockStats.totalAnswered) * 100)
        : 0,
    });
  }
  return apiFetch<EndlessStatsResponse>(withExamType('/endless/stats', examType));
}

export function resetEndlessStats(examType: ExamType = 'sqld'): Promise<EndlessStatsResponse> {
  if (IS_MOCK) {
    mockStats.totalAnswered = 0;
    mockStats.totalCorrect = 0;
    mockStats.byCategory = {};
    mockStats.byDifficulty = {};
    return Promise.resolve({ ...mockStats, correctRate: 0 });
  }
  return apiFetch<EndlessStatsResponse>(withExamType('/endless/stats', examType), { method: 'DELETE' });
}

/** 같은 답안을 다시 보낼 때 쓰는 재전송 식별자. 보안 컨텍스트가 아니면 난수로 UUID v4 를 만든다. */
export function createRequestId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * requestId 를 보내도 되는지.
 * 구 스키마(legacy) DB 에 requestId 를 보내면 서버가 503 으로 거절하므로 SQLD 운영이 깨진다.
 * ADsP 는 서버가 requestId 를 필수로 요구하고, SQLD 는 스키마가 'ready' 일 때만 보낸다.
 */
export function shouldSendRequestId(examType: ExamType, schemaState: ExamSchemaState | null): boolean {
  return examType === 'adsp' || schemaState === 'ready';
}

export function submitEndlessAnswer(payload: {
  examType: ExamType;
  problemId: string;
  selectedAnswer: string;
  category?: string;
  difficulty?: string;
  /** 같은 답안의 재시도에는 같은 값. shouldSendRequestId 가 false 인 환경에서는 보내지 않는다. */
  requestId?: string;
}): Promise<EndlessStatsResponse> {
  if (IS_MOCK) {
    const problem = [...MOCK_PROBLEMS, ...ADSP_ENDLESS_PROBLEMS].find((p) => p.id === payload.problemId);
    const isCorrect = problem?.answer === payload.selectedAnswer;

    mockStats.totalAnswered += 1;
    if (isCorrect) mockStats.totalCorrect += 1;

    const cat = payload.category ?? 'etc';
    const diff = payload.difficulty ?? 'medium';
    const c = mockStats.byCategory[cat] ?? { answered: 0, correct: 0, rate: 0 };
    c.answered += 1;
    if (isCorrect) c.correct += 1;
    c.rate = Math.round((c.correct / c.answered) * 100);
    mockStats.byCategory[cat] = c;

    const d = mockStats.byDifficulty[diff] ?? { answered: 0, correct: 0, rate: 0 };
    d.answered += 1;
    if (isCorrect) d.correct += 1;
    d.rate = Math.round((d.correct / d.answered) * 100);
    mockStats.byDifficulty[diff] = d;

    return Promise.resolve({
      ...mockStats,
      correctRate: Math.round((mockStats.totalCorrect / mockStats.totalAnswered) * 100),
      isCorrect,
      awardedPoints: isCorrect ? 10 : 0,
      totalPoints: 320 + mockStats.totalCorrect * 10,
    });
  }
  return apiFetch<EndlessStatsResponse>(withExamType('/endless/answer', payload.examType), {
    method: 'POST',
    body: JSON.stringify({
      requestId: payload.requestId,
      problem_id: payload.problemId,
      selected_answer: payload.selectedAnswer,
      category: payload.category,
      difficulty: payload.difficulty,
    }),
  });
}
