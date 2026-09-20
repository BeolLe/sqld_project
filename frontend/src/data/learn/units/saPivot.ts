import type { LearnBlock } from '../types';

const SALES_ROWS = [
  ['A', 'Q1', 100],
  ['A', 'Q2', 150],
  ['B', 'Q1', 80],
  ['B', 'Q2', 120],
];

/** 2과목 · SQL 활용 · PIVOT 절과 UNPIVOT 절 */
export const saPivotBlocks: LearnBlock[] = [
  {
    id: 'pivot1',
    heading: 'PIVOT의 역할과 구조',
    blanks: [
      { id: 'b1', answer: '열', accepts: ['열', '컬럼', 'column'] },
      { id: 'b2', answer: '집계 함수', accepts: ['집계 함수', '집계함수', 'aggregate'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '`PIVOT`은 행에 있던 구분값을 {{b1}}로 펼친다. 여러 행이 한 칸으로 모일 수 있으므로 `SUM`, `COUNT`, `MAX` 같은 {{b2}}가 필요하다.',
      },
      {
        kind: 'table',
        head: ['구성', '역할'],
        rows: [
          ['`SUM(AMOUNT)`', '각 교차 지점에 표시할 집계값'],
          ['`FOR QUARTER`', '열로 펼칠 기준 컬럼'],
          ["`IN ('Q1' AS Q1, 'Q2' AS Q2)`", '열로 만들 값과 출력 별칭'],
        ],
      },
      {
        kind: 'memory',
        text: 'PIVOT = 집계 함수 + FOR 기준 컬럼 + IN 출력할 값',
      },
    ],
  },
  {
    id: 'pivot2',
    heading: '행을 열로 펼치는 과정',
    blanks: [{ id: 'b3', answer: '그룹', accepts: ['그룹', '묶음', '집계 그룹'] }],
    nodes: [
      {
        kind: 'p',
        text: 'PIVOT 절에서 집계값이나 피벗 기준으로 쓰이지 않은 입력 컬럼은 암묵적인 {{b3}} 기준이 된다. 입력 서브쿼리에는 필요한 컬럼만 두는 편이 안전하다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query:
            "SELECT * FROM (SELECT PRODUCT, QUARTER, AMOUNT FROM SALES) PIVOT (SUM(AMOUNT) FOR QUARTER IN ('Q1' AS Q1, 'Q2' AS Q2))",
          sources: [{ label: 'SALES', columns: ['PRODUCT', 'QUARTER', 'AMOUNT'], rows: SALES_ROWS }],
          steps: [
            {
              note: '① PRODUCT가 행 그룹, QUARTER가 새 열의 기준이 됩니다.',
              resultLabel: '피벗 기준',
              columns: ['PRODUCT', 'Q1', 'Q2'],
              rows: [
                ['A', 100, '계산 중'],
                ['B', 80, '계산 중'],
              ],
            },
            {
              note: '② 각 PRODUCT와 QUARTER 교차 지점의 AMOUNT를 합산합니다.',
              resultLabel: '최종 결과',
              columns: ['PRODUCT', 'Q1', 'Q2'],
              rows: [
                ['A', 100, 150],
                ['B', 80, 120],
              ],
            },
          ],
          doneNote: '세로로 반복되던 분기 값이 Q1·Q2 열로 바뀌었습니다.',
        },
      },
      {
        kind: 'trap',
        text: '입력에 불필요한 컬럼이 남아 있으면 그 컬럼까지 암묵적 그룹 기준이 되어 예상보다 행이 많이 나올 수 있다.',
      },
    ],
  },
  {
    id: 'pivot3',
    heading: '조건부 집계와 PIVOT 비교',
    blanks: [{ id: 'b4', answer: 'CASE', accepts: ['case', 'case 문', 'case 표현식'] }],
    nodes: [
      {
        kind: 'p',
        text: '같은 결과는 `SUM({{b4}} WHEN QUARTER = ... THEN AMOUNT END)` 형태의 조건부 집계로도 만들 수 있다. 원리를 묻는 문제에서 두 형태를 서로 대응해 읽는다.',
      },
      {
        kind: 'table',
        head: ['PIVOT', '조건부 집계'],
        rows: [
          ["`SUM(AMOUNT) FOR QUARTER IN ('Q1')`", "`SUM(CASE WHEN QUARTER = 'Q1' THEN AMOUNT END)`"],
          ['암묵적 그룹화', '명시적인 `GROUP BY PRODUCT`'],
          ['값 목록을 열로 간결하게 표현', 'DBMS 호환성과 복잡한 조건 표현에 유리'],
        ],
      },
      {
        kind: 'trap',
        text: '정적 PIVOT의 `IN` 목록에 없는 값은 결과 열로 만들어지지 않는다. 데이터에 새 분기가 생겨도 SQL의 열 목록이 자동으로 늘어나지는 않는다.',
      },
    ],
  },
  {
    id: 'pivot4',
    heading: 'UNPIVOT으로 열을 행으로 되돌리기',
    blanks: [{ id: 'b5', answer: '행', accepts: ['행', '로우', 'row'] }],
    nodes: [
      {
        kind: 'p',
        text: '`UNPIVOT`은 여러 측정값 열을 이름 열과 값 열로 바꾸어 세로 {{b5}}으로 펼친다. 집계의 역연산이라기보다 저장 형태를 바꾸는 연산이다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query:
            "SELECT PRODUCT, QUARTER, AMOUNT FROM SALES_WIDE UNPIVOT (AMOUNT FOR QUARTER IN (Q1 AS 'Q1', Q2 AS 'Q2'))",
          sources: [
            {
              label: 'SALES_WIDE',
              columns: ['PRODUCT', 'Q1', 'Q2'],
              rows: [
                ['A', 100, 150],
                ['B', 80, 120],
              ],
            },
          ],
          steps: [
            {
              note: '① A 행의 Q1·Q2 열 이름은 QUARTER 값으로, 셀 값은 AMOUNT로 이동합니다.',
              resultLabel: 'A 변환',
              columns: ['PRODUCT', 'QUARTER', 'AMOUNT'],
              rows: [
                ['A', 'Q1', 100],
                ['A', 'Q2', 150],
              ],
            },
            {
              note: '② B 행도 같은 규칙으로 펼쳐집니다.',
              resultLabel: '최종 결과',
              columns: ['PRODUCT', 'QUARTER', 'AMOUNT'],
              rows: SALES_ROWS,
            },
          ],
          doneNote: 'Q1·Q2 열이 QUARTER 값으로 내려가고 각 금액이 별도 행이 되었습니다.',
        },
      },
      {
        kind: 'trap',
        text: '`UNPIVOT`은 기본적으로 NULL 값을 가진 열을 결과에서 제외한다. NULL 행도 필요하면 `UNPIVOT INCLUDE NULLS`를 사용한다.',
      },
    ],
  },
];
