import type { LearnBlock } from '../types';

/** 2과목 · 관리 구문 · DCL */
export const adDclBlocks: LearnBlock[] = [
  {
    id: 'dc1',
    heading: '권한의 두 종류',
    blanks: [
      { id: 'b1', answer: '시스템', accepts: ['시스템', 'system', '시스템 권한'] },
      { id: 'b2', answer: '객체', accepts: ['객체', 'object', '객체 권한'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          'DCL은 사용자가 무엇을 할 수 있는지 정하는 명령어다. `GRANT` 로 주고 `REVOKE` 로 거둔다.\n' +
          '권한은 무엇에 대한 권한이냐에 따라 두 종류로 나뉜다.',
      },
      {
        kind: 'table',
        head: ['구분', '대상', '예'],
        rows: [
          ['{{b1}} 권한', 'DB에서 할 수 있는 행위', '`CREATE SESSION`, `CREATE TABLE`, `CREATE USER`'],
          ['{{b2}} 권한', '특정 테이블이나 뷰', '`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `ALTER`, `REFERENCES`'],
        ],
      },
      {
        kind: 'p',
        text: '접속조차 못 하면 아무것도 할 수 없으므로, 새 사용자에게는 보통 `CREATE SESSION` 부터 준다.',
      },
    ],
  },
  {
    id: 'dc2',
    heading: 'GRANT와 REVOKE',
    blanks: [
      { id: 'b3', answer: 'ON', accepts: ['on'] },
      { id: 'b4', answer: 'FROM', accepts: ['from', '프롬'] },
      { id: 'b5', answer: 'PUBLIC', accepts: ['public', '퍼블릭', '전체'] },
    ],
    nodes: [
      {
        kind: 'table',
        head: ['목적', '구문'],
        rows: [
          ['객체 권한 부여', '`GRANT SELECT `{{b3}}` 사원 TO user1`'],
          ['권한 회수', '`REVOKE SELECT ON 사원 `{{b4}}` user1`'],
          ['여러 권한 한 번에', '`GRANT SELECT, INSERT ON 사원 TO user1`'],
          ['모든 사용자에게', '`GRANT SELECT ON 사원 TO `{{b5}}'],
        ],
      },
      {
        kind: 'p',
        text:
          '`WITH GRANT OPTION` 을 붙이면 받은 사람이 그 권한을 다른 사람에게 다시 줄 수 있다.\n' +
          '시스템 권한에서 같은 역할을 하는 것이 `WITH ADMIN OPTION` 이다.',
      },
      {
        kind: 'trap',
        text:
          '권한을 회수할 때 두 옵션의 결과가 다르다.\n' +
          '`WITH GRANT OPTION` 으로 넘어간 **객체** 권한은 회수하면 그 사람이 나눠준 권한까지 연쇄로 사라진다.\n' +
          '`WITH ADMIN OPTION` 으로 넘어간 **시스템** 권한은 회수해도 그 사람이 나눠준 권한은 남는다.',
      },
    ],
  },
  {
    id: 'dc3',
    heading: '롤(ROLE)',
    blanks: [
      { id: 'b6', answer: '묶음', accepts: ['묶음', '집합', '그룹', '모음'] },
      { id: 'b7', answer: 'CONNECT', accepts: ['connect', '커넥트'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '롤은 권한의 {{b6}}이다. 사용자마다 권한을 하나씩 주는 대신 롤에 모아 두고 롤을 준다.\n' +
          '사람이 늘어나도 줄 것은 롤 하나뿐이라 관리가 쉬워진다.',
      },
      {
        kind: 'table',
        head: ['단계', '구문'],
        rows: [
          ['롤 생성', '`CREATE ROLE 조회전용`'],
          ['롤에 권한 부여', '`GRANT SELECT ON 사원 TO 조회전용`'],
          ['사용자에게 롤 부여', '`GRANT 조회전용 TO user1`'],
        ],
      },
      {
        kind: 'p',
        text: 'DBMS가 미리 만들어 둔 롤도 있다. 접속과 기본 작업을 묶은 {{b7}}, 객체 생성 권한을 묶은 `RESOURCE`, 관리자 권한을 묶은 `DBA` 가 대표적이다.',
      },
    ],
  },
];
