import type { Problem } from '../../types';
import { EASY_PROBLEMS } from './easy';
import { MEDIUM_PROBLEMS } from './medium';
import { HARD_PROBLEMS } from './hard';

export { EASY_PROBLEMS } from './easy';
export { MEDIUM_PROBLEMS } from './medium';
export { HARD_PROBLEMS } from './hard';

export const ALL_PRACTICE_PROBLEMS: Problem[] = [
  ...EASY_PROBLEMS,
  ...MEDIUM_PROBLEMS,
  ...HARD_PROBLEMS,
];

export function getPracticeProblems(difficulty?: 'easy' | 'medium' | 'hard'): Problem[] {
  if (!difficulty) return ALL_PRACTICE_PROBLEMS;
  switch (difficulty) {
    case 'easy':
      return EASY_PROBLEMS;
    case 'medium':
      return MEDIUM_PROBLEMS;
    case 'hard':
      return HARD_PROBLEMS;
  }
}

export function getPracticeProblemById(id: string): Problem | undefined {
  return ALL_PRACTICE_PROBLEMS.find((p) => p.id === id);
}
