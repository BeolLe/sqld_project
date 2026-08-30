import type { LearnBlock } from '../types';

/** 2과목 · SQL 기본 · SELECT 문 */
export const sbSelectBlocks: LearnBlock[] = [
  {
    id: 's1',
    heading: 'SELECT 문의 기본 구조',
    blanks: [
      { id: 'b1', answer: 'SELECT', accepts: ['select', '셀렉트'] },
      { id: 'b2', answer: 'FROM', accepts: ['from', '프롬'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '{{b1}} 절에는 조회할 열이나 계산식을 적고, {{b2}} 절에는 데이터를 읽을 테이블을 적는다. `SELECT 사원번호, 사원명 FROM 사원;`은 사원 테이블에서 두 열만 골라 보여 준다.',
      },
      {
        kind: 'table',
        head: ['작성 요소', '역할', '예시'],
        rows: [
          ['SELECT', '결과에 표시할 열·식·함수를 지정', '`SELECT 사원명, 급여 * 12`'],
          ['FROM', '데이터를 가져올 테이블을 지정', '`FROM 사원`'],
          ['`*`', '테이블의 모든 열을 선택', '`SELECT * FROM 사원`'],
        ],
      },
      {
        kind: 'p',
        text: 'SELECT 목록에는 원래 열뿐 아니라 숫자·문자 같은 상수와 계산식도 넣을 수 있다. 계산식은 각 행마다 계산되며 결과 열로 나타난다.',
      },
      {
        kind: 'p',
        text: 'Oracle의 `DUAL`은 함수나 계산 결과를 확인할 때 사용하는 1행짜리 더미 테이블이다. 실제 업무 테이블을 읽지 않고도 `SELECT 10 + 20 FROM DUAL;`처럼 결과를 확인할 수 있다.',
      },
      {
        kind: 'trap',
        text: '`DUAL`은 함수와 계산식을 실행하기 위한 Oracle의 더미 테이블이다. 시험에서 `SELECT SYSDATE FROM DUAL`처럼 자주 등장한다.',
      },
    ],
  },
  {
    id: 's2',
    heading: '연산자와 NULL',
    blanks: [
      { id: 'b3', answer: 'NULL', accepts: ['null', '널'] },
      { id: 'b4', answer: '괄호', accepts: ['괄호', 'parentheses'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'SELECT 목록의 산술식은 일반 계산처럼 `*`, `/`가 `+`, `-`보다 먼저 처리된다. 원하는 계산 순서를 확실히 하려면 {{b4}}를 사용한다.',
      },
      {
        kind: 'table',
        head: ['표현식', '의미'],
        rows: [
          ['`급여 * 12`', '각 행의 월 급여로 연 급여를 계산'],
          ['`급여 + 수당`', '각 행의 급여와 수당을 더함'],
          ['`(급여 + 수당) * 12`', '덧셈을 먼저 한 뒤 12를 곱함'],
        ],
      },
      {
        kind: 'p',
        text: '산술식에 {{b3}}이 포함되면 결과도 NULL이다. 수당이 NULL인 행에서 `급여 + 수당`을 계산하면 급여가 있어도 결과는 NULL이 된다.',
      },
      {
        kind: 'p',
        text: "Oracle에서 `||`는 문자열을 이어 붙이는 연결 연산자다. `SELECT 'SQL' || 'D' FROM DUAL;`의 결과는 `SQLD`다.",
      },
      {
        kind: 'memory',
        text: 'NULL과 산술 연산 → 결과도 NULL · `||` → 문자열 연결 · 계산 순서가 중요하면 괄호 사용',
      },
      {
        kind: 'trap',
        text: "Oracle에서는 문자열 연결에 NULL이 포함되어도 다른 문자열은 남는다. `'SQL' || NULL`의 결과는 `SQL`이지만, `100 + NULL` 같은 산술 연산의 결과는 NULL이다.",
      },
    ],
  },
  {
    id: 's3',
    heading: '열 별칭',
    blanks: [
      { id: 'b5', answer: '별칭', accepts: ['별칭', 'alias', '알리아스'] },
      {
        id: 'b6',
        answer: '큰따옴표',
        accepts: ['큰따옴표', '큰 따옴표', 'double quote', 'double quotes'],
      },
    ],
    nodes: [
      {
        kind: 'p',
        text: '{{b5}}은 조회 결과의 열 제목을 이해하기 쉽게 바꾸는 이름이다. 원본 테이블의 열 이름이 바뀌는 것은 아니며, 해당 SELECT 결과에서만 사용된다.',
      },
      {
        kind: 'table',
        head: ['작성법', '예시'],
        rows: [
          ['열 뒤에 공백을 두고 작성', '`SELECT 급여 * 12 연봉 FROM 사원`'],
          ['`AS` 사용', '`SELECT 급여 * 12 AS 연봉 FROM 사원`'],
          ['공백·특수문자·대소문자를 그대로 표시', '`SELECT 사원명 AS "사원 이름" FROM 사원`'],
        ],
      },
      {
        kind: 'p',
        text: '별칭에 공백이나 특수문자가 있거나 표시할 대소문자를 그대로 유지하려면 {{b6}}로 묶는다. 작은따옴표는 문자열 값을 표현할 때 사용하므로 구분한다.',
      },
      {
        kind: 'trap',
        text: 'Oracle에서는 **열 별칭에는 `AS`를 사용할 수 있지만 테이블 별칭에는 `AS`를 사용하지 않는다.** `FROM 사원 E`처럼 작성한다.',
      },
    ],
  },
  {
    id: 's4',
    heading: 'DISTINCT와 ALL',
    blanks: [
      { id: 'b7', answer: 'DISTINCT', accepts: ['distinct', '디스팅트'] },
      { id: 'b8', answer: 'ALL', accepts: ['all', '올'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'SELECT는 기본적으로 중복된 결과도 모두 보여 준다. {{b7}}는 중복을 제거하고, {{b8}}은 중복을 포함해 모두 보여 준다. ALL은 기본값이므로 보통 생략한다.',
      },
      {
        kind: 'table',
        head: ['SQL', '결과 판단'],
        rows: [
          ['`SELECT 부서번호 FROM 사원`', '사원이 여러 명이면 같은 부서번호가 반복될 수 있음'],
          ['`SELECT DISTINCT 부서번호 FROM 사원`', '부서번호마다 한 행만 반환'],
          [
            '`SELECT DISTINCT 부서번호, 직급 FROM 사원`',
            '부서번호와 직급의 **조합**이 같은 행을 중복으로 판단',
          ],
        ],
      },
      {
        kind: 'memory',
        text: 'DISTINCT는 특정 열 하나가 아니라 SELECT 목록 전체 조합의 중복을 제거한다',
      },
      {
        kind: 'trap',
        text: '`DISTINCT` 뒤에 여러 열을 적으면 각 열을 따로 중복 제거하는 것이 아니다. **선택된 모든 열의 값이 같은 결과는 한 행만 남는다.**',
      },
    ],
  },
  {
    id: 's5',
    heading: 'SQL의 논리적 처리 순서',
    blanks: [
      { id: 'b9', answer: 'FROM', accepts: ['from'] },
      { id: 'b10', answer: 'ORDER BY', accepts: ['order by', 'orderby'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'SQL은 작성된 순서와 다른 논리적 순서로 처리된다. 먼저 {{b9}}에서 데이터를 가져오고 조건·그룹을 처리한 뒤 SELECT 결과를 만든다. 마지막에는 {{b10}}로 결과를 정렬한다.',
      },
      {
        kind: 'table',
        head: ['논리적 순서', '처리 내용'],
        rows: [
          ['1. FROM', '대상 테이블과 조인 결과를 준비'],
          ['2. WHERE', '행을 조건으로 걸러냄'],
          ['3. GROUP BY', '남은 행을 그룹으로 묶음'],
          ['4. HAVING', '그룹을 조건으로 걸러냄'],
          ['5. SELECT', '출력할 열·식과 별칭을 만듦'],
          ['6. ORDER BY', '완성된 결과를 정렬'],
        ],
      },
      {
        kind: 'p',
        text: 'SELECT에서 만든 별칭은 그보다 먼저 처리되는 WHERE에서는 아직 존재하지 않는다. 반면 ORDER BY는 SELECT 다음에 처리되므로 SELECT 별칭을 사용할 수 있다.',
      },
      {
        kind: 'memory',
        text: 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY',
      },
      {
        kind: 'trap',
        text: '작성 순서는 `SELECT → FROM → WHERE ...`지만 논리적 처리 순서는 다르다. 별칭 사용 가능 여부를 묻는 문제에서는 이 순서를 기준으로 판단한다.',
      },
    ],
  },
  {
    id: 's6',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          'SELECT에는 출력할 열·식, FROM에는 데이터를 읽을 테이블을 적는다',
          '산술식에 NULL이 포함되면 결과도 NULL이다',
          '열 별칭은 결과 제목이며, 공백이나 특수문자가 있으면 큰따옴표로 묶는다',
          'Oracle에서 열 별칭에는 AS를 쓸 수 있지만 테이블 별칭에는 AS를 쓰지 않는다',
          'DISTINCT는 SELECT 목록 전체 값의 조합을 기준으로 중복을 제거한다',
          '논리적 처리 순서는 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY다',
        ],
      },
    ],
  },
];
