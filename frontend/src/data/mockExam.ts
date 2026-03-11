import type { Problem } from '../types';

// 목업 문제 데이터 (50문항 중 일부 샘플)
export const MOCK_PROBLEMS: Problem[] = [
  {
    id: 'p1',
    title: 'SELECT 문 기본',
    description:
      '다음 SQL 문에서 출력되는 결과로 올바른 것은?\n\nSELECT EMPNO, ENAME, SAL * 12 AS ANNUAL_SAL\nFROM EMP\nWHERE DEPTNO = 10\nORDER BY SAL DESC;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 85,
    answer: '2',
    explanation:
      'SAL에 12를 곱한 연봉(ANNUAL_SAL)을 조회하며, DEPTNO가 10인 사원을 급여 내림차순으로 정렬합니다.',
    options: [
      '모든 사원의 연봉을 오름차순으로 출력한다.',
      '부서번호 10인 사원의 연봉을 급여 내림차순으로 출력한다.',
      '부서번호 10인 사원의 월급을 내림차순으로 출력한다.',
      'DEPTNO가 10이 아닌 사원만 출력한다.',
    ],
    points: 10,
  },
  {
    id: 'p2',
    title: 'NULL 처리 함수',
    description: 'NVL 함수에 대한 설명으로 가장 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 78,
    answer: '3',
    explanation:
      'NVL(expr1, expr2)는 expr1이 NULL이면 expr2를 반환하고, NULL이 아니면 expr1을 반환합니다.',
    options: [
      'NULL 값을 0으로만 변환한다.',
      'NULL이 아닌 첫 번째 값을 반환한다.',
      'NULL이면 두 번째 인수를 반환하고, 아니면 첫 번째 인수를 반환한다.',
      'NULL을 빈 문자열로 변환한다.',
    ],
    points: 10,
  },
  {
    id: 'p3',
    title: 'GROUP BY 절',
    description:
      '다음 SQL의 실행 결과에 대한 설명으로 올바른 것은?\n\nSELECT DEPTNO, COUNT(*), AVG(SAL)\nFROM EMP\nGROUP BY DEPTNO\nHAVING AVG(SAL) > 2000;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 62,
    answer: '1',
    explanation: 'GROUP BY로 부서별 집계 후 HAVING으로 평균 급여 2000 초과 부서만 필터링합니다.',
    options: [
      '부서별 사원 수와 평균급여를 출력하되, 평균급여가 2000 초과인 부서만 출력한다.',
      '사원 수가 2000 이상인 부서만 출력한다.',
      'WHERE 절과 동일한 역할을 HAVING 절이 수행한다.',
      'GROUP BY 없이 HAVING 단독 사용이 가능하다.',
    ],
    points: 10,
  },
  {
    id: 'p4',
    title: 'JOIN 유형',
    description: 'INNER JOIN에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 70,
    answer: '2',
    explanation: 'INNER JOIN은 양쪽 테이블 모두에 존재하는 행(교집합)만 반환합니다.',
    options: [
      '한쪽 테이블의 모든 행을 출력한다.',
      '양쪽 테이블에 모두 존재하는 행만 반환한다.',
      'NULL 값을 포함한 모든 행을 출력한다.',
      'ON 조건 없이도 사용 가능하다.',
    ],
    points: 10,
  },
  {
    id: 'p5',
    title: 'ROLLUP 함수',
    description: '다음 중 ROLLUP에 대한 설명으로 틀린 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 41,
    answer: '4',
    explanation: 'ROLLUP은 지정한 컬럼의 오른쪽부터 순차적으로 소계를 계산합니다.',
    options: [
      '소계와 합계를 동시에 구할 수 있다.',
      'GROUP BY 절과 함께 사용한다.',
      '계층적 집계를 지원한다.',
      '지정한 컬럼의 왼쪽부터 순차적으로 소계를 계산한다.',
    ],
    points: 10,
  },
];

// 50문항 채우기 (실제 서비스에서는 API 연동)
export const EXAM_PROBLEMS: Problem[] = Array.from({ length: 50 }, (_, i) => {
  const base = MOCK_PROBLEMS[i % MOCK_PROBLEMS.length];
  return {
    ...base,
    id: `exam_p${i + 1}`,
    title: `${i + 1}. ${base.title}`,
  };
});
