import type { LearnBlock } from '../types';

/** 2과목 · 관리 구문 · DDL */
export const adDdlBlocks: LearnBlock[] = [
  {
    id: 'd1',
    heading: 'CREATE TABLE',
    blanks: [
      { id: 'b1', answer: '고정', accepts: ['고정', '고정길이', '고정 길이'] },
      { id: 'b2', answer: '가변', accepts: ['가변', '가변길이', '가변 길이'] },
      { id: 'b3', answer: '문자', accepts: ['문자', '영문자', '알파벳'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '테이블을 만드는 명령어다. 칼럼마다 이름과 자료형을 적고, 필요하면 제약조건을 함께 선언한다.\n' +
          '`CREATE TABLE 사원 (`\n' +
          '`  사원번호 NUMBER PRIMARY KEY,`\n' +
          '`  사원명 VARCHAR2(20) NOT NULL,`\n' +
          '`  입사일 DATE DEFAULT SYSDATE )`',
      },
      {
        kind: 'table',
        head: ['자료형', '저장 방식', '쓰임'],
        rows: [
          ['`CHAR(n)`', '{{b1}} 길이. 남는 자리를 공백으로 채운다', '길이가 일정한 코드'],
          ['`VARCHAR2(n)`', '{{b2}} 길이. 들어온 만큼만 쓴다', '이름, 주소처럼 길이가 들쑥날쑥한 값'],
          ['`NUMBER(p, s)`', '전체 p자리, 소수점 이하 s자리', '금액, 수량'],
          ['`DATE`', '날짜와 시각', '입사일, 등록일시'],
        ],
      },
      {
        kind: 'p',
        text:
          '테이블명과 칼럼명은 {{b3}}로 시작해야 하고, 한 테이블 안에서 칼럼명이 겹칠 수 없다.\n' +
          '예약어는 이름으로 쓸 수 없다.',
      },
      {
        kind: 'trap',
        text:
          'CHAR는 비교할 때 짧은 쪽에 공백을 채워 맞춘 뒤 비교하므로 `\'AB\'` 와 `\'AB \'` 가 같다.\n' +
          'VARCHAR2는 공백도 값으로 보기 때문에 두 값이 다르다.',
      },
      {
        kind: 'p',
        text: '※ 명령어 4분류(DDL·DML·DCL·TCL)와 각 분류의 성격은 **DML** 단원에서 다룬다.',
      },
    ],
  },
  {
    id: 'd2',
    heading: 'ALTER TABLE',
    blanks: [
      { id: 'b4', answer: 'ADD', accepts: ['add', '애드'] },
      { id: 'b5', answer: 'MODIFY', accepts: ['modify', '모디파이'] },
      { id: 'b6', answer: 'NULL', accepts: ['null', '널'] },
    ],
    nodes: [
      {
        kind: 'table',
        head: ['목적', '구문'],
        rows: [
          ['칼럼 추가', '`ALTER TABLE 사원 `{{b4}}` (전화번호 VARCHAR2(20))`'],
          ['자료형·길이 변경', '`ALTER TABLE 사원 `{{b5}}` (사원명 VARCHAR2(30))`'],
          ['칼럼 삭제', '`ALTER TABLE 사원 DROP COLUMN 전화번호`'],
          ['칼럼명 변경', '`ALTER TABLE 사원 RENAME COLUMN 사원명 TO 성명`'],
          ['제약조건 추가', '`ALTER TABLE 사원 ADD CONSTRAINT ...`'],
        ],
      },
      {
        kind: 'p',
        text: '칼럼을 추가하면 기존 행의 그 칼럼 값은 {{b6}}이 된다. 그래서 값이 있는 테이블에 NOT NULL 칼럼을 바로 추가할 수 없다.',
      },
      {
        kind: 'trap',
        text:
          '이미 데이터가 있으면 자료형과 길이를 마음대로 줄일 수 없다.\n' +
          '들어 있는 값이 들어갈 수 있는 범위여야 MODIFY가 통과한다.',
      },
    ],
  },
  {
    id: 'd3',
    heading: 'DELETE · TRUNCATE · DROP',
    blanks: [
      { id: 'b7', answer: 'DML', accepts: ['dml'] },
      { id: 'b8', answer: '불가', accepts: ['불가', '불가능', '안됨', 'x'] },
      { id: 'b9', answer: '가능', accepts: ['가능', 'o', 'ㅇ'] },
      { id: 'b10', answer: '삭제', accepts: ['삭제', '제거', '없어짐'] },
      { id: 'b11', answer: '반환', accepts: ['반환', '반납', '해제'] },
    ],
    nodes: [
      {
        kind: 'analogy',
        lead: '노트를 정리하는 세 가지 방법이다.',
        body: [
          '`DELETE` 는 지우개로 한 줄씩 지우기다. 느리지만 되돌릴 수 있고 원하는 줄만 고를 수 있다.',
          '`TRUNCATE` 는 속지를 통째로 뜯어내기다. 표지(구조)는 남고 빠르지만 되돌릴 수 없다.',
          '`DROP` 은 노트를 통째로 버리기다. 표지까지 사라진다.',
        ],
      },
      {
        kind: 'table',
        head: ['', 'DELETE', 'TRUNCATE', 'DROP'],
        rows: [
          ['분류', '{{b7}}', 'DDL', 'DDL'],
          ['롤백', '가능', '{{b8}}', '불가'],
          ['WHERE 절', '{{b9}}', '불가', '불가'],
          ['테이블 구조', '유지', '유지', '{{b10}}'],
          ['저장 공간', '유지', '{{b11}}', '반환'],
        ],
      },
      {
        kind: 'p',
        text: 'TRUNCATE가 DELETE보다 빠른 이유는 행을 하나씩 지우지 않고 저장 공간을 초기화하기 때문이다.',
      },
    ],
  },
  {
    id: 'd4',
    heading: '제약조건',
    blanks: [
      { id: 'b12', answer: '불가', accepts: ['불가', '불가능', '안됨', 'x'] },
      { id: 'b13', answer: '허용', accepts: ['허용', '가능', 'o', 'ㅇ'] },
      { id: 'b14', answer: 'NOT NULL', accepts: ['not null', 'notnull', 'not-null'] },
    ],
    nodes: [
      {
        kind: 'table',
        head: ['제약조건', '의미', 'NULL'],
        rows: [
          ['PRIMARY KEY', '행을 유일하게 식별', '{{b12}}'],
          ['UNIQUE', '중복 값 불가', '{{b13}}'],
          ['NOT NULL', '널 입력 불가', '불가'],
          ['FOREIGN KEY', '다른 테이블 PK 참조', '허용'],
          ['CHECK', '입력 값의 범위 제한', '허용'],
        ],
      },
      {
        kind: 'p',
        text: 'PRIMARY KEY는 결국 `UNIQUE` + {{b14}} 의 결합이다.',
      },
      {
        kind: 'trap',
        text:
          'UNIQUE는 NULL을 허용하며, NULL끼리는 같다고 보지 않으므로 **여러 개 들어갈 수 있다.**\n' +
          'PK와 헷갈리게 내는 단골 선지다.',
      },
    ],
  },
];
