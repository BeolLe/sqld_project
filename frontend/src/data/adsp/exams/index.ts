import type { Problem } from '../../../types';
import type { ExamInfo } from '../../exams';
import { ADSP_EXAM_1_PROBLEMS } from './exam1';
import { ADSP_EXAM_2_PROBLEMS } from './exam2';
import { ADSP_EXAM_3_PROBLEMS } from './exam3';
import { ADSP_EXAM_4_PROBLEMS } from './exam4';
import { ADSP_EXAM_5_PROBLEMS } from './exam5';

/**
 * ADsP 모의고사. id 는 백엔드 공개 id 와 같은 회차 숫자('1'~'5')이며 SQLD 와 겹친다.
 * 시험 구분은 exam_type 으로 한다 (DB exam_code 는 'adsp_mock_N', docs/adsp_content_seed.sql).
 * 캐시·저장소 키처럼 id 로 만드는 값에는 반드시 시험 종류를 함께 쓴다.
 */
const EXAM_MAP: Record<string, Problem[]> = {
  '1': ADSP_EXAM_1_PROBLEMS,
  '2': ADSP_EXAM_2_PROBLEMS,
  '3': ADSP_EXAM_3_PROBLEMS,
  '4': ADSP_EXAM_4_PROBLEMS,
  '5': ADSP_EXAM_5_PROBLEMS,
};

export const ADSP_EXAM_LIST: ExamInfo[] = [
  { id: '1', round: 1, title: 'ADsP 모의고사 1회', problemCount: 50, avgDifficulty: 'easy', timeLimit: 90 },
  { id: '2', round: 2, title: 'ADsP 모의고사 2회', problemCount: 50, avgDifficulty: 'easy', timeLimit: 90 },
  { id: '3', round: 3, title: 'ADsP 모의고사 3회', problemCount: 50, avgDifficulty: 'medium', timeLimit: 90 },
  { id: '4', round: 4, title: 'ADsP 모의고사 4회', problemCount: 50, avgDifficulty: 'medium', timeLimit: 90 },
  { id: '5', round: 5, title: 'ADsP 모의고사 5회', problemCount: 50, avgDifficulty: 'hard', timeLimit: 90 },
];

export function getAdspExamProblems(examId: string): Problem[] {
  return EXAM_MAP[examId] ?? [];
}
