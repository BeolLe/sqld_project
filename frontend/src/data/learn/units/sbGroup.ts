import type { LearnBlock } from '../types';

/** 2과목 · SQL 기본 · GROUP BY, HAVING 절 */
export const sbGroupBlocks: LearnBlock[] = [
  {
    id: 'g1',
    heading: 'GROUP BY의 역할',
    blanks: [
      { id: 'b1', answer: 'GROUP BY', accepts: ['group by', 'groupby', '그룹 바이'] },
      { id: 'b2', answer: '그룹', accepts: ['그룹', 'group'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '{{b1}}는 같은 값을 가진 행을 하나의 {{b2}}으로 묶는다. `GROUP BY 부서번호`는 같은 부서번호를 가진 사원들을 모으고, 각 부서마다 합계·평균·인원 수를 계산할 수 있게 한다.',
      },
      {
        kind: 'table',
        head: ['SQL의 일부', '의미'],
        rows: [
          ['`GROUP BY 부서번호`', '부서번호별로 한 그룹을 만듦'],
          ['`GROUP BY 부서번호, 직급`', '부서번호와 직급의 값이 모두 같은 행끼리 묶음'],
          ["`GROUP BY TO_CHAR(입사일, 'YYYY')`", '입사 연도별로 묶음'],
        ],
      },
      {
        kind: 'p',
        text: 'GROUP BY에는 열뿐 아니라 표현식도 사용할 수 있다. 같은 표현식을 SELECT에서 보여 주려면 Oracle에서는 GROUP BY에도 그 표현식을 그대로 작성하는 것이 기본이다.',
      },
      {
        kind: 'memory',
        text: 'GROUP BY = 같은 값끼리 묶기 · 열을 여러 개 쓰면 그 값들의 조합으로 묶기',
      },
    ],
  },
  {
    id: 'g2',
    heading: '집계 함수와 NULL',
    blanks: [
      { id: 'b3', answer: 'COUNT(*)', accepts: ['count(*)', 'count *'] },
      { id: 'b4', answer: 'COUNT(열)', accepts: ['count(열)', 'count(column)', 'count 컬럼'] },
      { id: 'b5', answer: 'NULL', accepts: ['null', '널'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '집계 함수는 여러 행을 한 번에 계산하여 그룹마다 결과 하나를 만든다. 대표 함수는 `COUNT`, `SUM`, `AVG`, `MAX`, `MIN`이다.',
      },
      {
        kind: 'table',
        head: ['함수', '계산 대상'],
        rows: [
          ['{{b3}}', 'NULL 여부와 관계없이 행의 수를 계산'],
          ['{{b4}}', '해당 열이 NULL이 아닌 행의 수를 계산'],
          ['`COUNT(DISTINCT 열)`', 'NULL을 제외한 서로 다른 값의 수를 계산'],
          ['`SUM` / `AVG`', 'NULL을 제외한 값으로 합계 / 평균 계산'],
          ['`MAX` / `MIN`', 'NULL을 제외한 최댓값 / 최솟값 계산'],
        ],
      },
      {
        kind: 'p',
        text: '집계 함수는 일반적으로 {{b5}}을 계산에서 제외한다. 모든 값이 NULL이면 `SUM`, `AVG`, `MAX`, `MIN`은 NULL을 반환하고 `COUNT(열)`은 0을 반환한다.',
      },
      {
        kind: 'trap',
        text: '`AVG(수당)`은 수당이 NULL인 행을 제외한 평균이다. NULL을 0으로 포함한 평균이 필요하다면 `AVG(NVL(수당, 0))`처럼 NULL을 먼저 0으로 바꿔야 한다.',
      },
    ],
  },
  {
    id: 'g3',
    heading: 'GROUP BY 사용 시 SELECT 규칙',
    blanks: [
      { id: 'b6', answer: 'GROUP BY', accepts: ['group by', 'groupby'] },
      { id: 'b7', answer: '집계 함수', accepts: ['집계 함수', '집계함수', '다중행 함수', '그룹 함수'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'GROUP BY를 사용한 SELECT 목록에는 보통 **{{b6}}에 적은 열이나 표현식**과 **{{b7}}의 결과**만 올 수 있다. 여러 행이 한 그룹으로 합쳐졌을 때 결과 한 칸에 어떤 값을 보여 줄지 명확해야 하기 때문이다.',
      },
      {
        kind: 'table',
        head: ['SQL의 SELECT 목록', '판단'],
        rows: [
          ['`부서번호, COUNT(*)`', '`GROUP BY 부서번호`라면 가능'],
          ['`부서번호, 직급, COUNT(*)`', '`GROUP BY 부서번호, 직급`이라면 가능'],
          ['`부서번호, 사원명, COUNT(*)`', '사원명이 GROUP BY에 없고 집계되지 않았다면 오류'],
        ],
      },
      {
        kind: 'p',
        text: 'SELECT 별칭은 SELECT 단계에서 만들어지므로 Oracle에서는 같은 쿼리 블록의 GROUP BY에서 사용할 수 없다. 별칭 대신 원래 열이나 표현식을 적는다.',
      },
      {
        kind: 'trap',
        text: '`SELECT 부서번호, 사원명, COUNT(*) FROM 사원 GROUP BY 부서번호`는 오류다. 한 부서에 사원명이 여러 개일 수 있어 어떤 사원명을 한 행에 표시할지 결정할 수 없기 때문이다.',
      },
    ],
  },
  {
    id: 'g4',
    heading: 'WHERE와 HAVING의 차이',
    blanks: [
      { id: 'b8', answer: 'WHERE', accepts: ['where', '웨어'] },
      { id: 'b9', answer: 'HAVING', accepts: ['having', '해빙'] },
      { id: 'b10', answer: '그룹', accepts: ['그룹', 'group'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '{{b8}}는 그룹을 만들기 전에 **개별 행**을 걸러 내고, {{b9}}은 GROUP BY로 묶은 뒤 **{{b10}}**을 걸러 낸다.',
      },
      {
        kind: 'table',
        head: ['구분', 'WHERE', 'HAVING'],
        rows: [
          ['처리 시점', 'GROUP BY 전', 'GROUP BY 후'],
          ['필터 대상', '개별 행', '그룹'],
          ['집계 함수 조건', '사용할 수 없음', '사용 가능'],
          ['예시', '`WHERE 급여 >= 3000`', '`HAVING COUNT(*) >= 5`'],
        ],
      },
      {
        kind: 'p',
        text: '`WHERE 급여 >= 3000`은 급여가 낮은 사원을 먼저 제외하고 남은 행만 그룹으로 묶는다. `HAVING AVG(급여) >= 3000`은 그룹별 평균을 계산한 뒤 평균이 조건을 만족하는 그룹만 남긴다.',
      },
      {
        kind: 'memory',
        text: 'WHERE = 행 조건 · HAVING = 그룹 조건',
      },
      {
        kind: 'trap',
        text: 'HAVING은 GROUP BY와 함께 자주 쓰이지만 반드시 GROUP BY가 있어야 하는 것은 아니다. GROUP BY가 없으면 조회 대상 전체를 하나의 그룹처럼 보고 집계 조건을 판단할 수 있다.',
      },
    ],
  },
  {
    id: 'g5',
    heading: '처리 순서와 NULL 그룹',
    blanks: [
      { id: 'b11', answer: 'WHERE', accepts: ['where'] },
      { id: 'b12', answer: 'HAVING', accepts: ['having'] },
      { id: 'b13', answer: '하나의 그룹', accepts: ['하나의 그룹', '한 그룹', '동일 그룹'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '그룹 조회의 논리적 처리 순서는 `FROM → {{b11}} → GROUP BY → {{b12}} → SELECT → ORDER BY`다. 먼저 행을 거르고, 그룹을 만든 뒤, 그룹 조건을 검사한다고 이해한다.',
      },
      {
        kind: 'p',
        text: 'GROUP BY에서는 같은 열의 NULL들이 {{b13}}으로 묶인다. 예를 들어 부서번호가 NULL인 사원이 여러 명이면 각자 다른 그룹이 아니라 부서번호 NULL 그룹 하나로 집계된다.',
      },
      {
        kind: 'trap',
        text: 'GROUP BY가 NULL 행을 버리는 것은 아니다. NULL도 하나의 그룹이 되지만, `COUNT(부서번호)`는 NULL 값을 세지 않으므로 해당 그룹의 결과가 0일 수 있다.',
      },
    ],
  },
  {
    id: 'g6',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          'GROUP BY는 같은 값을 가진 행을 그룹으로 묶는다',
          'COUNT(*)는 행을 세고 COUNT(열)는 NULL이 아닌 값을 센다',
          '집계 함수는 일반적으로 NULL을 계산에서 제외한다',
          'SELECT에는 GROUP BY 기준이나 집계 함수 결과를 사용한다',
          'WHERE는 개별 행, HAVING은 만들어진 그룹을 거른다',
          'GROUP BY에서 NULL은 하나의 그룹으로 묶인다',
        ],
      },
    ],
  },
];
