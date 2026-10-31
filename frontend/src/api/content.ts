import type { Difficulty, Problem } from '../types';
import { apiFetch } from '../utils/api';
import type { ExamType } from '../constants/examTypes';
import { withExamType } from '../utils/examPath';
import { EXAM_LIST, getExamProblems } from '../data/exams';
import { ADSP_EXAM_LIST } from '../data/adsp/exams';
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

export function fetchExamList(examType: ExamType = 'sqld'): Promise<ExamListItem[]> {
  if (IS_MOCK) {
    return Promise.resolve(
      (examType === 'adsp' ? ADSP_EXAM_LIST : EXAM_LIST).map((e) => ({
        id: e.id,
        round: e.round,
        title: e.title,
        problemCount: e.problemCount,
        avgDifficulty: e.avgDifficulty,
        timeLimit: e.timeLimit,
      })),
    );
  }
  return apiFetch<ExamListItem[]>(withExamType('/content/exams', examType));
}

export function fetchExamProblems(examId: string, examType: ExamType): Promise<Problem[]> {
  if (IS_MOCK) {
    return Promise.resolve(getExamProblems(examId, examType));
  }
  return apiFetch<Problem[]>(withExamType(`/content/exams/${examId}`, examType));
}

/** `GET /api/content/exam-capabilities` 응답. 시험별 공개 여부와 DB 스키마 준비 상태. */
export type ExamSchemaState = 'legacy' | 'ready' | 'partial';

export interface ExamCapabilities {
  schemaState: ExamSchemaState;
  sqld: { available: boolean };
  adsp: { available: boolean };
}

export function fetchExamCapabilities(): Promise<ExamCapabilities> {
  // 목업 모드는 프론트 데이터(data/adsp)로 동작하므로 ADsP 도 사용 가능이다.
  if (IS_MOCK) {
    return Promise.resolve({ schemaState: 'ready', sqld: { available: true }, adsp: { available: true } });
  }
  return apiFetch<ExamCapabilities>('/content/exam-capabilities');
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
