import { DEFAULT_EXAM_TYPE, isExamType } from '../constants/examTypes';
import type { ExamType } from '../constants/examTypes';

const LAST_EXAM_KEY = 'solsqld_last_exam_type';
const INTEREST_EXAM_KEY = 'solsqld_interest_exam';

/**
 * '/adsp/exams/3' → { examType: 'adsp', rest: '/exams/3' }
 * '/adsp'         → { examType: 'adsp', rest: '/' }
 * '/mypage'       → { examType: null,   rest: '/mypage' }
 *
 * 로그 page_id 판별처럼 시험 구분 없이 화면 종류만 알고 싶을 때 rest 를 쓴다.
 */
export function splitExamPath(pathname: string): { examType: ExamType | null; rest: string } {
  const match = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (match && isExamType(match[1])) {
    return { examType: match[1], rest: match[2] || '/' };
  }
  return { examType: null, rest: pathname };
}

export function getLastExamType(): ExamType {
  try {
    const saved = window.localStorage.getItem(LAST_EXAM_KEY);
    return isExamType(saved) ? saved : DEFAULT_EXAM_TYPE;
  } catch {
    return DEFAULT_EXAM_TYPE;
  }
}

export function saveLastExamType(examType: ExamType) {
  try {
    window.localStorage.setItem(LAST_EXAM_KEY, examType);
  } catch {
    // 시크릿 모드 등 localStorage 사용 불가 시 조용히 무시한다.
  }
}

export type InterestExam = ExamType | 'both' | 'skipped';

/** 관심 시험 선택 결과. 아직 고르지 않았으면 null. */
export function getInterestExam(): InterestExam | null {
  try {
    const saved = window.localStorage.getItem(INTEREST_EXAM_KEY);
    if (saved === 'both' || saved === 'skipped' || isExamType(saved)) return saved;
    return null;
  } catch {
    // 저장소를 못 쓰면 모달을 매번 띄우지 않도록 고른 것으로 본다.
    return 'skipped';
  }
}

export function saveInterestExam(value: InterestExam) {
  try {
    window.localStorage.setItem(INTEREST_EXAM_KEY, value);
  } catch {
    // 시크릿 모드 등 localStorage 사용 불가 시 조용히 무시한다.
  }
}

/** 시험 콘텐츠 API 에 붙일 쿼리. 기존 쿼리가 있으면 & 로 잇는다. */
export function withExamType(path: string, examType: ExamType): string {
  return `${path}${path.includes('?') ? '&' : '?'}exam_type=${examType}`;
}
