import type { Difficulty, Problem } from '../types';
import { apiFetch } from '../utils/api';
import { EXAM_LIST, getExamProblems } from '../data/exams';
import { ALL_PRACTICE_PROBLEMS, getPracticeProblemById } from '../data/practice';

export interface ExamListItem {
  id: string;
  round: number;
  title: string;
  problemCount: number;
  avgDifficulty: Difficulty;
  timeLimit: number;
}

const IS_MOCK = import.meta.env.VITE_AI_MOCK === '1';

export function fetchExamList(): Promise<ExamListItem[]> {
  if (IS_MOCK) {
    return Promise.resolve(
      EXAM_LIST.map((e) => ({
        id: e.id,
        round: e.round,
        title: e.title,
        problemCount: e.problemCount,
        avgDifficulty: e.avgDifficulty,
        timeLimit: e.timeLimit,
      })),
    );
  }
  return apiFetch<ExamListItem[]>('/content/exams');
}

export function fetchExamProblems(examId: string): Promise<Problem[]> {
  if (IS_MOCK) {
    return Promise.resolve(getExamProblems(examId));
  }
  return apiFetch<Problem[]>(`/content/exams/${examId}`);
}

export interface SQLPracticeListItem {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  correctRate: number;
}

export function fetchSQLPracticeList(): Promise<SQLPracticeListItem[]> {
  if (IS_MOCK) {
    return Promise.resolve(
      ALL_PRACTICE_PROBLEMS.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        difficulty: p.difficulty,
        correctRate: p.correctRate,
      })),
    );
  }
  return apiFetch<SQLPracticeListItem[]>('/content/sql-practices');
}

export function fetchSQLPractice(practiceId: string): Promise<Problem> {
  if (IS_MOCK) {
    const problem = getPracticeProblemById(practiceId);
    if (!problem) return Promise.reject(new Error('문제를 찾을 수 없습니다.'));
    return Promise.resolve(problem);
  }
  return apiFetch<Problem>(`/content/sql-practices/${practiceId}`);
}
