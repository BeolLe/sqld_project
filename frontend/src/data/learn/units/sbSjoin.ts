import type { LearnBlock } from '../types';

/** 2과목 · SQL 기본 · 표준 조인 */
export const sbSjoinBlocks: LearnBlock[] = [
  {
    id: 'sj1',
    heading: '표준 조인이란 무엇인가',
    blanks: [
      {
        id: 'b1',
        answer: 'ANSI',
        accepts: ['ansi', 'ansi/iso', 'iso', 'ansi sql', 'ansi/iso sql', '안시'],
      },
      { id: 'b2', answer: 'FROM', accepts: ['from', '프롬'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '표준 조인은 {{b1}}/ISO SQL 표준에서 정한 조인 문법이다.\n' +
          '조인 조건을 WHERE가 아니라 {{b2}} 절에 JOIN과 함께 쓴다.',
      },
      {
        kind: 'table',
        head: ['구분', 'Oracle 방식', '표준 조인'],
        rows: [
          ['조인 조건 위치', 'WHERE 절', 'FROM 절 (`ON`, `USING` 등)'],
          ['조인 조건과 검색 조건', 'WHERE 절에 섞여 있음', '조인은 FROM, 검색은 WHERE로 분리'],
          [
            '조인 예',
            '`FROM 사원 E, 부서 D`\n`WHERE E.부서번호 = D.부서번호`',
            '`FROM 사원 E JOIN 부서 D`\n`ON E.부서번호 = D.부서번호`',
          ],
        ],
      },
      {
        kind: 'p',
        text:
          '표준 조인의 종류는 INNER, NATURAL, CROSS, OUTER JOIN이다.\n' +
          '조인 조건은 `USING`이나 `ON`으로 지정한다.',
      },
      {
        kind: 'memory',
        text: '표준 조인 = 조인 조건은 FROM(ON·USING) · 검색 조건은 WHERE',
      },
      {
        kind: 'p',
        text: '※ EQUI·Non EQUI JOIN의 개념과 테이블 별칭 규칙은 **조인** 단원에서 다룬다.',
      },
    ],
  },
  {
    id: 'sj2',
    heading: 'INNER JOIN과 ON 조건절',
    blanks: [
      { id: 'b3', answer: 'INNER', accepts: ['inner', 'inner join', '내부', '이너'] },
      { id: 'b4', answer: 'ON', accepts: ['on', '온'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          'INNER JOIN은 조인 조건을 만족하는 행만 반환한다.\n' +
          '`JOIN` 앞에 종류를 쓰지 않으면 {{b3}} JOIN으로 처리된다.',
      },
      {
        kind: 'p',
        text:
          '{{b4}} 조건절에는 조인 조건을 식으로 직접 쓴다.\n' +
          '칼럼 이름이 달라도 되고 `=` 외의 비교도 쓸 수 있다.\n' +
          '`SELECT E.사원명, D.부서명`\n' +
          '`FROM 사원 E INNER JOIN 부서 D`\n' +
          '`ON E.부서번호 = D.부서번호`\n' +
          '`WHERE E.급여 >= 3000`',
      },
      {
        kind: 'p',
        text:
          'ON에는 테이블을 잇는 조건을, WHERE에는 거르는 조건을 둔다.\n' +
          'ON을 쓸 때 이름이 같은 칼럼은 별칭이나 테이블명으로 구분한다.',
      },
      {
        kind: 'trap',
        text:
          'INNER JOIN은 `ON`이나 `USING` 조건절 **없이는 쓸 수 없다.**\n' +
          '조건 없이 모든 조합을 만들려면 CROSS JOIN을 쓴다.',
      },
    ],
  },
  {
    id: 'sj3',
    heading: 'NATURAL JOIN과 USING 조건절',
    blanks: [
      {
        id: 'b5',
        answer: 'NATURAL JOIN',
        accepts: ['natural join', 'natural', '자연 조인', '자연조인', '내추럴 조인'],
      },
      { id: 'b6', answer: 'USING', accepts: ['using', '유징'] },
      {
        id: 'b7',
        answer: '접두어',
        accepts: ['접두어', '접두사', '별칭', '테이블명', 'alias', '소유자명'],
      },
    ],
    nodes: [
      { kind: 'subheading', text: '3-1. NATURAL JOIN' },
      {
        kind: 'p',
        text:
          '{{b5}}은 **이름이 같은 모든 칼럼**으로 자동 EQUI JOIN한다.\n' +
          '조인 조건을 쓰지 않으며, ON이나 USING과 함께 쓸 수 없다.\n' +
          '`SELECT 부서번호, 사원명, 부서명`\n' +
          '`FROM 사원 NATURAL JOIN 부서`',
      },
      {
        kind: 'p',
        text:
          '이름이 같은 칼럼은 데이터 유형도 같아야 한다.\n' +
          '`SELECT *`로 조회하면 공통 칼럼은 한 번만, 맨 앞에 출력된다.',
      },
      { kind: 'subheading', text: '3-2. USING 조건절' },
      {
        kind: 'p',
        text:
          '{{b6}} 조건절은 같은 이름의 칼럼 중 **지정한 칼럼으로만** 조인한다.\n' +
          '칼럼 이름은 괄호 안에 쓴다.\n' +
          '`SELECT 부서번호, E.사원명, D.부서명`\n' +
          '`FROM 사원 E JOIN 부서 D`\n' +
          '`USING (부서번호)`',
      },
      { kind: 'subheading', text: '3-3. 세 방식 비교' },
      {
        kind: 'table',
        head: ['항목', 'NATURAL JOIN', 'USING', 'ON'],
        rows: [
          ['조인 칼럼 지정', '이름이 같은 칼럼 전부 자동', '괄호 안에 직접 지정', '조건식을 직접 작성'],
          ['칼럼 이름이 달라도 되는가', '안 됨', '안 됨', '됨'],
          ['`=` 외 비교 조건', '불가', '불가', '가능'],
          ['조인 칼럼에 별칭 붙이기', '불가', '불가', '가능'],
        ],
      },
      {
        kind: 'trap',
        text:
          'NATURAL JOIN·USING의 **조인 칼럼**에는 {{b7}}를 붙일 수 없다.\n' +
          '테이블명이나 별칭을 붙여 `SELECT D.부서번호`처럼 쓰면 오류가 난다.\n' +
          '조인 칼럼이 아닌 칼럼에는 붙여도 된다.',
      },
    ],
  },
  {
    id: 'sj4',
    heading: 'CROSS JOIN',
    blanks: [
      {
        id: 'b8',
        answer: 'CROSS JOIN',
        accepts: ['cross join', 'cross', '크로스 조인', '크로스조인', '교차 조인'],
      },
      { id: 'b9', answer: '56', accepts: ['56', '56행', '56개'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '{{b8}}은 조인 조건 없이 두 테이블의 **모든 행을 조합**한다.\n' +
          '결과 행 수는 두 테이블 행 수의 곱이며, 이를 카티션 곱이라 한다.',
      },
      {
        kind: 'table',
        head: ['표준 조인', 'Oracle 방식'],
        rows: [['`FROM 사원 CROSS JOIN 부서`', '`FROM 사원, 부서` (WHERE 조건 없음)']],
      },
      {
        kind: 'p',
        text: '사원 14행과 부서 4행을 CROSS JOIN하면 결과는 {{b9}}행이다.',
      },
      {
        kind: 'trap',
        text:
          'CROSS JOIN에는 ON이나 USING을 쓸 수 없다.\n' +
          '대신 WHERE 절로 조건을 걸어 결과를 줄일 수 있다.',
      },
    ],
  },
  {
    id: 'sj5',
    heading: 'OUTER JOIN',
    blanks: [
      { id: 'b10', answer: 'LEFT', accepts: ['left', 'left outer', 'left outer join', '왼쪽', '레프트'] },
      { id: 'b11', answer: '4', accepts: ['4', '4행', '네', '4개'] },
      {
        id: 'b12',
        answer: '없는',
        accepts: ['없는', '부족한', '모자란', '데이터가 없는', 'null이 채워질'],
      },
      { id: 'b13', answer: 'FULL', accepts: ['full', 'full outer', 'full outer join', '풀'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          'OUTER JOIN은 조건을 만족하지 않아도 기준 테이블의 행을 남긴다.\n' +
          '상대 쪽 칼럼은 NULL로 채워지고, `OUTER`는 생략할 수 있다.',
      },
      { kind: 'subheading', text: '5-1. LEFT · RIGHT · FULL' },
      {
        kind: 'p',
        text:
          '사원과 부서가 아래와 같다고 하자.\n' +
          '박민수는 부서가 없고, 인사팀에는 사원이 없다.',
      },
      {
        kind: 'table',
        head: ['사원명', '사원.부서번호'],
        rows: [
          ['김철수', '10'],
          ['이영희', '20'],
          ['박민수', 'NULL'],
        ],
      },
      {
        kind: 'table',
        head: ['부서.부서번호', '부서명'],
        rows: [
          ['10', '개발팀'],
          ['20', '영업팀'],
          ['40', '인사팀'],
        ],
      },
      {
        kind: 'p',
        text:
          '아래 조건에서 조인 종류만 바꾸면 결과가 이렇게 달라진다.\n' +
          '`FROM 사원 [조인 종류] 부서`\n' +
          '`ON 사원.부서번호 = 부서.부서번호`',
      },
      {
        kind: 'table',
        head: ['조인 종류', '결과 행 수', 'INNER JOIN에 더해 남는 행'],
        rows: [
          ['INNER', '2', '없음'],
          ['{{b10}} OUTER', '3', '박민수 (부서명 NULL)'],
          ['RIGHT OUTER', '3', '인사팀 (사원명 NULL)'],
          ['FULL OUTER', '{{b11}}', '박민수와 인사팀 모두'],
        ],
      },
      {
        kind: 'memory',
        text: 'LEFT = 왼쪽 테이블 보존 · RIGHT = 오른쪽 보존 · FULL = 양쪽 보존',
      },
      { kind: 'subheading', text: '5-2. Oracle의 (+) 표기' },
      {
        kind: 'p',
        text:
          'Oracle은 조인 조건에 `(+)`를 붙여 OUTER JOIN을 표현한다.\n' +
          '`(+)`는 데이터가 {{b12}} 쪽, 즉 NULL이 채워질 쪽에 붙인다.',
      },
      {
        kind: 'table',
        head: ['표준 조인', 'Oracle (+) 표기'],
        rows: [
          ['`사원 LEFT OUTER JOIN 부서`', '`사원.부서번호 = 부서.부서번호(+)`'],
          ['`사원 RIGHT OUTER JOIN 부서`', '`사원.부서번호(+) = 부서.부서번호`'],
          ['`사원 FULL OUTER JOIN 부서`', '표현할 수 없음'],
        ],
      },
      {
        kind: 'trap',
        text:
          '`(+)`는 **보존할 테이블의 반대편**에 붙는다.\n' +
          '사원을 모두 남기려면 부서 쪽에 붙인다.\n' +
          '양쪽에 동시에 붙일 수 없어 {{b13}} OUTER JOIN은 `(+)`로 표현하지 못한다.',
      },
    ],
  },
  {
    id: 'sj6',
    heading: 'OUTER JOIN의 ON과 WHERE',
    blanks: [{ id: 'b14', answer: 'WHERE', accepts: ['where', '웨어'] }],
    nodes: [
      {
        kind: 'p',
        text:
          'OUTER JOIN은 조건을 어디에 두느냐에 따라 결과가 달라진다.\n' +
          'ON 조건은 **조인하는 동안**, WHERE 조건은 **조인이 끝난 뒤** 적용된다.',
      },
      {
        kind: 'p',
        text: '앞의 데이터에서 사원은 모두 남기고 개발팀만 연결해 보자.',
      },
      {
        kind: 'table',
        head: ['조건 위치', 'SQL', '결과'],
        rows: [
          [
            'ON',
            "`사원 E LEFT JOIN 부서 D`\n`ON E.부서번호 = D.부서번호`\n`AND D.부서명 = '개발팀'`",
            '3행\n김철수만 부서명이 채워지고\n이영희·박민수는 NULL',
          ],
          [
            'WHERE',
            "`사원 E LEFT JOIN 부서 D`\n`ON E.부서번호 = D.부서번호`\n`WHERE D.부서명 = '개발팀'`",
            '1행\n김철수만 남음',
          ],
        ],
      },
      {
        kind: 'trap',
        text:
          'NULL이 채워지는 쪽 테이블의 조건을 {{b14}} 절에 걸면 NULL 행이 사라진다.\n' +
          '결과적으로 **INNER JOIN과 같아진다.**',
      },
    ],
  },
  {
    id: 'sj7',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          '표준 조인은 조인 조건을 FROM, 검색 조건을 WHERE에 쓴다',
          '`JOIN`만 쓰면 INNER이며, ON이나 USING이 반드시 필요하다',
          'NATURAL은 같은 이름 칼럼 전부, USING은 지정 칼럼으로 조인한다',
          'NATURAL·USING의 조인 칼럼에는 별칭을 붙일 수 없다',
          'ON은 칼럼 이름이 달라도 되고 `=` 외 비교도 쓸 수 있다',
          'CROSS JOIN 결과 행 수는 두 테이블 행 수의 곱이다',
          'LEFT는 왼쪽, RIGHT는 오른쪽, FULL은 양쪽 행을 보존한다',
          '`(+)`는 NULL이 채워질 쪽에 붙이며 FULL은 표현할 수 없다',
          'NULL이 채워질 쪽 조건을 WHERE에 걸면 INNER JOIN이 된다',
        ],
      },
    ],
  },
];
