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
      { id: 'b3', answer: '없다', accepts: ['없다', '없음', '포함되지 않는다', '제외된다', '안된다'] },
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
        kind: 'trap',
        text: 'Top N 을 뽑을 때 `ROW_NUMBER` 를 쓰면 동점자가 잘려나간다. "상위 3명"의 정의가 동점 포함이면 `RANK`, 정확히 3행이면 `ROW_NUMBER` 다. 선지에서 이걸 바꿔치기한다.',
      },
    ],
  },
];
