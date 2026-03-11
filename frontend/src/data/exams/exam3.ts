import type { Problem } from '../../types';

// SQLD 모의고사 3회 (기본 난이도 - 목표 합격률 ~55%)
// 1과목: 데이터 모델링의 이해 (10문항, 20점)
// 2과목: SQL 기본 및 활용 (40문항, 80점)
// 난이도 배분: easy 20 / medium 20 / hard 10

export const EXAM_3_PROBLEMS: Problem[] = [
  // ===== 1과목: 데이터 모델링의 이해 (1~10번) =====
  {
    id: 'exam3_p1',
    title: '1. 개념적 데이터 모델링',
    description:
      '개념적 데이터 모델링에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 82,
    answer: '1',
    explanation:
      '개념적 데이터 모델링은 업무의 핵심 엔터티와 그 관계를 도출하는 단계로, 전사적 관점에서 포괄적으로 수행됩니다. 물리적 구현이나 성능은 이 단계에서 고려하지 않습니다.',
    options: [
      '업무의 핵심 엔터티와 관계를 도출하는 추상화 수준이 가장 높은 단계이다.',
      '정규화를 수행하고 KEY를 확정하는 단계이다.',
      '테이블, 인덱스 등 물리적 구조를 설계하는 단계이다.',
      '성능 최적화를 위한 반정규화를 수행하는 단계이다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p2',
    title: '2. 엔터티와 인스턴스',
    description:
      '다음 중 엔터티와 인스턴스의 관계에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 80,
    answer: '2',
    explanation:
      '엔터티는 데이터의 집합(유형)이고, 인스턴스는 엔터티에 속하는 개별 데이터(행)입니다. 예: 사원 엔터티에 "홍길동", "김영희"는 각각 인스턴스입니다.',
    options: [
      '하나의 인스턴스는 여러 엔터티에 동시에 속할 수 있다.',
      '엔터티는 데이터의 집합이고, 인스턴스는 엔터티에 속하는 개별 행이다.',
      '인스턴스가 없어도 엔터티는 존재할 수 있다.',
      '엔터티와 인스턴스는 동일한 개념이다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p3',
    title: '3. 주식별자 선정 기준',
    description:
      '주식별자(Primary Identifier) 선정 기준으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 72,
    answer: '4',
    explanation:
      '주식별자는 자주 변경되지 않는 안정적인 속성이어야 합니다. 자주 변경되는 속성을 식별자로 선정하면 참조 관계에 있는 자식 테이블의 데이터도 모두 변경해야 하므로 부적합합니다.',
    options: [
      '해당 엔터티를 대표할 수 있어야 한다.',
      '유일성을 보장해야 한다.',
      '가능한 최소한의 속성으로 구성해야 한다.',
      '자주 변경되는 속성이어야 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p4',
    title: '4. 관계의 참여도',
    description:
      '부서와 사원의 관계에서 "모든 부서에 반드시 1명 이상의 사원이 있어야 한다"면, 부서 입장에서의 참여도는?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 75,
    answer: '1',
    explanation:
      '"반드시 1명 이상"이라는 조건은 부서가 사원과의 관계에 필수적으로 참여해야 함을 의미합니다. 이는 필수 참여(Mandatory Participation)입니다.',
    options: [
      '필수 참여(Mandatory)',
      '선택 참여(Optional)',
      '배타 참여(Exclusive)',
      '조건부 참여(Conditional)',
    ],
    points: 10,
  },
  {
    id: 'exam3_p5',
    title: '5. M:N 관계 해소',
    description:
      'M:N(다대다) 관계를 해소하는 방법으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 65,
    answer: '3',
    explanation:
      'M:N 관계는 물리적으로 직접 구현할 수 없으므로, 중간에 연결(교차) 엔터티를 추가하여 1:M + M:1로 분해합니다. 예: 학생-수강-과목.',
    options: [
      '한쪽 엔터티를 삭제한다.',
      'FOREIGN KEY를 양쪽에 추가한다.',
      '교차(연결) 엔터티를 추가하여 1:M 관계 두 개로 분해한다.',
      '관계를 무시하고 각각 독립적으로 관리한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p6',
    title: '6. 슈퍼타입과 서브타입',
    description:
      '슈퍼타입/서브타입 모델에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 58,
    answer: '2',
    explanation:
      '슈퍼타입/서브타입은 공통 속성을 슈퍼타입에, 고유 속성을 서브타입에 배치하는 모델입니다. 물리적 구현 시 단일 테이블(All-in-One), 슈퍼+서브 테이블, 서브타입별 개별 테이블 등 3가지 방법으로 변환 가능합니다.',
    options: [
      '슈퍼타입은 항상 물리적 테이블로 생성해야 한다.',
      '공통 속성은 슈퍼타입에, 고유 속성은 서브타입에 배치한다.',
      '서브타입은 슈퍼타입과 관계를 가질 수 없다.',
      '하나의 슈퍼타입에 하나의 서브타입만 가능하다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p7',
    title: '7. 함수적 종속',
    description:
      '함수적 종속(Functional Dependency)에 대한 설명으로 올바른 것은?\n\n학번 → 학생이름, 학번 → 학과\n일 때:',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 62,
    answer: '1',
    explanation:
      '학번이 결정되면 학생이름과 학과가 유일하게 결정되므로, 학번은 결정자(Determinant)이고 학생이름, 학과는 종속자(Dependent)입니다.',
    options: [
      '학번은 결정자이고, 학생이름과 학과는 종속자이다.',
      '학생이름은 결정자이고, 학번은 종속자이다.',
      '학번과 학생이름은 상호 종속 관계이다.',
      '함수적 종속은 M:N 관계를 의미한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p8',
    title: '8. 부분 함수 종속',
    description:
      '다음 테이블에서 부분 함수 종속이 발생하는 속성은?\n\n기본키: (학번, 과목코드)\n속성: 학생이름, 성적\n\n학번 → 학생이름\n(학번, 과목코드) → 성적',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 48,
    answer: '1',
    explanation:
      '학생이름은 기본키의 일부인 학번에만 종속(학번 → 학생이름)되므로 부분 함수 종속입니다. 성적은 (학번, 과목코드) 전체에 종속되므로 완전 함수 종속입니다. 이 부분 함수 종속을 제거하는 것이 2NF입니다.',
    options: [
      '학생이름',
      '성적',
      '학번',
      '과목코드',
    ],
    points: 10,
  },
  {
    id: 'exam3_p9',
    title: '9. 반정규화 기법',
    description:
      '다음 중 반정규화 기법에 해당하지 않는 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 55,
    answer: '4',
    explanation:
      '반정규화 기법에는 테이블 병합, 테이블 분할, 중복 테이블 추가, 중복 컬럼/관계 추가 등이 있습니다. 인덱스 생성은 물리적 성능 향상 기법이지 반정규화에 해당하지 않습니다.',
    options: [
      '테이블 병합(1:1 또는 1:M 관계 병합)',
      '중복 컬럼 추가',
      '테이블 분할(수직/수평)',
      '인덱스 추가',
    ],
    points: 10,
  },
  {
    id: 'exam3_p10',
    title: '10. NULL과 연산',
    description:
      '다음 중 결과가 NULL이 아닌 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 72,
    answer: '4',
    explanation:
      'NULL과의 산술 연산(+, -, *, /)이나 문자열 연결 결과는 NULL입니다. 그러나 COUNT(*)는 NULL을 포함한 전체 행 수를 반환하므로 NULL이 아닙니다.',
    options: [
      'NULL + 100',
      "NULL || 'ABC'",
      'NULL * 0',
      'COUNT(*) (테이블에 NULL 행 포함)',
    ],
    points: 10,
  },

  // ===== 2과목: SQL 기본 및 활용 (11~50번) =====

  // --- DML (11~15) ---
  {
    id: 'exam3_p11',
    title: '11. BETWEEN과 IN',
    description:
      "다음 두 SQL의 결과가 동일한 것은?\n\n-- SQL1: WHERE SAL BETWEEN 1000 AND 3000\n-- SQL2: ?",
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 85,
    answer: '1',
    explanation:
      'BETWEEN A AND B는 A 이상 B 이하(A <= SAL <= B)의 범위를 의미합니다. 경계값(1000, 3000)을 포함합니다.',
    options: [
      'WHERE SAL >= 1000 AND SAL <= 3000',
      'WHERE SAL > 1000 AND SAL < 3000',
      'WHERE SAL >= 1000 OR SAL <= 3000',
      'WHERE SAL IN (1000, 3000)',
    ],
    points: 10,
  },
  {
    id: 'exam3_p12',
    title: '12. 별칭(Alias) 사용',
    description:
      '다음 SQL에서 오류가 발생하는 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 55,
    answer: '3',
    explanation:
      'WHERE 절은 SELECT 절보다 먼저 실행(FROM → WHERE → SELECT 순)되므로, SELECT에서 정의한 별칭을 WHERE에서 사용할 수 없습니다. Oracle에서는 ORDER BY에서만 별칭 사용이 가능합니다.',
    options: [
      'SELECT SAL * 12 AS ANNUAL FROM EMP ORDER BY ANNUAL;',
      'SELECT E.ENAME FROM EMP E;',
      'SELECT SAL * 12 AS ANNUAL FROM EMP WHERE ANNUAL > 30000;',
      'SELECT DEPTNO AS DN, COUNT(*) FROM EMP GROUP BY DEPTNO;',
    ],
    points: 10,
  },
  {
    id: 'exam3_p13',
    title: '13. MERGE 문',
    description:
      'MERGE 문에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 70,
    answer: '2',
    explanation:
      'MERGE는 조건에 따라 INSERT 또는 UPDATE를 하나의 문장으로 수행합니다. MATCHED(일치하면 UPDATE), NOT MATCHED(불일치하면 INSERT) 절로 구성됩니다.',
    options: [
      'SELECT와 UPDATE를 동시에 수행한다.',
      '조건에 따라 INSERT 또는 UPDATE를 하나의 문장으로 수행한다.',
      'DELETE만 수행할 수 있다.',
      '두 테이블을 물리적으로 병합한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p14',
    title: '14. 연산자 우선순위',
    description:
      '다음 SQL에서 조회되는 행은?\n\nSELECT * FROM EMP\nWHERE DEPTNO = 10 OR DEPTNO = 20 AND SAL > 3000;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 52,
    answer: '3',
    explanation:
      'AND가 OR보다 우선순위가 높으므로, 먼저 DEPTNO=20 AND SAL>3000이 평가됩니다. 따라서 "부서 10의 전체 사원" OR "부서 20이면서 급여 3000 초과 사원"이 조회됩니다.',
    options: [
      '부서 10 또는 20의 모든 사원 중 급여 3000 초과',
      '부서 10의 사원만',
      '부서 10의 전체 사원 + 부서 20의 급여 3000 초과 사원',
      '부서 20의 급여 3000 초과 사원만',
    ],
    points: 10,
  },
  {
    id: 'exam3_p15',
    title: '15. ROWNUM',
    description:
      'Oracle에서 상위 5건만 조회하는 SQL로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 78,
    answer: '2',
    explanation:
      'ROWNUM은 WHERE 절에서 사용하며, 행이 반환될 때 순번이 부여됩니다. ROWNUM <= 5로 상위 5건을 제한합니다. ROWNUM = 5는 ROWNUM이 1부터 순차 부여되므로 결과가 없습니다.',
    options: [
      'SELECT * FROM EMP WHERE ROWNUM = 5;',
      'SELECT * FROM EMP WHERE ROWNUM <= 5;',
      'SELECT TOP 5 * FROM EMP;',
      'SELECT * FROM EMP LIMIT 5;',
    ],
    points: 10,
  },

  // --- 함수 (16~21) ---
  {
    id: 'exam3_p16',
    title: '16. REPLACE 함수',
    description:
      "다음 SQL의 결과는?\n\nSELECT REPLACE('ABCABC', 'AB', 'X') FROM DUAL;",
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 82,
    answer: '1',
    explanation:
      "REPLACE(문자열, 검색문자, 대체문자)는 문자열에서 검색문자를 대체문자로 모두 치환합니다. 'ABCABC'에서 'AB'를 'X'로 바꾸면 'XCXC'가 됩니다.",
    options: [
      'XCXC',
      'XBCXBC',
      'ABCX',
      'XCABC',
    ],
    points: 10,
  },
  {
    id: 'exam3_p17',
    title: '17. LPAD / RPAD',
    description:
      "다음 SQL의 결과는?\n\nSELECT LPAD('ABC', 7, '*') FROM DUAL;",
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 78,
    answer: '2',
    explanation:
      "LPAD(문자열, 전체길이, 채울문자)는 왼쪽을 지정한 문자로 채워 전체 길이를 맞춥니다. 'ABC'(3글자)를 7글자로 만들려면 왼쪽에 '*' 4개를 채웁니다.",
    options: [
      'ABC****',
      '****ABC',
      '***ABC*',
      '*ABC***',
    ],
    points: 10,
  },
  {
    id: 'exam3_p18',
    title: '18. MOD 함수',
    description:
      '다음 SQL의 결과는?\n\nSELECT MOD(17, 5) FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 88,
    answer: '2',
    explanation:
      'MOD(m, n)은 m을 n으로 나눈 나머지를 반환합니다. 17 ÷ 5 = 3 ... 2이므로 나머지 2를 반환합니다.',
    options: [
      '3',
      '2',
      '5',
      '12',
    ],
    points: 10,
  },
  {
    id: 'exam3_p19',
    title: '19. NVL2 함수',
    description:
      '다음 SQL의 결과는?\n\nCOMM이 NULL인 사원에 대해:\nSELECT NVL2(COMM, COMM * 1.1, 100) FROM EMP;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 60,
    answer: '3',
    explanation:
      'NVL2(expr1, expr2, expr3)는 expr1이 NULL이 아니면 expr2를, NULL이면 expr3를 반환합니다. COMM이 NULL이므로 세 번째 인수인 100을 반환합니다.',
    options: [
      'NULL',
      'COMM * 1.1',
      '100',
      '0',
    ],
    points: 10,
  },
  {
    id: 'exam3_p20',
    title: '20. HAVING과 WHERE의 차이',
    description:
      'HAVING과 WHERE의 차이에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 65,
    answer: '3',
    explanation:
      'WHERE는 GROUP BY 전에 개별 행을 필터링하고, HAVING은 GROUP BY 후에 그룹을 필터링합니다. HAVING에서는 집계함수를 조건으로 사용할 수 있습니다.',
    options: [
      'WHERE와 HAVING은 동일한 역할을 한다.',
      'HAVING은 GROUP BY 없이도 사용할 수 있다.',
      'WHERE는 행을 필터링하고, HAVING은 그룹을 필터링한다.',
      'WHERE에서도 집계함수를 사용할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p21',
    title: '21. 문자열 결합',
    description:
      "다음 SQL의 결과는?\n\nSELECT 'Hello' || ' ' || 'World' FROM DUAL;",
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 90,
    answer: '1',
    explanation:
      "Oracle에서 || 연산자는 문자열을 결합합니다. 'Hello' + ' ' + 'World' = 'Hello World'가 됩니다.",
    options: [
      'Hello World',
      'HelloWorld',
      'Hello||World',
      '오류 발생',
    ],
    points: 10,
  },

  // --- JOIN (22~27) ---
  {
    id: 'exam3_p22',
    title: '22. 3-Way JOIN',
    description:
      '다음 SQL의 의미로 올바른 것은?\n\nSELECT E.ENAME, D.DNAME, L.CITY\nFROM EMP E\n  JOIN DEPT D ON E.DEPTNO = D.DEPTNO\n  JOIN LOCATION L ON D.LOC_ID = L.LOC_ID;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 68,
    answer: '1',
    explanation:
      '3개 테이블을 순차적으로 JOIN합니다. EMP↔DEPT를 DEPTNO로 조인하고, 그 결과를 LOCATION과 LOC_ID로 조인하여 사원의 이름, 부서명, 도시를 조회합니다.',
    options: [
      '사원의 이름, 부서명, 근무 도시를 조회한다.',
      '3개 테이블의 CROSS JOIN을 수행한다.',
      '사원과 부서만 조인한다.',
      '위치 정보만 조회한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p23',
    title: '23. ANTI JOIN',
    description:
      '다음 SQL이 수행하는 ANTI JOIN의 의미는?\n\nSELECT * FROM DEPT D\nWHERE NOT EXISTS (\n  SELECT 1 FROM EMP E WHERE E.DEPTNO = D.DEPTNO\n);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 45,
    answer: '2',
    explanation:
      'NOT EXISTS를 사용한 ANTI JOIN은 매칭되는 행이 없는 경우만 반환합니다. 즉, 사원이 한 명도 없는 부서만 조회합니다.',
    options: [
      '사원이 있는 부서만 조회한다.',
      '사원이 한 명도 없는 부서만 조회한다.',
      '모든 부서와 사원을 조회한다.',
      '부서와 사원의 CROSS JOIN을 수행한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p24',
    title: '24. SEMI JOIN',
    description:
      '다음 SQL은 어떤 유형의 조인인가?\n\nSELECT * FROM DEPT D\nWHERE EXISTS (\n  SELECT 1 FROM EMP E WHERE E.DEPTNO = D.DEPTNO\n);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 55,
    answer: '3',
    explanation:
      'EXISTS를 사용하여 서브쿼리에 매칭되는 행이 존재하는 메인 쿼리의 행만 반환하는 것을 SEMI JOIN이라 합니다. DEPT에서 EMP에 매칭되는 부서만 반환합니다.',
    options: [
      'INNER JOIN',
      'ANTI JOIN',
      'SEMI JOIN',
      'OUTER JOIN',
    ],
    points: 10,
  },
  {
    id: 'exam3_p25',
    title: '25. 조인과 NULL',
    description:
      'EMP.DEPTNO에 NULL이 포함된 행이 있을 때, INNER JOIN의 결과에 이 행이 포함되는가?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 72,
    answer: '2',
    explanation:
      'NULL = NULL은 UNKNOWN이므로 조인 조건이 TRUE가 되지 않습니다. 따라서 DEPTNO가 NULL인 EMP 행은 INNER JOIN 결과에 포함되지 않습니다.',
    options: [
      '포함된다.',
      '포함되지 않는다.',
      'DEPT에 NULL이 있는 경우에만 포함된다.',
      '오류가 발생한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p26',
    title: '26. 다중 조건 JOIN',
    description:
      '다음 SQL에서 AND 조건의 역할은?\n\nSELECT * FROM EMP E\nJOIN DEPT D ON E.DEPTNO = D.DEPTNO AND D.LOC = \'서울\';',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 58,
    answer: '1',
    explanation:
      'ON 절에 AND 조건을 추가하면 조인 조건 자체에 추가 필터가 적용됩니다. INNER JOIN에서는 ON에 조건을 쓰나 WHERE에 쓰나 결과가 같지만, OUTER JOIN에서는 다른 결과가 나올 수 있습니다.',
    options: [
      '조인 조건에 LOC = \'서울\' 필터를 추가한다.',
      '조인 후 별도의 WHERE 절 역할을 한다.',
      'DEPTNO 조인과 LOC 조인을 각각 수행한다.',
      '문법 오류가 발생한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p27',
    title: '27. OUTER JOIN에서의 ON vs WHERE',
    description:
      'LEFT OUTER JOIN에서 ON 절과 WHERE 절에 조건을 넣을 때의 차이는?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 38,
    answer: '3',
    explanation:
      'OUTER JOIN에서 ON 절의 조건은 조인 전에 적용되어 NULL 보존에 영향을 주지 않습니다. WHERE 절의 조건은 조인 후에 적용되어 NULL 행이 제거될 수 있습니다. 따라서 OUTER JOIN에서는 ON과 WHERE의 위치에 따라 결과가 달라집니다.',
    options: [
      '차이가 없다.',
      'ON 절에 넣으면 오류가 발생한다.',
      'ON 절 조건은 조인 전 적용되고, WHERE 절 조건은 조인 후 적용되어 결과가 달라질 수 있다.',
      'WHERE 절에 넣으면 항상 INNER JOIN과 같다.',
    ],
    points: 10,
  },

  // --- 서브쿼리 (28~31) ---
  {
    id: 'exam3_p28',
    title: '28. WITH절 (CTE)',
    description:
      '다음 SQL의 WITH 절(Common Table Expression)에 대한 설명으로 올바른 것은?\n\nWITH DEPT_SAL AS (\n  SELECT DEPTNO, AVG(SAL) AS AVG_SAL\n  FROM EMP GROUP BY DEPTNO\n)\nSELECT * FROM EMP E\nJOIN DEPT_SAL DS ON E.DEPTNO = DS.DEPTNO\nWHERE E.SAL > DS.AVG_SAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 58,
    answer: '2',
    explanation:
      'WITH 절(CTE)은 임시 결과 집합에 이름을 부여하여 메인 쿼리에서 참조할 수 있게 합니다. 인라인 뷰와 유사하지만 가독성이 더 좋으며, 여러 번 참조 가능합니다.',
    options: [
      '영구적인 뷰를 생성한다.',
      '임시 결과 집합에 이름을 부여하여 메인 쿼리에서 참조한다.',
      '물리적 임시 테이블을 생성한다.',
      'FROM 절에서만 사용할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p29',
    title: '29. 서브쿼리와 NULL',
    description:
      '다음 SQL의 결과가 빈 결과가 되는 이유는?\n\nSELECT * FROM EMP\nWHERE EMPNO NOT IN (SELECT MGR FROM EMP);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 35,
    answer: '3',
    explanation:
      'MGR 컬럼에 NULL이 포함되어 있으면, NOT IN의 비교에서 UNKNOWN이 발생합니다. NOT IN은 모든 값과의 비교가 TRUE여야 하는데, NULL과의 비교가 UNKNOWN이므로 어떤 행도 반환되지 않습니다. 이 경우 NOT EXISTS를 사용해야 합니다.',
    options: [
      'EMP 테이블이 비어있어서',
      'EMPNO와 MGR의 데이터 타입이 달라서',
      '서브쿼리 결과에 NULL이 포함되어 NOT IN이 UNKNOWN을 반환하므로',
      'NOT IN은 서브쿼리와 사용할 수 없어서',
    ],
    points: 10,
  },
  {
    id: 'exam3_p30',
    title: '30. 상관 서브쿼리 실행 순서',
    description:
      '상관 서브쿼리의 실행 순서로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 55,
    answer: '2',
    explanation:
      '상관 서브쿼리는 1) 메인 쿼리에서 행을 읽고, 2) 해당 행의 값을 서브쿼리에 전달하며, 3) 서브쿼리를 실행하고, 4) 결과를 메인 쿼리의 조건으로 사용합니다. 이 과정을 메인 쿼리의 모든 행에 대해 반복합니다.',
    options: [
      '서브쿼리 전체 실행 → 메인 쿼리 실행',
      '메인 쿼리 행 읽기 → 서브쿼리 실행 → 반복',
      '메인 쿼리와 서브쿼리 동시 실행',
      '서브쿼리 1번 실행 → 결과 캐싱 → 메인 쿼리 실행',
    ],
    points: 10,
  },
  {
    id: 'exam3_p31',
    title: '31. 서브쿼리를 이용한 UPDATE',
    description:
      '다음 SQL의 의미로 올바른 것은?\n\nUPDATE EMP E\nSET SAL = (SELECT AVG(SAL) FROM EMP WHERE DEPTNO = E.DEPTNO)\nWHERE DEPTNO = 10;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '서브쿼리',
    correctRate: 68,
    answer: '1',
    explanation:
      '부서 10의 사원들의 급여를 각각 자신이 속한 부서(부서 10)의 평균 급여로 업데이트합니다. SET 절의 서브쿼리가 상관 서브쿼리로 동작합니다.',
    options: [
      '부서 10 사원의 급여를 부서 10의 평균 급여로 업데이트한다.',
      '모든 사원의 급여를 전체 평균으로 업데이트한다.',
      '부서 10 사원의 급여를 각 부서별 평균으로 업데이트한다.',
      '오류가 발생한다.',
    ],
    points: 10,
  },

  // --- 윈도우함수 (32~35) ---
  {
    id: 'exam3_p32',
    title: '32. PERCENT_RANK',
    description:
      'PERCENT_RANK() OVER (ORDER BY SAL) 함수에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 38,
    answer: '2',
    explanation:
      'PERCENT_RANK는 (현재 행의 RANK - 1) / (전체 행 수 - 1)로 계산되며, 0과 1 사이의 값을 반환합니다. 첫 번째 행은 0, 마지막 행은 1입니다.',
    options: [
      '백분위 순위를 1~100 사이 정수로 반환한다.',
      '0과 1 사이의 값으로 상대적 위치를 반환한다.',
      '전체 행 수 대비 현재 행의 비율을 백분율로 반환한다.',
      'ROW_NUMBER와 동일한 결과를 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p33',
    title: '33. 윈도우 프레임',
    description:
      'ROWS와 RANGE의 차이에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 35,
    answer: '1',
    explanation:
      'ROWS는 물리적 행 수를 기준으로 윈도우 범위를 지정하고, RANGE는 논리적 값(ORDER BY 기준 값)을 기준으로 범위를 지정합니다. 같은 값이 여러 행에 있을 때 결과가 달라질 수 있습니다.',
    options: [
      'ROWS는 물리적 행 수 기준, RANGE는 논리적 값 기준으로 범위를 지정한다.',
      'ROWS와 RANGE는 동일한 결과를 반환한다.',
      'RANGE는 숫자 타입에만 사용할 수 있다.',
      'ROWS는 ORDER BY 없이도 사용할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p34',
    title: '34. CUME_DIST',
    description:
      '5명의 사원 급여가 1000, 2000, 2000, 3000, 4000일 때,\n급여 2000인 행의 CUME_DIST() OVER (ORDER BY SAL) 값은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 45,
    answer: '3',
    explanation:
      'CUME_DIST는 (현재 행 이하의 행 수) / (전체 행 수)로 계산됩니다. SAL=2000 이하인 행은 3건(1000, 2000, 2000), 전체 5건이므로 3/5 = 0.6입니다.',
    options: [
      '0.4',
      '0.5',
      '0.6',
      '0.8',
    ],
    points: 10,
  },
  {
    id: 'exam3_p35',
    title: '35. 윈도우 함수와 PARTITION BY',
    description:
      '윈도우 함수에서 PARTITION BY를 생략하면 어떻게 되는가?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '윈도우함수',
    correctRate: 75,
    answer: '1',
    explanation:
      'PARTITION BY를 생략하면 전체 결과 집합이 하나의 파티션으로 취급됩니다. 즉, 전체 행에 대해 윈도우 함수가 적용됩니다.',
    options: [
      '전체 결과 집합을 하나의 파티션으로 취급한다.',
      '오류가 발생한다.',
      '각 행이 개별 파티션이 된다.',
      'GROUP BY와 동일하게 동작한다.',
    ],
    points: 10,
  },

  // --- 집합연산 (36~39) ---
  {
    id: 'exam3_p36',
    title: '36. INTERSECT',
    description:
      'A = {1, 2, 3, 4, 5}, B = {3, 4, 5, 6, 7}일 때,\nA INTERSECT B의 결과는?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 85,
    answer: '2',
    explanation:
      'INTERSECT는 두 집합의 교집합을 반환합니다. A와 B에 공통으로 포함된 {3, 4, 5}가 결과입니다.',
    options: [
      '{1, 2, 3, 4, 5, 6, 7}',
      '{3, 4, 5}',
      '{1, 2}',
      '{6, 7}',
    ],
    points: 10,
  },
  {
    id: 'exam3_p37',
    title: '37. 집합 연산자 우선순위',
    description:
      'SQL에서 집합 연산자의 처리 순서에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 50,
    answer: '3',
    explanation:
      'SQL 표준에서는 INTERSECT가 UNION/UNION ALL/MINUS보다 우선순위가 높습니다. 그러나 Oracle에서는 모든 집합 연산자가 동일한 우선순위로 위에서 아래로 순차 처리됩니다.',
    options: [
      'UNION이 항상 가장 먼저 처리된다.',
      'MINUS가 가장 높은 우선순위를 가진다.',
      'SQL 표준에서는 INTERSECT가 가장 높은 우선순위를 가진다.',
      '모든 DBMS에서 동일한 우선순위를 가진다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p38',
    title: '38. ROLLUP과 소계 행 구분',
    description:
      'ROLLUP으로 생성된 소계 행과 일반 행을 구분하는 방법은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 55,
    answer: '2',
    explanation:
      'GROUPING(컬럼) 함수를 사용하면 소계로 인한 NULL(GROUPING=1)과 실제 데이터의 NULL(GROUPING=0)을 구분할 수 있습니다.',
    options: [
      'NULL과 빈 문자열을 비교한다.',
      'GROUPING 함수를 사용한다.',
      'ROWNUM을 확인한다.',
      '구분할 수 없다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p39',
    title: '39. CUBE의 결과 행 수',
    description:
      'CUBE(A, B, C)에서 생성되는 그룹핑 조합의 수는?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 40,
    answer: '4',
    explanation:
      'CUBE(A, B, C)는 2^3 = 8가지 조합을 생성합니다: (A,B,C), (A,B), (A,C), (B,C), (A), (B), (C), (). 즉 모든 가능한 부분집합에 대한 소계를 구합니다.',
    options: [
      '3가지',
      '4가지',
      '6가지',
      '8가지',
    ],
    points: 10,
  },

  // --- DDL (40~43) ---
  {
    id: 'exam3_p40',
    title: '40. DEFAULT 값',
    description:
      '다음 DDL과 INSERT의 결과로 올바른 것은?\n\nCREATE TABLE T (\n  ID NUMBER,\n  STATUS VARCHAR2(10) DEFAULT \'ACTIVE\'\n);\nINSERT INTO T (ID) VALUES (1);',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 82,
    answer: '1',
    explanation:
      "DEFAULT 값이 설정된 컬럼에 값을 지정하지 않으면 DEFAULT 값이 자동으로 입력됩니다. STATUS를 지정하지 않았으므로 'ACTIVE'가 입력됩니다.",
    options: [
      "ID=1, STATUS='ACTIVE'",
      'ID=1, STATUS=NULL',
      '오류 발생 (STATUS 미지정)',
      "ID=1, STATUS=''",
    ],
    points: 10,
  },
  {
    id: 'exam3_p41',
    title: '41. UNIQUE 제약조건',
    description:
      'UNIQUE 제약조건에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 60,
    answer: '3',
    explanation:
      'UNIQUE 제약조건은 컬럼의 값이 중복되지 않도록 보장합니다. PRIMARY KEY와 달리 NULL을 허용하며, 하나의 테이블에 여러 UNIQUE 제약조건을 설정할 수 있습니다.',
    options: [
      'NULL을 허용하지 않는다.',
      '테이블당 하나만 정의할 수 있다.',
      'NULL을 허용하며, 테이블에 여러 개 정의할 수 있다.',
      'PRIMARY KEY와 동일하다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p42',
    title: '42. CASCADE 옵션',
    description:
      'FOREIGN KEY의 ON DELETE CASCADE 옵션의 동작은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 78,
    answer: '2',
    explanation:
      'ON DELETE CASCADE는 부모 테이블의 행이 삭제되면 해당 행을 참조하는 자식 테이블의 행도 자동으로 함께 삭제됩니다.',
    options: [
      '부모 행 삭제를 거부한다.',
      '부모 행 삭제 시 자식 행도 자동 삭제된다.',
      '자식 행의 외래키를 NULL로 설정한다.',
      '자식 행의 외래키를 DEFAULT 값으로 설정한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p43',
    title: '43. RENAME과 COMMENT',
    description:
      '테이블 이름을 변경하는 DDL 명령어는?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 80,
    answer: '3',
    explanation:
      'RENAME old_name TO new_name으로 테이블 이름을 변경합니다. ALTER TABLE에서도 RENAME TO로 변경 가능합니다.',
    options: [
      'CHANGE TABLE EMP TO EMPLOYEE;',
      'MODIFY TABLE EMP TO EMPLOYEE;',
      'RENAME EMP TO EMPLOYEE;',
      'UPDATE TABLE EMP SET NAME = EMPLOYEE;',
    ],
    points: 10,
  },

  // --- TCL (44~45) ---
  {
    id: 'exam3_p44',
    title: '44. 트랜잭션 시작',
    description:
      'Oracle에서 트랜잭션이 시작되는 시점은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'TCL',
    correctRate: 62,
    answer: '1',
    explanation:
      'Oracle에서는 첫 번째 DML(INSERT, UPDATE, DELETE)이 실행될 때 트랜잭션이 자동으로 시작됩니다. 별도의 BEGIN TRANSACTION 명령이 필요하지 않습니다.',
    options: [
      '첫 번째 DML 문이 실행될 때 자동으로 시작된다.',
      'BEGIN TRANSACTION을 명시적으로 실행해야 한다.',
      'SELECT 문이 실행될 때 시작된다.',
      '데이터베이스에 접속하는 순간 시작된다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p45',
    title: '45. ROLLBACK의 범위',
    description:
      '다음 SQL 실행 후 테이블의 상태는?\n\nINSERT INTO T VALUES (1);\nCOMMIT;\nINSERT INTO T VALUES (2);\nINSERT INTO T VALUES (3);\nROLLBACK;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'TCL',
    correctRate: 78,
    answer: '2',
    explanation:
      'COMMIT으로 확정된 데이터(1)는 ROLLBACK으로 취소할 수 없습니다. COMMIT 이후 삽입된 2와 3만 ROLLBACK으로 취소되므로 1만 남습니다.',
    options: [
      '1, 2, 3 모두 존재',
      '1만 존재',
      '아무것도 없음',
      '2, 3만 존재',
    ],
    points: 10,
  },

  // --- DCL (46~47) ---
  {
    id: 'exam3_p46',
    title: '46. 시스템 권한 vs 객체 권한',
    description:
      '다음 중 시스템 권한에 해당하는 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DCL',
    correctRate: 58,
    answer: '1',
    explanation:
      'CREATE TABLE은 테이블을 생성할 수 있는 시스템 권한입니다. SELECT ON, INSERT ON, UPDATE ON은 특정 객체에 대한 객체 권한입니다.',
    options: [
      'CREATE TABLE',
      'SELECT ON EMP',
      'INSERT ON DEPT',
      'UPDATE ON EMP',
    ],
    points: 10,
  },
  {
    id: 'exam3_p47',
    title: '47. REVOKE와 권한 연쇄',
    description:
      'A가 B에게 WITH GRANT OPTION으로 권한을 부여하고, B가 C에게 같은 권한을 부여한 후, A가 B의 권한을 REVOKE하면 C의 권한은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DCL',
    correctRate: 42,
    answer: '2',
    explanation:
      'WITH GRANT OPTION으로 부여된 권한이 REVOKE되면, 해당 사용자가 다시 부여한 권한도 연쇄적으로 회수됩니다. A→B 권한을 회수하면 B→C 권한도 자동 회수됩니다.',
    options: [
      'C의 권한은 유지된다.',
      'C의 권한도 함께 회수된다(연쇄 REVOKE).',
      '오류가 발생한다.',
      'A가 직접 C의 권한을 회수해야 한다.',
    ],
    points: 10,
  },

  // --- 계층형쿼리 (48~50) ---
  {
    id: 'exam3_p48',
    title: '48. CONNECT_BY_ISLEAF',
    description:
      'Oracle 계층형 쿼리에서 CONNECT_BY_ISLEAF의 의미는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '계층형쿼리',
    correctRate: 52,
    answer: '3',
    explanation:
      'CONNECT_BY_ISLEAF는 현재 행이 리프 노드(자식이 없는 최하위 노드)이면 1, 아니면 0을 반환하는 의사컬럼입니다.',
    options: [
      '루트 노드이면 1, 아니면 0',
      '현재 행의 LEVEL 값',
      '리프 노드(최하위)이면 1, 아니면 0',
      '부모 노드의 존재 여부',
    ],
    points: 10,
  },
  {
    id: 'exam3_p49',
    title: '49. SYS_CONNECT_BY_PATH',
    description:
      '다음 계층형 쿼리의 SYS_CONNECT_BY_PATH 결과에 대한 설명으로 올바른 것은?\n\nSELECT ENAME, SYS_CONNECT_BY_PATH(ENAME, \'/\') AS PATH\nFROM EMP\nSTART WITH MGR IS NULL\nCONNECT BY PRIOR EMPNO = MGR;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 40,
    answer: '1',
    explanation:
      "SYS_CONNECT_BY_PATH는 루트부터 현재 행까지의 경로를 지정된 구분자로 연결하여 반환합니다. 예: '/KING/BLAKE/ALLEN'처럼 계층 경로를 문자열로 보여줍니다.",
    options: [
      "루트부터 현재 행까지의 경로를 '/'로 연결하여 반환한다.",
      '현재 행의 바로 위 부모만 반환한다.',
      '모든 리프 노드의 경로를 반환한다.',
      '현재 행의 자식 목록을 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam3_p50',
    title: '50. PIVOT',
    description:
      'PIVOT에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 42,
    answer: '2',
    explanation:
      'PIVOT은 행 데이터를 열(컬럼)로 변환하는 기능입니다. 주로 크로스탭(Cross-Tab) 보고서나 매트릭스 형태의 결과를 생성할 때 사용합니다. UNPIVOT은 반대로 열을 행으로 변환합니다.',
    options: [
      '열 데이터를 행으로 변환한다.',
      '행 데이터를 열로 변환한다.',
      'GROUP BY와 동일한 기능이다.',
      '두 테이블을 병합한다.',
    ],
    points: 10,
  },
];
