import type { Difficulty, Problem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ExamListItem {
  id: string;
  round: number;
  title: string;
  problemCount: number;
  avgDifficulty: Difficulty;
  timeLimit: number;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail || '데이터를 불러오지 못했습니다.');
  }

  return (await response.json()) as T;
}

export function fetchExamList() {
  return request<ExamListItem[]>('/content/exams');
}

export function fetchExamProblems(examId: string) {
  return request<Problem[]>(`/content/exams/${examId}`);
}

export interface SQLPracticeListItem {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  correctRate: number;
}

export function fetchSQLPracticeList() {
  return request<SQLPracticeListItem[]>('/content/sql-practices');
}

export function fetchSQLPractice(practiceId: string) {
  return request<Problem>(`/content/sql-practices/${practiceId}`);
}
