import type { LearnBlock } from '../types';

/** 1과목 · 데이터 모델과 SQL · Null 속성의 이해 */
export const dmNullBlocks: LearnBlock[] = [
  {
    id: 'u1',
    heading: 'NULL의 의미',
    blanks: [
      { id: 'b1', answer: 'NULL', accepts: ['null', '널'] },
      { id: 'b2', answer: '0', accepts: ['0', '영', '숫자 0'] },
      { id: 'b3', answer: '빈 문자열', accepts: ['빈 문자열', '빈문자열', 'empty string'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '{{b1}}은 값이 없거나 현재 알 수 없음을 나타내는 특별한 상태다. 아직 배송되지 않아 배송일이 없거나, 사용자가 전화번호를 입력하지 않은 상황처럼 **현재 저장할 값이 없는 경우**에 사용된다.',
      },
      {
        kind: 'p',
        text: '다만 NULL이 `아직 정해지지 않음`, `알 수 없음`, `업무상 해당 없음` 중 무엇을 뜻하는지는 속성마다 다르다. 따라서 모델을 만들 때 그 의미를 정해야 한다.',
      },
      {
        kind: 'table',
        head: ['표현', '의미'],
        rows: [
          ['NULL', '값이 없거나 알 수 없는 상태'],
          ['{{b2}}', '숫자 값이 실제로 0임'],
          ['{{b3}}', '문자 값의 길이가 0인 문자열 · Oracle에서는 문자형 빈 문자열을 NULL로 처리'],
        ],
      },
      {
        kind: 'memory',
        text: 'NULL은 0이 아니다 · Oracle에서는 문자형 빈 문자열을 NULL로 처리한다',
      },
      {
        kind: 'trap',
        text: 'NULL을 `미정`, `해당 없음`, `모름` 중 하나로 고정해 외우면 안 된다. 정확한 의미는 **그 속성의 업무 정의**에 따라 달라진다. Oracle에서는 문자형 빈 문자열을 NULL로 처리한다.',
      },
    ],
  },
  {
    id: 'u2',
    heading: '필수 속성과 선택 속성',
    blanks: [
      { id: 'b4', answer: 'NOT NULL', accepts: ['not null', 'notnull', '널 불가', '필수'] },
      { id: 'b5', answer: '기본키', accepts: ['기본키', '기본 키', 'pk', 'primary key'] },
      { id: 'b6', answer: '외래키', accepts: ['외래키', '외래 키', 'fk', 'foreign key'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '모델에서 반드시 값이 있어야 하는 속성은 필수 속성, 업무 상황에 따라 값이 없어도 되는 속성은 선택 속성이다. 물리 모델에서는 필수 속성을 주로 {{b4}} 제약조건으로 구현해 NULL 저장을 막는다.',
      },
      {
        kind: 'table',
        head: ['속성', 'NULL 허용', '판단 기준'],
        rows: [
          ['{{b5}}', '허용하지 않음', '각 행을 반드시 식별해야 한다'],
          ['일반 필수 속성', '허용하지 않음', '업무상 반드시 입력되어야 한다'],
          ['일반 선택 속성', '허용 가능', '업무상 값이 아직 없거나 해당되지 않을 수 있다'],
          ['{{b6}}', '관계가 선택이면 허용 가능', '관계의 필수 여부와 제약조건을 함께 본다'],
        ],
      },
      {
        kind: 'trap',
        text: '외래키라고 해서 무조건 NULL이 가능한 것은 아니다. 부모와의 관계가 필수라면 외래키에도 `NOT NULL`을 적용할 수 있다.',
      },
    ],
  },
  {
    id: 'u3',
    heading: 'NULL의 비교와 연산',
    blanks: [
      { id: 'b7', answer: 'UNKNOWN', accepts: ['unknown', '알 수 없음', '미정'] },
      { id: 'b8', answer: 'IS NULL', accepts: ['is null', 'isnull'] },
      { id: 'b9', answer: 'COUNT(*)', accepts: ['count(*)', 'count *'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'SQL은 TRUE·FALSE와 함께 {{b7}}을 사용하는 3값 논리를 따른다. 예를 들어 점수를 모르는 학생의 점수가 60점보다 큰지는 참인지 거짓인지 정할 수 없다. 따라서 `점수 > 60`의 결과는 UNKNOWN이 된다.',
      },
      {
        kind: 'table',
        head: ['식 또는 함수', '결과 원칙'],
        rows: [
          ['`NULL = NULL`', 'TRUE가 아니라 UNKNOWN'],
          ['`NULL <> 10`', 'TRUE가 아니라 UNKNOWN'],
          ['`10 + NULL`', 'NULL'],
          ['{{b8}}', 'NULL 여부를 검사하는 올바른 조건'],
          ['{{b9}}', 'NULL 여부와 관계없이 행 수를 센다'],
          ['`COUNT(컬럼)`', '해당 컬럼의 NULL을 제외하고 센다'],
        ],
      },
      {
        kind: 'p',
        text: '`SUM`, `AVG`, `MIN`, `MAX` 같은 집계 함수는 일반적으로 NULL을 제외하고 계산한다. WHERE 절은 조건 결과가 TRUE인 행만 남기므로, NULL 때문에 결과가 UNKNOWN이 된 행은 조회 결과에서 빠진다.',
      },
      {
        kind: 'memory',
        text: 'NULL 비교는 IS NULL · COUNT(*)는 행 수 · COUNT(컬럼)은 NULL 제외',
      },
      {
        kind: 'trap',
        text: '`NULL = NULL`과 `NULL <> NULL`은 모두 TRUE가 아니다. NULL을 찾을 때는 `= NULL`이 아니라 **`IS NULL`**을 사용한다.',
      },
    ],
  },
  {
    id: 'u4',
    heading: 'NULL을 고려한 모델링',
    blanks: [
      { id: 'b10', answer: '기본값', accepts: ['기본값', 'default', '디폴트'] },
      {
        id: 'b11',
        answer: 'OUTER JOIN',
        accepts: ['outer join', 'outer', '외부 조인', '외부조인'],
      },
    ],
    nodes: [
      {
        kind: 'list',
        items: [
          '값이 반드시 있어야 하는 속성에는 `NOT NULL`을 적용한다',
          'NULL이 어떤 업무 상태를 뜻하는지 속성 정의에 명확히 적는다',
          '서로 다른 상태를 구분해야 한다면 상태코드 같은 별도 속성을 고려한다',
          '알 수 없는 값을 임의의 0이나 공백으로 바꾸지 않는다',
        ],
      },
      {
        kind: 'p',
        text: '{{b10}}은 실제 업무 의미가 있을 때만 사용한다. 단순히 NULL을 없애려고 미입력 급여에 0을 넣으면, 급여가 실제로 0인 사람과 아직 입력되지 않은 사람을 구분할 수 없게 된다.',
      },
      {
        kind: 'p',
        text: '{{b11}} 결과의 NULL은 원래 테이블에 저장된 NULL이 아니라, 조인 상대가 없어서 SQL 결과에 만들어진 값일 수도 있다.',
      },
      {
        kind: 'trap',
        text: '`DEFAULT`는 컬럼을 입력 대상에서 생략했을 때 적용된다. INSERT에서 NULL을 명시하면 DBMS와 제약조건에 따라 기본값이 아니라 NULL이 저장될 수 있으므로 구분한다.',
      },
    ],
  },
  {
    id: 'u5',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          'NULL은 0이 아니며, Oracle에서는 문자형 빈 문자열을 NULL로 처리한다',
          '필수 속성은 NOT NULL, 선택 속성은 업무 규칙에 따라 NULL을 허용할 수 있다',
          '기본키는 NULL을 허용하지 않으며 외래키는 관계의 필수 여부를 함께 본다',
          'NULL과의 일반 비교 결과는 UNKNOWN이며 NULL 검사는 IS NULL을 사용한다',
          'COUNT(*)는 전체 행, COUNT(컬럼)은 그 컬럼의 NULL을 제외한 행을 센다',
          '임의의 기본값으로 NULL의 업무 의미를 감추지 않는다',
        ],
      },
    ],
  },
];
