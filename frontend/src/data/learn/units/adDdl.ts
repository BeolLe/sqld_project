import type { LearnBlock } from '../types';

/** 2과목 · 관리 구문 · DDL */
export const adDdlBlocks: LearnBlock[] = [
  {
    id: 'd1',
    heading: '명령어 4분류',
    blanks: [
      { id: 'b1', answer: 'DDL', accepts: ['ddl'] },
      { id: 'b2', answer: 'DML', accepts: ['dml'] },
      { id: 'b3', answer: 'DCL', accepts: ['dcl'] },
      { id: 'b4', answer: 'TCL', accepts: ['tcl'] },
    ],
    nodes: [
      {
        kind: 'analogy',
        lead: 'DDL은 건물 짓기, DML은 이삿짐 나르기다.',
        body: [
          '건물(테이블 구조)을 세우고 부수는 게 `DDL`, 그 안에 짐(데이터)을 넣고 빼는 게 `DML` 이다. 건물을 부수면 되돌릴 수 없지만 짐은 다시 들여놓을 수 있다. 이게 롤백 가능 여부의 차이다.',
        ],
      },
      {
        kind: 'table',
        head: ['분류', '명령어', '성격'],
        rows: [
          ['{{b1}}', '`CREATE ALTER DROP TRUNCATE`', '구조 정의 · 자동 커밋'],
          ['{{b2}}', '`SELECT INSERT UPDATE DELETE`', '데이터 조작 · 롤백 가능'],
          ['{{b3}}', '`GRANT REVOKE`', '권한 부여 · 회수'],
          ['{{b4}}', '`COMMIT ROLLBACK SAVEPOINT`', '트랜잭션 제어'],
        ],
      },
      {
        kind: 'trap',
        text: 'DDL은 실행 즉시 자동 커밋된다. 그 앞에서 실행한 DML까지 함께 확정되므로 `ROLLBACK` 으로 되돌릴 수 없다.',
      },
    ],
  },
  {
    id: 'd2',
    heading: 'DELETE · TRUNCATE · DROP',
    blanks: [
      { id: 'b5', answer: 'DML', accepts: ['dml'] },
      { id: 'b6', answer: '불가', accepts: ['불가', '불가능', '안됨', 'x'] },
      { id: 'b7', answer: '가능', accepts: ['가능', 'o', 'ㅇ'] },
      { id: 'b8', answer: '삭제', accepts: ['삭제', '제거', '없어짐'] },
      { id: 'b9', answer: '반환', accepts: ['반환', '반납', '해제'] },
    ],
    nodes: [
      {
        kind: 'analogy',
        lead: '노트를 정리하는 세 가지 방법이다.',
        body: [
          '`DELETE` 는 **지우개로 한 줄씩 지우기** — 느리지만 되돌릴 수 있고 원하는 줄만 고를 수 있다. `TRUNCATE` 는 **속지를 통째로 뜯어내기** — 표지(구조)는 남고 빠르지만 되돌릴 수 없다. `DROP` 은 **노트를 통째로 버리기** — 표지까지 사라진다.',
        ],
      },
      {
        kind: 'table',
        head: ['', 'DELETE', 'TRUNCATE', 'DROP'],
        rows: [
          ['분류', '{{b5}}', 'DDL', 'DDL'],
          ['롤백', '가능', '{{b6}}', '불가'],
          ['WHERE 절', '{{b7}}', '불가', '불가'],
          ['테이블 구조', '유지', '유지', '{{b8}}'],
          ['저장 공간', '유지', '{{b9}}', '반환'],
        ],
      },
      {
        kind: 'p',
        text: 'TRUNCATE 가 DELETE 보다 빠른 이유는 행을 하나씩 지우지 않고 저장 공간을 초기화하기 때문이다.',
      },
    ],
  },
  {
    id: 'd3',
    heading: '제약조건',
    blanks: [
      { id: 'b10', answer: '불가', accepts: ['불가', '불가능', '안됨', 'x'] },
      { id: 'b11', answer: '허용', accepts: ['허용', '가능', 'o', 'ㅇ'] },
      { id: 'b12', answer: 'NOT NULL', accepts: ['not null', 'notnull', 'not-null'] },
    ],
    nodes: [
      {
        kind: 'table',
        head: ['제약조건', '의미', 'NULL'],
        rows: [
          ['PRIMARY KEY', '행을 유일하게 식별', '{{b10}}'],
          ['UNIQUE', '중복 값 불가', '{{b11}}'],
          ['NOT NULL', '널 입력 불가', '불가'],
          ['FOREIGN KEY', '다른 테이블 PK 참조', '허용'],
          ['CHECK', '입력 값의 범위 제한', '허용'],
        ],
      },
      {
        kind: 'p',
        text: 'PRIMARY KEY 는 결국 `UNIQUE` + {{b12}} 의 결합이다.',
      },
      {
        kind: 'trap',
        text: 'UNIQUE 는 NULL 을 허용하며, NULL 끼리는 같다고 보지 않으므로 **여러 개 들어갈 수 있다.** PK 와 헷갈리게 내는 단골 선지다.',
      },
    ],
  },
];
