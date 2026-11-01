import { splitExamPath } from './examPath';

/**
 * URL → 로그 page_id. 시험 접두어(`/sqld`, `/adsp`)는 떼고 판별한다.
 * 어느 시험인지는 tracker 가 page_params.exam_type 으로 따로 붙인다.
 */
export function getPageId(pathname: string): string {
  if (pathname === '/') return 'portal';
  const { examType, rest } = splitExamPath(pathname);
  if (examType && rest === '/') return 'main';
  if (rest.startsWith('/exams')) return rest.includes('/result') ? 'exam_result' : rest.includes('/taking') ? 'exam_taking' : 'exam_list';
  if (rest.startsWith('/sql-practice/')) return 'sql_solving';
  if (rest === '/sql-practice') return 'sql_list';
  if (rest === '/learn') return 'learn_index';
  if (rest.startsWith('/learn/')) return 'learn_unit';
  if (rest === '/endless') return 'endless';
  if (rest === '/dashboard') return 'dashboard';
  if (rest === '/feedback') return 'feedback';
  if (rest === '/mypage') return 'mypage';
  return 'unknown';
}
