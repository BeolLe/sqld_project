import type { Problem } from '../../types';

// SQLD 모의고사 1회 (기본 난이도 - 목표 합격률 ~55%)
// 1과목: 데이터 모델링의 이해 (10문항, 20점)
// 2과목: SQL 기본 및 활용 (40문항, 80점)
// 난이도 배분: easy 20 / medium 20 / hard 10

export const EXAM_1_PROBLEMS: Problem[] = [
  // ===== 1과목: 데이터 모델링의 이해 (1~10번) =====
  {
    id: 'exam1_p1',
    title: '1. 데이터 모델링의 3단계',
    description:
      '데이터 모델링의 3단계를 순서대로 나열한 것으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 82,
    answer: '2',
    explanation:
      '데이터 모델링은 개념적 모델링 → 논리적 모델링 → 물리적 모델링 순서로 진행됩니다. 개념적 모델링은 업무 중심의 포괄적 수준, 논리적 모델링은 KEY/속성/관계를 표현, 물리적 모델링은 실제 DB 구현을 위한 물리적 구조를 설계합니다.',
    options: [
      '물리적 모델링 → 논리적 모델링 → 개념적 모델링',
      '개념적 모델링 → 논리적 모델링 → 물리적 모델링',
      '논리적 모델링 → 개념적 모델링 → 물리적 모델링',
      '개념적 모델링 → 물리적 모델링 → 논리적 모델링',
    ],
    points: 10,
  },
  {
    id: 'exam1_p2',
    title: '2. 엔터티의 특징',
    description:
      '다음 중 엔터티(Entity)의 특징으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 78,
    answer: '4',
    explanation:
      '엔터티는 반드시 2개 이상의 인스턴스를 가져야 합니다. 1개의 인스턴스만 존재하는 것은 엔터티로 적합하지 않습니다. 또한 엔터티는 반드시 속성을 가지고, 다른 엔터티와 관계가 있어야 하며, 업무에서 관리해야 하는 대상이어야 합니다.',
    options: [
      '엔터티는 업무에서 관리해야 하는 집합이다.',
      '엔터티는 반드시 속성(Attribute)을 가져야 한다.',
      '엔터티는 다른 엔터티와 최소 1개 이상의 관계가 있어야 한다.',
      '엔터티는 인스턴스가 1개만 있어도 성립한다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p3',
    title: '3. 속성의 분류',
    description:
      '다음 중 속성(Attribute)의 분류 방법에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 65,
    answer: '3',
    explanation:
      '파생 속성(Derived Attribute)은 다른 속성으로부터 계산이나 변환 등의 방법으로 생성되는 속성입니다. 예를 들어, 생년월일로부터 계산되는 나이, 단가와 수량으로 계산되는 금액 등이 파생 속성입니다.',
    options: [
      '기본 속성은 다른 속성에서 파생되어 만들어진다.',
      '설계 속성은 원래 업무에서 사용하는 속성이다.',
      '파생 속성은 다른 속성으로부터 계산되어 생성되는 속성이다.',
      '기본 속성, 설계 속성, 파생 속성 중 가장 많은 비율을 차지하는 것은 설계 속성이다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p4',
    title: '4. 관계의 종류',
    description:
      '다음 중 관계(Relationship)에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 75,
    answer: '3',
    explanation:
      '관계의 카디널리티(Cardinality)는 1:1, 1:M, M:N으로 분류됩니다. 1:1:1 관계는 존재하지 않는 표기법입니다. 관계의 참여도(Participation)는 필수(Mandatory)와 선택(Optional)으로 구분합니다.',
    options: [
      '관계는 엔터티 간의 논리적 연관성을 의미한다.',
      '관계의 참여도(Participation)는 필수와 선택으로 구분한다.',
      '관계의 카디널리티는 1:1, 1:M, 1:1:1로 분류된다.',
      '관계에는 존재 관계와 행위 관계가 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p5',
    title: '5. 식별자의 종류',
    description:
      '다음 중 식별자(Identifier)에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 60,
    answer: '1',
    explanation:
      '주식별자(Primary Identifier)는 엔터티를 대표하는 유일한 식별자로, 최소성/대표성/유일성/Not Null의 특징을 가집니다. 대체식별자는 후보식별자 중 주식별자로 선정되지 않은 것이며, 외부식별자(Foreign Identifier)는 다른 엔터티로부터 상속받은 식별자입니다.',
    options: [
      '주식별자는 유일성, 최소성, 대표성, Not Null의 특성을 가진다.',
      '대체식별자는 주식별자와 동일한 역할을 수행한다.',
      '외부식별자는 자기 자신의 엔터티 내에서 생성된 식별자이다.',
      '모든 엔터티는 반드시 복합 식별자를 가져야 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p6',
    title: '6. 식별 관계와 비식별 관계',
    description:
      '부모 엔터티의 식별자를 자식 엔터티의 일반 속성으로 상속하는 관계를 무엇이라 하는가?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 80,
    answer: '2',
    explanation:
      '비식별 관계(Non-Identifying Relationship)는 부모의 식별자를 자식의 일반 속성으로 상속합니다. 반면 식별 관계(Identifying Relationship)는 부모의 식별자를 자식의 식별자(PK)에 포함시킵니다.',
    options: [
      '식별 관계(Identifying Relationship)',
      '비식별 관계(Non-Identifying Relationship)',
      '재귀 관계(Recursive Relationship)',
      '배타 관계(Exclusive Relationship)',
    ],
    points: 10,
  },
  {
    id: 'exam1_p7',
    title: '7. 제1정규형(1NF)',
    description:
      '제1정규형(1NF)에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 85,
    answer: '1',
    explanation:
      '제1정규형은 테이블의 모든 속성이 원자값(Atomic Value)만을 갖도록 하는 것입니다. 반복 그룹이나 다중 값을 가지는 속성을 제거합니다.',
    options: [
      '모든 속성이 원자값(Atomic Value)만을 가져야 한다.',
      '부분 함수 종속을 제거해야 한다.',
      '이행 함수 종속을 제거해야 한다.',
      '결정자가 후보키가 아닌 함수 종속을 제거해야 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p8',
    title: '8. 정규화 단계',
    description:
      '기본키가 아닌 모든 속성이 기본키에 완전 함수 종속되도록 하는 정규화 단계는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 62,
    answer: '2',
    explanation:
      '제2정규형(2NF)은 부분 함수 종속을 제거하여, 기본키가 아닌 모든 속성이 기본키에 완전 함수 종속(Full Functional Dependency)되도록 합니다. 이는 기본키가 복합키인 경우에 주로 해당됩니다.',
    options: [
      '제1정규형(1NF)',
      '제2정규형(2NF)',
      '제3정규형(3NF)',
      'BCNF',
    ],
    points: 10,
  },
  {
    id: 'exam1_p9',
    title: '9. 트랜잭션의 특성',
    description:
      '다음 중 트랜잭션의 4가지 특성(ACID)에 해당하지 않는 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 88,
    answer: '4',
    explanation:
      '트랜잭션의 4가지 특성은 원자성(Atomicity), 일관성(Consistency), 고립성/격리성(Isolation), 지속성/영속성(Durability)입니다. 가용성(Availability)은 ACID 특성에 포함되지 않습니다.',
    options: [
      '원자성(Atomicity)',
      '일관성(Consistency)',
      '고립성(Isolation)',
      '가용성(Availability)',
    ],
    points: 10,
  },
  {
    id: 'exam1_p10',
    title: '10. NULL의 특성',
    description:
      'NULL에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 58,
    answer: '3',
    explanation:
      'NULL은 0이나 공백과는 다른, 아직 정의되지 않은 미지의 값입니다. NULL에 어떤 연산을 해도 결과는 NULL이며, NULL과의 비교 연산 결과는 항상 UNKNOWN입니다. NULL + 100 = NULL이지, 100이 아닙니다.',
    options: [
      'NULL은 아직 정의되지 않은 미지의 값이다.',
      'NULL과의 비교 연산 결과는 항상 UNKNOWN이다.',
      'NULL + 100의 결과는 100이다.',
      '집계 함수에서 NULL은 제외되어 계산된다.',
    ],
    points: 10,
  },

  // ===== 2과목: SQL 기본 및 활용 (11~50번) =====

  // --- DML (11~15) ---
  {
    id: 'exam1_p11',
    title: '11. SELECT 문 기본',
    description:
      '다음 SQL 문의 실행 결과로 올바른 것은?\n\nSELECT EMPNO, ENAME, SAL * 12 AS ANNUAL_SAL\nFROM EMP\nWHERE DEPTNO = 10\nORDER BY SAL DESC;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 85,
    answer: '2',
    explanation:
      'WHERE DEPTNO = 10으로 부서번호 10인 사원만 필터링하고, SAL * 12를 ANNUAL_SAL 별칭으로 출력하며, ORDER BY SAL DESC로 급여 내림차순 정렬합니다.',
    options: [
      '모든 사원의 연봉을 오름차순으로 출력한다.',
      '부서번호 10인 사원의 연봉을 급여 내림차순으로 출력한다.',
      '부서번호 10인 사원의 월급을 내림차순으로 출력한다.',
      'ANNUAL_SAL 기준 오름차순으로 출력한다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p12',
    title: '12. WHERE 절 연산자',
    description:
      '다음 중 WHERE 절에서 사용할 수 없는 연산자는?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 80,
    answer: '4',
    explanation:
      'BETWEEN, IN, LIKE는 모두 WHERE 절에서 사용 가능한 연산자입니다. HAVING은 연산자가 아니라 GROUP BY와 함께 사용되는 절(clause)입니다.',
    options: [
      'BETWEEN A AND B',
      'IN (value1, value2, ...)',
      'LIKE',
      'HAVING',
    ],
    points: 10,
  },
  {
    id: 'exam1_p13',
    title: '13. INSERT 문',
    description:
      '다음 SQL 문에서 오류가 발생하는 것은?\n\n테이블 정의:\nCREATE TABLE DEPT (\n  DEPTNO NUMBER(2) PRIMARY KEY,\n  DNAME VARCHAR2(14) NOT NULL,\n  LOC VARCHAR2(13)\n);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 65,
    answer: '3',
    explanation:
      'DNAME 컬럼은 NOT NULL 제약조건이 있으므로, DNAME을 포함하지 않는 INSERT는 오류가 발생합니다. 보기 3은 DEPTNO와 LOC만 지정하고 DNAME을 누락했으므로 NOT NULL 위반 오류가 발생합니다.',
    options: [
      "INSERT INTO DEPT VALUES (10, '기획부', '서울');",
      "INSERT INTO DEPT (DEPTNO, DNAME) VALUES (20, '개발부');",
      "INSERT INTO DEPT (DEPTNO, LOC) VALUES (30, '부산');",
      "INSERT INTO DEPT VALUES (40, '인사부', NULL);",
    ],
    points: 10,
  },
  {
    id: 'exam1_p14',
    title: '14. UPDATE와 DELETE',
    description:
      '다음 SQL 문의 결과로 올바른 것은?\n\nDELETE FROM EMP WHERE DEPTNO = 30;\nUPDATE EMP SET SAL = SAL * 1.1 WHERE DEPTNO = 20;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 82,
    answer: '1',
    explanation:
      'DELETE는 DEPTNO가 30인 모든 행을 삭제하고, UPDATE는 DEPTNO가 20인 사원들의 급여를 10% 인상합니다.',
    options: [
      '부서 30의 사원이 삭제되고, 부서 20의 급여가 10% 인상된다.',
      '부서 30의 사원이 삭제되고, 모든 사원의 급여가 10% 인상된다.',
      '모든 사원이 삭제되고, 부서 20의 급여가 10% 인상된다.',
      '부서 30과 20의 사원이 모두 삭제된다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p15',
    title: '15. DISTINCT',
    description:
      '다음 SQL 문의 결과로 올바른 것은?\n\nEMP 테이블에 DEPTNO가 10, 10, 20, 20, 20, 30인 6개 행이 있을 때:\n\nSELECT COUNT(DISTINCT DEPTNO) FROM EMP;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 88,
    answer: '3',
    explanation:
      'DISTINCT DEPTNO는 중복을 제거하여 10, 20, 30의 3개 값만 남기고, COUNT 함수로 개수를 세면 3이 됩니다.',
    options: [
      '6',
      '2',
      '3',
      '1',
    ],
    points: 10,
  },

  // --- 함수 (16~21) ---
  {
    id: 'exam1_p16',
    title: '16. NVL 함수',
    description:
      '다음 SQL의 결과는?\n\nSELECT NVL(NULL, 100) FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 62,
    answer: '2',
    explanation:
      'NVL(expr1, expr2)는 expr1이 NULL이면 expr2를 반환합니다. 첫 번째 인수가 NULL이므로 100을 반환합니다.',
    options: [
      'NULL',
      '100',
      '0',
      '오류 발생',
    ],
    points: 10,
  },
  {
    id: 'exam1_p17',
    title: '17. DECODE 함수',
    description:
      "다음 SQL의 결과는?\n\nSELECT DECODE(10, 10, 'A', 20, 'B', 'C') FROM DUAL;",
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 58,
    answer: '1',
    explanation:
      "DECODE(expr, search1, result1, search2, result2, ..., default)에서 expr=10이고 search1=10이 일치하므로 result1인 'A'를 반환합니다.",
    options: [
      'A',
      'B',
      'C',
      'NULL',
    ],
    points: 10,
  },
  {
    id: 'exam1_p18',
    title: '18. CASE 표현식',
    description:
      '다음 SQL의 결과는?\n\nSELECT CASE WHEN 10 > 5 THEN \'참\' ELSE \'거짓\' END FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 85,
    answer: '1',
    explanation:
      'CASE WHEN 조건이 10 > 5이고 이는 TRUE이므로 THEN 절의 \'참\'을 반환합니다.',
    options: [
      '참',
      '거짓',
      'NULL',
      '오류 발생',
    ],
    points: 10,
  },
  {
    id: 'exam1_p19',
    title: '19. 문자 함수',
    description:
      "다음 SQL의 결과는?\n\nSELECT SUBSTR('DATABASE', 1, 4) FROM DUAL;",
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 82,
    answer: '1',
    explanation:
      "SUBSTR(문자열, 시작위치, 길이)에서 'DATABASE'의 1번째 위치부터 4글자를 추출하면 'DATA'가 됩니다.",
    options: [
      'DATA',
      'DATAB',
      'BASE',
      'ATAS',
    ],
    points: 10,
  },
  {
    id: 'exam1_p20',
    title: '20. 집계 함수와 NULL',
    description:
      'EMP 테이블의 COMM 컬럼 값이 300, NULL, 500, NULL, 200일 때,\n다음 SQL의 결과는?\n\nSELECT AVG(COMM) FROM EMP;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 58,
    answer: '3',
    explanation:
      '집계 함수(AVG, SUM 등)는 NULL을 제외하고 계산합니다. NULL을 제외한 값은 300, 500, 200이므로 AVG = (300+500+200)/3 ≈ 333.33입니다. NULL을 포함한 5로 나누지 않습니다.',
    options: [
      '200',
      '100',
      '333.33 (근사값)',
      '0',
    ],
    points: 10,
  },
  {
    id: 'exam1_p21',
    title: '21. COALESCE 함수',
    description:
      '다음 SQL의 결과는?\n\nSELECT COALESCE(NULL, NULL, 300, 400) FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 68,
    answer: '2',
    explanation:
      'COALESCE 함수는 인수 목록에서 NULL이 아닌 첫 번째 값을 반환합니다. 첫 번째와 두 번째가 NULL이므로 세 번째 값인 300을 반환합니다.',
    options: [
      'NULL',
      '300',
      '400',
      '700',
    ],
    points: 10,
  },

  // --- JOIN (22~29) ---
  {
    id: 'exam1_p22',
    title: '22. INNER JOIN',
    description:
      '다음 중 INNER JOIN에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 38,
    answer: '2',
    explanation:
      'INNER JOIN은 양쪽 테이블에서 조인 조건이 일치하는 행만 반환합니다. 일치하지 않는 행은 결과에 포함되지 않습니다.',
    options: [
      '한쪽 테이블의 모든 행을 출력한다.',
      '양쪽 테이블에 모두 일치하는 행만 반환한다.',
      '조인 조건이 없어도 사용 가능하다.',
      'NULL 값을 포함한 모든 행을 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p23',
    title: '23. LEFT OUTER JOIN',
    description:
      'EMP 테이블에 5건, DEPT 테이블에 4건이 있고, EMP의 DEPTNO 중 1건이 DEPT에 존재하지 않을 때,\n다음 SQL의 결과 행 수는?\n\nSELECT *\nFROM EMP E LEFT OUTER JOIN DEPT D\nON E.DEPTNO = D.DEPTNO;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 65,
    answer: '3',
    explanation:
      'LEFT OUTER JOIN은 왼쪽 테이블(EMP)의 모든 행을 보존합니다. EMP에 5건이 있으므로 결과는 최소 5건이며, 일치하지 않는 1건의 DEPT 컬럼은 NULL로 채워집니다.',
    options: [
      '4건',
      '9건',
      '5건',
      '6건',
    ],
    points: 10,
  },
  {
    id: 'exam1_p24',
    title: '24. CROSS JOIN',
    description:
      'A 테이블에 3건, B 테이블에 4건이 있을 때,\nSELECT * FROM A CROSS JOIN B;의 결과 행 수는?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 82,
    answer: '3',
    explanation:
      'CROSS JOIN(교차 조인)은 카테시안 곱(Cartesian Product)을 생성합니다. 3 × 4 = 12건의 결과가 반환됩니다.',
    options: [
      '3건',
      '7건',
      '12건',
      '4건',
    ],
    points: 10,
  },
  {
    id: 'exam1_p25',
    title: '25. NATURAL JOIN',
    description:
      'NATURAL JOIN에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 55,
    answer: '4',
    explanation:
      'NATURAL JOIN은 두 테이블에서 같은 이름을 가진 모든 컬럼을 자동으로 조인 조건으로 사용합니다. 조인에 사용된 컬럼에는 테이블 별칭(Alias)을 사용할 수 없습니다.',
    options: [
      '같은 이름을 가진 컬럼을 자동으로 조인한다.',
      'ON 절을 별도로 명시하지 않는다.',
      '동일 컬럼명이 여러 개면 모두 조인 조건에 포함된다.',
      '조인 컬럼에 테이블 별칭(Alias)을 사용할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p26',
    title: '26. SELF JOIN',
    description:
      '다음 SQL에서 조회하는 것은?\n\nSELECT E.ENAME AS 사원명, M.ENAME AS 관리자명\nFROM EMP E JOIN EMP M\nON E.MGR = M.EMPNO;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 62,
    answer: '1',
    explanation:
      'SELF JOIN은 같은 테이블을 두 번 참조하여 조인합니다. E(사원)의 MGR(관리자번호)와 M(관리자)의 EMPNO를 매칭하여 각 사원의 관리자 이름을 조회합니다.',
    options: [
      '각 사원과 해당 관리자의 이름을 조회한다.',
      '모든 사원의 이름을 두 번 출력한다.',
      '관리자가 없는 사원도 포함하여 출력한다.',
      '두 개의 서로 다른 테이블을 조인한다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p27',
    title: '27. JOIN과 WHERE 절',
    description:
      '다음 두 SQL의 결과가 동일한가?\n\n-- SQL1\nSELECT * FROM EMP E, DEPT D\nWHERE E.DEPTNO = D.DEPTNO;\n\n-- SQL2\nSELECT * FROM EMP E INNER JOIN DEPT D\nON E.DEPTNO = D.DEPTNO;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 75,
    answer: '1',
    explanation:
      'WHERE 절을 사용한 등가 조인(SQL1)과 INNER JOIN ... ON(SQL2)은 동일한 결과를 반환합니다. SQL1은 Oracle 전통 방식이고, SQL2는 ANSI 표준 방식입니다.',
    options: [
      '동일하다.',
      'SQL1이 더 많은 행을 반환한다.',
      'SQL2가 더 많은 행을 반환한다.',
      '문법 오류가 발생한다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p28',
    title: '28. FULL OUTER JOIN',
    description:
      'FULL OUTER JOIN에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 60,
    answer: '3',
    explanation:
      'FULL OUTER JOIN은 LEFT OUTER JOIN과 RIGHT OUTER JOIN의 합집합입니다. 양쪽 테이블 모두에서 일치하지 않는 행도 포함하며, 매칭되지 않는 부분은 NULL로 채웁니다.',
    options: [
      '양쪽 테이블의 교집합만 반환한다.',
      '왼쪽 테이블의 모든 행만 반환한다.',
      '양쪽 테이블의 모든 행을 반환하며, 매칭되지 않는 부분은 NULL로 채운다.',
      'CROSS JOIN과 동일한 결과를 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p29',
    title: '29. 다중 테이블 JOIN',
    description:
      '3개 테이블(A, B, C)을 조인할 때, 올바른 ANSI 표준 SQL 구문은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 48,
    answer: '2',
    explanation:
      'ANSI 표준에서 3개 이상의 테이블을 조인할 때는 JOIN ... ON을 연쇄적으로 작성합니다. 각 조인마다 ON 절로 조건을 명시해야 합니다.',
    options: [
      'SELECT * FROM A, B, C ON A.id = B.id AND B.id = C.id;',
      'SELECT * FROM A JOIN B ON A.id = B.a_id JOIN C ON B.id = C.b_id;',
      'SELECT * FROM A JOIN B JOIN C ON A.id = B.id = C.id;',
      'SELECT * FROM A INNER JOIN (B, C) ON A.id = B.id AND B.id = C.id;',
    ],
    points: 10,
  },

  // --- 서브쿼리 (30~34) ---
  {
    id: 'exam1_p30',
    title: '30. 단일행 서브쿼리',
    description:
      '다음 SQL에서 서브쿼리의 종류는?\n\nSELECT * FROM EMP\nWHERE SAL > (SELECT AVG(SAL) FROM EMP);',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '서브쿼리',
    correctRate: 78,
    answer: '1',
    explanation:
      '서브쿼리가 AVG(SAL)이라는 단일 값을 반환하므로 단일행 서브쿼리입니다. 단일행 서브쿼리는 =, >, <, >= 등의 비교 연산자와 함께 사용합니다.',
    options: [
      '단일행 서브쿼리',
      '다중행 서브쿼리',
      '상관 서브쿼리',
      '스칼라 서브쿼리',
    ],
    points: 10,
  },
  {
    id: 'exam1_p31',
    title: '31. 다중행 서브쿼리 연산자',
    description:
      '다중행 서브쿼리에서 사용할 수 있는 연산자가 아닌 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 60,
    answer: '4',
    explanation:
      'IN, ANY, ALL은 다중행 서브쿼리에서 사용 가능한 연산자입니다. = 연산자는 단일행 서브쿼리에서만 사용할 수 있으며, 다중행 서브쿼리에서 = 를 쓰면 오류가 발생합니다.',
    options: [
      'IN',
      'ANY',
      'ALL',
      '= (단독 사용)',
    ],
    points: 10,
  },
  {
    id: 'exam1_p32',
    title: '32. 인라인 뷰',
    description:
      '다음 SQL에서 인라인 뷰(Inline View)에 해당하는 부분은?\n\nSELECT A.ENAME, A.SAL\nFROM (\n  SELECT ENAME, SAL, DEPTNO\n  FROM EMP\n  WHERE DEPTNO = 10\n) A\nWHERE A.SAL > 2000;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 68,
    answer: '2',
    explanation:
      '인라인 뷰는 FROM 절에 위치하는 서브쿼리로, 하나의 임시 테이블처럼 사용됩니다. 위 SQL에서 FROM 절의 서브쿼리가 인라인 뷰이며, A라는 별칭으로 참조됩니다.',
    options: [
      'WHERE A.SAL > 2000',
      'FROM 절 안의 SELECT ~ WHERE DEPTNO = 10 부분',
      'SELECT A.ENAME, A.SAL',
      '전체 SQL 자체',
    ],
    points: 10,
  },
  {
    id: 'exam1_p33',
    title: '33. EXISTS 서브쿼리',
    description:
      'EXISTS 서브쿼리에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 45,
    answer: '3',
    explanation:
      'EXISTS는 서브쿼리의 결과가 한 건이라도 존재하면 TRUE를 반환합니다. 서브쿼리의 실제 값을 반환하는 것이 아니라 존재 여부만 확인하므로, SELECT 절에 무엇을 쓰든 결과에 영향을 주지 않습니다.',
    options: [
      '서브쿼리의 모든 행을 반환한다.',
      '서브쿼리 결과의 첫 번째 행만 반환한다.',
      '서브쿼리 결과가 한 건이라도 있으면 TRUE를 반환한다.',
      'NOT EXISTS는 서브쿼리 결과가 있을 때 TRUE를 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p34',
    title: '34. 스칼라 서브쿼리',
    description:
      '스칼라 서브쿼리에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 42,
    answer: '4',
    explanation:
      '스칼라 서브쿼리는 SELECT 절에 위치하며 반드시 단일 값(1행 1열)을 반환해야 합니다. 2건 이상의 행을 반환하면 오류가 발생합니다. 결과가 없으면 NULL을 반환합니다.',
    options: [
      'SELECT 절에 위치하는 서브쿼리이다.',
      '반드시 1행 1열의 값을 반환해야 한다.',
      '결과가 없으면 NULL을 반환한다.',
      '2건 이상의 결과를 반환할 수 있다.',
    ],
    points: 10,
  },

  // --- 윈도우함수 (35~38) ---
  {
    id: 'exam1_p35',
    title: '35. ROW_NUMBER 함수',
    description:
      '다음 SQL의 결과에서 RN 값이 1인 행은?\n\nSELECT ENAME, SAL,\n  ROW_NUMBER() OVER (ORDER BY SAL DESC) AS RN\nFROM EMP;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 70,
    answer: '1',
    explanation:
      'ROW_NUMBER()는 ORDER BY 기준으로 순차적인 번호를 부여합니다. SAL DESC이므로 급여가 가장 높은 사원의 RN이 1이 됩니다.',
    options: [
      '급여가 가장 높은 사원',
      '급여가 가장 낮은 사원',
      '첫 번째로 입사한 사원',
      'EMPNO가 가장 작은 사원',
    ],
    points: 10,
  },
  {
    id: 'exam1_p36',
    title: '36. RANK vs DENSE_RANK',
    description:
      'SAL이 5000, 3000, 3000, 2000인 4명의 사원이 있을 때,\nRANK() OVER (ORDER BY SAL DESC)와 DENSE_RANK() OVER (ORDER BY SAL DESC)의\n세 번째 행(SAL=3000) 결과는 각각?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 45,
    answer: '2',
    explanation:
      'RANK는 동일 순위 후 다음 순위를 건너뜁니다(1,2,2,4). DENSE_RANK는 건너뛰지 않습니다(1,2,2,3). 두 번째와 세 번째가 동일 SAL=3000이므로 RANK=2, DENSE_RANK=2입니다.',
    options: [
      'RANK: 3, DENSE_RANK: 3',
      'RANK: 2, DENSE_RANK: 2',
      'RANK: 2, DENSE_RANK: 3',
      'RANK: 3, DENSE_RANK: 2',
    ],
    points: 10,
  },
  {
    id: 'exam1_p37',
    title: '37. SUM OVER (PARTITION BY)',
    description:
      '다음 SQL에서 D_SUM이 의미하는 것은?\n\nSELECT ENAME, DEPTNO, SAL,\n  SUM(SAL) OVER (PARTITION BY DEPTNO) AS D_SUM\nFROM EMP;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 62,
    answer: '3',
    explanation:
      'SUM(SAL) OVER (PARTITION BY DEPTNO)는 부서별로 파티션을 나누어 각 부서의 급여 합계를 계산합니다. 각 행에 해당 부서의 급여 합계가 표시됩니다.',
    options: [
      '전체 사원의 급여 합계',
      '현재 행까지의 누적 급여 합계',
      '해당 사원이 속한 부서의 급여 합계',
      '해당 사원 개인의 급여',
    ],
    points: 10,
  },
  {
    id: 'exam1_p38',
    title: '38. LAG / LEAD 함수',
    description:
      'LAG(SAL, 1, 0) OVER (ORDER BY HIREDATE)의 의미로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 40,
    answer: '2',
    explanation:
      'LAG(컬럼, offset, default)는 현재 행 기준으로 이전(offset) 행의 값을 반환합니다. LAG(SAL, 1, 0)은 입사일 순으로 정렬한 뒤 이전 행의 SAL을 반환하며, 이전 행이 없으면 0을 반환합니다.',
    options: [
      '다음 행의 SAL 값을 반환, 없으면 0',
      '이전 행의 SAL 값을 반환, 없으면 0',
      '현재 행의 SAL에 1을 더한 값을 반환',
      '이전 행의 SAL 값을 반환, 없으면 NULL',
    ],
    points: 10,
  },

  // --- 집합연산 (39~42) ---
  {
    id: 'exam1_p39',
    title: '39. UNION vs UNION ALL',
    description:
      'UNION과 UNION ALL의 차이로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 85,
    answer: '1',
    explanation:
      'UNION은 두 결과 집합의 합집합에서 중복을 제거하고, UNION ALL은 중복을 포함한 모든 결과를 반환합니다. UNION ALL이 중복 제거 과정이 없어 성능이 더 좋습니다.',
    options: [
      'UNION은 중복을 제거하고, UNION ALL은 중복을 포함한다.',
      'UNION은 중복을 포함하고, UNION ALL은 중복을 제거한다.',
      '두 연산의 결과는 항상 동일하다.',
      'UNION ALL은 정렬을 수행하지만 UNION은 정렬하지 않는다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p40',
    title: '40. INTERSECT와 MINUS',
    description:
      'A = {1, 2, 3, 4}, B = {3, 4, 5, 6}일 때,\nA MINUS B의 결과는?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 80,
    answer: '2',
    explanation:
      'MINUS(또는 EXCEPT)는 첫 번째 집합에서 두 번째 집합과 겹치는 부분을 제거합니다. A에서 B와 겹치는 3, 4를 제거하면 {1, 2}가 남습니다.',
    options: [
      '{3, 4}',
      '{1, 2}',
      '{5, 6}',
      '{1, 2, 3, 4, 5, 6}',
    ],
    points: 10,
  },
  {
    id: 'exam1_p41',
    title: '41. ROLLUP',
    description:
      '다음 SQL에서 ROLLUP이 생성하는 소계의 개수는?\n\nSELECT DEPTNO, JOB, SUM(SAL)\nFROM EMP\nGROUP BY ROLLUP(DEPTNO, JOB);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 38,
    answer: '3',
    explanation:
      'ROLLUP(A, B)는 (A, B), (A), ()의 3가지 그룹핑 조합을 생성합니다. 즉, DEPTNO+JOB별 소계, DEPTNO별 소계, 전체 총계의 3단계 집계가 생성됩니다.',
    options: [
      '1단계 (전체 총계만)',
      '2단계 (DEPTNO별 소계 + 전체 총계)',
      '3단계 (DEPTNO+JOB별 소계 + DEPTNO별 소계 + 전체 총계)',
      '4단계',
    ],
    points: 10,
  },
  {
    id: 'exam1_p42',
    title: '42. CUBE',
    description:
      'CUBE와 ROLLUP의 차이에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 35,
    answer: '2',
    explanation:
      'ROLLUP은 지정된 컬럼의 오른쪽부터 순서대로 소계를 구하지만, CUBE는 지정된 컬럼의 모든 가능한 조합에 대해 소계를 구합니다. CUBE(A, B)는 (A,B), (A), (B), ()의 4가지를 생성합니다.',
    options: [
      'ROLLUP이 CUBE보다 더 많은 소계를 생성한다.',
      'CUBE는 가능한 모든 조합의 소계를, ROLLUP은 계층적 소계를 생성한다.',
      'CUBE와 ROLLUP은 동일한 결과를 반환한다.',
      'CUBE는 GROUP BY 없이 사용 가능하다.',
    ],
    points: 10,
  },

  // --- DDL (43~46) ---
  {
    id: 'exam1_p43',
    title: '43. DDL 명령어',
    description:
      '다음 중 DDL(Data Definition Language)에 해당하지 않는 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 85,
    answer: '4',
    explanation:
      'DDL은 CREATE, ALTER, DROP, TRUNCATE 등 데이터 구조를 정의하는 명령어입니다. INSERT는 데이터를 조작하는 DML(Data Manipulation Language)에 해당합니다.',
    options: [
      'CREATE',
      'ALTER',
      'TRUNCATE',
      'INSERT',
    ],
    points: 10,
  },
  {
    id: 'exam1_p44',
    title: '44. 제약조건',
    description:
      '다음 중 PRIMARY KEY 제약조건에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 68,
    answer: '3',
    explanation:
      'PRIMARY KEY는 UNIQUE + NOT NULL의 특성을 가지며, 테이블당 하나만 정의할 수 있습니다. 하나의 컬럼이 아닌 여러 컬럼을 묶어 복합 기본키로 구성할 수 있지만, PRIMARY KEY 제약 자체는 테이블에 1개만 존재합니다.',
    options: [
      '유일성(UNIQUE)과 NOT NULL 특성을 모두 가진다.',
      '테이블당 하나만 정의할 수 있다.',
      '하나의 테이블에 여러 개의 PRIMARY KEY를 정의할 수 있다.',
      '자동으로 고유 인덱스가 생성된다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p45',
    title: '45. TRUNCATE vs DELETE',
    description:
      'TRUNCATE TABLE과 DELETE FROM의 차이에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 62,
    answer: '2',
    explanation:
      'TRUNCATE는 DDL이므로 AUTO COMMIT되어 ROLLBACK이 불가능합니다. DELETE는 DML이므로 ROLLBACK이 가능합니다. TRUNCATE가 더 빠르며 로그를 최소한으로 기록합니다.',
    options: [
      'TRUNCATE는 WHERE 절을 사용할 수 있다.',
      'TRUNCATE는 ROLLBACK이 불가능하고, DELETE는 ROLLBACK이 가능하다.',
      'DELETE가 TRUNCATE보다 항상 빠르다.',
      'TRUNCATE와 DELETE는 동일한 결과를 내며 차이가 없다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p46',
    title: '46. ALTER TABLE',
    description:
      '기존 테이블에 컬럼을 추가하는 SQL로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 82,
    answer: '1',
    explanation:
      'ALTER TABLE ... ADD 명령으로 새 컬럼을 추가합니다. MODIFY는 기존 컬럼의 데이터 타입이나 크기를 변경하고, DROP COLUMN은 컬럼을 삭제합니다.',
    options: [
      'ALTER TABLE EMP ADD (EMAIL VARCHAR2(100));',
      'ALTER TABLE EMP MODIFY (EMAIL VARCHAR2(100));',
      'ALTER TABLE EMP INSERT (EMAIL VARCHAR2(100));',
      'ALTER TABLE EMP CREATE (EMAIL VARCHAR2(100));',
    ],
    points: 10,
  },

  // --- TCL (47~48) ---
  {
    id: 'exam1_p47',
    title: '47. COMMIT과 ROLLBACK',
    description:
      '다음 SQL 실행 후 테이블에 남아있는 데이터는?\n\nINSERT INTO DEPT VALUES (50, \'연구소\', \'대전\');\nSAVEPOINT SP1;\nINSERT INTO DEPT VALUES (60, \'품질팀\', \'광주\');\nROLLBACK TO SP1;\nCOMMIT;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 48,
    answer: '1',
    explanation:
      'SAVEPOINT SP1 이후의 INSERT(60번)가 ROLLBACK TO SP1에 의해 취소됩니다. SP1 이전의 INSERT(50번)는 유지되며, 최종 COMMIT으로 확정됩니다.',
    options: [
      '50번 부서(연구소)만 저장된다.',
      '50번과 60번 모두 저장된다.',
      '아무것도 저장되지 않는다.',
      '60번 부서(품질팀)만 저장된다.',
    ],
    points: 10,
  },
  {
    id: 'exam1_p48',
    title: '48. TCL 명령어',
    description:
      '다음 중 TCL(Transaction Control Language)에 해당하지 않는 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'TCL',
    correctRate: 78,
    answer: '4',
    explanation:
      'TCL은 COMMIT, ROLLBACK, SAVEPOINT로 구성됩니다. GRANT는 DCL(Data Control Language)에 해당합니다.',
    options: [
      'COMMIT',
      'ROLLBACK',
      'SAVEPOINT',
      'GRANT',
    ],
    points: 10,
  },

  // --- DCL (49) ---
  {
    id: 'exam1_p49',
    title: '49. GRANT와 REVOKE',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\nGRANT SELECT, INSERT ON EMP TO user1;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DCL',
    correctRate: 72,
    answer: '2',
    explanation:
      'GRANT는 사용자에게 특정 객체에 대한 권한을 부여합니다. 위 SQL은 user1에게 EMP 테이블에 대한 SELECT(조회)와 INSERT(삽입) 권한을 부여합니다.',
    options: [
      'user1의 EMP 테이블 권한을 회수한다.',
      'user1에게 EMP 테이블의 조회 및 삽입 권한을 부여한다.',
      'user1에게 모든 테이블의 모든 권한을 부여한다.',
      'EMP 테이블을 삭제한다.',
    ],
    points: 10,
  },

  // --- 계층형쿼리 (50) ---
  {
    id: 'exam1_p50',
    title: '50. 계층형 쿼리',
    description:
      'Oracle의 계층형 쿼리에서 START WITH와 CONNECT BY의 역할로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 42,
    answer: '3',
    explanation:
      'START WITH는 계층 구조의 시작점(루트)을 지정하고, CONNECT BY는 부모-자식 관계의 연결 조건을 정의합니다. PRIOR 키워드는 이전 행(부모)을 참조할 때 사용합니다.',
    options: [
      'START WITH는 정렬 조건을, CONNECT BY는 필터 조건을 지정한다.',
      'START WITH는 종료 조건을, CONNECT BY는 시작 조건을 지정한다.',
      'START WITH는 루트 노드를, CONNECT BY는 부모-자식 연결 조건을 지정한다.',
      'START WITH와 CONNECT BY는 서로 바꿔 사용할 수 있다.',
    ],
    points: 10,
  },
];
