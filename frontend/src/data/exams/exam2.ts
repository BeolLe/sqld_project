import type { Problem } from '../../types';

// SQLD 모의고사 2회 (기본 난이도 - 목표 합격률 ~55%)
// 1과목: 데이터 모델링의 이해 (10문항, 20점)
// 2과목: SQL 기본 및 활용 (40문항, 80점)
// 난이도 배분: easy 20 / medium 20 / hard 10

export const EXAM_2_PROBLEMS: Problem[] = [
  // ===== 1과목: 데이터 모델링의 이해 (1~10번) =====
  {
    id: 'exam2_p1',
    title: '1. 데이터 모델링의 정의',
    description:
      '다음 중 데이터 모델링에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 80,
    answer: '4',
    explanation:
      '데이터 모델링은 현실 세계의 데이터를 추상화하여 체계적으로 표현하는 과정입니다. 물리적 데이터베이스의 성능 최적화는 물리적 모델링 단계에서 고려하는 것이며, 데이터 모델링의 목적 자체가 성능 최적화는 아닙니다.',
    options: [
      '현실 세계의 데이터를 추상화하여 표현하는 과정이다.',
      '업무에서 필요한 데이터를 분석하고 구조화한다.',
      '데이터 간의 관계를 명확하게 정의한다.',
      '물리적 데이터베이스의 성능 최적화가 주된 목적이다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p2',
    title: '2. 엔터티의 분류',
    description:
      '다음 중 엔터티를 발생 시점에 따라 분류할 때, 올바른 조합은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 75,
    answer: '1',
    explanation:
      '엔터티는 발생 시점에 따라 기본(Key) 엔터티, 중심(Main) 엔터티, 행위(Active) 엔터티로 분류됩니다. 기본 엔터티는 독립적으로 존재하며(예: 고객, 부서), 중심 엔터티는 기본 엔터티에서 파생되고(예: 주문), 행위 엔터티는 두 개 이상의 엔터티로부터 발생합니다(예: 주문상세).',
    options: [
      '기본 엔터티, 중심 엔터티, 행위 엔터티',
      '기본 엔터티, 파생 엔터티, 관계 엔터티',
      '독립 엔터티, 종속 엔터티, 교차 엔터티',
      '유형 엔터티, 무형 엔터티, 개념 엔터티',
    ],
    points: 10,
  },
  {
    id: 'exam2_p3',
    title: '3. 속성의 도메인',
    description:
      '속성의 도메인(Domain)에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 78,
    answer: '2',
    explanation:
      '도메인은 각 속성이 가질 수 있는 값의 범위(집합)를 의미합니다. 예를 들어, 성별 속성의 도메인은 {남, 여}이고, 학점 속성의 도메인은 {A, B, C, D, F}입니다.',
    options: [
      '속성이 저장되는 물리적 공간을 의미한다.',
      '속성이 가질 수 있는 값의 범위를 의미한다.',
      '속성의 데이터 타입만을 의미한다.',
      '속성 간의 관계를 의미한다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p4',
    title: '4. 관계의 카디널리티',
    description:
      '한 명의 교수가 여러 과목을 강의하고, 한 과목은 한 명의 교수만 담당할 때, 교수와 과목의 관계 카디널리티는?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 82,
    answer: '2',
    explanation:
      '한 교수가 여러 과목을 담당하고(1:M), 한 과목은 한 교수만 담당하므로 교수:과목 = 1:M 관계입니다.',
    options: [
      '1:1',
      '1:M',
      'M:N',
      'M:1',
    ],
    points: 10,
  },
  {
    id: 'exam2_p5',
    title: '5. ERD 표기법',
    description:
      'ERD(Entity Relationship Diagram)에서 관계를 표현할 때 필수 참여(Mandatory)를 나타내는 기호는?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 72,
    answer: '3',
    explanation:
      'IE(Information Engineering) 표기법에서 필수 참여는 실선(|)으로, 선택 참여는 원(O)으로 표현합니다. 까마귀발(Crow\'s Foot) 기호는 다수(Many)를 나타냅니다.',
    options: [
      '원(O)',
      '점선',
      '실선(|)',
      '화살표(→)',
    ],
    points: 10,
  },
  {
    id: 'exam2_p6',
    title: '6. 본질식별자와 인조식별자',
    description:
      '다음 중 인조식별자(Artificial Identifier)를 사용하는 경우로 적합한 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 68,
    answer: '4',
    explanation:
      '인조식별자는 업무적 의미가 없는 자동 생성 식별자(시퀀스, 일련번호 등)입니다. 복합 식별자의 컬럼 수가 너무 많아 조인 성능에 문제가 있거나, 적절한 본질 식별자가 없을 때 사용합니다.',
    options: [
      '주민등록번호처럼 유일한 업무 식별자가 있을 때',
      '복합키의 컬럼 수가 2개일 때',
      '모든 테이블에 반드시 사용해야 할 때',
      '복합 식별자의 컬럼 수가 많아 조인 성능에 문제가 있을 때',
    ],
    points: 10,
  },
  {
    id: 'exam2_p7',
    title: '7. 제3정규형(3NF)',
    description:
      '제3정규형(3NF)에서 제거하는 종속성은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 70,
    answer: '3',
    explanation:
      '제3정규형은 이행 함수 종속(Transitive Functional Dependency)을 제거합니다. A→B, B→C일 때 A→C인 이행 종속이 존재하면, C를 별도 테이블로 분리합니다.',
    options: [
      '반복 그룹',
      '부분 함수 종속',
      '이행 함수 종속',
      '다치 종속',
    ],
    points: 10,
  },
  {
    id: 'exam2_p8',
    title: '8. BCNF',
    description:
      'BCNF(Boyce-Codd Normal Form)에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 65,
    answer: '2',
    explanation:
      'BCNF는 모든 결정자가 후보키(Candidate Key)여야 합니다. 3NF를 만족하더라도 결정자가 후보키가 아닌 경우가 있을 수 있으며, 이를 해결하는 것이 BCNF입니다.',
    options: [
      '모든 속성이 원자값을 가져야 한다.',
      '모든 결정자가 후보키여야 한다.',
      '이행 함수 종속을 제거해야 한다.',
      '다치 종속을 제거해야 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p9',
    title: '9. 반정규화',
    description:
      '반정규화(Denormalization)를 수행하는 주된 이유로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 70,
    answer: '1',
    explanation:
      '반정규화는 정규화된 테이블의 조회 성능을 향상시키기 위해 의도적으로 중복을 허용하는 것입니다. 조인이 과도하게 많아 성능이 저하될 때 수행합니다. 단, 데이터 정합성 관리 비용이 증가하는 단점이 있습니다.',
    options: [
      '데이터 조회 성능을 향상시키기 위해',
      '데이터 무결성을 강화하기 위해',
      '저장 공간을 절약하기 위해',
      '이상(Anomaly) 현상을 제거하기 위해',
    ],
    points: 10,
  },
  {
    id: 'exam2_p10',
    title: '10. 정규화와 이상현상',
    description:
      '정규화를 수행하지 않았을 때 발생할 수 있는 이상(Anomaly) 현상이 아닌 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 75,
    answer: '4',
    explanation:
      '정규화 미수행 시 발생하는 이상 현상은 삽입 이상, 삭제 이상, 갱신 이상의 3가지입니다. 조회 이상이라는 것은 존재하지 않습니다.',
    options: [
      '삽입 이상(Insertion Anomaly)',
      '삭제 이상(Deletion Anomaly)',
      '갱신 이상(Update Anomaly)',
      '조회 이상(Selection Anomaly)',
    ],
    points: 10,
  },

  // ===== 2과목: SQL 기본 및 활용 (11~50번) =====

  // --- DML (11~14) ---
  {
    id: 'exam2_p11',
    title: '11. SELECT 절의 실행 순서',
    description:
      'SQL의 논리적 실행 순서로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 55,
    answer: '3',
    explanation:
      'SQL의 논리적 실행 순서는 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY입니다. 작성 순서와 실행 순서가 다르다는 점에 주의해야 합니다.',
    options: [
      'SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY',
      'FROM → SELECT → WHERE → GROUP BY → HAVING → ORDER BY',
      'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY',
      'FROM → WHERE → SELECT → GROUP BY → HAVING → ORDER BY',
    ],
    points: 10,
  },
  {
    id: 'exam2_p12',
    title: '12. NULL 비교',
    description:
      '다음 SQL의 결과 행 수는?\n\nEMP 테이블에 COMM 값이 300, NULL, 500, NULL, 0인 5건이 있을 때:\n\nSELECT * FROM EMP WHERE COMM = NULL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 60,
    answer: '4',
    explanation:
      'NULL은 = 연산자로 비교할 수 없습니다. COMM = NULL의 결과는 항상 UNKNOWN이므로 어떤 행도 반환되지 않습니다. NULL을 비교하려면 IS NULL을 사용해야 합니다.',
    options: [
      '5건',
      '2건',
      '3건',
      '0건',
    ],
    points: 10,
  },
  {
    id: 'exam2_p13',
    title: '13. LIKE 연산자',
    description:
      "다음 SQL에서 조회되는 이름의 패턴은?\n\nSELECT ENAME FROM EMP WHERE ENAME LIKE '_A%';",
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 78,
    answer: '2',
    explanation:
      "LIKE 패턴에서 '_'는 한 글자, '%'는 0개 이상의 글자를 의미합니다. '_A%'는 두 번째 글자가 'A'인 모든 이름을 의미합니다.",
    options: [
      "이름이 'A'로 시작하는 사원",
      "이름의 두 번째 글자가 'A'인 사원",
      "이름에 'A'가 포함된 모든 사원",
      "이름이 'A'로 끝나는 사원",
    ],
    points: 10,
  },
  {
    id: 'exam2_p14',
    title: '14. ORDER BY와 NULL',
    description:
      'Oracle에서 ORDER BY ASC 정렬 시 NULL 값의 위치는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 52,
    answer: '2',
    explanation:
      'Oracle에서는 NULL을 가장 큰 값으로 취급하여, ASC 정렬 시 NULL이 마지막에 위치합니다. 반면 SQL Server에서는 NULL을 가장 작은 값으로 취급합니다. NULLS FIRST/NULLS LAST 옵션으로 위치를 지정할 수 있습니다.',
    options: [
      '항상 가장 처음에 위치한다.',
      'Oracle에서는 가장 마지막에 위치한다.',
      '중간에 위치한다.',
      'NULL 행은 결과에서 제외된다.',
    ],
    points: 10,
  },

  // --- 함수 (15~20) ---
  {
    id: 'exam2_p15',
    title: '15. NULLIF 함수',
    description:
      '다음 SQL의 결과는?\n\nSELECT NULLIF(100, 100) FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 62,
    answer: '1',
    explanation:
      'NULLIF(expr1, expr2)는 두 값이 같으면 NULL을, 다르면 expr1을 반환합니다. 100과 100이 같으므로 NULL을 반환합니다.',
    options: [
      'NULL',
      '100',
      '0',
      '200',
    ],
    points: 10,
  },
  {
    id: 'exam2_p16',
    title: '16. 날짜 함수',
    description:
      '다음 SQL의 결과로 올바른 것은? (현재 날짜: 2025-03-15)\n\nSELECT ADD_MONTHS(SYSDATE, -3) FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 82,
    answer: '3',
    explanation:
      'ADD_MONTHS(날짜, 숫자)는 날짜에서 지정한 개월 수를 더합니다. -3이므로 3개월 전인 2024-12-15가 됩니다.',
    options: [
      '2025-06-15',
      '2025-03-12',
      '2024-12-15',
      '2025-03-18',
    ],
    points: 10,
  },
  {
    id: 'exam2_p17',
    title: '17. 숫자 함수',
    description:
      '다음 SQL의 결과는?\n\nSELECT TRUNC(156.78, -1) FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 68,
    answer: '2',
    explanation:
      'TRUNC(숫자, 자릿수)에서 자릿수가 음수이면 정수부를 절삭합니다. -1은 일의 자리에서 절삭하므로 150이 됩니다.',
    options: [
      '156',
      '150',
      '160',
      '156.7',
    ],
    points: 10,
  },
  {
    id: 'exam2_p18',
    title: '18. CASE WHEN 중첩',
    description:
      "다음 SQL의 결과는?\n\nSELECT CASE WHEN 10 > 20 THEN 'A'\n            WHEN 10 > 5 THEN 'B'\n            WHEN 10 > 1 THEN 'C'\n            ELSE 'D'\n       END\nFROM DUAL;",
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 75,
    answer: '2',
    explanation:
      "CASE WHEN은 위에서부터 순차적으로 조건을 평가하며, 처음으로 TRUE인 조건의 결과를 반환합니다. 10>20은 FALSE, 10>5는 TRUE이므로 'B'를 반환합니다.",
    options: [
      'A',
      'B',
      'C',
      'D',
    ],
    points: 10,
  },
  {
    id: 'exam2_p19',
    title: '19. 형변환 함수',
    description:
      "다음 SQL에서 TO_CHAR 함수의 결과는?\n\nSELECT TO_CHAR(1234567, '9,999,999') FROM DUAL;",
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 58,
    answer: '1',
    explanation:
      "TO_CHAR(숫자, 형식)에서 '9,999,999' 형식은 천 단위 구분자를 포함합니다. 1234567은 '1,234,567'로 변환됩니다.",
    options: [
      '1,234,567',
      '1234567',
      '123,4567',
      '오류 발생',
    ],
    points: 10,
  },
  {
    id: 'exam2_p20',
    title: '20. GROUP BY와 집계함수',
    description:
      'GROUP BY 절에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 60,
    answer: '3',
    explanation:
      'SELECT 절에서 집계함수와 함께 사용된 일반 컬럼은 반드시 GROUP BY에 명시되어야 합니다. GROUP BY에 명시되지 않은 컬럼을 SELECT에 쓰면 오류가 발생합니다. 또한 GROUP BY에는 별칭(Alias)을 사용할 수 없습니다(Oracle 기준).',
    options: [
      'GROUP BY에 명시된 컬럼만 SELECT에 사용할 수 있다(집계함수 제외).',
      'HAVING은 GROUP BY 이후에 그룹에 대한 조건을 지정한다.',
      'GROUP BY에 컬럼 별칭(Alias)을 사용할 수 있다.',
      'GROUP BY 절은 NULL도 하나의 그룹으로 처리한다.',
    ],
    points: 10,
  },

  // --- JOIN (21~27) ---
  {
    id: 'exam2_p21',
    title: '21. USING 절',
    description:
      'JOIN에서 USING 절에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 58,
    answer: '3',
    explanation:
      'USING 절은 두 테이블에서 같은 이름의 컬럼을 조인 조건으로 사용할 때 쓰며, USING에 명시된 컬럼에는 테이블 별칭을 사용할 수 없습니다.',
    options: [
      '서로 다른 이름의 컬럼을 조인할 때 사용한다.',
      'ON 절과 동시에 사용할 수 있다.',
      '같은 이름의 컬럼으로 조인하며, 해당 컬럼에 별칭을 사용할 수 없다.',
      '3개 이상의 테이블 조인에는 사용할 수 없다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p22',
    title: '22. RIGHT OUTER JOIN',
    description:
      'A 테이블에 {1,2,3}, B 테이블에 {2,3,4,5}가 있을 때,\nA RIGHT OUTER JOIN B의 결과 행 수는? (조인 키 기준)',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 62,
    answer: '2',
    explanation:
      'RIGHT OUTER JOIN은 오른쪽 테이블(B)의 모든 행을 보존합니다. B에 {2,3,4,5}가 있으므로 4건이 반환됩니다. A에 없는 4, 5의 A 컬럼은 NULL로 채워집니다.',
    options: [
      '3건',
      '4건',
      '5건',
      '2건',
    ],
    points: 10,
  },
  {
    id: 'exam2_p23',
    title: '23. 비등가 조인',
    description:
      '비등가 조인(Non-Equi Join)에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 45,
    answer: '2',
    explanation:
      '비등가 조인은 = 연산자가 아닌 BETWEEN, >, <, >= 등의 연산자를 사용하는 조인입니다. 예를 들어, 급여가 특정 등급 범위에 해당하는지 확인할 때 사용합니다.',
    options: [
      '두 테이블의 컬럼이 동일한 값을 가질 때 사용한다.',
      '= 이외의 연산자(BETWEEN, >, < 등)를 사용하는 조인이다.',
      'JOIN 키워드 없이 WHERE 절만으로 조인하는 것이다.',
      'CROSS JOIN과 동일한 의미이다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p24',
    title: '24. Oracle 조인 구문',
    description:
      'Oracle에서 LEFT OUTER JOIN을 전통적 방식으로 작성한 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 55,
    answer: '1',
    explanation:
      'Oracle 전통 방식에서 (+) 기호는 데이터가 부족한(NULL이 채워질) 쪽에 붙입니다. LEFT OUTER JOIN은 오른쪽 테이블에 매칭이 없을 수 있으므로, 오른쪽 조건에 (+)를 붙입니다.',
    options: [
      'SELECT * FROM A, B WHERE A.ID = B.ID(+);',
      'SELECT * FROM A, B WHERE A.ID(+) = B.ID;',
      'SELECT * FROM A, B WHERE A.ID = B.ID;',
      'SELECT * FROM A, B WHERE A.ID(+) = B.ID(+);',
    ],
    points: 10,
  },
  {
    id: 'exam2_p25',
    title: '25. 조인과 서브쿼리 변환',
    description:
      '다음 SQL과 동일한 결과를 반환하는 것은?\n\nSELECT E.ENAME, D.DNAME\nFROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO\nWHERE D.LOC = \'서울\';',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 72,
    answer: '1',
    explanation:
      '조인 결과에 WHERE 조건을 적용하는 것과, WHERE 절의 서브쿼리에서 조건에 맞는 DEPTNO를 먼저 구한 뒤 IN 연산으로 필터링하는 것은 동일한 결과를 반환합니다.',
    options: [
      "SELECT ENAME FROM EMP WHERE DEPTNO IN (SELECT DEPTNO FROM DEPT WHERE LOC = '서울');",
      'SELECT ENAME FROM EMP WHERE DEPTNO = (SELECT DEPTNO FROM DEPT);',
      "SELECT ENAME FROM EMP WHERE EXISTS (SELECT 1 FROM DEPT WHERE LOC = '서울');",
      'SELECT ENAME, DNAME FROM EMP, DEPT;',
    ],
    points: 10,
  },
  {
    id: 'exam2_p26',
    title: '26. 조인 결과의 행 수',
    description:
      'A 테이블의 행 수가 5, B 테이블의 행 수가 3이고, 조인 조건에 일치하는 행이 2건일 때, INNER JOIN의 결과 행 수는?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 80,
    answer: '2',
    explanation:
      'INNER JOIN은 양쪽 테이블에서 조인 조건이 일치하는 행만 반환합니다. 일치하는 행이 2건이므로 결과는 2건입니다.',
    options: [
      '5건',
      '2건',
      '8건',
      '3건',
    ],
    points: 10,
  },
  {
    id: 'exam2_p27',
    title: '27. 다중 조인 시 주의사항',
    description:
      '3개 이상의 테이블을 OUTER JOIN할 때 주의해야 할 점은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 38,
    answer: '3',
    explanation:
      '3개 이상의 테이블을 OUTER JOIN할 때, 조인 순서에 따라 결과가 달라질 수 있습니다. 먼저 수행된 OUTER JOIN의 NULL 행이 다음 조인에서 제외될 수 있으므로 조인 순서를 신중하게 결정해야 합니다.',
    options: [
      '항상 INNER JOIN으로 변환하여 사용해야 한다.',
      '3개 이상의 테이블은 OUTER JOIN할 수 없다.',
      '조인 순서에 따라 결과가 달라질 수 있으므로 순서에 주의해야 한다.',
      'FULL OUTER JOIN만 사용할 수 있다.',
    ],
    points: 10,
  },

  // --- 서브쿼리 (28~32) ---
  {
    id: 'exam2_p28',
    title: '28. 상관 서브쿼리',
    description:
      '상관 서브쿼리(Correlated Subquery)에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 42,
    answer: '2',
    explanation:
      '상관 서브쿼리는 메인 쿼리의 컬럼을 참조하며, 메인 쿼리의 각 행마다 서브쿼리가 반복 실행됩니다. 비상관 서브쿼리는 독립적으로 한 번만 실행되는 반면, 상관 서브쿼리는 메인 쿼리에 종속됩니다.',
    options: [
      '서브쿼리가 독립적으로 한 번만 실행된다.',
      '메인 쿼리의 각 행마다 서브쿼리가 반복 실행된다.',
      '항상 단일 행을 반환한다.',
      'FROM 절에서만 사용할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p29',
    title: '29. IN vs EXISTS',
    description:
      'IN과 EXISTS의 차이에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 40,
    answer: '4',
    explanation:
      'IN은 서브쿼리의 결과 집합과 값을 비교하고, EXISTS는 서브쿼리의 결과 존재 여부만 확인합니다. 서브쿼리 결과에 NULL이 포함되면 NOT IN은 의도와 다른 결과를 반환할 수 있지만, NOT EXISTS는 영향받지 않습니다.',
    options: [
      'IN과 EXISTS는 항상 동일한 결과를 반환한다.',
      'EXISTS가 항상 IN보다 빠르다.',
      'IN은 상관 서브쿼리에서만 사용 가능하다.',
      'NOT IN은 NULL 값이 포함되면 결과가 달라질 수 있지만 NOT EXISTS는 그렇지 않다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p30',
    title: '30. 서브쿼리의 위치',
    description:
      '다음 중 서브쿼리를 사용할 수 없는 위치는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 55,
    answer: '4',
    explanation:
      '서브쿼리는 SELECT 절(스칼라), FROM 절(인라인 뷰), WHERE 절, HAVING 절 등에서 사용 가능합니다. GROUP BY 절에는 서브쿼리를 사용할 수 없습니다.',
    options: [
      'SELECT 절',
      'FROM 절',
      'HAVING 절',
      'GROUP BY 절',
    ],
    points: 10,
  },
  {
    id: 'exam2_p31',
    title: '31. ANY / ALL 연산자',
    description:
      '서브쿼리가 (100, 200, 300)을 반환할 때,\nWHERE SAL > ALL (서브쿼리)의 의미는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 58,
    answer: '3',
    explanation:
      'ALL은 서브쿼리의 모든 값을 만족해야 합니다. SAL > ALL(100, 200, 300)은 SAL이 300보다 커야 한다는 뜻으로, 서브쿼리 결과의 최대값보다 커야 합니다.',
    options: [
      'SAL이 100보다 큰 행',
      'SAL이 200보다 큰 행',
      'SAL이 300보다 큰 행 (최대값 초과)',
      'SAL이 100, 200, 300 중 하나보다 큰 행',
    ],
    points: 10,
  },
  {
    id: 'exam2_p32',
    title: '32. 다중 컬럼 서브쿼리',
    description:
      '다중 컬럼 서브쿼리에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 45,
    answer: '1',
    explanation:
      '다중 컬럼 서브쿼리는 서브쿼리의 결과가 여러 컬럼을 반환하며, 메인 쿼리의 조건절에서 여러 컬럼을 동시에 비교합니다. WHERE (DEPTNO, JOB) IN (SELECT DEPTNO, JOB FROM ...) 형태로 사용합니다.',
    options: [
      '서브쿼리가 여러 컬럼을 반환하여 동시에 비교하는 서브쿼리이다.',
      '여러 개의 서브쿼리를 동시에 실행하는 것이다.',
      'SELECT 절에서만 사용할 수 있다.',
      '단일행 서브쿼리의 다른 이름이다.',
    ],
    points: 10,
  },

  // --- 윈도우함수 (33~36) ---
  {
    id: 'exam2_p33',
    title: '33. 윈도우 함수 기본',
    description:
      '윈도우 함수에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '윈도우함수',
    correctRate: 72,
    answer: '4',
    explanation:
      '윈도우 함수는 GROUP BY와 달리 행을 그룹으로 축소하지 않습니다. 각 행을 유지하면서 그룹 단위의 집계값을 함께 조회할 수 있습니다.',
    options: [
      'OVER 절과 함께 사용한다.',
      'PARTITION BY로 그룹을 나눌 수 있다.',
      'ORDER BY로 정렬 기준을 지정할 수 있다.',
      'GROUP BY와 동일하게 행을 그룹으로 축소한다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p34',
    title: '34. NTILE 함수',
    description:
      '10건의 행을 NTILE(3)으로 나누면 각 그룹의 행 수는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 50,
    answer: '2',
    explanation:
      'NTILE(3)은 행을 3개 그룹으로 균등 분할합니다. 10건을 3으로 나누면 몫이 3, 나머지가 1이므로 첫 번째 그룹에 4건, 나머지 두 그룹에 3건씩 배분됩니다.',
    options: [
      '3건, 3건, 4건',
      '4건, 3건, 3건',
      '3건, 4건, 3건',
      '4건, 4건, 2건',
    ],
    points: 10,
  },
  {
    id: 'exam2_p35',
    title: '35. 누적 합계 (Cumulative Sum)',
    description:
      '다음 SQL에서 RUNNING_SUM의 의미는?\n\nSELECT ENAME, SAL,\n  SUM(SAL) OVER (ORDER BY HIREDATE\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RUNNING_SUM\nFROM EMP;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 38,
    answer: '1',
    explanation:
      'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW는 파티션의 첫 행부터 현재 행까지의 범위를 지정합니다. 따라서 입사일 순으로 정렬된 급여의 누적 합계가 됩니다.',
    options: [
      '입사일순 급여 누적 합계',
      '전체 급여 합계',
      '부서별 급여 합계',
      '현재 행의 급여만',
    ],
    points: 10,
  },
  {
    id: 'exam2_p36',
    title: '36. FIRST_VALUE / LAST_VALUE',
    description:
      'FIRST_VALUE(SAL) OVER (PARTITION BY DEPTNO ORDER BY SAL)의 결과는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 60,
    answer: '2',
    explanation:
      'FIRST_VALUE는 윈도우 프레임 내에서 첫 번째 값을 반환합니다. PARTITION BY DEPTNO로 부서별 그룹을 나누고 ORDER BY SAL로 급여 오름차순 정렬하므로, 각 부서의 최소 급여가 반환됩니다.',
    options: [
      '전체에서 가장 높은 급여',
      '해당 부서에서 가장 낮은 급여',
      '해당 부서에서 가장 높은 급여',
      '전체에서 가장 낮은 급여',
    ],
    points: 10,
  },

  // --- 집합연산 (37~40) ---
  {
    id: 'exam2_p37',
    title: '37. UNION 사용 조건',
    description:
      'UNION 사용 시 반드시 충족해야 하는 조건이 아닌 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 75,
    answer: '4',
    explanation:
      'UNION은 두 SELECT 문의 컬럼 수가 동일해야 하고, 대응하는 컬럼의 데이터 타입이 호환되어야 합니다. 컬럼명은 달라도 괜찮으며, 첫 번째 SELECT의 컬럼명이 사용됩니다.',
    options: [
      '두 SELECT 문의 컬럼 수가 동일해야 한다.',
      '대응하는 컬럼의 데이터 타입이 호환되어야 한다.',
      'ORDER BY는 마지막 SELECT에만 사용할 수 있다.',
      '두 SELECT 문의 컬럼명이 반드시 동일해야 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p38',
    title: '38. GROUPING SETS',
    description:
      '다음 SQL의 결과는?\n\nSELECT DEPTNO, JOB, SUM(SAL)\nFROM EMP\nGROUP BY GROUPING SETS((DEPTNO), (JOB));',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 40,
    answer: '3',
    explanation:
      'GROUPING SETS((DEPTNO), (JOB))는 DEPTNO별 소계와 JOB별 소계를 각각 구하여 UNION ALL한 것과 같습니다. 전체 합계는 포함되지 않습니다.',
    options: [
      'DEPTNO별 소계만 출력한다.',
      'JOB별 소계만 출력한다.',
      'DEPTNO별 소계와 JOB별 소계를 모두 출력한다.',
      'DEPTNO+JOB 조합별 소계와 전체 총계를 출력한다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p39',
    title: '39. GROUPING 함수',
    description:
      'GROUPING 함수에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 35,
    answer: '2',
    explanation:
      'GROUPING(컬럼)은 해당 컬럼이 소계에 의해 NULL로 표시된 것인지 구분합니다. 소계로 인한 NULL이면 1, 실제 데이터의 NULL이면 0을 반환합니다.',
    options: [
      '그룹별 행의 수를 반환한다.',
      '소계로 인한 NULL이면 1을, 실제 데이터면 0을 반환한다.',
      'GROUP BY에서 그룹의 순서를 지정한다.',
      'HAVING 절에서만 사용 가능하다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p40',
    title: '40. 집합 연산자와 정렬',
    description:
      '집합 연산자 사용 시 ORDER BY에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 78,
    answer: '2',
    explanation:
      '집합 연산자 사용 시 ORDER BY는 전체 결과에 대해 마지막에 한 번만 사용할 수 있습니다. 각 SELECT 문에 개별적으로 ORDER BY를 쓸 수 없습니다.',
    options: [
      '각 SELECT 문마다 개별적으로 ORDER BY를 사용할 수 있다.',
      '마지막 SELECT 문 뒤에만 ORDER BY를 사용할 수 있다.',
      'ORDER BY를 사용할 수 없다.',
      'UNION ALL에서만 ORDER BY를 사용할 수 있다.',
    ],
    points: 10,
  },

  // --- DDL (41~43) ---
  {
    id: 'exam2_p41',
    title: '41. FOREIGN KEY',
    description:
      'FOREIGN KEY 제약조건에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 62,
    answer: '3',
    explanation:
      'FOREIGN KEY 컬럼에는 참조하는 테이블의 PK/UNIQUE 값 또는 NULL 값이 들어갈 수 있습니다. 반드시 NOT NULL이어야 하는 것은 아닙니다.',
    options: [
      '참조하는 테이블의 PK 또는 UNIQUE 컬럼을 참조한다.',
      '참조 무결성을 보장하는 제약조건이다.',
      'FOREIGN KEY 컬럼은 반드시 NOT NULL이어야 한다.',
      'ON DELETE CASCADE 옵션을 설정할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p42',
    title: '42. CHECK 제약조건',
    description:
      '다음 DDL에서 CHECK 제약조건의 역할은?\n\nCREATE TABLE EMP (\n  EMPNO NUMBER PRIMARY KEY,\n  SAL NUMBER CHECK (SAL > 0)\n);',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 85,
    answer: '1',
    explanation:
      'CHECK 제약조건은 컬럼에 저장될 수 있는 값의 조건을 지정합니다. SAL > 0은 급여가 반드시 0보다 커야 함을 의미합니다.',
    options: [
      'SAL 컬럼에 0보다 큰 값만 저장할 수 있도록 제한한다.',
      'SAL 컬럼의 값이 유일해야 한다.',
      'SAL 컬럼에 NULL을 허용하지 않는다.',
      'SAL 컬럼에 인덱스를 생성한다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p43',
    title: '43. DROP TABLE',
    description:
      'DROP TABLE에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 78,
    answer: '3',
    explanation:
      'DROP TABLE은 DDL이므로 AUTO COMMIT되어 ROLLBACK으로 복구할 수 없습니다. 테이블 구조와 데이터 모두 삭제됩니다. CASCADE CONSTRAINTS 옵션을 사용하면 참조하는 외래키도 함께 삭제됩니다.',
    options: [
      '테이블 구조와 데이터를 모두 삭제한다.',
      'DDL이므로 AUTO COMMIT된다.',
      'ROLLBACK으로 복구할 수 있다.',
      'CASCADE CONSTRAINTS 옵션을 사용할 수 있다.',
    ],
    points: 10,
  },

  // --- TCL (44~46) ---
  {
    id: 'exam2_p44',
    title: '44. 암시적 COMMIT',
    description:
      '다음 중 암시적(자동) COMMIT이 발생하는 경우는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'TCL',
    correctRate: 58,
    answer: '3',
    explanation:
      'DDL(CREATE, ALTER, DROP 등)을 실행하면 암시적으로 COMMIT이 발생합니다. DML(INSERT, UPDATE, DELETE)은 명시적으로 COMMIT해야 확정됩니다.',
    options: [
      'INSERT 문을 실행했을 때',
      'SELECT 문을 실행했을 때',
      'DDL(CREATE TABLE 등)을 실행했을 때',
      'WHERE 절이 없는 UPDATE를 실행했을 때',
    ],
    points: 10,
  },
  {
    id: 'exam2_p45',
    title: '45. SAVEPOINT 활용',
    description:
      '다음 SQL 실행 후 테이블에 남아있는 데이터는?\n\nINSERT INTO T VALUES (1);\nSAVEPOINT A;\nINSERT INTO T VALUES (2);\nSAVEPOINT B;\nINSERT INTO T VALUES (3);\nROLLBACK TO A;\nINSERT INTO T VALUES (4);\nCOMMIT;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 42,
    answer: '2',
    explanation:
      'ROLLBACK TO A는 SAVEPOINT A 이후의 모든 변경(2, 3 삽입)을 취소합니다. 이후 4를 삽입하고 COMMIT하면, 최종적으로 1과 4만 저장됩니다.',
    options: [
      '1, 2, 3, 4',
      '1, 4',
      '1, 2, 4',
      '4만',
    ],
    points: 10,
  },
  {
    id: 'exam2_p46',
    title: '46. 트랜잭션 격리 수준',
    description:
      '다음 중 트랜잭션 격리 수준(Isolation Level)이 아닌 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'TCL',
    correctRate: 55,
    answer: '4',
    explanation:
      'SQL 표준의 트랜잭션 격리 수준은 Read Uncommitted, Read Committed, Repeatable Read, Serializable의 4단계입니다. Read Only는 격리 수준이 아닙니다.',
    options: [
      'Read Uncommitted',
      'Read Committed',
      'Serializable',
      'Read Only',
    ],
    points: 10,
  },

  // --- DCL (47~48) ---
  {
    id: 'exam2_p47',
    title: '47. ROLE',
    description:
      '다음 중 ROLE에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DCL',
    correctRate: 65,
    answer: '2',
    explanation:
      'ROLE은 여러 권한을 묶어서 관리하는 권한의 집합입니다. 사용자에게 개별 권한을 하나씩 부여하는 대신 ROLE을 부여하면 권한 관리가 효율적입니다.',
    options: [
      '단일 권한만 포함할 수 있다.',
      '여러 권한을 하나의 그룹으로 묶어 관리할 수 있다.',
      '한 사용자에게 하나의 ROLE만 부여할 수 있다.',
      'DBA만 ROLE을 생성할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam2_p48',
    title: '48. WITH GRANT OPTION',
    description:
      'GRANT SELECT ON EMP TO user1 WITH GRANT OPTION;에서\nWITH GRANT OPTION의 의미는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DCL',
    correctRate: 60,
    answer: '1',
    explanation:
      'WITH GRANT OPTION은 권한을 받은 사용자가 다른 사용자에게 동일한 권한을 부여할 수 있는 옵션입니다. user1이 다른 사용자에게 EMP 테이블의 SELECT 권한을 다시 부여할 수 있습니다.',
    options: [
      'user1이 다른 사용자에게 같은 권한을 부여할 수 있다.',
      'user1의 권한이 영구적으로 유지된다.',
      'user1이 EMP 테이블을 수정할 수 있다.',
      'user1이 모든 테이블에 접근할 수 있다.',
    ],
    points: 10,
  },

  // --- 계층형쿼리 (49~50) ---
  {
    id: 'exam2_p49',
    title: '49. LEVEL 의사컬럼',
    description:
      'Oracle 계층형 쿼리에서 LEVEL 의사컬럼(Pseudo Column)의 의미는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '계층형쿼리',
    correctRate: 55,
    answer: '3',
    explanation:
      'LEVEL은 계층형 쿼리에서 현재 행의 계층 깊이를 나타냅니다. 루트 노드가 LEVEL 1이며, 자식으로 내려갈수록 LEVEL이 1씩 증가합니다.',
    options: [
      '전체 계층의 최대 깊이',
      '현재 행의 정렬 순서',
      '현재 행의 계층 깊이 (루트=1)',
      '부모 노드의 식별자',
    ],
    points: 10,
  },
  {
    id: 'exam2_p50',
    title: '50. CONNECT BY PRIOR',
    description:
      '다음 계층형 쿼리에서 PRIOR 키워드의 위치에 따른 탐색 방향은?\n\n-- SQL1: CONNECT BY PRIOR EMPNO = MGR\n-- SQL2: CONNECT BY EMPNO = PRIOR MGR',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 38,
    answer: '1',
    explanation:
      'PRIOR는 이전(부모) 행을 참조합니다. SQL1은 부모의 EMPNO = 자식의 MGR이므로 TOP-DOWN(순방향) 탐색입니다. SQL2는 자식의 EMPNO = 부모의 MGR이므로 BOTTOM-UP(역방향) 탐색입니다.',
    options: [
      'SQL1은 순방향(TOP-DOWN), SQL2는 역방향(BOTTOM-UP)',
      'SQL1은 역방향(BOTTOM-UP), SQL2는 순방향(TOP-DOWN)',
      '두 SQL 모두 동일한 방향으로 탐색한다.',
      'PRIOR의 위치는 탐색 방향에 영향을 주지 않는다.',
    ],
    points: 10,
  },
];
