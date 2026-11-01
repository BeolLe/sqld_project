import { Fragment, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { EXAM_CONFIG, isExamType } from '../constants/examTypes';
import { saveLastExamType } from '../utils/examPath';

/**
 * `/:examType/*` 라우트 가드. 모르는 시험이면 통합 메인으로 보낸다.
 * children 을 넘기면 children 을, 아니면 하위 라우트(Outlet)를 그린다.
 */
export function ExamTypeGuard({ children }: { children?: ReactNode }) {
  const { examType } = useParams<{ examType: string }>();
  const valid = isExamType(examType);

  useEffect(() => {
    if (valid) saveLastExamType(examType);
  }, [valid, examType]);

  if (!valid) return <Navigate to="/" replace />;
  // 같은 화면에서 시험만 바뀌면(/sqld/learn → /adsp/learn) 컴포넌트를 새로 마운트해
  // 이전 시험의 상태·조회 결과·pageview 중복 방지 플래그가 남지 않게 한다.
  return <Fragment key={examType}>{children ?? <Outlet />}</Fragment>;
}

/** SQL 실습처럼 한 시험에만 있는 기능. 다른 시험이면 그 시험 홈으로 보낸다. */
export function SqlPracticeOnly({ children }: { children: ReactNode }) {
  const { examType } = useParams<{ examType: string }>();
  if (isExamType(examType) && !EXAM_CONFIG[examType].hasSqlPractice) {
    return <Navigate to={`/${examType}`} replace />;
  }
  return <>{children}</>;
}

/**
 * 통합 전 URL(`/exams/3`, `/learn/dm-entity` 등)을 `/sqld/...` 로 옮긴다.
 * 검색 유입과 이미 공유된 링크를 살리기 위한 것이다.
 */
export function LegacySqldRedirect() {
  const { pathname, search, hash } = useLocation();
  return <Navigate to={`/sqld${pathname}${search}${hash}`} replace />;
}

/** `/:examType` 아래 모르는 경로 → 그 시험 홈 */
export function ExamHomeRedirect() {
  const { examType } = useParams<{ examType: string }>();
  return <Navigate to={isExamType(examType) ? `/${examType}` : '/'} replace />;
}
