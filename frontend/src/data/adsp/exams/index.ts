import type { Problem } from '../../../types';
import type { ExamInfo } from '../../exams';
import { ADSP_EXAM_1_PROBLEMS } from './exam1';
import { ADSP_EXAM_2_PROBLEMS } from './exam2';
import { ADSP_EXAM_3_PROBLEMS } from './exam3';
import { ADSP_EXAM_4_PROBLEMS } from './exam4';
import { ADSP_EXAM_5_PROBLEMS } from './exam5';

/**
 * ADsP 모의고사. id 는 SQLD('1'~'10')와 겹치지 않게 'adsp-N' 을 쓴다.
 * DB 의 exam_code 는 'adsp_mock_N' (docs/adsp_content_seed.sql).
 */
const EXAM_MAP: Record<string, Problem[]> = {
  'adsp-1': ADSP_EXAM_1_PROBLEMS,
  'adsp-2': ADSP_EXAM_2_PROBLEMS,
  'adsp-3': ADSP_EXAM_3_PROBLEMS,
  'adsp-4': ADSP_EXAM_4_PROBLEMS,
  'adsp-5': ADSP_EXAM_5_PROBLEMS,
};

export const ADSP_EXAM_LIST: ExamInfo[] = [
  { id: 'adsp-1', round: 1, title: 'ADsP 모의고사 1회', problemCount: 50, avgDifficulty: 'easy', timeLimit: 90 },
  { id: 'adsp-2', round: 2, title: 'ADsP 모의고사 2회', problemCount: 50, avgDifficulty: 'easy', timeLimit: 90 },
  { id: 'adsp-3', round: 3, title: 'ADsP 모의고사 3회', problemCount: 50, avgDifficulty: 'medium', timeLimit: 90 },
  { id: 'adsp-4', round: 4, title: 'ADsP 모의고사 4회', problemCount: 50, avgDifficulty: 'medium', timeLimit: 90 },
  { id: 'adsp-5', round: 5, title: 'ADsP 모의고사 5회', problemCount: 50, avgDifficulty: 'hard', timeLimit: 90 },
];

export function getAdspExamProblems(examId: string): Problem[] {
  return EXAM_MAP[examId] ?? [];
}
