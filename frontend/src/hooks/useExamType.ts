import { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { EXAM_CONFIG } from '../constants/examTypes';
import type { ExamType, ExamTypeConfig } from '../constants/examTypes';
import { getLastExamType, saveLastExamType, splitExamPath } from '../utils/examPath';

export interface ExamTypeState {
  examType: ExamType;
  config: ExamTypeConfig;
  /** URL 에 시험 세그먼트가 있는지. `/`, `/mypage` 같은 공통 화면이면 false. */
  isExamScoped: boolean;
  /** '/exams' → '/adsp/exams' */
  examPath: (path?: string) => string;
}

/**
 * 현재 시험(SQLD/ADsP)을 URL 첫 세그먼트에서 읽는다.
 * 공통 화면에서는 마지막으로 고른 시험을 쓴다.
 */
export function useExamType(): ExamTypeState {
  const { pathname } = useLocation();
  const fromPath = splitExamPath(pathname).examType;
  const examType = fromPath ?? getLastExamType();

  useEffect(() => {
    if (fromPath) saveLastExamType(fromPath);
  }, [fromPath]);

  const examPath = useCallback(
    (path = '/') => `/${examType}${path === '/' ? '' : path}`,
    [examType],
  );

  return useMemo(
    () => ({ examType, config: EXAM_CONFIG[examType], isExamScoped: fromPath !== null, examPath }),
    [examType, fromPath, examPath],
  );
}
