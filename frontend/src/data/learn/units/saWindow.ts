import type { LearnBlock } from '../types';

const EMP_ROWS = [
  ['KING', 5000],
  ['SCOTT', 3000],
  ['JONES', 2975],
  ['BLAKE', 2850],
  ['CLARK', 2450],
];

/** 2과목 · SQL 활용 · 윈도우 함수 */
export const saWindowBlocks: LearnBlock[] = [
  {
    id: 'w1',
    heading: '윈도우 함수란',
    blanks: [{ id: 'b1', answer: '같은', accepts: ['같은', '동일한', '동일', 'n'] }],
    nodes: [
      {
        kind: 'analogy',
        lead: '집계 함수는 반죽이고, 윈도우 함수는 커닝이다.',
        body: [
          '`GROUP BY` 로 합계를 내면 원래 행들이 뭉개져서 한 줄로 합쳐진다. 반면 윈도우 함수는 **내 행은 그대로 남긴 채 옆 행을 슬쩍 훔쳐보는** 것이다. 그래서 "각 사원의 급여와 동시에 부서 평균"을 한 줄에 같이 놓을 수 있다.',
        ],
      },
      {
        kind: 'p',
        text: '구문은 `함수() OVER (PARTITION BY ... ORDER BY ...)` 형태다. `PARTITION BY` 는 훔쳐볼 범위를 나누는 칸막이고, `ORDER BY` 는 그 칸 안에서의 줄 세우기다.',
      },
      {
        kind: 'p',
        text: '핵심은 **행 개수가 줄지 않는다**는 점이다. 입력이 5행이면 출력도 {{b1}} 수만큼 나온다.',
      },
    ],
  },
  {
    id: 'w2',
    heading: 'LAG · LEAD — 앞뒤 행 참조',
    blanks: [{ id: 'b2', answer: 'NULL', accepts: ['null', '널'] }],
    nodes: [
      {
        kind: 'analogy',
        lead: '줄을 선 채로 앞사람과 뒷사람을 쳐다보는 것이다.',
        body: [
          '`LAG` 는 뒤를 돌아 **앞사람(이전 행)** 을, `LEAD` 는 목을 빼서 **뒷사람(다음 행)** 을 본다. 맨 앞사람은 앞에 볼 사람이 없으니 `NULL` 이 된다.',
        ],
      },
      {
        kind: 'p',
        text: '아래에서 직접 돌려보자. 급여를 내림차순으로 줄 세운 뒤 각자 자기 **앞사람의 급여**를 가져온다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'row-reference',
          query: 'SELECT ENAME, SAL, LAG(SAL) OVER (ORDER BY SAL DESC) AS PREV_SAL FROM EMP',
          sourceLabel: 'EMP (SAL 내림차순)',
          columns: ['ENAME', 'SAL'],
          rows: EMP_ROWS,
          reference: { outputColumn: 'PREV_SAL', sourceColumnIndex: 1 },
          doneNote: '완료 — 행 개수는 그대로 5행. 첫 행은 참조할 이전 행이 없어 NULL 입니다.',
        },
      },
      {
        kind: 'p',
        text: '`LAG(SAL)` 의 결과에서 첫 행이 {{b2}} 인 이유는 참조할 이전 행이 없기 때문이다. 세 번째 인자로 기본값을 줄 수 있다 — `LAG(SAL, 1, 0)`.',
      },
      {
        kind: 'trap',
        text: '`LAG` / `LEAD` 는 `OVER` 절에 `ORDER BY` 가 **반드시** 있어야 한다. 순서가 정해지지 않으면 "이전 행"이 정의되지 않는다.',
      },
    ],
  },
  {
    id: 'w3',
    heading: 'WHERE 는 어떻게 걸러지나',
    blanks: [
      {
        id: 'b3',
        answer: '없다',
        accepts: ['없다', '없음', '포함되지 않는다', '제외된다', '안된다'],
      },
    ],
    nodes: [
      {
        kind: 'p',
        text: '윈도우 함수를 이해하려면 행이 걸러지는 순서를 먼저 봐야 한다. 조건에 맞지 않는 행이 **버려지고** 남은 것만 다음 단계로 간다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'row-filter',
          query: 'SELECT * FROM EMP WHERE SAL >= 2900',
          sourceLabel: 'EMP 전체',
          columns: ['ENAME', 'SAL'],
          rows: EMP_ROWS,
          filter: { columnIndex: 1, min: 2900 },
          doneNote: '버려진 행은 이후 단계(윈도우 함수 포함)에 참여하지 않습니다.',
        },
      },
      {
        kind: 'p',
        text: '중요한 건 실행 순서다. `WHERE` 로 행을 거른 **다음에** 윈도우 함수가 계산된다. 즉 `WHERE` 에서 버려진 행은 `LAG` 의 "이전 행" 후보에도 {{b3}}.',
      },
    ],
  },
  {
    id: 'w4',
    heading: '순위 함수 3형제',
    blanks: [
      { id: 'b4', answer: '4', accepts: ['4'] },
      { id: 'b5', answer: '3', accepts: ['3'] },
    ],
    nodes: [
      {
        kind: 'analogy',
        lead: '올림픽 시상대에 공동 2등이 두 명 나왔을 때, 그 다음은 몇 등인가?',
        body: [
          '이게 세 함수의 유일한 차이다. `RANK` 는 자리를 비워 4등으로 건너뛰고, `DENSE_RANK` 는 자리를 안 비워 3등이 나오며, `ROW_NUMBER` 는 공동 순위 자체를 인정하지 않고 무조건 1·2·3·4를 매긴다.',
        ],
      },
      {
        kind: 'table',
        head: ['함수', '동점 처리', '결과 예시'],
        rows: [
          ['RANK', '동점 인정, 다음 순위 **건너뜀**', '`1, 2, 2, `{{b4}}'],
          ['DENSE_RANK', '동점 인정, 다음 순위 **연속**', '`1, 2, 2, `{{b5}}'],
          ['ROW_NUMBER', '동점 **불인정**', '`1, 2, 3, 4`'],
        ],
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query:
            'SELECT ENAME, SAL, RANK() OVER (ORDER BY SAL DESC), DENSE_RANK() OVER (ORDER BY SAL DESC), ROW_NUMBER() OVER (ORDER BY SAL DESC, ENAME) FROM EMP',
          sources: [
            {
              label: 'EMP',
              columns: ['ENAME', 'SAL'],
              rows: [
                ['KING', 5000],
                ['FORD', 3000],
                ['SCOTT', 3000],
                ['JONES', 2000],
              ],
            },
          ],
          steps: [
            {
              note: '5000은 가장 큰 값이므로 세 함수 모두 1을 부여합니다.',
              resultLabel: '순위 계산',
              columns: ['ENAME', 'SAL', 'RANK', 'DENSE_RANK', 'ROW_NUMBER'],
              rows: [['KING', 5000, 1, 1, 1]],
            },
            {
              note: '3000인 두 행은 RANK와 DENSE_RANK에서 공동 2위입니다. ROW_NUMBER는 이름 기준까지 적용해 2와 3으로 나눕니다.',
              resultLabel: '순위 계산',
              columns: ['ENAME', 'SAL', 'RANK', 'DENSE_RANK', 'ROW_NUMBER'],
              rows: [
                ['KING', 5000, 1, 1, 1],
                ['FORD', 3000, 2, 2, 2],
                ['SCOTT', 3000, 2, 2, 3],
              ],
            },
            {
              note: '다음 행은 RANK가 자리를 건너뛰어 4, DENSE_RANK는 연속된 3을 부여합니다.',
              resultLabel: '최종 결과',
              columns: ['ENAME', 'SAL', 'RANK', 'DENSE_RANK', 'ROW_NUMBER'],
              rows: [
                ['KING', 5000, 1, 1, 1],
                ['FORD', 3000, 2, 2, 2],
                ['SCOTT', 3000, 2, 2, 3],
                ['JONES', 2000, 4, 3, 4],
              ],
            },
          ],
          doneNote: '완료 — RANK는 다음 순위를 건너뛰고 DENSE_RANK는 연속 순위를 사용합니다.',
        },
      },
      {
        kind: 'trap',
        text: 'Top N 을 뽑을 때 `ROW_NUMBER` 를 쓰면 동점자가 잘려나간다. "상위 3명"의 정의가 동점 포함이면 `RANK`, 정확히 3행이면 `ROW_NUMBER` 다. 선지에서 이걸 바꿔치기한다.',
      },
    ],
  },
  {
    id: 'w5',
    heading: 'PARTITION BY와 누적 집계',
    blanks: [
      { id: 'b6', answer: '다시 시작', accepts: ['다시 시작', '초기화', '리셋'] },
      { id: 'b7', answer: '유지', accepts: ['유지', '그대로 유지', '줄지 않는다'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '`PARTITION BY`는 계산 범위를 그룹처럼 나누지만 GROUP BY와 달리 원래 행은 {{b7}}한다. 파티션이 바뀌면 누적 계산도 {{b6}}한다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query:
            'SELECT DEPTNO, ENAME, SAL, SUM(SAL) OVER (PARTITION BY DEPTNO ORDER BY SAL DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RUNNING_SAL FROM EMP',
          sources: [
            {
              label: 'EMP',
              columns: ['DEPTNO', 'ENAME', 'SAL'],
              rows: [
                [10, 'KING', 5000],
                [10, 'CLARK', 2450],
                [20, 'SCOTT', 3000],
                [20, 'JONES', 2975],
              ],
            },
          ],
          steps: [
            {
              note: '10번 부서 안에서 급여 내림차순으로 누적합니다.',
              resultLabel: '10번 파티션',
              columns: ['DEPTNO', 'ENAME', 'SAL', 'RUNNING_SAL'],
              rows: [
                [10, 'KING', 5000, 5000],
                [10, 'CLARK', 2450, 7450],
              ],
            },
            {
              note: '부서번호가 20으로 바뀌면 누적 합계가 0부터 다시 시작합니다.',
              resultLabel: '20번 파티션 추가',
              columns: ['DEPTNO', 'ENAME', 'SAL', 'RUNNING_SAL'],
              rows: [
                [10, 'KING', 5000, 5000],
                [10, 'CLARK', 2450, 7450],
                [20, 'SCOTT', 3000, 3000],
              ],
            },
            {
              note: '20번 부서 안에서만 다음 행의 급여를 이어서 더합니다.',
              resultLabel: '최종 결과',
              columns: ['DEPTNO', 'ENAME', 'SAL', 'RUNNING_SAL'],
              rows: [
                [10, 'KING', 5000, 5000],
                [10, 'CLARK', 2450, 7450],
                [20, 'SCOTT', 3000, 3000],
                [20, 'JONES', 2975, 5975],
              ],
            },
          ],
          doneNote: '완료 — 행은 그대로 유지되고 부서별 누적 합계만 새 열로 추가됩니다.',
        },
      },
      {
        kind: 'trap',
        text: '`PARTITION BY`를 생략하면 조회 결과 전체가 하나의 파티션이 된다. GROUP BY처럼 행 수를 줄이지 않는다는 점을 구분한다.',
      },
    ],
  },
  {
    id: 'w6',
    heading: 'ROWS와 RANGE 윈도우 프레임',
    blanks: [
      { id: 'b8', answer: '물리적 행', accepts: ['물리적 행', '행', '개별 행'] },
      { id: 'b9', answer: '동일한 정렬값', accepts: ['동일한 정렬값', '같은 정렬값', '동점'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '`ROWS`는 현재 위치까지의 {{b8}}을 기준으로 범위를 잡는다. `RANGE`는 현재 행과 {{b9}}을 가진 행을 같은 경계로 취급한다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query:
            'SELECT NAME, AMOUNT, SUM(AMOUNT) OVER (ORDER BY AMOUNT, NAME ROWS UNBOUNDED PRECEDING) ROWS_SUM, SUM(AMOUNT) OVER (ORDER BY AMOUNT RANGE UNBOUNDED PRECEDING) RANGE_SUM FROM SALES',
          sources: [
            {
              label: 'SALES',
              columns: ['NAME', 'AMOUNT'],
              rows: [
                ['A', 100],
                ['B', 100],
                ['C', 200],
              ],
            },
          ],
          steps: [
            {
              note: 'ROWS는 개별 행 위치를 따르므로 첫 행 A까지의 합계는 100입니다.',
              resultLabel: '첫 번째 행',
              columns: ['NAME', 'AMOUNT', 'ROWS_SUM', 'RANGE_SUM'],
              rows: [['A', 100, 100, 200]],
            },
            {
              note: 'RANGE는 AMOUNT가 같은 A와 B를 동점 경계로 묶어 두 행 모두 200을 봅니다.',
              resultLabel: '동일 정렬값 처리',
              columns: ['NAME', 'AMOUNT', 'ROWS_SUM', 'RANGE_SUM'],
              rows: [
                ['A', 100, 100, 200],
                ['B', 100, 200, 200],
              ],
            },
            {
              note: '200인 C까지 오면 두 프레임 모두 전체 합계 400이 됩니다.',
              resultLabel: '최종 결과',
              columns: ['NAME', 'AMOUNT', 'ROWS_SUM', 'RANGE_SUM'],
              rows: [
                ['A', 100, 100, 200],
                ['B', 100, 200, 200],
                ['C', 200, 400, 400],
              ],
            },
          ],
          doneNote:
            '완료 — 정렬값이 같은 행이 있을 때 ROWS와 RANGE의 누적 결과가 달라질 수 있습니다.',
        },
      },
      {
        kind: 'trap',
        text: '윈도우 함수에 ORDER BY만 쓰고 프레임을 생략하면 함수와 DBMS 규칙에 따른 기본 프레임이 적용된다. 행 단위 누적이 필요하면 `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`처럼 명시한다.',
      },
    ],
  },
];
