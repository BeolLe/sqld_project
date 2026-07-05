import { apiFetch } from '../utils/api';
import type { Problem } from '../types';
import { ALL_PRACTICE_PROBLEMS } from '../data/practice';
import { EXAM_1_PROBLEMS } from '../data/exams/exam1';

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

export function fetchEndlessProblems(): Promise<Problem[]> {
  if (IS_MOCK) return Promise.resolve(MOCK_PROBLEMS);
  return apiFetch<Problem[]>('/endless/problems');
}

export function fetchEndlessStats(): Promise<EndlessStatsResponse> {
  if (IS_MOCK) {
    return Promise.resolve({
      ...mockStats,
      correctRate: mockStats.totalAnswered > 0
        ? Math.round((mockStats.totalCorrect / mockStats.totalAnswered) * 100)
        : 0,
    });
  }
  return apiFetch<EndlessStatsResponse>('/endless/stats');
}

export function resetEndlessStats(): Promise<EndlessStatsResponse> {
  if (IS_MOCK) {
    mockStats.totalAnswered = 0;
    mockStats.totalCorrect = 0;
    mockStats.byCategory = {};
    mockStats.byDifficulty = {};
    return Promise.resolve({ ...mockStats, correctRate: 0 });
  }
  return apiFetch<EndlessStatsResponse>('/endless/stats', { method: 'DELETE' });
}

export function submitEndlessAnswer(payload: {
  problemId: string;
  selectedAnswer: string;
  category?: string;
  difficulty?: string;
}): Promise<EndlessStatsResponse> {
  if (IS_MOCK) {
    const problem = MOCK_PROBLEMS.find((p) => p.id === payload.problemId);
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
  return apiFetch<EndlessStatsResponse>('/endless/answer', {
    method: 'POST',
    body: JSON.stringify({
      problem_id: payload.problemId,
      selected_answer: payload.selectedAnswer,
      category: payload.category,
      difficulty: payload.difficulty,
    }),
  });
}
