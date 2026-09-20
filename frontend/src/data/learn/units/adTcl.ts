import type { LearnBlock } from '../types';

/** 2과목 · 관리 구문 · TCL */
export const adTclBlocks: LearnBlock[] = [
  {
    id: 'tc1',
    heading: '트랜잭션과 TCL',
    blanks: [
      { id: 'b1', answer: '원자성', accepts: ['원자성', 'atomicity', '원자'] },
      { id: 'b2', answer: '일관성', accepts: ['일관성', 'consistency'] },
      { id: 'b3', answer: '고립성', accepts: ['고립성', '격리성', 'isolation'] },
      { id: 'b4', answer: '지속성', accepts: ['지속성', '영속성', 'durability'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '트랜잭션은 쪼갤 수 없는 하나의 업무 단위다. 전부 반영되거나 전부 취소되어야 한다.\n' +
          'TCL은 그 단위를 확정하거나 되돌리는 명령어다.',
      },
      {
        kind: 'table',
        head: ['특성', '의미'],
        rows: [
          ['{{b1}}', '전부 반영되거나 전부 취소된다'],
          ['{{b2}}', '트랜잭션 전후로 데이터가 모순되지 않는다'],
          ['{{b3}}', '수행 중인 트랜잭션의 중간 결과를 다른 트랜잭션이 보지 못한다'],
          ['{{b4}}', '확정된 결과는 장애가 나도 남는다'],
        ],
      },
      {
        kind: 'memory',
        text: '원자성·일관성·고립성·지속성의 앞 글자를 딴 영문 약자가 ACID다.',
      },
      {
        kind: 'p',
        text: '※ 업무 단위를 어디까지 묶을지 모델에서 판단하는 방법은 **모델이 표현하는 트랜잭션의 이해** 단원에서 다룬다.',
      },
    ],
  },
  {
    id: 'tc2',
    heading: 'COMMIT과 ROLLBACK',
    blanks: [
      { id: 'b5', answer: 'COMMIT', accepts: ['commit', '커밋'] },
      { id: 'b6', answer: 'ROLLBACK', accepts: ['rollback', '롤백'] },
      { id: 'b7', answer: '자기 자신', accepts: ['자기 자신', '자신', '본인', '자기', '해당 세션'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '{{b5}}은 변경을 확정하고, {{b6}}은 직전 COMMIT 이후의 변경을 모두 취소한다.\n' +
          'DML을 실행한 것만으로는 아직 확정되지 않는다.',
      },
      {
        kind: 'table',
        head: ['', 'COMMIT 전', 'COMMIT 후'],
        rows: [
          ['변경한 세션', '바뀐 값이 보인다', '바뀐 값이 보인다'],
          ['다른 세션', '{{b7}}만 볼 수 있다', '모두 볼 수 있다'],
          ['ROLLBACK', '되돌릴 수 있다', '되돌릴 수 없다'],
          ['잠금(Lock)', '유지된다', '풀린다'],
        ],
      },
      {
        kind: 'trap',
        text:
          'DDL이나 DCL을 실행하면 그 앞의 DML까지 **자동으로 커밋된다.**\n' +
          'INSERT 후 실수로 CREATE TABLE을 실행하면 그 INSERT는 이미 확정되어 되돌릴 수 없다.',
      },
    ],
  },
  {
    id: 'tc3',
    heading: 'SAVEPOINT',
    blanks: [
      { id: 'b8', answer: 'SAVEPOINT', accepts: ['savepoint', '세이브포인트', '저장점'] },
      { id: 'b9', answer: '이후', accepts: ['이후', '뒤', '다음', '이후의'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '{{b8}}는 트랜잭션 중간에 되돌아올 지점을 표시해 둔다.\n' +
          '`ROLLBACK TO 지점명` 을 쓰면 그 지점 {{b9}}의 작업만 취소하고 트랜잭션은 계속된다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'INSERT ... ; SAVEPOINT S1; INSERT ... ; ROLLBACK TO S1; COMMIT;',
          sources: [
            {
              label: '사원 (트랜잭션 시작 시점)',
              columns: ['사원명', '부서번호'],
              rows: [['김철수', 10]],
            },
          ],
          steps: [
            {
              note: '① 이영희를 INSERT한 뒤 SAVEPOINT S1으로 지금 상태를 표시해 둔다.',
              resultLabel: '현재 상태',
              columns: ['사원명', '부서번호'],
              rows: [
                ['김철수', 10],
                ['이영희', 20],
              ],
            },
            {
              note: '② 박민수를 INSERT한다. 아직 COMMIT 전이라 확정된 것은 없다.',
              resultLabel: '현재 상태',
              columns: ['사원명', '부서번호'],
              rows: [
                ['김철수', 10],
                ['이영희', 20],
                ['박민수', 10],
              ],
            },
            {
              note: '③ ROLLBACK TO S1은 S1 이후의 작업만 취소한다. 박민수만 사라지고 이영희는 남는다.',
              resultLabel: '현재 상태',
              columns: ['사원명', '부서번호'],
              rows: [
                ['김철수', 10],
                ['이영희', 20],
              ],
            },
            {
              note: '④ COMMIT하면 남아 있던 이영희까지 확정된다.',
              resultLabel: '최종 결과',
              columns: ['사원명', '부서번호'],
              rows: [
                ['김철수', 10],
                ['이영희', 20],
              ],
            },
          ],
          doneNote: 'ROLLBACK TO는 트랜잭션 전체가 아니라 표시해 둔 지점까지만 되돌린다.',
        },
      },
      {
        kind: 'trap',
        text:
          '`ROLLBACK TO S1` 을 실행하면 S1 이후에 만든 세이브포인트는 사라진다.\n' +
          '지점을 적지 않은 그냥 `ROLLBACK` 은 트랜잭션 전체를 되돌린다.',
      },
    ],
  },
  {
    id: 'tc4',
    heading: '자동 커밋과 DBMS 차이',
    blanks: [
      { id: 'b10', answer: 'ROLLBACK', accepts: ['rollback', '롤백', '취소'] },
      { id: 'b11', answer: 'BEGIN TRANSACTION', accepts: ['begin transaction', 'begin tran', 'begin'] },
    ],
    nodes: [
      {
        kind: 'table',
        head: ['상황', '결과'],
        rows: [
          ['DDL·DCL 실행', '앞선 DML까지 자동 커밋'],
          ['세션을 정상 종료', '커밋'],
          ['세션이 비정상 종료', '{{b10}}'],
        ],
      },
      {
        kind: 'table',
        head: ['', 'Oracle', 'SQL Server'],
        rows: [
          ['기본 동작', 'DML 후 COMMIT을 직접 해야 확정', '문장 단위로 자동 커밋'],
          ['트랜잭션 시작', 'DML 실행 시 자동 시작', '{{b11}} 문으로 명시'],
        ],
      },
      {
        kind: 'trap',
        text: 'SQL Server는 기본이 자동 커밋이라 BEGIN TRANSACTION 없이 실행한 DML은 ROLLBACK으로 되돌릴 수 없다.',
      },
    ],
  },
];
