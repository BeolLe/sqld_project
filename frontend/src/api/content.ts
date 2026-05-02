import type { Difficulty, Problem } from '../types';
import { apiFetch } from '../utils/api';

export interface ExamListItem {
  id: string;
  round: number;
  title: string;
  problemCount: number;
  avgDifficulty: Difficulty;
  timeLimit: number;
}

export function fetchExamList() {
  return apiFetch<ExamListItem[]>('/content/exams');
}

export function fetchExamProblems(examId: string) {
  return apiFetch<Problem[]>(`/content/exams/${examId}`);
}

export interface SQLPracticeListItem {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  correctRate: number;
}

export function fetchSQLPracticeList() {
  return apiFetch<SQLPracticeListItem[]>('/content/sql-practices');
}

export function fetchSQLPractice(practiceId: string) {
  return apiFetch<Problem>(`/content/sql-practices/${practiceId}`);
}
