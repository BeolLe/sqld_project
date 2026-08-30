import type { LearnBlock } from '../types';

/** 2과목 · SQL 기본 · 함수 */
export const sbFuncBlocks: LearnBlock[] = [
  {
    id: 'f1',
    heading: '단일행 함수와 다중행 함수',
    blanks: [
      {
        id: 'b1',
        answer: '단일행 함수',
        accepts: ['단일행 함수', '단일행함수', 'single row function'],
      },
      {
        id: 'b2',
        answer: '다중행 함수',
        accepts: ['다중행 함수', '다중행함수', '그룹 함수', '집계 함수'],
      },
    ],
    nodes: [
      {
        kind: 'p',
        text: '함수는 값을 받아 정해진 계산이나 변환을 수행하고 결과를 반환한다. {{b1}}는 입력 행마다 결과 하나를 만들고, {{b2}}는 여러 행을 모아 하나의 결과를 만든다.',
      },
      {
        kind: 'table',
        head: ['구분', '처리 방식', '대표 예'],
        rows: [
          ['{{b1}}', '각 행을 독립적으로 처리', '`UPPER`, `ROUND`, `TO_CHAR`, `NVL`'],
          ['{{b2}}', '여러 행을 한 그룹으로 처리', '`SUM`, `AVG`, `COUNT`, `MAX`, `MIN`'],
        ],
      },
      {
        kind: 'p',
        text: '단일행 함수는 SELECT, WHERE, ORDER BY 등에 사용할 수 있고 서로 중첩할 수 있다. 중첩된 함수는 가장 안쪽 함수부터 바깥쪽으로 계산한다.',
      },
      {
        kind: 'trap',
        text: '단일행 함수는 **행마다 하나**, 다중행 함수는 **그룹마다 하나**의 결과를 만든다. 집계 함수의 상세 규칙은 뒤 단원에서 다룬다.',
      },
    ],
  },
  {
    id: 'f2',
    heading: '문자 함수',
    blanks: [
      { id: 'b3', answer: 'SUBSTR', accepts: ['substr', 'substring'] },
      { id: 'b4', answer: 'INSTR', accepts: ['instr'] },
      { id: 'b5', answer: 'LPAD', accepts: ['lpad'] },
    ],
    nodes: [
      {
        kind: 'table',
        head: ['함수', '반환하는 값', '예시'],
        rows: [
          [
            '`UPPER` / `LOWER` / `INITCAP`',
            '대문자 / 소문자 / 단어 첫 글자 대문자로 변환',
            "`UPPER('Sql')` → `SQL`",
          ],
          ['`LENGTH` / `LENGTHB`', '문자 수 / 바이트 수', "`LENGTH('SQL')` → `3`"],
          ['{{b3}}', '지정한 위치부터 원하는 길이의 문자열 추출', "`SUBSTR('SQLD', 2, 2)` → `QL`"],
          ['{{b4}}', '문자열이 나타난 위치를 숫자로 반환', "`INSTR('ABCABC', 'BC', 1, 2)` → `5`"],
          [
            '`LTRIM` / `RTRIM` / `TRIM`',
            '왼쪽 / 오른쪽 / 양쪽의 지정 문자 제거',
            "`TRIM(' SQL ')` → `SQL`",
          ],
          [
            '{{b5}} / `RPAD`',
            '전체 길이가 되도록 왼쪽 / 오른쪽을 채움',
            "`LPAD('7', 3, '0')` → `007`",
          ],
          ['`REPLACE`', '찾은 문자열을 다른 문자열로 바꿈', "`REPLACE('A-B', '-', '/')` → `A/B`"],
        ],
      },
      {
        kind: 'p',
        text: 'Oracle에서 문자 위치는 1부터 센다. `SUBSTR(문자열, 시작위치, 길이)`는 문자열을 반환하고, `INSTR(문자열, 찾을 값, 시작위치, 출현순서)`는 위치를 숫자로 반환한다. 뒤의 두 인수를 생략하면 처음부터 첫 번째 위치를 찾는다.',
      },
      {
        kind: 'memory',
        text: 'SUBSTR = 문자열 추출 · INSTR = 위치 숫자 · LPAD/RPAD = 정해진 길이까지 채우기',
      },
      {
        kind: 'trap',
        text: '함수가 중첩되면 안쪽부터 계산한다. `LPAD(SUBSTR(...), ...)`라면 먼저 SUBSTR 결과를 구한 뒤 LPAD를 적용한다.',
      },
    ],
  },
  {
    id: 'f3',
    heading: '숫자 함수',
    blanks: [
      { id: 'b6', answer: 'ROUND', accepts: ['round'] },
      { id: 'b7', answer: 'TRUNC', accepts: ['trunc'] },
      { id: 'b8', answer: 'MOD', accepts: ['mod'] },
    ],
    nodes: [
      {
        kind: 'table',
        head: ['함수', '의미', '예시'],
        rows: [
          ['{{b6}}', '지정한 자리에서 반올림', '`ROUND(4.567, 2)` → `4.57`'],
          ['{{b7}}', '지정한 자리 아래를 버림', '`TRUNC(4.567, 2)` → `4.56`'],
          ['`CEIL`', '입력값보다 크거나 같은 최소 정수', '`CEIL(3.2)` → `4`'],
          ['`FLOOR`', '입력값보다 작거나 같은 최대 정수', '`FLOOR(3.8)` → `3`'],
          ['{{b8}}', '나눗셈의 나머지', '`MOD(15, 4)` → `3`'],
        ],
      },
      {
        kind: 'p',
        text: 'ROUND와 TRUNC의 두 번째 인수는 처리할 자리다. `0`이면 정수 자리, 양수면 소수점 오른쪽, 음수면 소수점 왼쪽의 십·백 자리 등을 처리한다.',
      },
      {
        kind: 'trap',
        text: '음수에서는 CEIL과 FLOOR를 직선 위에서 생각한다. `CEIL(-3.7)`은 -3, `FLOOR(-3.7)`은 -4다.',
      },
    ],
  },
  {
    id: 'f4',
    heading: '날짜 함수와 날짜 연산',
    blanks: [
      { id: 'b9', answer: 'SYSDATE', accepts: ['sysdate'] },
      { id: 'b10', answer: 'ADD_MONTHS', accepts: ['add_months', 'addmonths'] },
      { id: 'b11', answer: 'MONTHS_BETWEEN', accepts: ['months_between', 'monthsbetween'] },
      { id: 'b12', answer: 'LAST_DAY', accepts: ['last_day', 'lastday'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'Oracle의 {{b9}}는 데이터베이스 서버의 현재 날짜와 시간을 반환한다. SQL Server에서는 같은 목적으로 `GETDATE()`를 사용한다. Oracle에서는 날짜에 숫자를 더하거나 빼면 그만큼의 **일수**가 이동하고, 날짜끼리 빼면 두 날짜 사이의 일수가 나온다.',
      },
      {
        kind: 'table',
        head: ['함수·연산', '결과'],
        rows: [
          ['`날짜 + 7`', '7일 뒤 날짜'],
          ['`날짜1 - 날짜2`', '두 날짜 사이의 일수'],
          ['{{b10}}`(날짜, n)`', 'n개월 뒤 또는 앞의 날짜'],
          ['{{b11}}`(날짜1, 날짜2)`', '두 날짜 사이의 개월 수'],
          ['{{b12}}`(날짜)`', '해당 월의 마지막 날짜'],
          ['`NEXT_DAY(날짜, 요일)`', '지정한 날짜 다음에 오는 해당 요일'],
        ],
      },
      {
        kind: 'p',
        text: 'ADD_MONTHS는 원래 날짜가 월말이거나 이동한 달에 같은 날짜가 없으면 결과 월의 마지막 날로 맞춘다. 예를 들어 2024년 1월 31일에 한 달을 더하면 2024년 2월 29일이다.',
      },
      {
        kind: 'trap',
        text: '`MONTHS_BETWEEN(날짜1, 날짜2)`는 날짜1이 날짜2보다 늦으면 양수, 이르면 음수가 된다. 두 날짜의 일자가 같거나 둘 다 월말이면 정수 개월 수가 된다.',
      },
    ],
  },
  {
    id: 'f5',
    heading: '명시적 데이터형 변환',
    blanks: [
      { id: 'b13', answer: 'TO_CHAR', accepts: ['to_char', 'tochar'] },
      { id: 'b14', answer: 'TO_DATE', accepts: ['to_date', 'todate'] },
      { id: 'b15', answer: 'TO_NUMBER', accepts: ['to_number', 'tonumber'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'DBMS가 데이터형을 자동으로 바꾸는 것을 암시적 변환, 함수로 변환 대상과 형식을 직접 지정하는 것을 명시적 변환이라고 한다. 결과와 환경 의존성을 예측하기 쉬운 **명시적 변환이 안전하다.**',
      },
      {
        kind: 'table',
        head: ['함수', '변환 방향', '예시'],
        rows: [
          ['{{b13}}', '숫자·날짜 → 문자', "`TO_CHAR(날짜, 'YYYY-MM-DD')`"],
          ['{{b14}}', '문자 → 날짜', "`TO_DATE('20260829', 'YYYYMMDD')`"],
          ['{{b15}}', '문자 → 숫자', "`TO_NUMBER('1,200', '9,999')`"],
        ],
      },
      {
        kind: 'p',
        text: '날짜 형식에서 `YYYY`는 네 자리 연도, `MM`은 월, `DD`는 일이다. 숫자 형식의 `9`는 값이 있을 때 표시하는 자리, `0`은 값이 없어도 0으로 채우는 자리를 뜻한다. Oracle의 `FM`은 형식의 고정 길이를 맞추기 위해 자동으로 붙는 공백이나 앞자리 0을 제거한다.',
      },
      {
        kind: 'trap',
        text: '문자와 숫자·날짜를 그대로 비교하면 DBMS의 데이터형 변환 규칙에 따라 암시적 변환이 발생한다. 날짜·숫자 문자열의 해석은 DB에 설정된 날짜·숫자 형식의 영향을 받을 수 있다. 따라서 시험에서는 어떤 값이 어떤 데이터형으로 변환되는지와 변환 오류 가능성을 확인한다.',
      },
    ],
  },
  {
    id: 'f6',
    heading: 'NULL 처리 함수',
    blanks: [
      { id: 'b16', answer: 'NVL', accepts: ['nvl'] },
      { id: 'b17', answer: 'NVL2', accepts: ['nvl2'] },
      { id: 'b18', answer: 'NULLIF', accepts: ['nullif'] },
      { id: 'b19', answer: 'COALESCE', accepts: ['coalesce'] },
    ],
    nodes: [
      {
        kind: 'table',
        head: ['함수', '판단과 반환'],
        rows: [
          ['{{b16}}`(값, 대체값)`', 'Oracle 함수 · 값이 NULL이면 대체값, 아니면 원래 값'],
          ['{{b17}}`(값, A, B)`', '값이 NULL이 아니면 A, NULL이면 B'],
          ['{{b18}}`(A, B)`', 'A와 B가 같으면 NULL, 다르면 A'],
          ['{{b19}}`(A, B, ...)`', 'ANSI 표준 · 왼쪽부터 처음 만나는 NULL이 아닌 값'],
        ],
      },
      {
        kind: 'p',
        text: '`NVL2(값, A, B)`는 **NULL이 아니면 A, NULL이면 B**다. COALESCE는 인수를 여러 개 받을 수 있으며 모두 NULL이면 NULL을 반환한다.',
      },
      {
        kind: 'memory',
        text: 'NVL 대체 · NVL2 NOT NULL이면 두 번째 · NULLIF 같으면 NULL · COALESCE 첫 번째 NOT NULL',
      },
      {
        kind: 'trap',
        text: 'NULL은 `= NULL`로 비교하지 않고 `IS NULL` 또는 `IS NOT NULL`을 사용한다. NULL 처리 함수의 반환값끼리 데이터형이 호환되는지도 확인한다.',
      },
    ],
  },
  {
    id: 'f7',
    heading: 'CASE 표현식과 DECODE',
    blanks: [
      { id: 'b20', answer: 'CASE', accepts: ['case', '케이스'] },
      { id: 'b21', answer: 'DECODE', accepts: ['decode', '디코드'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '{{b20}}는 WHEN을 위에서부터 확인하여 **처음 TRUE가 된 결과를 반환한다.** 단순 CASE는 하나의 값을 여러 값과 비교하고, 검색 CASE는 `WHEN 급여 >= 5000`처럼 범위·복합 조건도 사용할 수 있다.',
      },
      {
        kind: 'table',
        head: ['구분', '가능한 비교', '특징'],
        rows: [
          ['단순 CASE', '`CASE 값 WHEN 비교값 THEN 결과`', '값이 같은지 비교'],
          ['검색 CASE', '`CASE WHEN 조건 THEN 결과`', '부등호·범위·NULL 등 다양한 조건'],
          [
            '{{b21}}',
            '`DECODE(값, 비교값, 결과, 기본값)`',
            'Oracle 전용 · 기본적으로 같은 값 비교',
          ],
        ],
      },
      {
        kind: 'p',
        text: 'CASE와 DECODE 모두 조건에 맞는 결과가 없으면 ELSE 또는 기본값을 반환하고, 그것도 생략하면 NULL을 반환한다.',
      },
      {
        kind: 'trap',
        text: 'Oracle의 DECODE는 NULL과 NULL을 같은 값으로 취급한다. 하지만 `CASE 값 WHEN NULL`은 NULL을 찾지 못하므로, CASE에서는 `CASE WHEN 값 IS NULL THEN ...`처럼 작성한다.',
      },
    ],
  },
  {
    id: 'f8',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          '단일행 함수는 입력 행마다 하나, 다중행 함수는 그룹마다 하나의 결과를 만든다',
          '중첩 함수는 가장 안쪽부터 바깥쪽으로 계산한다',
          'ROUND는 반올림, TRUNC는 버림, MOD는 나머지를 반환한다',
          '날짜에 숫자를 더하면 일수가 이동하고 날짜끼리 빼면 일수 차이가 나온다',
          'TO_CHAR는 문자로, TO_DATE는 날짜로, TO_NUMBER는 숫자로 변환한다',
          'NVL2는 NULL이 아니면 두 번째, NULL이면 세 번째 인수를 반환한다',
          'CASE는 다양한 조건을, DECODE는 Oracle의 같은 값 비교를 중심으로 사용한다',
        ],
      },
    ],
  },
];
