import type { LearnBlock } from '../types';

const A_ROWS = [[1], [2], [2], [3]];
const B_ROWS = [[2], [3], [3], [4]];

/** 2과목 · SQL 활용 · 집합 연산자 */
export const saSetBlocks: LearnBlock[] = [
  {
    id: 'set1',
    heading: '집합 연산자의 공통 규칙',
    blanks: [
      { id: 'b1', answer: '같아야', accepts: ['같아야', '동일해야', '같다'] },
      { id: 'b2', answer: '호환', accepts: ['호환', '호환 가능'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '집합 연산자는 두 SELECT 결과를 세로로 결합한다. 양쪽 SELECT의 열 개수는 {{b1}} 하고, 같은 위치의 자료형은 서로 {{b2}} 가능해야 한다.',
      },
      {
        kind: 'table',
        head: ['연산자', '결과', '중복 처리'],
        rows: [
          ['`UNION`', '합집합', '제거'],
          ['`UNION ALL`', '합집합', '유지'],
          ['`INTERSECT`', '교집합', '제거'],
          ['`MINUS`', '첫 번째 결과에서 두 번째 결과를 뺀 차집합', '제거'],
        ],
      },
      {
        kind: 'memory',
        text: 'UNION ALL만 중복 유지 · 나머지는 집합 의미에 따라 중복 제거',
      },
    ],
  },
  {
    id: 'set2',
    heading: 'UNION과 UNION ALL',
    blanks: [
      { id: 'b3', answer: '중복 제거', accepts: ['중복 제거', '중복을 제거'] },
      { id: 'b4', answer: '8', accepts: ['8', '8행'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '`UNION`은 {{b3}}를 수행하고 `UNION ALL`은 양쪽 결과를 그대로 이어 붙인다. 아래 예시에서 UNION ALL 결과는 {{b4}}행이다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT N FROM A UNION ALL SELECT N FROM B',
          sources: [
            { label: 'A', columns: ['N'], rows: A_ROWS },
            { label: 'B', columns: ['N'], rows: B_ROWS },
          ],
          steps: [
            {
              note: '① A의 네 행을 먼저 결과에 둔다.',
              resultLabel: '현재 결과',
              columns: ['N'],
              rows: A_ROWS,
            },
            {
              note: '② B의 네 행을 그대로 이어 붙인다. 중복도 남는다.',
              resultLabel: '최종 결과',
              columns: ['N'],
              rows: [...A_ROWS, ...B_ROWS],
            },
          ],
          doneNote: 'UNION ALL은 정렬이나 중복 제거 없이 총 8행을 반환한다.',
        },
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT N FROM A UNION SELECT N FROM B',
          sources: [
            { label: 'A', columns: ['N'], rows: A_ROWS },
            { label: 'B', columns: ['N'], rows: B_ROWS },
          ],
          steps: [
            {
              note: '① 양쪽 결과를 합치면 1, 2, 2, 3, 2, 3, 3, 4가 된다.',
              resultLabel: '결합 결과',
              columns: ['N'],
              rows: [...A_ROWS, ...B_ROWS],
            },
            {
              note: '② UNION이 같은 값을 한 번만 남긴다.',
              resultLabel: '최종 결과',
              columns: ['N'],
              rows: [[1], [2], [3], [4]],
            },
          ],
          doneNote: 'UNION은 중복을 제거해 4행을 반환한다.',
        },
      },
      {
        kind: 'trap',
        text: '중복 제거가 필요 없으면 UNION ALL이 의도도 분명하고 불필요한 중복 제거 비용도 피한다.',
      },
    ],
  },
  {
    id: 'set3',
    heading: 'INTERSECT와 MINUS',
    blanks: [
      { id: 'b5', answer: '공통', accepts: ['공통', '교집합', '공통된'] },
      { id: 'b6', answer: '순서', accepts: ['순서', '방향'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '`INTERSECT`는 양쪽에 {{b5}}으로 있는 행을 남긴다. `MINUS`는 왼쪽에서 오른쪽을 빼므로 SELECT의 {{b6}}가 중요하다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT N FROM A INTERSECT SELECT N FROM B',
          sources: [
            { label: 'A', columns: ['N'], rows: A_ROWS },
            { label: 'B', columns: ['N'], rows: B_ROWS },
          ],
          steps: [
            {
              note: '① A의 고유 값은 1, 2, 3이고 B의 고유 값은 2, 3, 4다.',
              resultLabel: '고유 값 비교',
              columns: ['A', 'B'],
              rows: [
                ['1', '2'],
                ['2', '3'],
                ['3', '4'],
              ],
            },
            {
              note: '② 양쪽에 모두 있는 2와 3만 남긴다.',
              resultLabel: '최종 결과',
              columns: ['N'],
              rows: [[2], [3]],
            },
          ],
          doneNote: 'INTERSECT 결과는 2, 3 두 행이다.',
        },
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT N FROM A MINUS SELECT N FROM B',
          sources: [
            { label: 'A', columns: ['N'], rows: A_ROWS },
            { label: 'B', columns: ['N'], rows: B_ROWS },
          ],
          steps: [
            {
              note: '① A의 고유 값 1, 2, 3에서 비교를 시작한다.',
              resultLabel: 'A의 고유 값',
              columns: ['N'],
              rows: [[1], [2], [3]],
            },
            {
              note: '② B에도 있는 2와 3을 제거한다.',
              resultLabel: '최종 결과',
              columns: ['N'],
              rows: [[1]],
            },
          ],
          doneNote: 'A MINUS B 결과는 1 한 행이다. B MINUS A라면 4가 남는다.',
        },
      },
    ],
  },
  {
    id: 'set4',
    heading: 'NULL과 중복의 처리',
    blanks: [{ id: 'b7', answer: '같은 값', accepts: ['같은 값', '동일한 값', '같다'] }],
    nodes: [
      {
        kind: 'p',
        text: '일반 조건식에서 `NULL = NULL`은 UNKNOWN이지만, 집합 연산의 중복 판단에서는 같은 위치의 NULL을 {{b7}}처럼 취급한다.',
      },
      {
        kind: 'table',
        head: ['입력', '연산', '결과'],
        rows: [
          ['NULL 1행 + NULL 1행', '`UNION`', 'NULL 1행'],
          ['NULL 1행 + NULL 1행', '`UNION ALL`', 'NULL 2행'],
          ['양쪽 모두 NULL 1행', '`INTERSECT`', 'NULL 1행'],
        ],
      },
    ],
  },
  {
    id: 'set5',
    heading: 'ORDER BY와 열 이름',
    blanks: [{ id: 'b8', answer: '마지막', accepts: ['마지막', '맨 마지막', '끝'] }],
    nodes: [
      {
        kind: 'p',
        text: '집합 연산 전체를 정렬하는 ORDER BY는 전체 SQL의 {{b8}}에 한 번 둔다. 결과 열 이름은 첫 번째 SELECT의 열 이름이나 별칭을 따른다.',
      },
      {
        kind: 'table',
        head: ['확인 항목', '규칙'],
        rows: [
          ['열 개수', '양쪽 SELECT가 동일'],
          ['자료형', '같은 위치끼리 호환 가능'],
          ['결과 열 이름', '첫 번째 SELECT 기준'],
          ['ORDER BY', '전체 집합 연산 마지막에 한 번'],
        ],
      },
      {
        kind: 'trap',
        text: '연산자가 여러 개면 DBMS별 우선순위 기억에 의존하지 말고 괄호로 의도를 명확하게 표현한다.',
      },
    ],
  },
  {
    id: 'set6',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          '집합 연산 양쪽 SELECT는 열 개수와 위치별 자료형이 호환돼야 한다',
          'UNION은 중복 제거, UNION ALL은 중복 유지다',
          'INTERSECT는 교집합, MINUS는 왼쪽에서 오른쪽을 뺀 차집합이다',
          '집합 연산의 중복 판단에서는 같은 위치의 NULL을 같은 값처럼 취급한다',
          'ORDER BY는 전체 집합 연산의 마지막에 한 번 사용한다',
        ],
      },
    ],
  },
];
