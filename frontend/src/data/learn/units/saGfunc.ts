import type { LearnBlock } from '../types';

const SALES_ROWS = [
  [10, 'DEV', 100],
  [10, 'SALES', 80],
  [20, 'DEV', 120],
  [20, 'SALES', 90],
];

const DETAIL_ROWS = [
  [10, 'DEV', 100],
  [10, 'SALES', 80],
  [20, 'DEV', 120],
  [20, 'SALES', 90],
];

/** 2과목 · SQL 활용 · 그룹 함수 */
export const saGfuncBlocks: LearnBlock[] = [
  {
    id: 'gf1',
    heading: '그룹 함수가 만드는 소계',
    blanks: [
      { id: 'b1', answer: '소계', accepts: ['소계', 'subtotal'] },
      { id: 'b2', answer: '총계', accepts: ['총계', '전체 합계', 'grand total'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'SQL 활용의 그룹 함수는 기본 집계 함수 자체보다 여러 수준의 {{b1}}와 {{b2}}를 한 SQL에서 만드는 `ROLLUP`, `CUBE`, `GROUPING SETS`를 중심으로 다룬다.',
      },
      {
        kind: 'table',
        head: ['구문', '생성하는 그룹'],
        rows: [
          ['`ROLLUP(A, B)`', '`(A,B)`, `(A)`, `()`'],
          ['`CUBE(A, B)`', '`(A,B)`, `(A)`, `(B)`, `()`'],
          ['`GROUPING SETS((A), (B), ())`', '지정한 `(A)`, `(B)`, `()`만'],
        ],
      },
      {
        kind: 'memory',
        text: '빈 그룹 `()` = 전체 총계',
      },
    ],
  },
  {
    id: 'gf2',
    heading: 'ROLLUP — 계층 순서대로 소계',
    blanks: [
      { id: 'b3', answer: '오른쪽', accepts: ['오른쪽', '우측'] },
      { id: 'b4', answer: '7', accepts: ['7', '7행'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '`ROLLUP(A, B)`는 상세 그룹에서 시작해 {{b3}} 항목부터 하나씩 제거하며 상위 소계를 만든다. 아래 데이터에서는 상세 4행, 부서 소계 2행, 총계 1행으로 {{b4}}행이 된다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT DEPTNO, JOB, SUM(AMT) FROM SALES GROUP BY ROLLUP(DEPTNO, JOB)',
          sources: [{ label: 'SALES', columns: ['DEPTNO', 'JOB', 'AMT'], rows: SALES_ROWS }],
          steps: [
            {
              note: '① (DEPTNO, JOB) 조합별 상세 합계를 만든다.',
              resultLabel: '상세 그룹',
              columns: ['DEPTNO', 'JOB', 'SUM'],
              rows: DETAIL_ROWS,
            },
            {
              note: '② JOB을 제거한 (DEPTNO) 수준의 부서 소계를 추가한다.',
              resultLabel: '상세 + 부서 소계',
              columns: ['DEPTNO', 'JOB', 'SUM'],
              rows: [...DETAIL_ROWS, [10, 'ALL', 180], [20, 'ALL', 210]],
            },
            {
              note: '③ 모든 그룹 항목을 제거한 전체 총계를 추가한다.',
              resultLabel: '최종 결과',
              columns: ['DEPTNO', 'JOB', 'SUM'],
              rows: [...DETAIL_ROWS, [10, 'ALL', 180], [20, 'ALL', 210], ['ALL', 'ALL', 390]],
            },
          ],
          doneNote: 'ROLLUP은 지정 순서에 따른 계층형 소계와 전체 총계를 만든다.',
        },
      },
      {
        kind: 'trap',
        text: '`ROLLUP(A, B)`와 `ROLLUP(B, A)`는 중간 소계 수준이 다르다. 앞쪽 항목이 더 상위 그룹으로 남는다.',
      },
    ],
  },
  {
    id: 'gf3',
    heading: 'CUBE — 가능한 모든 방향의 소계',
    blanks: [{ id: 'b5', answer: '2의 n제곱', accepts: ['2의 n제곱', '2^n', '2의 n승'] }],
    nodes: [
      {
        kind: 'p',
        text: '`CUBE`는 지정한 그룹 항목의 모든 조합을 만든다. 그룹 항목이 n개이면 그룹화 조합 수는 {{b5}}이다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT DEPTNO, JOB, SUM(AMT) FROM SALES GROUP BY CUBE(DEPTNO, JOB)',
          sources: [{ label: 'SALES', columns: ['DEPTNO', 'JOB', 'AMT'], rows: SALES_ROWS }],
          steps: [
            {
              note: '① (DEPTNO, JOB) 상세 그룹과 (DEPTNO) 부서 소계를 만든다.',
              resultLabel: '기본 소계',
              columns: ['DEPTNO', 'JOB', 'SUM'],
              rows: [...DETAIL_ROWS, [10, 'ALL', 180], [20, 'ALL', 210]],
            },
            {
              note: '② ROLLUP에는 없던 (JOB) 직무 소계를 추가한다.',
              resultLabel: '양방향 소계',
              columns: ['DEPTNO', 'JOB', 'SUM'],
              rows: [
                ...DETAIL_ROWS,
                [10, 'ALL', 180],
                [20, 'ALL', 210],
                ['ALL', 'DEV', 220],
                ['ALL', 'SALES', 170],
              ],
            },
            {
              note: '③ 마지막으로 전체 총계를 추가한다.',
              resultLabel: '최종 결과',
              columns: ['DEPTNO', 'JOB', 'SUM'],
              rows: [
                ...DETAIL_ROWS,
                [10, 'ALL', 180],
                [20, 'ALL', 210],
                ['ALL', 'DEV', 220],
                ['ALL', 'SALES', 170],
                ['ALL', 'ALL', 390],
              ],
            },
          ],
          doneNote: 'CUBE(DEPTNO, JOB)는 상세·부서별·직무별·전체 총계를 모두 만든다.',
        },
      },
      {
        kind: 'memory',
        text: 'ROLLUP = 계층형 일부 조합 · CUBE = 가능한 모든 조합',
      },
    ],
  },
  {
    id: 'gf4',
    heading: 'GROUPING SETS — 필요한 조합만 선택',
    blanks: [{ id: 'b6', answer: '지정한', accepts: ['지정한', '명시한', '선택한'] }],
    nodes: [
      {
        kind: 'p',
        text: '`GROUPING SETS`는 ROLLUP이나 CUBE처럼 조합을 자동 생성하지 않고 {{b6}} 그룹 조합만 계산한다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query:
            'SELECT DEPTNO, JOB, SUM(AMT) FROM SALES GROUP BY GROUPING SETS ((DEPTNO), (JOB), ())',
          sources: [{ label: 'SALES', columns: ['DEPTNO', 'JOB', 'AMT'], rows: SALES_ROWS }],
          steps: [
            {
              note: '① 지정된 (DEPTNO) 조합으로 부서별 합계를 만든다.',
              resultLabel: '부서별 합계',
              columns: ['DEPTNO', 'JOB', 'SUM'],
              rows: [
                [10, 'ALL', 180],
                [20, 'ALL', 210],
              ],
            },
            {
              note: '② 지정된 (JOB) 조합으로 직무별 합계를 추가한다.',
              resultLabel: '부서별 + 직무별',
              columns: ['DEPTNO', 'JOB', 'SUM'],
              rows: [
                [10, 'ALL', 180],
                [20, 'ALL', 210],
                ['ALL', 'DEV', 220],
                ['ALL', 'SALES', 170],
              ],
            },
            {
              note: '③ 빈 그룹 ()로 전체 총계를 추가한다. 상세 조합은 지정하지 않았으므로 나오지 않는다.',
              resultLabel: '최종 결과',
              columns: ['DEPTNO', 'JOB', 'SUM'],
              rows: [
                [10, 'ALL', 180],
                [20, 'ALL', 210],
                ['ALL', 'DEV', 220],
                ['ALL', 'SALES', 170],
                ['ALL', 'ALL', 390],
              ],
            },
          ],
          doneNote: 'GROUPING SETS는 명시한 부서별·직무별·전체 합계만 반환한다.',
        },
      },
    ],
  },
  {
    id: 'gf5',
    heading: 'GROUPING으로 소계 NULL 구분',
    blanks: [
      { id: 'b7', answer: '1', accepts: ['1'] },
      { id: 'b8', answer: '0', accepts: ['0'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'ROLLUP·CUBE가 소계를 만들면서 해당 그룹 열을 비운 경우 `GROUPING(열)`은 {{b7}}을 반환한다. 원본 데이터의 실제 NULL이나 일반 상세 행이면 {{b8}}이다.',
      },
      {
        kind: 'table',
        head: ['행 종류', 'JOB 표시', '`GROUPING(JOB)`'],
        rows: [
          ['상세 행의 실제 NULL', 'NULL', '0'],
          ['부서 소계로 생성된 NULL', 'NULL', '1'],
          ['전체 총계로 생성된 NULL', 'NULL', '1'],
        ],
      },
      {
        kind: 'p',
        text: '`GROUPING_ID(A, B, ...)`는 여러 GROUPING 결과를 하나의 숫자로 합쳐 행의 그룹 수준을 구분할 때 사용한다.',
      },
      {
        kind: 'trap',
        text: "`NVL(JOB, '합계')`만 사용하면 실제 데이터의 NULL과 소계용 NULL을 구분하지 못한다. GROUPING 결과로 라벨을 결정해야 한다.",
      },
    ],
  },
  {
    id: 'gf6',
    heading: '그룹 조합 계산과 함정',
    blanks: [{ id: 'b9', answer: '4', accepts: ['4', '4개'] }],
    nodes: [
      {
        kind: 'p',
        text: '`CUBE(A, B)`는 `(A,B)`, `(A)`, `(B)`, `()`의 {{b9}}개 그룹화 조합을 만든다. 결과 행 수는 각 조합에서 실제로 생기는 그룹 수를 모두 더해 계산한다.',
      },
      {
        kind: 'table',
        head: ['표현', '그룹화 조합'],
        rows: [
          ['`ROLLUP(A, B)`', '`(A,B)`, `(A)`, `()`'],
          ['`CUBE(A, B)`', '`(A,B)`, `(A)`, `(B)`, `()`'],
          ['`GROUPING SETS((A,B), ())`', '`(A,B)`, `()`'],
        ],
      },
      {
        kind: 'trap',
        text: '그룹화 조합의 개수와 실제 결과 행 수는 다르다. 각 조합에서 만들어지는 고유 그룹 수까지 계산해야 한다.',
      },
    ],
  },
  {
    id: 'gf7',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          'ROLLUP은 오른쪽 그룹 항목부터 제거하며 계층형 소계와 총계를 만든다',
          'CUBE는 지정한 그룹 항목의 모든 조합을 만든다',
          'GROUPING SETS는 명시한 그룹 조합만 만든다',
          '빈 그룹 ()는 전체 총계를 의미한다',
          'GROUPING은 소계 생성으로 생긴 NULL이면 1, 일반 행이면 0을 반환한다',
          '그룹화 조합 수와 실제 결과 행 수를 구분한다',
        ],
      },
    ],
  },
];
