import type { LearnBlock } from '../types';

/** 2과목 · SQL 기본 · 조인 */
export const sbJoinBlocks: LearnBlock[] = [
  {
    id: 'jo1',
    heading: '조인이란 무엇인가',
    blanks: [
      { id: 'b1', answer: '조인', accepts: ['조인', 'join'] },
      { id: 'b2', answer: '두', accepts: ['두', '2', '두 개', '2개', '둘'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '{{b1}}은 두 개 이상의 테이블을 연결해 데이터를 함께 출력하는 것이다.\n' +
          '일반적으로 한 테이블의 PK와 다른 테이블의 FK 값을 연결한다.',
      },
      {
        kind: 'p',
        text:
          'FROM 절에 테이블이 여럿이어도 조인은 {{b2}} 집합씩 일어난다.\n' +
          '세 테이블이면 두 개를 먼저 조인하고, 그 결과를 나머지와 조인한다.',
      },
      {
        kind: 'trap',
        text:
          'PK·FK 관계가 **반드시 있어야** 조인할 수 있는 것은 아니다.\n' +
          '값이 논리적으로 연관되면 관계가 선언되지 않은 칼럼끼리도 조인할 수 있다.',
      },
      {
        kind: 'p',
        text: '※ 모델의 관계가 조인 조건이 되는 과정, 관계 차수에 따른 결과 행 수, 조인 조건을 빠뜨렸을 때 생기는 카티션 곱은 **관계와 조인의 이해** 단원에서 다룬다.',
      },
    ],
  },
  {
    id: 'jo2',
    heading: 'EQUI JOIN',
    blanks: [
      {
        id: 'b3',
        answer: 'EQUI JOIN',
        accepts: ['equi join', 'equi', '등가 조인', '등가조인', 'equijoin'],
      },
      { id: 'b4', answer: '=', accepts: ['=', '같다', '등호', '이퀄'] },
      { id: 'b5', answer: 'AND', accepts: ['and', '앤드'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '{{b3}}(등가 조인)은 칼럼 값이 정확히 같은 행끼리 연결한다.\n' +
          '조건에는 {{b4}} 연산자를 쓰며, 대부분의 PK·FK 조인이 여기에 해당한다.',
      },
      {
        kind: 'p',
        text:
          'Oracle 방식에서는 FROM 절에 테이블을 나열하고 WHERE 절에 조인 조건을 쓴다.\n' +
          '`SELECT 사원.사원명, 부서.부서명`\n' +
          '`FROM 사원, 부서`\n' +
          '`WHERE 사원.부서번호 = 부서.부서번호`',
      },
      {
        kind: 'table',
        head: ['사원명', '사원.부서번호', '일치하는 부서.부서명', '결과'],
        rows: [
          ['김철수', '10', '개발팀', '포함'],
          ['이영희', '20', '영업팀', '포함'],
          ['박민수', '10', '개발팀', '포함'],
          ['최지원', '30', '(없음)', '제외'],
        ],
      },
      {
        kind: 'p',
        text:
          '조인 조건과 일반 검색 조건은 {{b5}}로 이어서 쓴다.\n' +
          '`WHERE 사원.부서번호 = 부서.부서번호`\n' +
          '`AND 사원.급여 >= 3000`',
      },
      {
        kind: 'trap',
        text:
          'EQUI JOIN은 **양쪽에 모두 일치하는 값이 있는 행**만 남긴다.\n' +
          '최지원처럼 상대가 없는 행까지 남기려면 OUTER JOIN을 쓴다.',
      },
      {
        kind: 'p',
        text: '※ OUTER JOIN 문법은 **표준 조인** 단원에서 다룬다.',
      },
    ],
  },
  {
    id: 'jo3',
    heading: '테이블 별칭과 칼럼 이름 충돌',
    blanks: [
      {
        id: 'b6',
        answer: '테이블명',
        accepts: ['테이블명', '테이블 이름', '테이블 명', '테이블이름'],
      },
      { id: 'b7', answer: '별칭', accepts: ['별칭', 'alias', '앨리어스', '에일리어스'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '칼럼 이름이 두 테이블에 겹치면 {{b6}}이나 별칭으로 구분해야 한다.\n' +
          '붙이지 않으면 칼럼이 모호하다는 오류가 난다.',
      },
      {
        kind: 'p',
        text: 'FROM 절에서 테이블에 짧은 {{b7}}을 지정하면 SQL이 간결해진다.\n`FROM 사원 E, 부서 D`',
      },
      {
        kind: 'table',
        head: ['결과', 'SQL', '이유'],
        rows: [
          ['오류', '`SELECT 부서번호 FROM 사원, 부서 WHERE ...`', '부서번호가 두 테이블에 모두 있어 모호하다'],
          ['정상', '`SELECT E.부서번호 FROM 사원 E, 부서 D WHERE ...`', '별칭으로 테이블을 밝혔다'],
          ['오류', '`SELECT 사원.부서번호 FROM 사원 E, 부서 D WHERE ...`', '별칭을 지정한 뒤 테이블명을 섞어 썼다'],
          ['정상', '`SELECT 사원명 FROM 사원 E, 부서 D WHERE ...`', '사원명은 한쪽에만 있어 생략할 수 있다'],
        ],
      },
      {
        kind: 'trap',
        text:
          '별칭을 지정했다면 SELECT·WHERE 절에서도 **반드시 별칭을** 써야 한다.\n' +
          '원래 테이블명을 섞어 쓰면 Oracle에서 오류가 발생한다.',
      },
    ],
  },
  {
    id: 'jo4',
    heading: 'Non EQUI JOIN',
    blanks: [
      {
        id: 'b8',
        answer: 'Non EQUI JOIN',
        accepts: ['non equi join', 'non-equi join', 'nonequi join', 'non equi', '비등가 조인', '비등가조인'],
      },
      { id: 'b9', answer: 'BETWEEN', accepts: ['between', '비트윈'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '{{b8}}(비등가 조인)은 `=`가 아닌 연산자로 두 테이블을 연결한다.\n' +
          '{{b9}}, `>`, `<`처럼 값이 **범위에 드는지**를 조건으로 쓴다.',
      },
      {
        kind: 'p',
        text: '급여등급 테이블로 사원의 급여에 등급을 붙여 보자.',
      },
      {
        kind: 'table',
        head: ['등급', '최저급여', '최고급여'],
        rows: [
          ['1', '0', '2999'],
          ['2', '3000', '4999'],
          ['3', '5000', '9999'],
        ],
      },
      {
        kind: 'p',
        text:
          '`SELECT E.사원명, E.급여, G.등급`\n' +
          '`FROM 사원 E, 급여등급 G`\n' +
          '`WHERE E.급여 BETWEEN G.최저급여 AND G.최고급여`',
      },
      {
        kind: 'table',
        head: ['사원명', '급여', '등급'],
        rows: [
          ['김철수', '3500', '2'],
          ['이영희', '2800', '1'],
          ['박민수', '5200', '3'],
        ],
      },
      {
        kind: 'memory',
        text: 'EQUI JOIN = 값이 같음(=) · Non EQUI JOIN = 범위·대소 비교(BETWEEN, >, <)',
      },
      {
        kind: 'trap',
        text:
          '등급 구간이 **서로 겹치면** 한 사원이 여러 등급과 연결되어 행이 늘어난다.\n' +
          '구간 사이가 **비어 있으면** 그 급여의 사원은 결과에서 빠진다.',
      },
    ],
  },
  {
    id: 'jo5',
    heading: '3개 이상 테이블 조인',
    blanks: [
      { id: 'b10', answer: 'N-1', accepts: ['n-1', 'n - 1'] },
      { id: 'b11', answer: '2', accepts: ['2', '두', '두 개', '2개', '둘'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '테이블이 N개면 조인 조건이 최소 {{b10}}개 필요하다.\n' +
          '세 테이블을 조인하면 조건은 최소 {{b11}}개다.',
      },
      {
        kind: 'p',
        text:
          '사원은 부서번호로 부서와, 부서는 지역코드로 지역과 연결된다.\n' +
          '`SELECT E.사원명, D.부서명, L.지역명`\n' +
          '`FROM 사원 E, 부서 D, 지역 L`\n' +
          '`WHERE E.부서번호 = D.부서번호`\n' +
          '`AND D.지역코드 = L.지역코드`',
      },
      {
        kind: 'table',
        head: ['조인 조건', '연결되는 테이블'],
        rows: [
          ['`E.부서번호 = D.부서번호`', '사원 ↔ 부서'],
          ['`D.지역코드 = L.지역코드`', '부서 ↔ 지역'],
        ],
      },
      { kind: 'memory', text: '테이블 N개 → 조인 조건 최소 N-1개' },
      {
        kind: 'trap',
        text:
          'N-1개는 **최소** 개수다. 조인 키가 복합키라면 조건이 더 필요하다.\n' +
          '조건이 모자라면 연결되지 않은 테이블이 모든 행과 조합되어 결과가 부푼다.',
      },
    ],
  },
  {
    id: 'jo6',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          '조인은 PK·FK 관계가 없어도 값이 연관되면 할 수 있다',
          '테이블이 여럿이어도 조인은 두 집합씩 일어난다',
          'EQUI JOIN은 같은 값, Non EQUI JOIN은 범위로 연결한다',
          'EQUI JOIN은 양쪽에 일치하는 값이 있는 행만 남긴다',
          '같은 이름의 칼럼은 테이블명이나 별칭으로 구분한다',
          '별칭을 지정하면 테이블명 대신 별칭만 써야 한다',
          'N개 테이블 조인에는 조건이 최소 N-1개 필요하다',
        ],
      },
    ],
  },
];
