import { apiFetch } from '../utils/api';

export interface EndlessStatsResponse {
  totalAnswered: number;
  totalCorrect: number;
  correctRate: number;
  totalPoints?: number | null;
  awardedPoints?: number;
  isCorrect?: boolean;
  byCategory: Record<string, { answered: number; correct: number; rate: number }>;
  byDifficulty: Record<string, { answered: number; correct: number; rate: number }>;
}

export function fetchEndlessStats() {
  return apiFetch<EndlessStatsResponse>('/endless/stats');
}

export function resetEndlessStats() {
  return apiFetch<EndlessStatsResponse>('/endless/stats', {
    method: 'DELETE',
  });
}

export function submitEndlessAnswer(payload: {
  problemId: string;
  selectedAnswer: string;
  category?: string;
  difficulty?: string;
}) {
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
