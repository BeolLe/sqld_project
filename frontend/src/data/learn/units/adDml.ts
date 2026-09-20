import type { LearnBlock } from '../types';

/** 2과목 · 관리 구문 · DML */
export const adDmlBlocks: LearnBlock[] = [
  {
    id: 'ml1',
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
          '건물(테이블 구조)을 세우고 부수는 게 `DDL`, 그 안에 짐(데이터)을 넣고 빼는 게 `DML` 이다.',
          '건물을 부수면 되돌릴 수 없지만 짐은 다시 들여놓을 수 있다. 이게 롤백 가능 여부의 차이다.',
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
        kind: 'p',
        text:
          'SELECT는 데이터를 읽기만 하지만 DML로 분류한다.\n' +
          'DML은 테이블 구조가 아니라 그 안의 데이터를 다루는 명령어이기 때문이다.',
      },
      {
        kind: 'trap',
        text:
          'DML은 실행해도 아직 확정되지 않는다. `COMMIT` 해야 다른 세션에도 보인다.\n' +
          '반면 DDL은 실행 즉시 자동 커밋되며, 그 앞에서 실행한 DML까지 함께 확정된다.',
      },
    ],
  },
  {
    id: 'ml2',
    heading: 'INSERT',
    blanks: [
      { id: 'b5', answer: 'VALUES', accepts: ['values', '밸류스'] },
      { id: 'b6', answer: 'NULL', accepts: ['null', '널'] },
      { id: 'b7', answer: 'SELECT', accepts: ['select', '셀렉트', '서브쿼리'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '행을 새로 넣는 명령어다. 넣을 값은 {{b5}} 절에 적으며, 칼럼 목록과 값의 개수·순서·자료형이 맞아야 한다.\n' +
          '`INSERT INTO 사원 (사원번호, 사원명, 급여)`\n' +
          '`VALUES (1001, \'김철수\', 3500)`',
      },
      {
        kind: 'table',
        head: ['형태', '의미'],
        rows: [
          ['칼럼 목록을 적는다', '적은 칼럼에만 값이 들어간다'],
          ['칼럼 목록을 생략한다', '테이블 정의 순서대로 **모든** 칼럼의 값을 적어야 한다'],
          ['`INSERT INTO ... SELECT`', '다른 테이블의 조회 결과를 여러 행 한 번에 넣는다'],
        ],
      },
      {
        kind: 'p',
        text:
          '값을 적지 않은 칼럼에는 {{b6}}이 들어간다. DEFAULT가 정의돼 있으면 그 값이 들어간다.\n' +
          '여러 행을 한 번에 넣을 때는 VALUES 대신 {{b7}} 문을 쓴다.',
      },
      {
        kind: 'trap',
        text:
          'NOT NULL 칼럼을 빼놓고 INSERT하면 제약조건 위반으로 실패한다.\n' +
          '칼럼 목록을 생략했다면 값 하나만 빠져도 개수가 어긋나 실패한다.',
      },
    ],
  },
  {
    id: 'ml3',
    heading: 'UPDATE',
    blanks: [
      { id: 'b8', answer: 'SET', accepts: ['set', '셋'] },
      { id: 'b9', answer: '모든', accepts: ['모든', '전체', '전부', '모든 행', '전체 행'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '이미 있는 행의 값을 바꾼다. {{b8}} 절에 바꿀 칼럼과 값을, WHERE 절에 대상 행의 조건을 적는다.\n' +
          '`UPDATE 사원`\n' +
          '`SET 급여 = 급여 * 1.1`\n' +
          '`WHERE 부서번호 = 10`',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'UPDATE 사원 SET 급여 = 급여 * 1.1 WHERE 부서번호 = 10',
          sources: [
            {
              label: '사원',
              columns: ['사원명', '부서번호', '급여'],
              rows: [
                ['김철수', 10, 3000],
                ['이영희', 20, 2800],
                ['박민수', 10, 4000],
              ],
            },
          ],
          steps: [
            {
              note: '① WHERE 절이 부서번호 10인 행만 고른다. 김철수와 박민수가 대상이다.',
              resultLabel: '대상 행',
              columns: ['사원명', '부서번호', '급여'],
              rows: [
                ['김철수', 10, 3000],
                ['박민수', 10, 4000],
              ],
            },
            {
              note: '② 고른 행의 급여에만 1.1을 곱한다. 3000은 3300, 4000은 4400이 된다.',
              resultLabel: '현재 결과',
              columns: ['사원명', '부서번호', '급여'],
              rows: [
                ['김철수', 10, 3300],
                ['박민수', 10, 4400],
              ],
            },
            {
              note: '③ WHERE 조건에 맞지 않은 이영희는 그대로 남는다.',
              resultLabel: '최종 결과',
              columns: ['사원명', '부서번호', '급여'],
              rows: [
                ['김철수', 10, 3300],
                ['이영희', 20, 2800],
                ['박민수', 10, 4400],
              ],
            },
          ],
          doneNote: 'WHERE 절이 바뀔 행을 고르고, SET 절이 그 행의 값을 바꾼다.',
        },
      },
      {
        kind: 'trap',
        text: 'WHERE 절을 빼면 {{b9}} 행의 값이 바뀐다. 시험에서도 실무에서도 단골 사고다.',
      },
    ],
  },
  {
    id: 'ml4',
    heading: 'DELETE',
    blanks: [
      { id: 'b10', answer: '유지', accepts: ['유지', '남는다', '보존', '그대로'] },
      { id: 'b11', answer: '가능', accepts: ['가능', 'o', 'ㅇ', '된다'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '행을 지운다. WHERE 절로 지울 행을 고르고, 생략하면 테이블의 모든 행이 지워진다.\n' +
          '`DELETE FROM 사원 WHERE 부서번호 = 10`',
      },
      {
        kind: 'p',
        text:
          'DELETE는 행만 지우므로 테이블 구조는 {{b10}}된다.\n' +
          'DML이라 COMMIT 전이라면 ROLLBACK이 {{b11}}하다.',
      },
      {
        kind: 'p',
        text: '※ DELETE·TRUNCATE·DROP의 차이와 저장 공간 반환 여부는 **DDL** 단원에서 다룬다.',
      },
    ],
  },
  {
    id: 'ml5',
    heading: 'MERGE',
    blanks: [
      { id: 'b12', answer: 'MATCHED', accepts: ['matched', '매치드', 'when matched'] },
      { id: 'b13', answer: 'INSERT', accepts: ['insert', '인서트'] },
    ],
    nodes: [
      {
        kind: 'p',
        text:
          '기준 테이블과 비교해 조건에 맞으면 수정하고, 맞는 행이 없으면 새로 넣는 명령어다.\n' +
          '한 문장으로 UPDATE와 INSERT를 함께 처리한다.',
      },
      {
        kind: 'p',
        text:
          '`MERGE INTO 사원 T`\n' +
          '`USING 신규사원 S ON (T.사원번호 = S.사원번호)`\n' +
          '`WHEN MATCHED THEN UPDATE SET T.급여 = S.급여`\n' +
          '`WHEN NOT MATCHED THEN INSERT VALUES (S.사원번호, S.사원명, S.급여)`',
      },
      {
        kind: 'table',
        head: ['ON 조건', '동작'],
        rows: [
          ['일치하는 행이 있다', 'WHEN {{b12}} THEN UPDATE'],
          ['일치하는 행이 없다', 'WHEN NOT MATCHED THEN {{b13}}'],
        ],
      },
    ],
  },
];
