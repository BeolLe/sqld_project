import type { LearnBlock } from '../types';

const ORG_ROWS = [
  [100, '대표', 'NULL'],
  [200, '개발팀장', 100],
  [300, '영업팀장', 100],
  [210, '개발자A', 200],
  [220, '개발자B', 200],
];

/** 2과목 · SQL 활용 · 계층형 질의와 셀프 조인 */
export const saHierBlocks: LearnBlock[] = [
  {
    id: 'hier1',
    heading: '계층형 질의의 세 부분',
    blanks: [
      { id: 'b1', answer: 'START WITH', accepts: ['start with'] },
      { id: 'b2', answer: 'CONNECT BY', accepts: ['connect by'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'Oracle 계층형 질의는 {{b1}}로 루트를 고르고, {{b2}}로 부모와 자식의 연결 규칙을 정한다. `PRIOR`가 붙은 표현식은 직전 단계의 부모 행을 가리킨다.',
      },
      {
        kind: 'table',
        head: ['절·키워드', '역할'],
        rows: [
          ['`START WITH`', '트리 탐색을 시작할 루트 행 선택'],
          ['`CONNECT BY`', '부모 행과 다음 자식 행의 연결 조건'],
          ['`PRIOR`', '연결 조건에서 부모 행의 값 표시'],
          ['`LEVEL`', '루트가 1인 현재 행의 깊이'],
        ],
      },
      {
        kind: 'memory',
        text: 'START WITH = 시작점 · CONNECT BY = 연결 규칙 · PRIOR = 부모 쪽 값',
      },
    ],
  },
  {
    id: 'hier2',
    heading: '순방향과 역방향 전개',
    blanks: [{ id: 'b3', answer: '자식', accepts: ['자식', '하위', '부하'] }],
    nodes: [
      {
        kind: 'p',
        text: '`CONNECT BY PRIOR EMPNO = MGR`는 부모의 사원번호와 현재 행의 관리자번호를 연결해 위에서 {{b3}} 방향으로 내려간다. `PRIOR`의 위치를 바꾸면 탐색 방향도 바뀐다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query:
            'SELECT LEVEL, ENAME FROM EMP START WITH MGR IS NULL CONNECT BY PRIOR EMPNO = MGR ORDER SIBLINGS BY EMPNO',
          sources: [{ label: 'EMP', columns: ['EMPNO', 'ENAME', 'MGR'], rows: ORG_ROWS }],
          steps: [
            {
              note: '① START WITH 조건에 맞는 대표가 LEVEL 1 루트가 됩니다.',
              resultLabel: 'LEVEL 1',
              columns: ['LEVEL', 'ENAME'],
              rows: [[1, '대표']],
            },
            {
              note: '② 대표의 EMPNO 100을 MGR로 가진 두 팀장이 LEVEL 2에 연결됩니다.',
              resultLabel: 'LEVEL 1~2',
              columns: ['LEVEL', 'ENAME'],
              rows: [
                [1, '대표'],
                [2, '개발팀장'],
                [2, '영업팀장'],
              ],
            },
            {
              note: '③ 개발팀장 EMPNO 200을 MGR로 가진 개발자들이 LEVEL 3에 연결됩니다.',
              resultLabel: '최종 계층',
              columns: ['LEVEL', 'ENAME'],
              rows: [
                [1, '대표'],
                [2, '개발팀장'],
                [3, '개발자A'],
                [3, '개발자B'],
                [2, '영업팀장'],
              ],
            },
          ],
          doneNote: 'PRIOR EMPNO = MGR는 부모의 사원번호를 현재 자식의 관리자번호와 비교합니다.',
        },
      },
      {
        kind: 'p',
        text: '반대로 특정 사원에서 관리자 방향으로 올라가려면 `PRIOR`를 관리자번호 쪽에 붙여 `CONNECT BY PRIOR MGR = EMPNO`로 연결한다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query:
            'SELECT LEVEL, ENAME FROM EMP START WITH EMPNO = 210 CONNECT BY PRIOR MGR = EMPNO',
          sources: [{ label: 'EMP', columns: ['EMPNO', 'ENAME', 'MGR'], rows: ORG_ROWS }],
          steps: [
            {
              note: '① EMPNO 210인 개발자A에서 탐색을 시작합니다.',
              resultLabel: 'LEVEL 1',
              columns: ['LEVEL', 'ENAME'],
              rows: [[1, '개발자A']],
            },
            {
              note: '② 개발자A의 MGR 200과 EMPNO가 같은 개발팀장을 찾습니다.',
              resultLabel: 'LEVEL 1~2',
              columns: ['LEVEL', 'ENAME'],
              rows: [
                [1, '개발자A'],
                [2, '개발팀장'],
              ],
            },
            {
              note: '③ 개발팀장의 MGR 100을 따라 대표까지 올라갑니다.',
              resultLabel: '최종 계층',
              columns: ['LEVEL', 'ENAME'],
              rows: [
                [1, '개발자A'],
                [2, '개발팀장'],
                [3, '대표'],
              ],
            },
          ],
          doneNote: 'PRIOR MGR = EMPNO는 현재 행의 관리자번호를 다음 상위 행의 사원번호와 비교합니다.',
        },
      },
      {
        kind: 'trap',
        text: '`PRIOR`는 무조건 왼쪽에 붙는 문법이 아니다. 어느 표현식에 붙었는지가 부모 행을 결정하므로 등호 양쪽을 직접 읽어야 한다.',
      },
    ],
  },
  {
    id: 'hier3',
    heading: '계층형 질의 전용 표현식',
    blanks: [{ id: 'b4', answer: '리프', accepts: ['리프', 'leaf', '말단'] }],
    nodes: [
      {
        kind: 'p',
        text: '`CONNECT_BY_ISLEAF`는 현재 행이 자식 없는 {{b4}} 노드면 1을 반환한다. 루트, 경로, 순환 여부도 전용 표현식으로 확인할 수 있다.',
      },
      {
        kind: 'table',
        head: ['표현식', '결과'],
        rows: [
          ['`LEVEL`', '루트 1부터 시작하는 깊이'],
          ['`CONNECT_BY_ISLEAF`', '리프면 1, 아니면 0'],
          ['`CONNECT_BY_ROOT col`', '현재 행이 속한 트리의 루트 값'],
          ['`SYS_CONNECT_BY_PATH(col, delimiter)`', '루트부터 현재 행까지의 경로 문자열'],
          ['`CONNECT_BY_ISCYCLE`', '`NOCYCLE` 사용 시 순환을 만든 행이면 1'],
        ],
      },
      {
        kind: 'trap',
        text: '데이터에 순환 참조 가능성이 있으면 `CONNECT BY NOCYCLE`을 검토한다. `CONNECT_BY_ISCYCLE`은 `NOCYCLE`을 지정한 계층형 질의에서 사용한다.',
      },
    ],
  },
  {
    id: 'hier4',
    heading: '계층을 유지하는 정렬',
    blanks: [{ id: 'b5', answer: 'ORDER SIBLINGS BY', accepts: ['order siblings by', 'siblings'] }],
    nodes: [
      {
        kind: 'p',
        text: '일반 `ORDER BY`로 전체 결과를 다시 정렬하면 부모·자식 출력 순서가 흐트러질 수 있다. 같은 부모를 가진 형제끼리 정렬하려면 {{b5}}를 사용한다.',
      },
      {
        kind: 'table',
        head: ['구문', '효과'],
        rows: [
          ['`ORDER BY ENAME`', '전체 결과를 이름순으로 정렬해 계층 출력 순서가 깨질 수 있음'],
          ['`ORDER SIBLINGS BY ENAME`', '부모 아래의 형제만 이름순으로 정렬해 트리 구조 유지'],
        ],
      },
      {
        kind: 'memory',
        text: '계층 구조를 보존한 형제 정렬 = ORDER SIBLINGS BY',
      },
    ],
  },
  {
    id: 'hier5',
    heading: '셀프 조인으로 관리자 찾기',
    blanks: [{ id: 'b6', answer: '별칭', accepts: ['별칭', 'alias', '테이블 별칭'] }],
    nodes: [
      {
        kind: 'p',
        text: '셀프 조인은 같은 테이블을 서로 다른 역할로 두 번 사용한다. 두 인스턴스를 구분하려면 반드시 서로 다른 {{b6}}을 붙인다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: 'SELECT E.ENAME 사원, M.ENAME 관리자 FROM EMP E LEFT JOIN EMP M ON E.MGR = M.EMPNO',
          sources: [{ label: 'EMP', columns: ['EMPNO', 'ENAME', 'MGR'], rows: ORG_ROWS }],
          steps: [
            {
              note: '① E는 사원 역할, M은 관리자 역할로 같은 EMP를 각각 읽습니다.',
              resultLabel: '역할 분리',
              columns: ['E.ENAME', 'E.MGR', 'M.EMPNO', 'M.ENAME'],
              rows: [
                ['개발팀장', 100, 100, '대표'],
                ['개발자A', 200, 200, '개발팀장'],
              ],
            },
            {
              note: '② LEFT JOIN이므로 관리자가 없는 대표도 결과에 남습니다.',
              resultLabel: '최종 결과',
              columns: ['사원', '관리자'],
              rows: [
                ['대표', 'NULL'],
                ['개발팀장', '대표'],
                ['영업팀장', '대표'],
                ['개발자A', '개발팀장'],
                ['개발자B', '개발팀장'],
              ],
            },
          ],
          doneNote: '계층 전체를 펼치는 대신 각 행의 직접 관리자 한 명을 붙인 결과입니다.',
        },
      },
      {
        kind: 'trap',
        text: 'INNER JOIN을 사용하면 MGR이 NULL인 최상위 행은 사라진다. 루트까지 보여야 하는 요구라면 LEFT OUTER JOIN이 필요하다.',
      },
    ],
  },
];
