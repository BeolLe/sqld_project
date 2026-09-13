import type { LearnBlock } from '../types';

const EMP_ROWS = [
  ['KING', 5000, 10],
  ['SCOTT', 3000, 20],
  ['JONES', 2975, 20],
  ['SMITH', 800, 30],
];

/** 2과목 · SQL 활용 · 서브쿼리 */
export const saSubBlocks: LearnBlock[] = [
  {
    id: 'sub1',
    heading: '서브쿼리의 위치와 역할',
    blanks: [
      { id: 'b1', answer: '괄호', accepts: ['괄호', '소괄호', '()'] },
      { id: 'b2', answer: '바깥 쿼리', accepts: ['바깥 쿼리', '메인 쿼리', '외부 쿼리'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '서브쿼리는 다른 SQL 안에 들어 있는 SELECT 문이다. 반드시 {{b1}}로 감싸며, 서브쿼리가 만든 값이나 행 집합을 {{b2}}가 사용한다.',
      },
      {
        kind: 'table',
        head: ['위치', '이름·용도', '반환 형태'],
        rows: [
          ['`SELECT`', '스칼라 서브쿼리', '보통 1행 1열'],
          ['`FROM`', '인라인 뷰', '테이블 형태'],
          ['`WHERE` / `HAVING`', '중첩 서브쿼리', '조건 비교용 값·집합'],
        ],
      },
      {
        kind: 'trap',
        text: '아래 실행 과정은 개념을 위한 논리적 설명이다. 실제 DBMS 옵티마이저는 서브쿼리를 조인으로 변환하거나 실행 순서를 바꿀 수 있다.',
      },
    ],
  },
  {
    id: 'sub2',
    heading: '단일행·다중행 서브쿼리',
    blanks: [
      { id: 'b3', answer: '단일행', accepts: ['단일행', 'single row'] },
      { id: 'b4', answer: 'IN', accepts: ['in'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '서브쿼리 결과가 한 행이면 {{b3}} 비교 연산자 `=`, `>`, `<`, `>=`, `<=`, `<>`를 사용한다. 여러 행이면 {{b4}}, `ANY`, `ALL`, `EXISTS` 같은 연산자가 필요하다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT ENAME, SAL FROM EMP WHERE SAL > (SELECT AVG(SAL) FROM EMP)',
          sources: [{ label: 'EMP', columns: ['ENAME', 'SAL', 'DEPTNO'], rows: EMP_ROWS }],
          steps: [
            {
              note: '① 안쪽 쿼리가 전체 급여 평균 2,943.75를 만든다.',
              resultLabel: '서브쿼리 결과',
              columns: ['AVG(SAL)'],
              rows: [[2943.75]],
            },
            {
              note: '② 바깥 쿼리가 각 SAL을 2,943.75와 비교한다.',
              resultLabel: '최종 결과',
              columns: ['ENAME', 'SAL'],
              rows: [
                ['KING', 5000],
                ['SCOTT', 3000],
                ['JONES', 2975],
              ],
            },
          ],
          doneNote: '평균보다 급여가 큰 3개 행만 남는다.',
        },
      },
      {
        kind: 'table',
        head: ['연산자', '판단'],
        rows: [
          ['`IN`', '결과 중 같은 값이 하나라도 있으면 TRUE'],
          ['`> ANY`', '결과 중 하나보다만 크면 TRUE → 최솟값보다 큼'],
          ['`> ALL`', '결과의 모든 값보다 커야 TRUE → 최댓값보다 큼'],
        ],
      },
      {
        kind: 'trap',
        text: '여러 행을 반환하는 서브쿼리에 `=` 같은 단일행 연산자를 사용하면 ORA-01427 오류가 발생한다.',
      },
    ],
  },
  {
    id: 'sub3',
    heading: '스칼라 서브쿼리',
    blanks: [{ id: 'b5', answer: 'NULL', accepts: ['null', '널'] }],
    nodes: [
      {
        kind: 'p',
        text: '스칼라 서브쿼리는 한 행의 한 열, 즉 단일 값을 반환해 SELECT 목록이나 표현식에서 사용한다.',
      },
      {
        kind: 'table',
        head: ['반환 행 수', '스칼라 서브쿼리 결과'],
        rows: [
          ['0행', '{{b5}}'],
          ['1행', '그 행의 값'],
          ['2행 이상', 'ORA-01427 오류'],
        ],
      },
      {
        kind: 'trap',
        text: '`SELECT` 절에 있다고 무조건 안전한 것이 아니다. 여러 행이 나올 가능성이 있으면 집계하거나 유일 조건으로 한 행을 보장해야 한다.',
      },
    ],
  },
  {
    id: 'sub4',
    heading: '상관 서브쿼리와 EXISTS',
    blanks: [
      { id: 'b6', answer: '바깥 쿼리', accepts: ['바깥 쿼리', '메인 쿼리', '외부 쿼리'] },
      { id: 'b7', answer: '존재 여부', accepts: ['존재 여부', '존재', '행 존재 여부'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '상관 서브쿼리는 서브쿼리 안에서 {{b6}}의 현재 행을 참조한다. `EXISTS`는 반환값이 아니라 조건을 만족하는 행의 {{b7}}만 확인한다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query:
            'SELECT D.DEPTNO, D.DNAME FROM DEPT D WHERE EXISTS (SELECT 1 FROM EMP E WHERE E.DEPTNO = D.DEPTNO)',
          sources: [
            {
              label: 'DEPT',
              columns: ['DEPTNO', 'DNAME'],
              rows: [
                [10, 'ACCOUNTING'],
                [20, 'RESEARCH'],
                [30, 'SALES'],
                [40, 'OPERATIONS'],
              ],
            },
            { label: 'EMP', columns: ['ENAME', 'SAL', 'DEPTNO'], rows: EMP_ROWS },
          ],
          steps: [
            {
              note: '① DEPT 10과 같은 EMP 행이 있으므로 통과한다.',
              resultLabel: '현재까지 통과',
              columns: ['DEPTNO', 'DNAME'],
              rows: [[10, 'ACCOUNTING']],
            },
            {
              note: '② DEPT 20도 같은 EMP 행이 있으므로 통과한다.',
              resultLabel: '현재까지 통과',
              columns: ['DEPTNO', 'DNAME'],
              rows: [
                [10, 'ACCOUNTING'],
                [20, 'RESEARCH'],
              ],
            },
            {
              note: '③ DEPT 30도 같은 EMP 행이 있으므로 통과한다.',
              resultLabel: '현재까지 통과',
              columns: ['DEPTNO', 'DNAME'],
              rows: [
                [10, 'ACCOUNTING'],
                [20, 'RESEARCH'],
                [30, 'SALES'],
              ],
            },
            {
              note: '④ DEPT 40과 같은 EMP 행은 없으므로 제외한다.',
              resultLabel: '최종 결과',
              columns: ['DEPTNO', 'DNAME'],
              rows: [
                [10, 'ACCOUNTING'],
                [20, 'RESEARCH'],
                [30, 'SALES'],
              ],
            },
          ],
          doneNote: 'EMP가 한 명이라도 존재하는 부서만 남는다.',
        },
      },
      {
        kind: 'memory',
        text: 'EXISTS = 행이 있으면 TRUE · NOT EXISTS = 행이 없으면 TRUE',
      },
    ],
  },
  {
    id: 'sub5',
    heading: 'NOT IN과 NULL 함정',
    blanks: [{ id: 'b8', answer: 'UNKNOWN', accepts: ['unknown', '알 수 없음', '미정'] }],
    nodes: [
      {
        kind: 'p',
        text: '`NOT IN` 목록에 NULL이 있으면 `값 <> NULL` 비교가 {{b8}}이 된다. WHERE는 TRUE인 행만 남기므로 예상과 달리 결과가 0행이 될 수 있다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT DEPTNO FROM DEPT WHERE DEPTNO NOT IN (SELECT DEPTNO FROM EMP)',
          sources: [
            { label: 'DEPT.DEPTNO', columns: ['DEPTNO'], rows: [[10], [20], [30], [40]] },
            { label: 'EMP.DEPTNO', columns: ['DEPTNO'], rows: [[10], [20], ['NULL']] },
          ],
          steps: [
            {
              note: '① 서브쿼리 결과에 10, 20과 함께 NULL이 포함된다.',
              resultLabel: '서브쿼리 결과',
              columns: ['DEPTNO'],
              rows: [[10], [20], ['NULL']],
            },
            {
              note: '② 30과 40도 마지막의 <> NULL 때문에 TRUE가 아닌 UNKNOWN이 된다.',
              resultLabel: 'WHERE 판정',
              columns: ['DEPTNO', '판정'],
              rows: [
                [10, 'FALSE'],
                [20, 'FALSE'],
                [30, 'UNKNOWN'],
                [40, 'UNKNOWN'],
              ],
            },
            {
              note: '③ TRUE인 행이 없으므로 최종 결과는 0행이다.',
              resultLabel: '최종 결과',
              columns: ['DEPTNO'],
              rows: [],
            },
          ],
          doneNote: 'NULL 가능성이 있으면 NOT EXISTS 또는 서브쿼리의 IS NOT NULL 조건을 검토한다.',
        },
      },
      {
        kind: 'trap',
        text: '`NOT IN`을 `NOT EXISTS`로 무조건 치환하면 NULL 의미가 달라질 수 있다. 원하는 업무 규칙을 먼저 정하고 NULL을 명시적으로 처리한다.',
      },
    ],
  },
  {
    id: 'sub6',
    heading: '인라인 뷰와 WITH 절',
    blanks: [{ id: 'b9', answer: 'FROM', accepts: ['from', 'from 절'] }],
    nodes: [
      {
        kind: 'p',
        text: '인라인 뷰는 {{b9}} 절의 서브쿼리를 테이블처럼 사용한다. WITH 절의 CTE는 복잡한 중간 결과에 이름을 붙여 같은 SQL 안에서 읽기 쉽게 만든다.',
      },
      {
        kind: 'table',
        head: ['형태', '예시 용도'],
        rows: [
          ['인라인 뷰', '집계 결과를 다시 필터링하거나 순위를 제한'],
          ['CTE', '여러 단계의 쿼리를 이름으로 분리'],
          ['상관 서브쿼리', '바깥 행마다 연관된 데이터 존재·값 확인'],
        ],
      },
      {
        kind: 'trap',
        text: 'WITH 절이 항상 결과를 물리적으로 저장하는 것은 아니다. 실제 실행 방식은 옵티마이저가 결정한다.',
      },
    ],
  },
  {
    id: 'sub7',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          '서브쿼리는 괄호로 감싸고 바깥 쿼리에 값이나 행 집합을 제공한다',
          '단일행 결과에는 단일행 비교 연산자, 다중행 결과에는 IN·ANY·ALL 등을 사용한다',
          '스칼라 서브쿼리는 0행이면 NULL, 2행 이상이면 오류다',
          '상관 서브쿼리는 바깥 행을 참조하며 EXISTS는 행의 존재 여부를 판단한다',
          'NOT IN의 서브쿼리 결과에 NULL이 있으면 결과가 사라질 수 있다',
          '인라인 뷰는 FROM 절, CTE는 WITH 절에서 중간 결과를 표현한다',
        ],
      },
    ],
  },
];
