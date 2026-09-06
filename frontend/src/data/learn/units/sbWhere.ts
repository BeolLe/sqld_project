import type { LearnBlock } from '../types';

/** 2과목 · SQL 기본 · WHERE 절 */
export const sbWhereBlocks: LearnBlock[] = [
  {
    id: 'w1',
    heading: 'WHERE 절의 역할',
    blanks: [
      { id: 'b1', answer: 'WHERE', accepts: ['where', '웨어'] },
      { id: 'b2', answer: 'TRUE', accepts: ['true', '참'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '{{b1}} 절은 테이블의 각 행을 조건으로 검사하여 필요한 행만 남긴다. 조건의 결과가 {{b2}}인 행만 조회되고, FALSE이거나 알 수 없는 결과인 UNKNOWN인 행은 제외된다.',
      },
      {
        kind: 'table',
        head: ['SQL', '조회되는 행'],
        rows: [
          ['`WHERE 부서번호 = 10`', '부서번호가 10인 행'],
          ['`WHERE 급여 >= 3000`', '급여가 3000 이상인 행'],
          ["`WHERE 직급 <> '사원'`", '직급이 사원이 아닌 행'],
        ],
      },
      {
        kind: 'p',
        text: 'WHERE는 SELECT보다 먼저 처리된다. 따라서 SELECT에서 만든 열 별칭은 같은 쿼리의 WHERE에서 사용할 수 없다.',
      },
      {
        kind: 'memory',
        text: 'WHERE = 행을 거르는 조건 · 조건이 TRUE인 행만 통과',
      },
      {
        kind: 'trap',
        text: '`SELECT 급여 * 12 AS 연봉 FROM 사원 WHERE 연봉 >= 5000`은 Oracle에서 오류가 발생한다. WHERE가 처리될 때는 SELECT 별칭인 연봉이 아직 만들어지지 않았기 때문이다.',
      },
    ],
  },
  {
    id: 'w2',
    heading: '비교 연산자와 SQL 연산자',
    blanks: [
      { id: 'b3', answer: 'BETWEEN', accepts: ['between', '비트윈'] },
      { id: 'b4', answer: 'IN', accepts: ['in', '인'] },
      { id: 'b5', answer: 'LIKE', accepts: ['like', '라이크'] },
    ],
    nodes: [
      {
        kind: 'table',
        head: ['연산자', '의미', '예시'],
        rows: [
          ['`=`, `<>`, `!=`', '같음, 같지 않음', '`WHERE 부서번호 <> 10`'],
          ['`>`, `>=`, `<`, `<=`', '대소 비교', '`WHERE 급여 >= 3000`'],
          ['{{b3}} `A AND B`', 'A 이상 B 이하', '`WHERE 급여 BETWEEN 1000 AND 3000`'],
          ['{{b4}} `(A, B, ...)`', '목록 중 하나와 같음', '`WHERE 부서번호 IN (10, 20)`'],
          ['{{b5}}', '문자 패턴과 일치', "`WHERE 사원명 LIKE '김%'`"],
          ['`IS NULL`', '값이 NULL인지 확인', '`WHERE 수당 IS NULL`'],
        ],
      },
      {
        kind: 'p',
        text: '`BETWEEN 1000 AND 3000`은 1000과 3000을 모두 포함한다. `부서번호 IN (10, 20)`은 `부서번호 = 10 OR 부서번호 = 20`과 같은 의미다.',
      },
      {
        kind: 'memory',
        text: 'BETWEEN = 양쪽 경계 포함 · IN = 목록 중 하나 · LIKE = 문자 패턴',
      },
      {
        kind: 'trap',
        text: '`BETWEEN A AND B`는 A 이상 B 이하다. 경계값을 제외하는 조건이 아니며, 작은 값을 앞에 두어야 정상적인 범위를 판단하기 쉽다.',
      },
    ],
  },
  {
    id: 'w3',
    heading: 'LIKE 패턴',
    blanks: [
      { id: 'b6', answer: '%', accepts: ['%', '퍼센트'] },
      { id: 'b7', answer: '_', accepts: ['_', '언더바', '언더스코어'] },
      { id: 'b8', answer: 'ESCAPE', accepts: ['escape', '이스케이프'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'LIKE는 문자열의 모양을 조건으로 검사한다. {{b6}}는 0개 이상의 문자를, {{b7}}는 정확히 한 문자를 나타낸다.',
      },
      {
        kind: 'table',
        head: ['패턴', '찾는 값'],
        rows: [
          ["`'A%'`", 'A로 시작하는 문자열'],
          ["`'%A'`", 'A로 끝나는 문자열'],
          ["`'%A%'`", 'A가 포함된 문자열'],
          ["`'_A%'`", '두 번째 글자가 A인 문자열'],
        ],
      },
      {
        kind: 'p',
        text: "데이터에 들어 있는 `%`나 `_` 자체를 찾으려면 {{b8}}로 일반 문자임을 표시한다. 예를 들어 `LIKE 'A\\_%' ESCAPE '\\'`는 `A_`로 시작하는 문자열을 찾는다.",
      },
      {
        kind: 'trap',
        text: '`_`는 글자가 없어도 되는 기호가 아니라 **반드시 한 글자**를 뜻한다. `\'_A%\'`는 첫 글자가 무엇이든 존재하고 두 번째 글자가 A인 값이다.',
      },
    ],
  },
  {
    id: 'w4',
    heading: 'NULL 조건과 UNKNOWN',
    blanks: [
      { id: 'b9', answer: 'IS NULL', accepts: ['is null', 'isnull'] },
      { id: 'b10', answer: 'UNKNOWN', accepts: ['unknown', '알 수 없음', '모름'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'NULL은 값이 없거나 알 수 없는 상태이므로 `= NULL`이나 `<> NULL`로 비교하지 않는다. NULL 여부는 {{b9}} 또는 `IS NOT NULL`로 확인한다.',
      },
      {
        kind: 'table',
        head: ['조건', '판단 결과'],
        rows: [
          ['`수당 = NULL`', '{{b10}}이므로 WHERE를 통과하지 못함'],
          ['`수당 <> NULL`', '{{b10}}이므로 WHERE를 통과하지 못함'],
          ['`수당 IS NULL`', '수당이 NULL이면 TRUE'],
          ['`수당 IS NOT NULL`', '수당에 값이 있으면 TRUE'],
        ],
      },
      {
        kind: 'p',
        text: 'NULL과 일반 값을 비교한 결과는 참이나 거짓으로 확정할 수 없어 UNKNOWN이 된다. WHERE는 TRUE만 남기므로 UNKNOWN도 결과에서 제외된다.',
      },
      {
        kind: 'trap',
        text: '`NOT IN`의 목록이나 서브쿼리 결과에 NULL이 포함되면, 일치하지 않는 행도 UNKNOWN이 되어 조회되지 않을 수 있다. NULL이 섞일 가능성이 있는지 반드시 확인한다.',
      },
    ],
  },
  {
    id: 'w5',
    heading: 'AND, OR, NOT과 처리 순서',
    blanks: [
      { id: 'b11', answer: 'AND', accepts: ['and', '앤드'] },
      { id: 'b12', answer: 'OR', accepts: ['or', '오어'] },
      { id: 'b13', answer: '괄호', accepts: ['괄호', 'parentheses'] },
    ],
    nodes: [
      {
        kind: 'table',
        head: ['논리 연산자', 'TRUE가 되는 경우'],
        rows: [
          ['{{b11}}', '양쪽 조건이 모두 TRUE'],
          ['{{b12}}', '한쪽 조건이라도 TRUE'],
          ['`NOT`', '조건의 결과를 반대로 바꿈'],
        ],
      },
      {
        kind: 'p',
        text: '논리 연산자의 우선순위는 `NOT → AND → OR`다. 따라서 `부서번호 = 10 OR 부서번호 = 20 AND 급여 > 3000`은 부서 10 전체 또는 부서 20이면서 급여가 3000을 넘는 행을 찾는다.',
      },
      {
        kind: 'p',
        text: '조건의 의도를 확실히 표현하려면 {{b13}}를 사용한다. 부서 10 또는 20인 사원 중 급여가 3000을 넘는 행을 찾으려면 `(부서번호 = 10 OR 부서번호 = 20) AND 급여 > 3000`으로 작성한다.',
      },
      {
        kind: 'memory',
        text: '논리 연산 순서 = NOT → AND → OR · 의도한 묶음은 괄호로 표시',
      },
    ],
  },
  {
    id: 'w6',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          'WHERE는 각 행을 검사하며 조건이 TRUE인 행만 남긴다',
          'BETWEEN은 양쪽 경계를 포함하고, IN은 목록 중 하나와 같은지 검사한다',
          'LIKE에서 `%`는 0개 이상, `_`는 정확히 한 글자를 뜻한다',
          'NULL은 `= NULL`이 아니라 `IS NULL`로 확인한다',
          '논리 연산자의 우선순위는 NOT → AND → OR다',
          'SELECT에서 만든 별칭은 같은 쿼리의 WHERE에서 사용할 수 없다',
        ],
      },
    ],
  },
];
