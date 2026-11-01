import type { Difficulty, Problem } from '../types';
import { apiFetch } from '../utils/api';
import type { ExamType } from '../constants/examTypes';
import { withExamType } from '../utils/examPath';

export interface ExamListItem {
  id: string;
  round: number;
  title: string;
  problemCount: number;
  avgDifficulty: Difficulty;
  timeLimit: number;
}

// 목업 데이터(문항·정답·해설)는 운영 번들에 들어가면 안 되므로, 빌드 때 제거되는
// `import.meta.env.VITE_AI_MOCK === '1'` 분기 안에서만 동적 import 한다.

export async function fetchExamList(examType: ExamType = 'sqld'): Promise<ExamListItem[]> {
  if (import.meta.env.VITE_AI_MOCK === '1') {
    const list =
      examType === 'adsp'
        ? (await import('../data/adsp/exams')).ADSP_EXAM_LIST
        : (await import('../data/exams')).EXAM_LIST;
    return list.map((e) => ({
      id: e.id,
      round: e.round,
      title: e.title,
      problemCount: e.problemCount,
      avgDifficulty: e.avgDifficulty,
      timeLimit: e.timeLimit,
    }));
  }
  return apiFetch<ExamListItem[]>(withExamType('/content/exams', examType));
}

export async function fetchExamProblems(examId: string, examType: ExamType): Promise<Problem[]> {
  if (import.meta.env.VITE_AI_MOCK === '1') {
    const { getExamProblems } = await import('../data/exams');
    return getExamProblems(examId, examType);
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
  if (import.meta.env.VITE_AI_MOCK === '1') {
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

export async function fetchSQLPracticeList(): Promise<SQLPracticeListItem[]> {
  if (import.meta.env.VITE_AI_MOCK === '1') {
    const { ALL_PRACTICE_PROBLEMS } = await import('../data/practice');
    return ALL_PRACTICE_PROBLEMS.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      difficulty: p.difficulty,
      correctRate: p.correctRate,
    }));
  }
  return apiFetch<SQLPracticeListItem[]>('/content/sql-practices');
}

export async function fetchSQLPractice(practiceId: string): Promise<Problem> {
  if (import.meta.env.VITE_AI_MOCK === '1') {
    const { getPracticeProblemById } = await import('../data/practice');
    const problem = getPracticeProblemById(practiceId);
    if (!problem) throw new Error('문제를 찾을 수 없습니다.');
    return problem;
  }
  return apiFetch<Problem>(`/content/sql-practices/${practiceId}`);
}
