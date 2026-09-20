import type { LearnBlock } from '../types';

const CODE_ROWS = [['AB123'], ['A1234'], ['xy789'], ['CD045'], ['EF12X']];

/** 2과목 · SQL 활용 · 정규 표현식 */
export const saRegexBlocks: LearnBlock[] = [
  {
    id: 'regex1',
    heading: '정규 표현식과 LIKE의 차이',
    blanks: [{ id: 'b1', answer: '패턴', accepts: ['패턴', 'pattern', '문자 패턴'] }],
    nodes: [
      {
        kind: 'p',
        text: '`LIKE`는 `%`와 `_`로 단순한 위치를 비교한다. 정규 표현식은 반복 횟수, 문자 종류, 시작과 끝을 조합해 더 구체적인 문자열 {{b1}}을 검사한다.',
      },
      {
        kind: 'table',
        head: ['요구사항', '예시'],
        rows: [
          ['A로 시작', "`LIKE 'A%'` 또는 `REGEXP_LIKE(CODE, '^A')`"],
          ['영문 대문자 2자 + 숫자 3자', "`REGEXP_LIKE(CODE, '^[A-Z]{2}[0-9]{3}$')`"],
          ['숫자가 하나 이상 포함', "`REGEXP_LIKE(CODE, '[0-9]+')`"],
        ],
      },
      {
        kind: 'trap',
        text: '정규 표현식에서 `.`은 임의의 한 문자다. 실제 마침표를 찾으려면 `\\.`처럼 메타 문자의 특별한 의미를 없애야 한다.',
      },
    ],
  },
  {
    id: 'regex2',
    heading: '범위와 반복을 읽는 법',
    blanks: [
      { id: 'b2', answer: '시작', accepts: ['시작', '문자열 시작'] },
      { id: 'b3', answer: '끝', accepts: ['끝', '문자열 끝', '종료'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '`^`는 문자열의 {{b2}}, `$`는 문자열의 {{b3}}을 뜻한다. 둘을 함께 사용해야 문자열 전체가 패턴과 일치하는지 검사할 수 있다.',
      },
      {
        kind: 'table',
        head: ['기호', '의미'],
        rows: [
          ['`[ABC]` / `[^ABC]`', 'A·B·C 중 한 문자 / A·B·C가 아닌 한 문자'],
          ['`[A-Z]` / `[[:digit:]]`', '영문 대문자 / 숫자 문자'],
          ['`*` / `+` / `?`', '0회 이상 / 1회 이상 / 0회 또는 1회'],
          ['`{m}` / `{m,n}`', '정확히 m회 / m회 이상 n회 이하'],
          ['`|` / `( )`', '또는 / 묶음과 하위 표현식'],
        ],
      },
      {
        kind: 'memory',
        text: '`^[A-Z]{2}[0-9]{3}$` = 처음부터 끝까지 대문자 2자와 숫자 3자',
      },
    ],
  },
  {
    id: 'regex3',
    heading: 'REGEXP_LIKE로 행 필터링',
    blanks: [{ id: 'b4', answer: 'TRUE', accepts: ['true', '참'] }],
    nodes: [
      {
        kind: 'p',
        text: '`REGEXP_LIKE(문자열, 패턴)`는 문자열이 패턴과 일치하면 {{b4}}가 되어 WHERE 조건을 통과한다. 세 번째 인자의 `i`는 대소문자를 구분하지 않고, `c`는 구분한다.',
      },
      {
        kind: 'viz',
        spec: {
          kind: 'staged',
          query: "SELECT CODE FROM ITEMS WHERE REGEXP_LIKE(CODE, '^[A-Z]{2}[0-9]{3}$', 'c')",
          sources: [{ label: 'ITEMS', columns: ['CODE'], rows: CODE_ROWS }],
          steps: [
            {
              note: '① 시작부터 대문자 2자를 확인합니다. 소문자 xy와 대문자가 1자인 A1234는 제외됩니다.',
              resultLabel: '대문자 2자 검사',
              columns: ['CODE', '판정'],
              rows: [
                ['AB123', '통과'],
                ['A1234', '실패'],
                ['xy789', '실패'],
                ['CD045', '통과'],
                ['EF12X', '통과'],
              ],
            },
            {
              note: '② 뒤의 세 문자가 모두 숫자이고 그 자리에서 문자열이 끝나는지 확인합니다.',
              resultLabel: '최종 결과',
              columns: ['CODE'],
              rows: [['AB123'], ['CD045']],
            },
          ],
          doneNote: '대문자 2자와 숫자 3자로만 이루어진 코드 두 개가 남았습니다.',
        },
      },
      {
        kind: 'trap',
        text: '`^`와 `$`를 생략하면 문자열 일부만 패턴과 맞아도 통과할 수 있다. 전체 형식 검증 문제에서는 양쪽 경계를 먼저 확인한다.',
      },
    ],
  },
  {
    id: 'regex4',
    heading: '찾기·추출·치환 함수',
    blanks: [{ id: 'b5', answer: 'REGEXP_REPLACE', accepts: ['regexp_replace'] }],
    nodes: [
      {
        kind: 'p',
        text: '패턴을 검사하는 것 외에도 위치를 찾고, 일부를 추출하고, 다른 문자열로 바꿀 수 있다. {{b5}}는 일치한 부분을 지정한 문자열로 치환한다.',
      },
      {
        kind: 'table',
        head: ['함수', '역할', '예시 결과'],
        rows: [
          ['`REGEXP_INSTR`', '일치 위치 반환', "`REGEXP_INSTR('AB123', '[0-9]')` → `3`"],
          ['`REGEXP_SUBSTR`', '일치 문자열 반환', "`REGEXP_SUBSTR('AB123', '[0-9]+')` → `'123'`"],
          ['`REGEXP_REPLACE`', '일치 문자열 치환', "`REGEXP_REPLACE('AB123', '[0-9]', '*')` → `'AB***'`"],
          ['`REGEXP_COUNT`', '일치 횟수 반환', "`REGEXP_COUNT('A1B2', '[0-9]')` → `2`"],
        ],
      },
      {
        kind: 'trap',
        text: '`REGEXP_SUBSTR`의 occurrence는 몇 번째 일치를 반환할지 정한다. 시작 위치 position과 서로 바꿔 읽지 않도록 인자 순서를 확인한다.',
      },
    ],
  },
  {
    id: 'regex5',
    heading: '하위 표현식과 형식 변환',
    blanks: [{ id: 'b6', answer: '괄호', accepts: ['괄호', '소괄호', '그룹'] }],
    nodes: [
      {
        kind: 'p',
        text: '패턴의 {{b6}}는 여러 문자를 한 단위로 묶고 하위 표현식을 만든다. 치환 문자열에서 `\\1`, `\\2`처럼 각 그룹을 다시 참조해 표시 형식을 바꿀 수 있다.',
      },
      {
        kind: 'table',
        head: ['원본', '표현식', '결과'],
        rows: [
          ["`01012345678`", "`REGEXP_REPLACE(phone, '([0-9]{3})([0-9]{4})([0-9]{4})', '\\1-\\2-\\3')`", "`010-1234-5678`"],
          ["`20260919`", "`REGEXP_REPLACE(dt, '([0-9]{4})([0-9]{2})([0-9]{2})', '\\1-\\2-\\3')`", "`2026-09-19`"],
        ],
      },
      {
        kind: 'memory',
        text: '괄호로 묶고 → 각 그룹을 \\1, \\2, \\3으로 재사용한다.',
      },
    ],
  },
];
