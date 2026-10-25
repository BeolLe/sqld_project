export type PreviewExam = 'sqld' | 'adsp';

// ponytail: 테스트 배포의 임시 UI만 활성화합니다. 정식 출시 때 시험별 라우팅으로 대체합니다.
export function isExamPreviewHost(hostname: string): boolean {
  return ['test_dummies.selfronny.com', 'localhost', '127.0.0.1', '[::1]'].includes(hostname);
}

export function getPreviewExam(pathname: string, remembered: PreviewExam = 'sqld'): PreviewExam {
  if (/^\/adsp(?:\/|$)/.test(pathname)) return 'adsp';
  if (/^\/(exams|learn|endless|dashboard|sql-practice)(?:\/|$)/.test(pathname)) return 'sqld';
  return remembered;
}

export function examPreviewPath(pathname: string, exam: PreviewExam): string {
  const path = pathname.replace(/^\/adsp(?=\/|$)/, '') || '/';
  if (path === '/' || path.startsWith('/sql-practice')) {
    return exam === 'adsp' ? '/adsp' : path;
  }
  // 시험마다 문항·단원 ID가 다르므로 상세 화면에서는 대상 시험의 목록으로 전환합니다.
  const section = path.match(/^\/(exams|learn|endless|dashboard)(?:\/|$)/)?.[1];
  if (!section) return path;
  return `${exam === 'adsp' ? '/adsp' : ''}/${section}`;
}

export function readPreviewExam(): PreviewExam {
  try {
    return localStorage.getItem('solsqld_preview_exam') === 'adsp' ? 'adsp' : 'sqld';
  } catch {
    return 'sqld';
  }
}

export function rememberPreviewExam(exam: PreviewExam): void {
  try {
    localStorage.setItem('solsqld_preview_exam', exam);
  } catch {
    // 저장소를 사용할 수 없어도 현재 URL로 시험 전환은 가능합니다.
  }
}
