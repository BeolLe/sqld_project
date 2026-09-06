import type { LearnBlock } from '../types';

/** 2과목 · SQL 기본 · ORDER BY 절 */
export const sbOrderBlocks: LearnBlock[] = [
  {
    id: 'o1',
    heading: 'ORDER BY의 역할',
    blanks: [
      { id: 'b1', answer: 'ORDER BY', accepts: ['order by', 'orderby', '오더 바이'] },
      { id: 'b2', answer: 'ASC', accepts: ['asc', '오름차순'] },
      { id: 'b3', answer: 'DESC', accepts: ['desc', '내림차순'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '{{b1}}는 조회가 끝난 결과의 표시 순서를 정한다. {{b2}}는 작은 값부터 정렬하는 오름차순이고 기본값이므로 생략할 수 있다. {{b3}}는 큰 값부터 정렬하는 내림차순이다.',
      },
      {
        kind: 'table',
        head: ['SQL', '정렬 결과'],
        rows: [
          ['`ORDER BY 급여`', '급여 오름차순'],
          ['`ORDER BY 급여 ASC`', '급여 오름차순'],
          ['`ORDER BY 급여 DESC`', '급여 내림차순'],
          ['`ORDER BY 부서번호 ASC, 급여 DESC`', '부서번호가 같으면 급여 내림차순'],
        ],
      },
      {
        kind: 'p',
        text: '정렬 기준을 여러 개 쓰면 왼쪽 기준부터 적용한다. 앞 기준의 값이 같은 행끼리만 다음 기준으로 순서를 결정한다.',
      },
      {
        kind: 'memory',
        text: 'ASC = 오름차순·기본값 · DESC = 내림차순 · 여러 기준은 왼쪽부터',
      },
    ],
  },
  {
    id: 'o2',
    heading: '정렬 기준 작성 방법',
    blanks: [
      { id: 'b4', answer: '별칭', accepts: ['별칭', 'alias', '알리아스'] },
      { id: 'b5', answer: '열 순서 번호', accepts: ['열 순서 번호', '컬럼 순서 번호', '열 번호', '컬럼 번호'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'ORDER BY에는 열 이름, 표현식, SELECT에서 만든 {{b4}}, SELECT 목록의 {{b5}}를 사용할 수 있다.',
      },
      {
        kind: 'table',
        head: ['작성법', '예시', '의미'],
        rows: [
          ['열 이름', '`ORDER BY 급여 DESC`', '급여를 기준으로 정렬'],
          ['표현식', '`ORDER BY 급여 + NVL(수당, 0) DESC`', '계산 결과로 정렬'],
          ['SELECT 별칭', '`ORDER BY 총액 DESC`', 'SELECT에서 만든 총액 별칭으로 정렬'],
          ['열 순서 번호', '`ORDER BY 2 DESC`', 'SELECT 목록의 두 번째 열로 정렬'],
        ],
      },
      {
        kind: 'p',
        text: 'ORDER BY는 SELECT 다음에 처리되므로 SELECT 별칭을 사용할 수 있다. 열 순서 번호는 SELECT 목록이 바뀌면 의미도 달라지므로 문제에서는 번호가 어느 열을 가리키는지 먼저 확인한다.',
      },
      {
        kind: 'trap',
        text: '`ORDER BY 2`의 숫자 2는 값 2를 뜻하는 것이 아니라 SELECT 목록의 두 번째 열을 뜻한다.',
      },
    ],
  },
  {
    id: 'o3',
    heading: 'Oracle의 NULL 정렬',
    blanks: [
      { id: 'b6', answer: 'NULLS FIRST', accepts: ['nulls first', '널스 퍼스트'] },
      { id: 'b7', answer: 'NULLS LAST', accepts: ['nulls last', '널스 라스트'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: 'Oracle에서 별도 옵션이 없으면 오름차순에서는 NULL이 마지막, 내림차순에서는 NULL이 처음에 배치된다. {{b6}}와 {{b7}}를 사용하면 정렬 방향과 관계없이 NULL의 위치를 직접 지정할 수 있다.',
      },
      {
        kind: 'table',
        head: ['Oracle 정렬', 'NULL의 기본 위치'],
        rows: [
          ['`ORDER BY 수당 ASC`', '마지막'],
          ['`ORDER BY 수당 DESC`', '처음'],
          ['`ORDER BY 수당 ASC NULLS FIRST`', '처음으로 직접 지정'],
          ['`ORDER BY 수당 DESC NULLS LAST`', '마지막으로 직접 지정'],
        ],
      },
      {
        kind: 'memory',
        text: 'Oracle 기본값 = ASC는 NULLS LAST · DESC는 NULLS FIRST',
      },
      {
        kind: 'trap',
        text: 'NULL 정렬의 기본 위치는 DBMS에 따라 다를 수 있다. SQLD의 Oracle 기준 문제에서는 ASC일 때 마지막, DESC일 때 처음으로 판단한다.',
      },
    ],
  },
  {
    id: 'o4',
    heading: 'ORDER BY의 사용 규칙과 함정',
    blanks: [
      { id: 'b8', answer: 'DISTINCT', accepts: ['distinct', '디스팅트'] },
      { id: 'b9', answer: '보장되지 않는다', accepts: ['보장되지 않는다', '보장 안됨', '알 수 없다'] },
    ],
    nodes: [
      {
        kind: 'p',
        text: '일반 SELECT에서는 출력하지 않은 테이블 열을 ORDER BY에 사용할 수 있다. 하지만 {{b8}}를 사용하면 Oracle의 ORDER BY 표현식은 SELECT 목록에 포함되어 있어야 한다.',
      },
      {
        kind: 'table',
        head: ['SQL', '판단'],
        rows: [
          ['`SELECT 사원명 FROM 사원 ORDER BY 급여 DESC`', '일반 SELECT이므로 가능'],
          ['`SELECT DISTINCT 부서번호 FROM 사원 ORDER BY 급여`', '급여가 SELECT 목록에 없어 Oracle에서 오류'],
          ['`SELECT 부서번호, COUNT(*) FROM 사원 GROUP BY 부서번호 ORDER BY COUNT(*) DESC`', '그룹별 인원 수로 정렬하므로 가능'],
        ],
      },
      {
        kind: 'p',
        text: 'ORDER BY가 없으면 결과 행의 순서는 {{b9}}. 같은 정렬값을 가진 행들의 순서도 추가 기준을 지정하지 않으면 보장되지 않는다.',
      },
      {
        kind: 'trap',
        text: '테이블에 저장된 순서나 이전 실행에서 보였던 순서를 믿으면 안 된다. 필요한 순서를 확실히 얻는 방법은 ORDER BY에 정렬 기준을 모두 명시하는 것이다.',
      },
    ],
  },
  {
    id: 'o5',
    heading: '핵심 정리',
    blanks: [],
    nodes: [
      {
        kind: 'list',
        items: [
          'ORDER BY는 조회 결과의 표시 순서를 정하며 논리적으로 가장 마지막에 처리된다',
          'ASC는 오름차순이자 기본값이고 DESC는 내림차순이다',
          '정렬 기준이 여러 개면 왼쪽 기준부터 적용한다',
          'ORDER BY에는 열, 표현식, SELECT 별칭, SELECT 열 순서 번호를 사용할 수 있다',
          'Oracle에서 NULL은 기본적으로 ASC에서 마지막, DESC에서 처음에 온다',
          'ORDER BY가 없거나 정렬값이 같으면 행의 세부 순서는 보장되지 않는다',
        ],
      },
    ],
  },
];
