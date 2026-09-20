import type { LearnBlock } from '../types';

const EMP_ROWS = [
  ['BLAKE', 2850],
  ['KING', 5000],
  ['CLARK', 2450],
  ['SCOTT', 3000],
  ['JONES', 2975],
];

const SORTED_EMP_ROWS = [
  ['KING', 5000],
  ['SCOTT', 3000],
  ['JONES', 2975],
  ['BLAKE', 2850],
  ['CLARK', 2450],
];

/** 2과목 · SQL 활용 · Top N 쿼리 */
export const saTopnBlocks: LearnBlock[] = [
  {
    id: 'topn1',
    heading: 'Top N 쿼리란',
    blanks: [{ id: 'b1', answer: '정렬 기준', accepts: ['정렬 기준', 'order by', '정렬'] }],
    nodes: [
      {
        kind: 'p',
        text: 'Top N 쿼리는 전체 결과를 {{b1}}으로 줄 세운 뒤 앞에서 N개 행을 가져온다. 따라서 행 제한보다 `ORDER BY`의 기준이 먼저 명확해야 한다.',
      },
      {
        kind: 'table',
        head: ['요구사항', '적합한 방식'],
        rows: [
          ['정확히 N행', '`ROW_NUMBER()` 또는 `FETCH FIRST N ROWS ONLY`'],
          ['N등과 같은 값까지 포함', '`RANK()` 또는 `FETCH FIRST N ROWS WITH TIES`'],
          ['구버전 Oracle', '정렬한 인라인 뷰 바깥에서 `ROWNUM <= N`'],
        ],
      },
      {
        kind: 'memory',
        text: 'Top N = 먼저 순위를 결정하고, 그다음 필요한 행 수를 제한한다.',
      },
    ],
  },
  {
    id: 'topn2',
    heading: 'ROWNUM과 ORDER BY의 순서',
    blanks: [{ id: 'b2', answer: '먼저', accepts: ['먼저', '우선', '선행'] }],
    nodes: [
      {
        kind: 'p',
        text: '같은 SELECT 문에서 `WHERE ROWNUM <= 3`을 사용하면 행이 {{b2}} 선택되고, 그 3개 행만 `ORDER BY`로 정렬된다. 전체 급여 상위 3명을 보장하지 않는다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT ENAME, SAL FROM EMP WHERE ROWNUM <= 3 ORDER BY SAL DESC',
          sources: [{ label: 'EMP (조회된 순서)', columns: ['ENAME', 'SAL'], rows: EMP_ROWS }],
          steps: [
            {
              note: '① ROWNUM 조건이 먼저 적용되어 처음 조회된 3행만 남습니다.',
              resultLabel: 'ROWNUM <= 3',
              columns: ['ENAME', 'SAL'],
              rows: EMP_ROWS.slice(0, 3),
            },
            {
              note: '② 남은 3행만 급여 내림차순으로 정렬됩니다.',
              resultLabel: '최종 결과',
              columns: ['ENAME', 'SAL'],
              rows: [
                ['KING', 5000],
                ['BLAKE', 2850],
                ['CLARK', 2450],
              ],
            },
          ],
          doneNote: 'SCOTT와 JONES는 정렬 전에 제외되어 실제 급여 상위 3명이 나오지 않았습니다.',
        },
      },
      {
        kind: 'trap',
        text: '`ROWNUM`은 결과가 정렬된 뒤 붙는 최종 행 번호가 아니다. 같은 SELECT 문의 `ORDER BY`와 함께 쓰는 선지를 특히 조심한다.',
      },
    ],
  },
  {
    id: 'topn3',
    heading: '인라인 뷰로 올바른 Top N 만들기',
    blanks: [{ id: 'b3', answer: '바깥', accepts: ['바깥', '외부', '메인'] }],
    nodes: [
      {
        kind: 'p',
        text: '인라인 뷰 안에서 전체 행을 정렬하고, {{b3}} 쿼리에서 `ROWNUM <= N`을 적용하면 정렬된 결과의 앞 N행을 가져올 수 있다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT ENAME, SAL FROM (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC) WHERE ROWNUM <= 3',
          sources: [{ label: 'EMP', columns: ['ENAME', 'SAL'], rows: EMP_ROWS }],
          steps: [
            {
              note: '① 인라인 뷰가 전체 사원을 급여 내림차순으로 정렬합니다.',
              resultLabel: '인라인 뷰',
              columns: ['ENAME', 'SAL'],
              rows: SORTED_EMP_ROWS,
            },
            {
              note: '② 바깥 쿼리가 정렬된 결과의 처음 3행만 남깁니다.',
              resultLabel: '최종 결과',
              columns: ['ENAME', 'SAL'],
              rows: SORTED_EMP_ROWS.slice(0, 3),
            },
          ],
          doneNote: '정렬과 행 제한의 단계를 분리했으므로 전체 급여 상위 3명이 선택됩니다.',
        },
      },
      {
        kind: 'trap',
        text: '`ROWNUM > 1`은 첫 행부터 조건을 만족하지 못해 결과가 나오지 않는다. 구간 조회가 필요하면 인라인 뷰에서 ROWNUM을 별칭으로 만든 뒤 바깥에서 범위를 비교한다.',
      },
    ],
  },
  {
    id: 'topn4',
    heading: 'FETCH FIRST와 OFFSET',
    blanks: [{ id: 'b4', answer: 'ORDER BY', accepts: ['order by', '정렬', 'order by 절'] }],
    nodes: [
      {
        kind: 'p',
        text: 'Oracle 12c 이상에서는 `OFFSET m ROWS FETCH NEXT n ROWS ONLY`를 사용할 수 있다. 결과를 재현하려면 {{b4}}에 동점 해소 기준까지 넣는다.',
      },
      {
        kind: 'table',
        head: ['구문', '의미'],
        rows: [
          ['`FETCH FIRST 3 ROWS ONLY`', '정렬 결과의 처음 3행'],
          ['`OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY`', '앞 3행을 건너뛰고 다음 3행'],
          ['`FETCH FIRST 3 ROWS WITH TIES`', '3번째 행과 정렬값이 같은 행까지 포함'],
        ],
      },
      {
        kind: 'trap',
        text: '`ORDER BY SAL DESC`만 쓰면 같은 급여의 행 순서는 확정되지 않는다. 정확히 N행을 안정적으로 가져오려면 `ORDER BY SAL DESC, EMPNO`처럼 유일한 기준을 덧붙인다.',
      },
    ],
  },
  {
    id: 'topn5',
    heading: '순위 함수로 Top N 정하기',
    blanks: [{ id: 'b5', answer: '동점', accepts: ['동점', '동순위', '같은 값'] }],
    nodes: [
      {
        kind: 'p',
        text: '`ROW_NUMBER`, `RANK`, `DENSE_RANK` 중 무엇을 쓰는지는 {{b5}}을 어떻게 처리할지에 달려 있다. 순위를 먼저 계산한 인라인 뷰 바깥에서 순위 열을 필터링한다.',
      },
      {
        kind: 'table',
        head: ['함수', '상위 3 조건의 의미'],
        rows: [
          ['`ROW_NUMBER() ... AS RN` / `RN <= 3`', '항상 최대 3행'],
          ['`RANK() ... AS RK` / `RK <= 3`', '공동 순위 포함, 다음 순위는 건너뜀'],
          ['`DENSE_RANK() ... AS DR` / `DR <= 3`', '서로 다른 상위 3개 값에 해당하는 행 전부'],
        ],
      },
      {
        kind: 'memory',
        text: '정확히 N행이면 ROW_NUMBER · N등 동점 포함이면 RANK · 상위 N개 값이면 DENSE_RANK',
      },
    ],
  },
];
