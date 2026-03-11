import type { Problem, Difficulty } from '../../types';
import { EXAM_1_PROBLEMS } from './exam1';
import { EXAM_2_PROBLEMS } from './exam2';
import { EXAM_3_PROBLEMS } from './exam3';
import { EXAM_4_PROBLEMS } from './exam4';
import { EXAM_5_PROBLEMS } from './exam5';
import { EXAM_6_PROBLEMS } from './exam6';
import { EXAM_7_PROBLEMS } from './exam7';
import { EXAM_8_PROBLEMS } from './exam8';
import { EXAM_9_PROBLEMS } from './exam9';
import { EXAM_10_PROBLEMS } from './exam10';

const EXAM_MAP: Record<string, Problem[]> = {
  '1': EXAM_1_PROBLEMS,
  '2': EXAM_2_PROBLEMS,
  '3': EXAM_3_PROBLEMS,
  '4': EXAM_4_PROBLEMS,
  '5': EXAM_5_PROBLEMS,
  '6': EXAM_6_PROBLEMS,
  '7': EXAM_7_PROBLEMS,
  '8': EXAM_8_PROBLEMS,
  '9': EXAM_9_PROBLEMS,
  '10': EXAM_10_PROBLEMS,
};

export function getExamProblems(examId: string): Problem[] {
  return EXAM_MAP[examId] ?? [];
}

export interface ExamInfo {
  id: string;
  round: number;
  title: string;
  problemCount: number;
  avgDifficulty: Difficulty;
  timeLimit: number;
}

export const EXAM_LIST: ExamInfo[] = [
  { id: '1', round: 1, title: 'SQLD 모의고사 1회', problemCount: 50, avgDifficulty: 'easy', timeLimit: 90 },
  { id: '2', round: 2, title: 'SQLD 모의고사 2회', problemCount: 50, avgDifficulty: 'easy', timeLimit: 90 },
  { id: '3', round: 3, title: 'SQLD 모의고사 3회', problemCount: 50, avgDifficulty: 'easy', timeLimit: 90 },
  { id: '4', round: 4, title: 'SQLD 모의고사 4회', problemCount: 50, avgDifficulty: 'medium', timeLimit: 90 },
  { id: '5', round: 5, title: 'SQLD 모의고사 5회', problemCount: 50, avgDifficulty: 'medium', timeLimit: 90 },
  { id: '6', round: 6, title: 'SQLD 모의고사 6회', problemCount: 50, avgDifficulty: 'medium', timeLimit: 90 },
  { id: '7', round: 7, title: 'SQLD 모의고사 7회', problemCount: 50, avgDifficulty: 'hard', timeLimit: 90 },
  { id: '8', round: 8, title: 'SQLD 모의고사 8회', problemCount: 50, avgDifficulty: 'hard', timeLimit: 90 },
  { id: '9', round: 9, title: 'SQLD 모의고사 9회', problemCount: 50, avgDifficulty: 'hard', timeLimit: 90 },
  { id: '10', round: 10, title: 'SQLD 모의고사 10회', problemCount: 50, avgDifficulty: 'hard', timeLimit: 90 },
];
