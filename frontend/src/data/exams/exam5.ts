import type { Problem } from '../../types';

// SQLD 모의고사 5회 (중급 난이도 - 목표 합격률 ~45%)
// 1과목: 데이터 모델링의 이해 (10문항, 20점)
//   - 데이터모델링 5문항 + 정규화 5문항
// 2과목: SQL 기본 및 활용 (40문항, 80점)
//   - JOIN 7, 함수 6, DML 5, 서브쿼리 5, 윈도우함수 4, 집합연산 4, DDL 4, TCL 2, DCL 2, 계층형쿼리 1
// 난이도 배분: easy 12 / medium 23 / hard 15
// 집중 영역: Oracle vs SQL Server 구문 차이, 복합 GROUP BY, 상관 서브쿼리,
//           윈도우 함수 프레임 지정, DDL 제약조건 위반, TCL과 DDL 자동커밋,
//           DECODE vs CASE WHEN, 다중 테이블 JOIN 필터링, NULL 전파

export const EXAM_5_PROBLEMS: Problem[] = [
  // ===== 1과목: 데이터 모델링의 이해 (1~10번) =====
  // --- 데이터모델링 (1~5) ---
  {
    id: 'exam5_p1',
    title: '1. 개념적 데이터 모델의 특성',
    description:
      '개념적 데이터 모델(Conceptual Data Model)에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 78,
    answer: '3',
    explanation:
      '개념적 데이터 모델은 특정 DBMS에 독립적이며, 업무 중심의 포괄적 수준에서 데이터를 표현합니다. 사람들이 이해하기 쉬운 형태로 현실 세계를 표현하며, 엔터티와 관계를 위주로 표현합니다. 물리적 저장 구조나 인덱스는 물리적 모델에서 다루는 내용입니다. 개념적 모델은 ERD(Entity Relationship Diagram)를 사용하여 표현하는 것이 일반적입니다.',
    options: [
      '개념적 데이터 모델은 특정 DBMS의 물리적 저장 구조를 표현한다.',
      '개념적 데이터 모델에는 인덱스 설계가 포함된다.',
      '개념적 데이터 모델은 특정 DBMS에 독립적으로 현실 세계를 표현한다.',
      '개념적 데이터 모델은 SQL 스크립트로 직접 표현된다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p2',
    title: '2. 엔터티 분류 - 기본/중심/행위 엔터티',
    description:
      '다음 중 엔터티를 발생 시점에 따라 기본(Fundamental), 중심(Main), 행위(Active) 엔터티로 분류할 때, 각 유형에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 52,
    answer: '2',
    explanation:
      '기본 엔터티는 독립적으로 생성 가능하며 업무에서 원래 존재하는 엔터티입니다(예: 고객, 상품). 중심 엔터티는 기본 엔터티로부터 발생하고 업무에서 중심적인 역할을 하는 엔터티입니다(예: 주문). 행위 엔터티는 2개 이상의 부모 엔터티로부터 발생하며(예: 주문상품), 자주 변경되거나 양이 많습니다. 중심 엔터티가 반드시 2개 이상의 부모 엔터티를 가져야 하는 것은 행위 엔터티의 특성이므로 틀린 설명입니다.',
    options: [
      '기본 엔터티는 독립적으로 생성 가능하며 타 엔터티에 의존하지 않는다.',
      '중심 엔터티는 반드시 2개 이상의 부모 엔터티로부터 발생한다.',
      '행위 엔터티는 2개 이상의 부모 엔터티로부터 발생하는 경우가 많다.',
      '중심 엔터티는 기본 엔터티로부터 발생하며 업무에서 중심 역할을 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p3',
    title: '3. 관계의 카디널리티와 선택성',
    description:
      '다음 ERD 표기에서 A 엔터티와 B 엔터티의 관계가 "A 1개에 대해 B는 0개 또는 1개 존재"를 나타내는 표기로 올바른 것은? (IE 표기법 기준)',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 48,
    answer: '4',
    explanation:
      'IE(Information Engineering) 표기법에서 카디널리티와 선택성을 함께 표현합니다. "0개 또는 1개"는 선택적(Optional) + 최대 1개를 의미합니다. IE 표기법에서 선택적은 O(원), 필수는 |로 표기하며, 최대 1개는 | 하나, 최대 다수는 까마귀발(>)로 표기합니다. "0개 또는 1개"는 선택적(O) + 단수(|)로 표기합니다. 반면 "1개 이상"은 필수(|) + 다수(>)입니다.',
    options: [
      'A ---||--- B (필수 1)',
      'A ---|{--- B (필수 다수)',
      'A ---|o--- B (필수 0 또는 다수)',
      'A ---o|--- B (선택 0 또는 1)',
    ],
    points: 10,
  },
  {
    id: 'exam5_p4',
    title: '4. 속성의 원자성과 복합 속성',
    description:
      '다음 중 속성의 원자성(Atomicity)에 관한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 38,
    answer: '1',
    explanation:
      '1차 정규화에서 요구하는 원자성(Atomicity)은 속성이 더 이상 분리될 수 없는 단일 값을 가져야 함을 의미합니다. "주소" 속성은 시/구/동 등으로 분리 가능하므로 원자적이지 않습니다. 원자성 위반의 경우 데이터 조회와 관리가 복잡해집니다. 복합 속성(Composite Attribute)은 여러 단순 속성으로 분리될 수 있는 속성을 말하며, 다치 속성(Multi-valued Attribute)은 하나의 엔터티 인스턴스에 여러 값을 가질 수 있는 속성입니다.',
    options: [
      '"주소" 속성은 시/구/동으로 분리 가능하므로 원자적이지 않다.',
      '원자적 속성은 여러 단순 속성으로 구성된 복합 속성이다.',
      '다치 속성(Multi-valued Attribute)은 항상 원자적이다.',
      '원자성 원칙은 2차 정규화부터 적용된다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p5',
    title: '5. 데이터 모델링의 관점',
    description:
      '데이터 모델링의 3가지 관점 중 "데이터 관점(Data Perspective)"에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 75,
    answer: '2',
    explanation:
      '데이터 모델링의 3가지 관점은 데이터 관점(What), 프로세스 관점(How), 데이터와 프로세스의 상관 관점(Interaction)입니다. 데이터 관점은 업무에서 사용되는 데이터 구조와 흐름을 모델링하는 것으로, "무엇을 관리하는가(What)"를 중심으로 합니다. 프로세스 관점은 업무가 실제로 처리되는 방법(How)에 초점을 맞춥니다. 상관 관점은 데이터와 프로세스 간의 상호작용을 나타냅니다.',
    options: [
      '데이터 관점은 업무가 실제로 어떻게 처리되는지(How)를 중심으로 한다.',
      '데이터 관점은 업무에서 무엇을 관리하는가(What)를 중심으로 한다.',
      '데이터 관점은 데이터와 프로세스의 상호작용을 중심으로 한다.',
      '데이터 관점은 물리적 저장 방식을 중심으로 한다.',
    ],
    points: 10,
  },

  // --- 정규화 (6~10) ---
  {
    id: 'exam5_p6',
    title: '6. 함수적 종속성의 이해',
    description:
      '릴레이션 R(학번, 과목코드, 성적, 학과명, 지도교수)에서 종속 관계가 다음과 같을 때, 이 릴레이션이 위반하는 정규형으로 올바른 것은?\n• {학번, 과목코드} → 성적\n• 학번 → 학과명\n• 학번 → 지도교수',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 35,
    answer: '2',
    explanation:
      '기본키는 {학번, 과목코드}입니다. 이때 학번만으로 학과명과 지도교수가 결정됩니다(부분 함수 종속). 2차 정규화는 부분 함수 종속을 제거하는 과정입니다. 이 릴레이션은 1NF는 만족하지만 2NF를 위반합니다. 2NF를 만족하려면 R1(학번, 과목코드, 성적), R2(학번, 학과명, 지도교수)로 분리해야 합니다.',
    options: [
      '1차 정규형(1NF)을 위반한다.',
      '2차 정규형(2NF)을 위반한다.',
      '3차 정규형(3NF)을 위반한다.',
      'BCNF(보이스-코드 정규형)를 위반한다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p7',
    title: '7. 이행적 함수 종속과 3NF',
    description:
      '릴레이션 R(사원번호, 부서코드, 부서명)에서 종속 관계가 다음과 같을 때, 이에 해당하는 이상현상과 해결 방법으로 올바른 것은?\n• 사원번호 → 부서코드\n• 부서코드 → 부서명',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 55,
    answer: '3',
    explanation:
      '사원번호 → 부서코드 → 부서명의 관계는 이행적 함수 종속(Transitive Functional Dependency)입니다. 이는 3NF 위반입니다. 이를 해결하기 위해 R1(사원번호, 부서코드)과 R2(부서코드, 부서명)로 분리합니다. 이행적 종속이 존재하면 수정 이상(부서명 변경 시 모든 사원 레코드 수정 필요), 삭제 이상(마지막 사원 삭제 시 부서 정보도 삭제), 삽입 이상(사원 없이 부서 정보만 삽입 불가) 등이 발생합니다.',
    options: [
      '부분 함수 종속으로 2NF를 위반하며, 기본키별로 테이블을 분리한다.',
      '다치 종속(Multivalued Dependency)으로 4NF를 위반하며, 추가 분리가 필요하다.',
      '이행적 함수 종속으로 3NF를 위반하며, R1(사원번호, 부서코드)과 R2(부서코드, 부서명)로 분리한다.',
      '조인 종속(Join Dependency)으로 5NF를 위반하며, 무손실 분해가 필요하다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p8',
    title: '8. BCNF와 3NF의 차이',
    description:
      '다음 중 BCNF(Boyce-Codd Normal Form)와 3NF의 차이에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 30,
    answer: '4',
    explanation:
      'BCNF는 3NF보다 강한 정규형입니다. 3NF는 "비주요 속성이 기본키에 이행적으로 종속되지 않아야 한다"는 조건이며, BCNF는 "모든 결정자가 후보키여야 한다"는 더 엄격한 조건입니다. 3NF를 만족해도 BCNF를 위반하는 경우가 있습니다(예: 복수의 후보키가 겹치는 경우). BCNF는 항상 3NF를 만족하지만, 3NF를 만족한다고 반드시 BCNF를 만족하는 것은 아닙니다. 또한 BCNF 분해는 무손실 조인을 보장하지만 함수적 종속성 보존을 보장하지 않을 수 있습니다.',
    options: [
      'BCNF와 3NF는 동일한 정규형이다.',
      '3NF는 BCNF보다 강한 정규형이다.',
      'BCNF를 만족하면 반드시 3NF를 만족하지 않을 수 있다.',
      'BCNF는 모든 결정자가 후보키여야 하는 조건으로, 3NF보다 강한 정규형이다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p9',
    title: '9. 정규화의 장단점',
    description:
      '정규화(Normalization)의 장단점에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 72,
    answer: '1',
    explanation:
      '정규화는 데이터 중복을 제거하고 삽입/수정/삭제 이상현상을 방지하는 장점이 있습니다. 그러나 테이블이 여러 개로 분리되어 JOIN 연산이 증가하면 조회 성능이 저하될 수 있습니다. 이를 해결하기 위해 성능이 중요한 경우 반정규화를 적용합니다. 정규화는 저장 공간을 효율적으로 사용하게 하며, 데이터 일관성을 유지하는 데 도움이 됩니다.',
    options: [
      '정규화는 데이터 중복을 제거하지만, JOIN 증가로 조회 성능이 저하될 수 있다.',
      '정규화를 적용할수록 JOIN이 줄어들어 조회 성능이 향상된다.',
      '정규화는 데이터 이상현상을 완전히 제거하는 것을 보장하지 않는다.',
      '정규화는 데이터 중복을 허용하여 저장 공간을 효율적으로 사용한다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p10',
    title: '10. 반정규화 기법의 종류',
    description:
      '반정규화(Denormalization) 기법 중 "컬럼 역정규화(Column Denormalization)"에 해당하는 것으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 50,
    answer: '3',
    explanation:
      '반정규화 기법은 크게 테이블 반정규화(테이블 병합, 테이블 분할, 테이블 추가)와 컬럼 반정규화, 관계 반정규화로 나눌 수 있습니다. 컬럼 반정규화는 중복 컬럼 추가(자주 JOIN되는 컬럼을 다른 테이블에도 추가), 파생 컬럼 추가(집계값을 미리 계산하여 컬럼에 저장), 이력 테이블 컬럼 추가 등이 있습니다. 주문 테이블에 고객명을 중복으로 추가하는 것이 컬럼 반정규화의 대표적인 예입니다.',
    options: [
      '성능 향상을 위해 두 테이블을 하나로 합치는 것',
      '대용량 테이블을 수평으로 분할하는 것',
      '자주 JOIN하는 컬럼을 현재 테이블에 중복으로 추가하는 것',
      '자주 사용되는 집계를 별도 요약 테이블로 만드는 것',
    ],
    points: 10,
  },

  // ===== 2과목: SQL 기본 및 활용 (11~50번) =====
  // --- JOIN (7문항: 11~17) ---
  {
    id: 'exam5_p11',
    title: '11. NATURAL JOIN과 USING 절의 차이',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\n-- SQL A\nSELECT * FROM EMP NATURAL JOIN DEPT;\n\n-- SQL B\nSELECT * FROM EMP JOIN DEPT USING (DEPTNO);\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 48,
    answer: '2',
    explanation:
      'NATURAL JOIN은 두 테이블에서 이름이 같은 모든 컬럼을 기준으로 자동으로 JOIN합니다. 이때 JOIN 기준 컬럼은 결과에 한 번만 나타나며 테이블 별칭(Alias)을 붙일 수 없습니다. USING 절은 JOIN 기준 컬럼을 명시적으로 지정하며, 해당 컬럼에도 테이블 별칭을 붙일 수 없습니다(Oracle 기준). 두 방식 모두 JOIN 기준 컬럼은 결과에 한 번만 출력됩니다. NATURAL JOIN은 동명 컬럼이 여러 개일 경우 모두 JOIN 조건이 되어 의도치 않은 결과가 발생할 수 있으므로 주의해야 합니다.',
    options: [
      'NATURAL JOIN에서는 JOIN 기준 컬럼에 테이블 별칭을 붙일 수 있다.',
      'NATURAL JOIN은 동명 컬럼 전체를 JOIN 조건으로 사용하므로 의도치 않은 결과가 발생할 수 있다.',
      'USING 절에서는 JOIN 기준 컬럼에 테이블 별칭을 붙여야 한다.',
      'NATURAL JOIN과 USING 절은 결과 컬럼 수가 다르다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p12',
    title: '12. LEFT OUTER JOIN과 INNER JOIN의 결과 차이',
    description:
      '다음 두 SQL의 결과 차이에 대한 설명으로 올바른 것은?\n\n```sql\n-- SQL A\nSELECT E.EMPNO, E.ENAME, D.DNAME\nFROM EMP E LEFT OUTER JOIN DEPT D ON E.DEPTNO = D.DEPTNO\nWHERE D.LOC = \'DALLAS\';\n\n-- SQL B\nSELECT E.EMPNO, E.ENAME, D.DNAME\nFROM EMP E LEFT OUTER JOIN DEPT D\n  ON E.DEPTNO = D.DEPTNO AND D.LOC = \'DALLAS\';\n```',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 32,
    answer: '4',
    explanation:
      'LEFT OUTER JOIN에서 WHERE 절과 ON 절의 조건 위치는 결과에 큰 차이를 만듭니다. SQL A는 LEFT OUTER JOIN 후 WHERE D.LOC = \'DALLAS\'를 적용합니다. WHERE 절은 JOIN 결과에 필터를 적용하므로, DEPT에 매칭되지 않아 D 컬럼이 NULL인 행은 D.LOC = \'DALLAS\'를 만족하지 못해 제거됩니다. 결과적으로 INNER JOIN과 동일하게 동작합니다. SQL B는 ON 절에 조건을 포함시켜, DEPT.LOC = \'DALLAS\'인 부서와 매칭을 시도하되 매칭되지 않는 EMP 행도 LEFT 테이블이므로 유지됩니다. 즉 SQL B는 모든 사원을 반환하되 DALLAS 부서 정보만 연결합니다.',
    options: [
      'SQL A와 SQL B는 항상 동일한 결과를 반환한다.',
      'SQL A는 모든 사원을 반환하고 DALLAS 부서 정보만 연결한다.',
      'SQL B는 DALLAS 부서의 사원만 반환한다.',
      'SQL A는 DALLAS 부서 사원만 반환하고, SQL B는 모든 사원을 반환하되 DALLAS 부서 정보만 연결한다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p13',
    title: '13. CROSS JOIN의 결과 행 수',
    description:
      'EMP 테이블에 14건, DEPT 테이블에 4건의 데이터가 있을 때, 다음 SQL의 결과 행 수로 올바른 것은?\n\n```sql\nSELECT E.ENAME, D.DNAME\nFROM EMP E CROSS JOIN DEPT D\nWHERE E.JOB = \'MANAGER\';\n```\n\n(EMP 테이블에서 JOB = \'MANAGER\'인 사원은 3명이다.)',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 74,
    answer: '3',
    explanation:
      'CROSS JOIN은 카테시안 곱(Cartesian Product)으로, 두 테이블의 모든 조합을 생성합니다. 조건 없는 CROSS JOIN의 결과는 14 × 4 = 56행입니다. 여기에 WHERE 절로 JOB = \'MANAGER\'인 사원(3명)을 필터링하면, 3 × 4 = 12행이 됩니다. CROSS JOIN 자체에는 JOIN 조건이 없으므로 WHERE 절로 필터링 후 결과가 결정됩니다.',
    options: [
      '3행',
      '14행',
      '12행',
      '56행',
    ],
    points: 10,
  },
  {
    id: 'exam5_p14',
    title: '14. SELF JOIN의 활용',
    description:
      '다음 SQL은 사원과 그 사원의 관리자 이름을 조회하는 SELF JOIN입니다. 빈칸 (가)와 (나)에 들어갈 내용으로 올바른 것은?\n\n```sql\nSELECT E.ENAME AS 사원명, (가) AS 관리자명\nFROM EMP E LEFT OUTER JOIN EMP M\n  ON (나);\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 58,
    answer: '1',
    explanation:
      'SELF JOIN은 같은 테이블을 두 번 사용하여 JOIN하는 방식으로, 계층적 데이터를 처리할 때 많이 사용됩니다. EMP 테이블에서 MGR 컬럼은 해당 사원의 관리자 EMPNO를 참조합니다. 따라서 사원 테이블(E)의 MGR과 관리자 테이블(M)의 EMPNO를 연결합니다. LEFT OUTER JOIN을 사용하면 관리자가 없는 사원(최상위 관리자)도 조회됩니다. (가)에는 관리자 별칭인 M.ENAME, (나)에는 E.MGR = M.EMPNO가 들어갑니다.',
    options: [
      '(가) M.ENAME, (나) E.MGR = M.EMPNO',
      '(가) E.ENAME, (나) E.EMPNO = M.MGR',
      '(가) M.MGR, (나) E.EMPNO = M.EMPNO',
      '(가) M.ENAME, (나) E.EMPNO = M.EMPNO',
    ],
    points: 10,
  },
  {
    id: 'exam5_p15',
    title: '15. 다중 테이블 JOIN과 필터링 조건',
    description:
      '다음 SQL의 결과로 올바른 것은? (EMP, DEPT, SALGRADE 테이블 사용)\n\n```sql\nSELECT E.ENAME, D.DNAME, S.GRADE\nFROM EMP E\n  JOIN DEPT D ON E.DEPTNO = D.DEPTNO\n  JOIN SALGRADE S ON E.SAL BETWEEN S.LOSAL AND S.HISAL\nWHERE D.LOC != \'CHICAGO\'\n  AND S.GRADE >= 3;\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 55,
    answer: '3',
    explanation:
      '이 SQL은 EMP, DEPT, SALGRADE 3개 테이블을 JOIN합니다. SALGRADE와의 JOIN 조건 E.SAL BETWEEN S.LOSAL AND S.HISAL은 BETWEEN JOIN이라고도 하며, 사원의 급여가 어느 등급 범위에 속하는지 연결합니다. 최종적으로 WHERE 절에서 CHICAGO 부서를 제외하고, 급여 등급이 3 이상인 사원만 필터링합니다. 결과는 CHICAGO가 아닌 지역에서 급여 등급 3 이상인 사원의 이름, 부서명, 급여 등급을 반환합니다.',
    options: [
      '모든 사원의 이름, 부서명, 급여 등급을 반환한다.',
      'CHICAGO 부서의 급여 등급 3 이상 사원을 반환한다.',
      'CHICAGO가 아닌 지역에서 급여 등급 3 이상인 사원의 이름, 부서명, 급여 등급을 반환한다.',
      '급여 등급 3 미만인 사원을 제외하고 모든 사원을 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p16',
    title: '16. FULL OUTER JOIN의 결과',
    description:
      '테이블 A와 B가 다음과 같을 때 FULL OUTER JOIN의 결과 행 수로 올바른 것은?\n\n테이블 A: (ID=1, NAME=\'Kim\'), (ID=2, NAME=\'Lee\'), (ID=3, NAME=\'Park\')\n테이블 B: (ID=2, SCORE=90), (ID=3, SCORE=85), (ID=4, SCORE=70)\n\n```sql\nSELECT A.ID, A.NAME, B.SCORE\nFROM A FULL OUTER JOIN B ON A.ID = B.ID;\n```',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 70,
    answer: '4',
    explanation:
      'FULL OUTER JOIN은 LEFT OUTER JOIN과 RIGHT OUTER JOIN의 합집합입니다. A와 B를 ID로 JOIN하면: (1, Kim, NULL) - A에만 있는 행, (2, Lee, 90) - 양쪽 매칭, (3, Park, 85) - 양쪽 매칭, (NULL, NULL, 70) - B에만 있는 행. 총 4행이 반환됩니다. INNER JOIN이면 2행(ID 2,3), LEFT OUTER JOIN이면 3행(1,2,3), RIGHT OUTER JOIN이면 3행(2,3,4), FULL OUTER JOIN이면 4행(1,2,3,4)입니다.',
    options: [
      '2행',
      '3행 (A 기준)',
      '3행 (B 기준)',
      '4행',
    ],
    points: 10,
  },
  {
    id: 'exam5_p17',
    title: '17. 비등가 조인(Non-Equi JOIN)의 이해',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\nSELECT E.ENAME, E.SAL, S.GRADE\nFROM EMP E, SALGRADE S\nWHERE E.SAL BETWEEN S.LOSAL AND S.HISAL\n  AND S.GRADE = 2;\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 62,
    answer: '2',
    explanation:
      '비등가 조인(Non-Equi JOIN)은 두 테이블의 JOIN 조건이 등호(=)가 아닌 BETWEEN, >, < 등 범위 조건으로 연결되는 JOIN입니다. 이 SQL은 EMP 테이블의 SAL이 SALGRADE 테이블의 LOSAL과 HISAL 사이에 있는 조건으로 JOIN합니다(비등가 조인). WHERE S.GRADE = 2는 급여 등급이 2인 등급 범위에 해당하는 사원만 필터링합니다. 결과적으로 급여가 2등급 범위에 해당하는 사원의 이름, 급여, 급여 등급을 조회합니다.',
    options: [
      '이 SQL은 등가 조인(Equi JOIN)이다.',
      '이 SQL은 비등가 조인으로, 급여가 2등급 범위에 해당하는 사원을 조회한다.',
      'SALGRADE 테이블의 모든 행이 결과에 포함된다.',
      '이 SQL은 ANSI/ISO 표준 JOIN 구문을 사용한다.',
    ],
    points: 10,
  },

  // --- 함수 (6문항: 18~23) ---
  {
    id: 'exam5_p18',
    title: '18. DECODE 함수와 CASE WHEN의 차이',
    description:
      '다음 두 SQL의 동작 차이에 대한 설명으로 올바른 것은?\n\n```sql\n-- SQL A\nSELECT DECODE(COMM, NULL, \'없음\', 0, \'없음\', COMM) AS 커미션\nFROM EMP;\n\n-- SQL B\nSELECT CASE WHEN COMM IS NULL THEN \'없음\'\n            WHEN COMM = 0 THEN \'없음\'\n            ELSE TO_CHAR(COMM)\n       END AS 커미션\nFROM EMP;\n```',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 35,
    answer: '1',
    explanation:
      'DECODE 함수에서 NULL 비교는 특별합니다. DECODE(COMM, NULL, \'없음\', ...)는 COMM = NULL이 아닌 COMM IS NULL로 처리하므로 NULL 비교가 정상 동작합니다(이는 DECODE의 특수 기능). 그러나 DECODE는 등가 비교만 가능하며, 범위 조건이나 IS NULL 이외의 복잡한 조건을 직접 지정할 수 없습니다. CASE WHEN은 IS NULL, BETWEEN, 부등호 등 다양한 조건을 사용할 수 있습니다. SQL A에서 DECODE는 COMM이 NULL이거나 0이면 \'없음\'을 반환하고, 그 외에는 COMM(숫자)을 반환합니다. SQL B에서 CASE WHEN은 동일한 논리를 명시적으로 표현하며 TO_CHAR로 문자 변환을 추가했습니다. 두 SQL의 결과는 대부분 동일하지만, SQL A의 ELSE에 해당하는 COMM은 숫자 타입이고 SQL B의 ELSE는 TO_CHAR로 문자 타입이므로 타입이 다를 수 있습니다.',
    options: [
      'DECODE는 NULL 비교를 특수하게 처리하며, SQL A와 SQL B의 결과는 데이터 타입에서 차이가 있을 수 있다.',
      'DECODE는 NULL 비교를 지원하지 않아 SQL A에서 NULL 처리가 되지 않는다.',
      'SQL A와 SQL B는 완전히 동일한 결과와 타입을 반환한다.',
      'CASE WHEN은 DECODE보다 성능이 항상 우수하다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p19',
    title: '19. 중첩 함수에서의 NULL 전파',
    description:
      '다음 SQL의 결과로 올바른 것은?\n\n```sql\nSELECT UPPER(TRIM(NULL)) AS 결과1,\n       NVL(UPPER(NULL), \'DEFAULT\') AS 결과2,\n       LENGTH(NULL) AS 결과3\nFROM DUAL;\n```',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 28,
    answer: '3',
    explanation:
      'NULL은 대부분의 함수에서 전파됩니다(NULL propagation). TRIM(NULL)은 NULL을 반환하고, UPPER(NULL)도 NULL을 반환합니다. 따라서 UPPER(TRIM(NULL)) = NULL이 됩니다. NVL(UPPER(NULL), \'DEFAULT\')는 UPPER(NULL)이 NULL이므로 NVL이 \'DEFAULT\'를 반환합니다. LENGTH(NULL)은 NULL을 반환합니다(LENGTH는 NULL 문자열의 길이를 NULL로 처리, Oracle 기준). 따라서 결과1 = NULL, 결과2 = \'DEFAULT\', 결과3 = NULL입니다.',
    options: [
      '결과1 = \'\', 결과2 = \'DEFAULT\', 결과3 = 0',
      '결과1 = NULL, 결과2 = NULL, 결과3 = NULL',
      '결과1 = NULL, 결과2 = \'DEFAULT\', 결과3 = NULL',
      '결과1 = \'\', 결과2 = \'DEFAULT\', 결과3 = NULL',
    ],
    points: 10,
  },
  {
    id: 'exam5_p20',
    title: '20. Oracle과 SQL Server의 날짜 함수 차이',
    description:
      '동일한 목적(현재 날짜 조회)을 수행하는 Oracle과 SQL Server의 함수를 올바르게 연결한 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 60,
    answer: '2',
    explanation:
      'Oracle에서 현재 날짜와 시간을 반환하는 함수는 SYSDATE이며, SQL Server에서는 GETDATE()를 사용합니다. Oracle의 DUAL은 단일 행/컬럼 더미 테이블로 함수 결과를 확인할 때 사용하며(SELECT SYSDATE FROM DUAL), SQL Server는 FROM 없이 SELECT GETDATE()만으로 동작합니다. Oracle의 CURRENT_DATE는 세션 타임존 기준 날짜를 반환하며, SQL Server의 CURRENT_TIMESTAMP는 현재 날짜 및 시간을 반환합니다.',
    options: [
      'Oracle: NOW(), SQL Server: SYSDATE()',
      'Oracle: SYSDATE, SQL Server: GETDATE()',
      'Oracle: GETDATE(), SQL Server: SYSDATE',
      'Oracle: CURRENT_TIMESTAMP(), SQL Server: NOW()',
    ],
    points: 10,
  },
  {
    id: 'exam5_p21',
    title: '21. 문자 함수의 조합 활용',
    description:
      '다음 SQL의 결과로 올바른 것은?\n\n```sql\nSELECT LPAD(SUBSTR(\'SQLD-2025-EXAM\', 6, 4), 8, \'0\') AS 결과\nFROM DUAL;\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 52,
    answer: '4',
    explanation:
      'SUBSTR(\'SQLD-2025-EXAM\', 6, 4)는 6번째 위치부터 4글자를 추출합니다. \'SQLD-2025-EXAM\'에서 위치는 S=1, Q=2, L=3, D=4, -=5, 2=6, 0=7, 2=8, 5=9이므로, 6번째부터 4글자는 \'2025\'입니다. 그 다음 LPAD(\'2025\', 8, \'0\')은 \'2025\'를 왼쪽에 \'0\'으로 채워 총 8자리로 만들면 \'00002025\'가 됩니다.',
    options: [
      '\'0002025\'',
      '\'2025-EXA\'',
      '\'0000SQLD\'',
      '\'00002025\'',
    ],
    points: 10,
  },
  {
    id: 'exam5_p22',
    title: '22. 집계 함수와 NULL 처리',
    description:
      '다음 SQL의 결과로 올바른 것은?\n\n```sql\n-- 테이블 T: COL1(1, 2, NULL, 4, NULL)\nSELECT COUNT(*), COUNT(COL1), SUM(COL1), AVG(COL1)\nFROM T;\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 58,
    answer: '3',
    explanation:
      'COUNT(*)은 NULL을 포함한 모든 행을 셉니다. 행이 5개이므로 COUNT(*) = 5입니다. COUNT(COL1)은 NULL을 제외한 행만 셉니다. NULL이 2개이므로 COUNT(COL1) = 3입니다. SUM(COL1)은 NULL을 무시하고 합산합니다. 1 + 2 + 4 = 7입니다. AVG(COL1)은 NULL을 제외한 값의 평균입니다. (1+2+4)/3 = 7/3 ≈ 2.33입니다. AVG는 NULL을 분모에서도 제외하므로 5가 아닌 3으로 나눕니다.',
    options: [
      'COUNT(*)=5, COUNT(COL1)=5, SUM(COL1)=7, AVG(COL1)=1.4',
      'COUNT(*)=3, COUNT(COL1)=3, SUM(COL1)=7, AVG(COL1)=2.33',
      'COUNT(*)=5, COUNT(COL1)=3, SUM(COL1)=7, AVG(COL1)=2.33',
      'COUNT(*)=5, COUNT(COL1)=3, SUM(COL1)=NULL, AVG(COL1)=NULL',
    ],
    points: 10,
  },
  {
    id: 'exam5_p23',
    title: '23. Oracle의 TO_CHAR 날짜 형식',
    description:
      '오라클에서 날짜를 \'2025년 12월 31일 화요일\'로 출력하려 할 때, 올바른 SQL은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 68,
    answer: '1',
    explanation:
      'Oracle의 TO_CHAR 함수를 사용하여 날짜를 원하는 형식의 문자열로 변환합니다. 날짜 형식 요소 중 YYYY는 4자리 연도, MM은 2자리 월, DD는 2자리 일, DAY는 요일의 전체 이름을 나타냅니다. NLS_DATE_LANGUAGE 설정에 따라 언어가 결정됩니다. 한국어 환경에서 올바른 형식은 TO_CHAR(날짜, \'YYYY"년" MM"월" DD"일" DAY\')입니다. 큰따옴표로 묶인 문자는 형식 지정자가 아닌 리터럴로 처리됩니다.',
    options: [
      'SELECT TO_CHAR(SYSDATE, \'YYYY"년" MM"월" DD"일" DAY\') FROM DUAL;',
      'SELECT TO_CHAR(SYSDATE, \'YYYY년 MM월 DD일 DAY\') FROM DUAL;',
      'SELECT CONVERT(SYSDATE, \'YYYY년 MM월 DD일 DAY\') FROM DUAL;',
      'SELECT FORMAT(SYSDATE, \'YYYY년 MM월 DD일 DAY\') FROM DUAL;',
    ],
    points: 10,
  },

  // --- DML (5문항: 24~28) ---
  {
    id: 'exam5_p24',
    title: '24. INSERT INTO SELECT 구문',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\nINSERT INTO DEPT_BACKUP (DEPTNO, DNAME, LOC)\nSELECT DEPTNO, DNAME, LOC\nFROM DEPT\nWHERE LOC = \'SEOUL\';\n```',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 76,
    answer: '2',
    explanation:
      'INSERT INTO ... SELECT 구문은 SELECT 결과를 대상 테이블에 삽입합니다. 이 SQL은 DEPT 테이블에서 LOC가 \'SEOUL\'인 행을 DEPT_BACKUP 테이블에 복사합니다. SELECT 결과가 여러 행이면 여러 행이 한 번에 삽입됩니다. 대상 테이블(DEPT_BACKUP)은 이미 존재해야 하며, 컬럼 수와 데이터 타입이 일치해야 합니다. 만약 테이블을 새로 생성하며 데이터를 삽입하려면 CREATE TABLE ... AS SELECT 구문을 사용합니다.',
    options: [
      'DEPT_BACKUP 테이블이 없으면 자동으로 생성한다.',
      'DEPT 테이블의 LOC = \'SEOUL\' 행을 DEPT_BACKUP에 삽입한다.',
      'SELECT 결과가 여러 행이면 오류가 발생한다.',
      '이 구문은 Oracle에서만 지원된다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p25',
    title: '25. UPDATE 문의 서브쿼리 사용',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\nUPDATE EMP\nSET SAL = SAL * 1.1,\n    COMM = (SELECT AVG(COMM) FROM EMP WHERE DEPTNO = 30)\nWHERE DEPTNO = 30\n  AND JOB = \'SALESMAN\';\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 55,
    answer: '4',
    explanation:
      'UPDATE 문에서 SET 절에 서브쿼리를 사용할 수 있습니다. 이 SQL은 DEPTNO가 30이고 JOB이 \'SALESMAN\'인 사원에 대해 SAL을 10% 인상하고, COMM을 30번 부서 전체 평균 COMM으로 갱신합니다. 서브쿼리는 WHERE 절을 적용하기 전에 실행되어 UPDATE 시작 시점의 평균값을 사용합니다(일반적으로 서브쿼리가 먼저 평가됨). SET 절의 서브쿼리가 NULL을 반환하면 COMM이 NULL로 업데이트됩니다.',
    options: [
      'SET 절에서 서브쿼리를 사용할 수 없어 오류가 발생한다.',
      'SAL은 변경되지 않고 COMM만 서브쿼리 결과로 업데이트된다.',
      'WHERE 절과 SET의 서브쿼리 모두 UPDATE 후의 값을 기준으로 실행된다.',
      '30번 부서 SALESMAN의 SAL을 10% 인상하고 COMM을 30번 부서 평균 COMM으로 업데이트한다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p26',
    title: '26. MERGE 문의 동작 이해',
    description:
      '다음 MERGE 문에 대한 설명으로 올바른 것은?\n\n```sql\nMERGE INTO EMP_TARGET T\nUSING EMP_SOURCE S ON (T.EMPNO = S.EMPNO)\nWHEN MATCHED THEN\n  UPDATE SET T.SAL = S.SAL\nWHEN NOT MATCHED THEN\n  INSERT (EMPNO, ENAME, SAL) VALUES (S.EMPNO, S.ENAME, S.SAL);\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 50,
    answer: '3',
    explanation:
      'MERGE 문은 소스 테이블(EMP_SOURCE)의 데이터를 대상 테이블(EMP_TARGET)에 조건에 따라 UPDATE 또는 INSERT합니다(Upsert 패턴). EMPNO가 일치하는 행은 UPDATE(WHEN MATCHED), 일치하지 않는 행은 INSERT(WHEN NOT MATCHED)합니다. 이 SQL은 EMP_SOURCE에 있고 EMP_TARGET에 없는 EMPNO는 INSERT하고, 이미 있는 EMPNO는 SAL을 업데이트합니다. EMP_TARGET에 있지만 EMP_SOURCE에 없는 행은 변경되지 않습니다.',
    options: [
      'EMP_SOURCE와 EMP_TARGET의 모든 데이터를 병합하여 새 테이블을 생성한다.',
      'EMP_TARGET에만 있는 데이터는 삭제된다.',
      'EMP_SOURCE에 있고 EMP_TARGET에 없으면 INSERT, 양쪽에 있으면 UPDATE한다.',
      'MERGE는 DELETE를 포함하지 않으므로 WHEN NOT MATCHED만 처리한다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p27',
    title: '27. DELETE와 TRUNCATE의 차이',
    description:
      '다음 중 DELETE와 TRUNCATE의 차이에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 72,
    answer: '2',
    explanation:
      'DELETE는 DML(Data Manipulation Language)로 COMMIT/ROLLBACK이 가능하며, WHERE 절로 특정 행만 삭제할 수 있습니다. 삭제된 각 행에 대한 로그가 생성되어 처리 속도가 느릴 수 있습니다. TRUNCATE는 DDL(Data Definition Language)로 자동으로 COMMIT되며 ROLLBACK이 불가능합니다. TRUNCATE는 테이블의 모든 데이터를 한 번에 삭제하며, 로그를 최소화하여 DELETE보다 빠릅니다. Oracle에서 TRUNCATE는 테이블의 STORAGE 초기화도 함께 수행합니다.',
    options: [
      'DELETE는 DDL이므로 자동 COMMIT되고, TRUNCATE는 DML이므로 ROLLBACK이 가능하다.',
      'DELETE는 ROLLBACK 가능하고, TRUNCATE는 자동 COMMIT되어 ROLLBACK이 불가능하다.',
      'DELETE와 TRUNCATE 모두 WHERE 절을 사용하여 특정 행을 삭제할 수 있다.',
      'TRUNCATE는 DELETE보다 느리지만 더 안전하다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p28',
    title: '28. 복합 DML 순서와 영향 행 수',
    description:
      '다음 SQL 실행 순서대로 처리할 때 최종 테이블 T의 행 수로 올바른 것은?\n\n```sql\n-- 초기 상태: T 테이블 (ID: 1, 2, 3, 4, 5) 총 5행\nINSERT INTO T VALUES (6);\nINSERT INTO T VALUES (7);\nDELETE FROM T WHERE ID <= 2;\nUPDATE T SET ID = ID + 10 WHERE ID = 6;\nROLLBACK;\n```',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 38,
    answer: '1',
    explanation:
      'ROLLBACK은 현재 트랜잭션의 모든 변경사항을 취소합니다. 초기 5행에서 INSERT 2개(6행, 7행 추가 → 7행), DELETE(ID<=2인 1,2 삭제 → 5행), UPDATE(ID=6을 16으로 변경 → 5행) 이후 ROLLBACK하면 모든 변경이 취소되어 최초 상태인 5행으로 돌아갑니다. ROLLBACK이 실행되면 해당 트랜잭션 내의 INSERT, DELETE, UPDATE가 모두 취소됩니다.',
    options: [
      '5행 (ROLLBACK으로 모든 변경 취소)',
      '7행 (INSERT 2개만 유지)',
      '5행 (INSERT 2개 + DELETE 2개 = 순변화 없음)',
      '3행 (ROLLBACK 전 상태)',
    ],
    points: 10,
  },

  // --- 서브쿼리 (5문항: 29~33) ---
  {
    id: 'exam5_p29',
    title: '29. 상관 서브쿼리(Correlated Subquery)의 이해',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\nSELECT E.EMPNO, E.ENAME, E.SAL\nFROM EMP E\nWHERE E.SAL > (\n  SELECT AVG(E2.SAL)\n  FROM EMP E2\n  WHERE E2.DEPTNO = E.DEPTNO\n);\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 52,
    answer: '3',
    explanation:
      '상관 서브쿼리(Correlated Subquery)는 외부 쿼리의 특정 컬럼을 서브쿼리에서 참조하는 구조입니다. 이 SQL에서 서브쿼리는 E2.DEPTNO = E.DEPTNO 조건으로 외부 쿼리의 E.DEPTNO를 참조합니다. 따라서 서브쿼리는 외부 쿼리의 각 행(사원)마다 해당 사원의 부서 평균 급여를 계산합니다. 결과적으로 각 사원이 자신이 속한 부서의 평균 급여보다 높은 급여를 받는 사원만 조회됩니다. 상관 서브쿼리는 외부 쿼리의 각 행마다 반복 실행되므로 비용이 높을 수 있습니다.',
    options: [
      '이 서브쿼리는 단 한 번만 실행되어 전체 평균 급여를 반환한다.',
      '이 SQL은 회사 전체 평균 급여보다 높은 사원을 조회한다.',
      '이 SQL은 각 사원이 자신의 부서 평균 급여보다 높은 경우의 사원을 조회한다.',
      '상관 서브쿼리는 메인 쿼리보다 먼저 한 번만 실행된다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p30',
    title: '30. EXISTS와 IN의 성능 차이',
    description:
      '다음 두 SQL에 대한 설명으로 올바른 것은?\n\n```sql\n-- SQL A (EXISTS)\nSELECT D.DEPTNO, D.DNAME\nFROM DEPT D\nWHERE EXISTS (\n  SELECT 1 FROM EMP E WHERE E.DEPTNO = D.DEPTNO\n);\n\n-- SQL B (IN)\nSELECT D.DEPTNO, D.DNAME\nFROM DEPT D\nWHERE D.DEPTNO IN (\n  SELECT E.DEPTNO FROM EMP E\n);\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 48,
    answer: '4',
    explanation:
      'EXISTS와 IN은 동일한 결과를 반환하지만 동작 방식이 다릅니다. EXISTS는 서브쿼리가 결과를 반환하는 즉시 TRUE를 반환하고 서브쿼리 실행을 중단합니다(Short-circuit). EMP 테이블이 크고 매칭 행이 초기에 발견되면 EXISTS가 효율적입니다. IN은 서브쿼리의 모든 결과를 먼저 구한 후 비교합니다. 서브쿼리 결과가 NULL을 포함하는 경우 IN은 예상치 못한 동작(NOT IN에서 특히)을 할 수 있습니다. 두 SQL의 결과는 NULL이 없을 때 동일합니다. EMP의 DEPTNO에 NULL이 있으면 IN은 영향받을 수 있습니다.',
    options: [
      'SQL A(EXISTS)는 항상 SQL B(IN)보다 빠르다.',
      'SQL A와 SQL B는 어떤 상황에서도 동일한 결과를 보장한다.',
      'EXISTS는 상관 서브쿼리가 아니므로 한 번만 실행된다.',
      'EXISTS는 매칭 즉시 탐색을 중단하고, IN은 서브쿼리 전체를 실행하므로 상황에 따라 성능이 다를 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p31',
    title: '31. 스칼라 서브쿼리의 제약 조건',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\nSELECT E.EMPNO, E.ENAME,\n       (SELECT D.DNAME FROM DEPT D WHERE D.DEPTNO = E.DEPTNO) AS 부서명\nFROM EMP E;\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 58,
    answer: '1',
    explanation:
      '스칼라 서브쿼리(Scalar Subquery)는 SELECT 절에 사용되며 반드시 단일 값(1행 1열)을 반환해야 합니다. 이 SQL에서 서브쿼리는 각 사원의 DEPTNO로 DEPT 테이블에서 DNAME을 조회합니다. DEPTNO는 고유하므로 결과는 항상 1행입니다. 만약 서브쿼리가 2개 이상의 행을 반환하면 오류가 발생합니다. 서브쿼리가 0행을 반환하면(매칭 없음) NULL을 반환합니다. 스칼라 서브쿼리는 외부 쿼리의 각 행마다 실행되므로 상관 서브쿼리의 일종입니다.',
    options: [
      '이 서브쿼리는 단일 값을 반환해야 하며, 여러 행 반환 시 오류가 발생한다.',
      '이 서브쿼리는 여러 행을 반환할 수 있으며 모두 결과에 포함된다.',
      '스칼라 서브쿼리는 FROM 절에서만 사용할 수 있다.',
      '서브쿼리가 결과를 반환하지 않으면 해당 행이 결과에서 제외된다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p32',
    title: '32. 다중 행 서브쿼리와 ANY/ALL',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\nSELECT EMPNO, ENAME, SAL\nFROM EMP\nWHERE SAL > ALL (\n  SELECT SAL FROM EMP WHERE DEPTNO = 20\n);\n```',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 35,
    answer: '2',
    explanation:
      '>ALL은 서브쿼리 결과의 모든 값보다 크다는 의미로, MAX()와 동일합니다. 이 SQL은 DEPTNO=20인 모든 사원의 급여보다 높은 급여를 받는 사원을 조회합니다. 즉, DEPTNO=20 부서의 최고 급여보다 높은 급여를 받는 사원입니다. >ANY는 서브쿼리 결과 중 하나라도 크면 참(MIN()보다 큰 것과 동일). 만약 서브쿼리가 NULL을 포함하면 >ALL은 항상 거짓이 되므로 결과가 없을 수 있습니다.',
    options: [
      'DEPTNO=20 사원의 평균 급여보다 높은 급여를 받는 사원을 조회한다.',
      'DEPTNO=20 사원 중 최고 급여보다 높은 급여를 받는 사원을 조회한다.',
      'DEPTNO=20 사원 중 한 명의 급여보다 높은 급여를 받는 사원을 조회한다.',
      '>ALL은 서브쿼리의 어느 값보다 크면 참이므로 MIN()과 동일하다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p33',
    title: '33. FROM 절 서브쿼리(인라인 뷰)',
    description:
      '다음 SQL의 결과에 대한 설명으로 올바른 것은?\n\n```sql\nSELECT DEPTNO, AVG_SAL\nFROM (\n  SELECT DEPTNO, AVG(SAL) AS AVG_SAL\n  FROM EMP\n  GROUP BY DEPTNO\n) DEPT_AVG\nWHERE AVG_SAL > 2000;\n```',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '서브쿼리',
    correctRate: 74,
    answer: '3',
    explanation:
      '인라인 뷰(Inline View)는 FROM 절에 사용된 서브쿼리로, 마치 임시 테이블처럼 동작합니다. 이 SQL에서 인라인 뷰는 부서별 평균 급여를 계산하고, 외부 쿼리는 평균 급여가 2000을 초과하는 부서만 필터링합니다. HAVING 절을 사용하면 GROUP BY와 함께 집계 필터링이 가능하지만, 인라인 뷰를 사용하면 더 복잡한 처리가 가능합니다. 이 SQL은 HAVING AVG(SAL) > 2000과 동일한 결과를 반환합니다.',
    options: [
      '이 SQL은 오류가 발생한다. WHERE 절에서 별칭(AVG_SAL)을 사용할 수 없다.',
      '인라인 뷰는 실제 테이블이 아니므로 WHERE 절 필터링이 적용되지 않는다.',
      '부서별 평균 급여를 계산한 후 평균이 2000을 초과하는 부서의 부서번호와 평균 급여를 반환한다.',
      '이 SQL은 각 사원의 급여가 2000을 초과하는 행만 반환한다.',
    ],
    points: 10,
  },

  // --- 윈도우함수 (4문항: 34~37) ---
  {
    id: 'exam5_p34',
    title: '34. 윈도우 함수 ROWS와 RANGE의 차이',
    description:
      '다음 두 SQL에서 ROWS와 RANGE의 차이에 대한 설명으로 올바른 것은?\n\n```sql\n-- SQL A\nSELECT EMPNO, SAL,\n       SUM(SAL) OVER (ORDER BY SAL ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS 누적합_ROWS\nFROM EMP;\n\n-- SQL B\nSELECT EMPNO, SAL,\n       SUM(SAL) OVER (ORDER BY SAL RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS 누적합_RANGE\nFROM EMP;\n```',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 28,
    answer: '4',
    explanation:
      'ROWS는 물리적 행을 기준으로 프레임을 지정합니다. SAL이 같은 값이 여러 개일 때, ROWS CURRENT ROW는 현재 물리적 행만 포함하므로 동일 SAL을 가진 행들의 누적합이 다를 수 있습니다. RANGE는 논리적 값 범위를 기준으로 프레임을 지정합니다. RANGE CURRENT ROW는 ORDER BY 기준(SAL)이 현재 행과 동일한 모든 행을 CURRENT ROW로 간주합니다. 따라서 SAL이 같은 행들은 모두 동일한 누적합을 갖게 됩니다. 중복 SAL이 없으면 두 결과는 동일합니다.',
    options: [
      'ROWS와 RANGE는 항상 동일한 결과를 반환한다.',
      'ROWS는 논리적 범위를, RANGE는 물리적 행을 기준으로 프레임을 지정한다.',
      'RANGE CURRENT ROW는 현재 행 한 개만 포함한다.',
      'SAL이 같은 행이 있을 때, ROWS는 행마다 다른 누적합을, RANGE는 같은 SAL의 행들이 동일한 누적합을 가진다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p35',
    title: '35. RANK, DENSE_RANK, ROW_NUMBER의 차이',
    description:
      '다음 테이블에서 SQL 실행 결과로 올바른 것은?\n\n테이블 SCORE: (NAME=\'A\', SCORE=90), (NAME=\'B\', SCORE=85), (NAME=\'C\', SCORE=85), (NAME=\'D\', SCORE=80)\n\n```sql\nSELECT NAME, SCORE,\n       RANK() OVER (ORDER BY SCORE DESC) AS RK,\n       DENSE_RANK() OVER (ORDER BY SCORE DESC) AS DRK,\n       ROW_NUMBER() OVER (ORDER BY SCORE DESC) AS RN\nFROM SCORE;\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 55,
    answer: '2',
    explanation:
      'RANK()는 동순위 다음 순위를 건너뜁니다. A=1위, B와 C는 동점이므로 2위, 2위 다음은 4위로 건너뜁니다. D=4위. DENSE_RANK()는 동순위 다음 순위를 건너뛰지 않습니다. A=1위, B와 C는 2위, D=3위. ROW_NUMBER()는 동순위 없이 순서대로 1,2,3,4를 부여합니다(ORDER BY에 따라 B와 C 중 누가 2가 되는지는 비결정적). 따라서 A: RK=1, DRK=1, RN=1 / B,C: RK=2, DRK=2, RN=2 또는 3 / D: RK=4, DRK=3, RN=4가 됩니다.',
    options: [
      'D의 RANK=3, DENSE_RANK=3, ROW_NUMBER=4',
      'D의 RANK=4, DENSE_RANK=3, ROW_NUMBER=4',
      'B의 RANK=2, DENSE_RANK=2, ROW_NUMBER=2이고 D의 RANK=3, DENSE_RANK=3, ROW_NUMBER=4',
      'RANK와 DENSE_RANK는 동순위 처리가 동일하다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p36',
    title: '36. LAG/LEAD 함수의 활용',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\nSELECT EMPNO, ENAME, SAL,\n       LAG(SAL, 1, 0) OVER (ORDER BY SAL) AS 이전급여,\n       LEAD(SAL, 2, -1) OVER (ORDER BY SAL) AS 다음2급여\nFROM EMP\nORDER BY SAL;\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 48,
    answer: '1',
    explanation:
      'LAG(SAL, 1, 0)은 현재 행으로부터 1행 이전의 SAL 값을 반환하며, 이전 행이 없으면 기본값 0을 반환합니다. LEAD(SAL, 2, -1)은 현재 행으로부터 2행 이후의 SAL 값을 반환하며, 해당 행이 없으면 기본값 -1을 반환합니다. SAL 오름차순으로 정렬된 결과에서, 첫 번째 행의 이전급여는 0(기본값), 마지막 두 행의 다음2급여는 -1(기본값)이 됩니다.',
    options: [
      'LAG 첫 번째 행의 이전급여는 0, LEAD 마지막 두 행의 다음2급여는 -1을 반환한다.',
      'LAG와 LEAD 모두 NULL을 반환하는 경우 기본값을 설정할 수 없다.',
      'LAG(SAL, 1, 0)은 다음 행의 SAL을 반환한다.',
      'LEAD(SAL, 2, -1)은 현재 행 이전의 두 번째 행 SAL을 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p37',
    title: '37. PARTITION BY와 ORDER BY 조합',
    description:
      '다음 SQL의 결과에 대한 설명으로 올바른 것은?\n\n```sql\nSELECT DEPTNO, ENAME, SAL,\n       SUM(SAL) OVER (PARTITION BY DEPTNO) AS 부서합계,\n       SUM(SAL) OVER (PARTITION BY DEPTNO ORDER BY SAL) AS 부서누적합\nFROM EMP\nORDER BY DEPTNO, SAL;\n```',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 32,
    answer: '3',
    explanation:
      'PARTITION BY DEPTNO만 있는 경우(부서합계)는 해당 부서의 전체 급여 합계가 모든 행에 동일하게 표시됩니다. PARTITION BY DEPTNO ORDER BY SAL이 있는 경우(부서누적합)는 부서 내에서 SAL 오름차순으로 현재 행까지의 누적 합계를 계산합니다(기본 프레임: RANGE UNBOUNDED PRECEDING AND CURRENT ROW). 따라서 같은 부서의 마지막 행(가장 높은 SAL)의 부서누적합은 부서합계와 동일합니다. SAL이 같은 행이 있으면 RANGE 기준으로 동일한 누적합을 가집니다.',
    options: [
      '부서합계와 부서누적합은 항상 동일한 값을 반환한다.',
      '부서누적합은 전체 EMP 테이블의 SAL을 누적한다.',
      '부서합계는 부서 전체 합계이고, 부서누적합은 부서 내 SAL 오름차순 누적합이며 마지막 행에서 부서합계와 같아진다.',
      'PARTITION BY 없이 ORDER BY만 있으면 전체 누적합이 계산된다.',
    ],
    points: 10,
  },

  // --- 집합연산 (4문항: 38~41) ---
  {
    id: 'exam5_p38',
    title: '38. UNION과 UNION ALL의 차이',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\n-- SQL A\nSELECT EMPNO, ENAME FROM EMP WHERE DEPTNO = 10\nUNION\nSELECT EMPNO, ENAME FROM EMP WHERE JOB = \'MANAGER\';\n\n-- SQL B\nSELECT EMPNO, ENAME FROM EMP WHERE DEPTNO = 10\nUNION ALL\nSELECT EMPNO, ENAME FROM EMP WHERE JOB = \'MANAGER\';\n```',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 76,
    answer: '1',
    explanation:
      'UNION은 두 SELECT 결과를 합치면서 중복을 제거합니다. 정렬 연산이 발생하므로 UNION ALL보다 느릴 수 있습니다. UNION ALL은 중복을 제거하지 않고 모든 행을 합칩니다. DEPTNO=10이면서 JOB=\'MANAGER\'인 사원이 있다면, SQL A에서는 1번 나타나고 SQL B에서는 2번 나타납니다. 따라서 중복 행이 있을 경우 SQL A의 결과 행 수 <= SQL B의 결과 행 수입니다.',
    options: [
      '중복 행이 있으면 SQL A의 결과 행 수가 SQL B보다 적거나 같다.',
      'SQL A와 SQL B는 항상 동일한 결과를 반환한다.',
      'UNION ALL은 중복을 제거하고 UNION은 제거하지 않는다.',
      'UNION은 항상 UNION ALL보다 빠르다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p39',
    title: '39. INTERSECT와 MINUS/EXCEPT',
    description:
      '다음 두 SQL의 결과에 대한 설명으로 올바른 것은?\n\n```sql\n-- SQL A (INTERSECT)\nSELECT DEPTNO FROM EMP WHERE JOB = \'CLERK\'\nINTERSECT\nSELECT DEPTNO FROM EMP WHERE JOB = \'MANAGER\';\n\n-- SQL B (MINUS)\nSELECT DEPTNO FROM EMP WHERE JOB = \'CLERK\'\nMINUS\nSELECT DEPTNO FROM EMP WHERE JOB = \'MANAGER\';\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 52,
    answer: '4',
    explanation:
      'INTERSECT는 두 집합의 교집합(공통 원소)을 반환합니다. SQL A는 CLERK와 MANAGER 모두 있는 부서번호를 반환합니다. MINUS(Oracle) 또는 EXCEPT(SQL Server, PostgreSQL)는 첫 번째 집합에서 두 번째 집합을 뺀 차집합을 반환합니다. SQL B는 CLERK가 있지만 MANAGER는 없는 부서번호를 반환합니다. 두 연산 모두 중복을 자동으로 제거합니다. SQL Server에서는 MINUS 대신 EXCEPT를 사용합니다.',
    options: [
      'SQL A는 CLERK 또는 MANAGER가 있는 모든 부서번호를 반환한다.',
      'SQL B는 MANAGER가 있지만 CLERK가 없는 부서번호를 반환한다.',
      'MINUS와 EXCEPT는 다른 결과를 반환한다.',
      'SQL A는 CLERK와 MANAGER 모두 있는 부서번호, SQL B는 CLERK만 있고 MANAGER가 없는 부서번호를 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p40',
    title: '40. 집합 연산자의 ORDER BY 위치',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\nSELECT EMPNO, ENAME, SAL FROM EMP WHERE DEPTNO = 10\nUNION ALL\nSELECT EMPNO, ENAME, SAL FROM EMP WHERE DEPTNO = 20\nORDER BY SAL DESC;\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 58,
    answer: '2',
    explanation:
      '집합 연산자(UNION, UNION ALL, INTERSECT, MINUS)를 사용할 때 ORDER BY는 마지막 SELECT 문 뒤에만 한 번 사용할 수 있습니다. ORDER BY는 전체 집합 연산 결과에 적용됩니다. 또한 ORDER BY에서 컬럼명은 첫 번째 SELECT의 컬럼명이나 별칭을 사용하거나, 컬럼 순서(번호)로 지정할 수 있습니다. 이 SQL은 올바른 구문으로, DEPTNO=10과 DEPTNO=20의 합집합을 SAL 내림차순으로 정렬합니다.',
    options: [
      '각 SELECT에 ORDER BY를 따로 붙여야 한다.',
      '집합 연산자 사용 시 ORDER BY는 마지막에 한 번만 사용하며, 전체 결과에 적용된다.',
      'UNION ALL은 ORDER BY를 지원하지 않는다.',
      'ORDER BY SAL은 첫 번째 SELECT의 SAL에만 적용된다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p41',
    title: '41. 집합 연산자와 컬럼 개수/타입 조건',
    description:
      '다음 SQL 중 오류가 발생하는 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 60,
    answer: '3',
    explanation:
      '집합 연산자를 사용할 때 각 SELECT 문의 컬럼 수는 동일해야 하며, 대응되는 컬럼의 데이터 타입이 호환 가능해야 합니다. 컬럼 이름이 다른 경우 첫 번째 SELECT의 컬럼명이 결과 컬럼명이 됩니다. SELECT 컬럼 수가 다르면 오류가 발생합니다. SQL 3번은 첫 번째 SELECT는 2개 컬럼, 두 번째 SELECT는 3개 컬럼으로 컬럼 수가 달라 오류가 발생합니다.',
    options: [
      'SELECT EMPNO, ENAME FROM EMP UNION SELECT DEPTNO, DNAME FROM DEPT;',
      'SELECT 1, \'A\' FROM DUAL UNION SELECT 2, \'B\' FROM DUAL;',
      'SELECT EMPNO, ENAME FROM EMP UNION SELECT DEPTNO, DNAME, LOC FROM DEPT;',
      'SELECT EMPNO, ENAME FROM EMP UNION ALL SELECT EMPNO, ENAME FROM EMP WHERE DEPTNO = 10;',
    ],
    points: 10,
  },

  // --- DDL (4문항: 42~45) ---
  {
    id: 'exam5_p42',
    title: '42. Oracle과 SQL Server의 AUTO INCREMENT 차이',
    description:
      '자동 증가 기본키를 생성할 때 Oracle과 SQL Server의 차이로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DDL',
    correctRate: 38,
    answer: '3',
    explanation:
      'Oracle 12c 이전에는 자동 증가 컬럼이 없어 SEQUENCE를 따로 생성하여 INSERT 시 NEXTVAL을 사용해야 했습니다. Oracle 12c 이후부터 GENERATED AS IDENTITY 구문으로 자동 증가 컬럼을 지원합니다. SQL Server는 IDENTITY(시작값, 증가값) 속성으로 자동 증가 컬럼을 정의합니다(예: ID INT IDENTITY(1,1)). MySQL은 AUTO_INCREMENT를 사용합니다. 따라서 전통적인 Oracle 방식과 SQL Server 방식은 다릅니다.',
    options: [
      'Oracle과 SQL Server 모두 AUTO_INCREMENT 키워드를 사용한다.',
      'Oracle은 IDENTITY를 사용하고, SQL Server는 SEQUENCE를 사용한다.',
      'Oracle 12c 이전에는 SEQUENCE를 사용하고, SQL Server는 IDENTITY(1,1)을 사용한다.',
      'Oracle과 SQL Server는 자동 증가 기본키를 지원하지 않는다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p43',
    title: '43. DDL 제약조건 위반 시나리오',
    description:
      '다음 테이블 생성 후 INSERT 시 오류가 발생하는 것은?\n\n```sql\nCREATE TABLE ORDERS (\n  ORDER_ID   NUMBER PRIMARY KEY,\n  CUST_ID    NUMBER NOT NULL,\n  AMOUNT     NUMBER CHECK (AMOUNT > 0),\n  STATUS     VARCHAR2(10) DEFAULT \'PENDING\'\n             CHECK (STATUS IN (\'PENDING\', \'DONE\', \'CANCEL\'))\n);\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 55,
    answer: '4',
    explanation:
      'INSERT INTO ORDERS VALUES (1, 101, 500, \'PENDING\')는 모든 제약 조건 만족으로 성공합니다. INSERT INTO ORDERS (ORDER_ID, CUST_ID, AMOUNT) VALUES (2, 102, 300)는 STATUS가 생략되어 DEFAULT \'PENDING\'이 적용되므로 성공합니다. INSERT INTO ORDERS VALUES (3, 103, 200, \'HOLD\')는 STATUS가 \'HOLD\'로 CHECK 제약(IN(\'PENDING\',\'DONE\',\'CANCEL\'))을 위반하여 오류가 발생합니다. 오류가 발생하는 것은 4번입니다.',
    options: [
      'INSERT INTO ORDERS VALUES (1, 101, 500, \'PENDING\');',
      'INSERT INTO ORDERS (ORDER_ID, CUST_ID, AMOUNT) VALUES (2, 102, 300);',
      'INSERT INTO ORDERS VALUES (3, 103, 0, \'DONE\');',
      'INSERT INTO ORDERS VALUES (4, 104, 200, \'HOLD\');',
    ],
    points: 10,
  },
  {
    id: 'exam5_p44',
    title: '44. ALTER TABLE을 이용한 제약조건 추가',
    description:
      '기존 테이블에 FOREIGN KEY 제약조건을 추가하는 SQL로 올바른 것은?\n\n(EMP.DEPTNO가 DEPT.DEPTNO를 참조하도록 추가)',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 70,
    answer: '2',
    explanation:
      'ALTER TABLE을 사용하여 기존 테이블에 제약조건을 추가할 수 있습니다. FOREIGN KEY 제약조건 추가 구문은 ALTER TABLE 테이블명 ADD CONSTRAINT 제약조건명 FOREIGN KEY (컬럼명) REFERENCES 참조테이블(참조컬럼)입니다. 이때 CONSTRAINT 절로 제약조건에 이름을 부여할 수 있습니다(생략 가능). REFERENCES 후에는 참조하는 테이블과 컬럼을 지정합니다. 참조 컬럼이 참조 테이블의 기본키인 경우 컬럼명을 생략할 수 있습니다.',
    options: [
      'ALTER TABLE EMP MODIFY DEPTNO FOREIGN KEY REFERENCES DEPT(DEPTNO);',
      'ALTER TABLE EMP ADD CONSTRAINT FK_EMP_DEPT FOREIGN KEY (DEPTNO) REFERENCES DEPT(DEPTNO);',
      'ALTER TABLE EMP ADD FOREIGN KEY DEPTNO TO DEPT.DEPTNO;',
      'ALTER TABLE EMP CONSTRAINT FK_EMP_DEPT FOREIGN KEY (DEPTNO) = DEPT(DEPTNO);',
    ],
    points: 10,
  },
  {
    id: 'exam5_p45',
    title: '45. TCL과 DDL의 자동 커밋 상호작용',
    description:
      '다음 SQL 실행 순서에서 최종 상태로 올바른 것은? (Oracle 기준)\n\n```sql\nINSERT INTO EMP (EMPNO, ENAME) VALUES (9999, \'TEST\');\n-- 커밋 전\nCREATE TABLE TEMP_TABLE (ID NUMBER);\n-- DDL 실행\nROLLBACK;\n```',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DDL',
    correctRate: 32,
    answer: '2',
    explanation:
      'Oracle에서 DDL(CREATE, DROP, ALTER, TRUNCATE 등)을 실행하면 자동으로 COMMIT이 발생합니다(암묵적 COMMIT). 따라서 CREATE TABLE TEMP_TABLE이 실행되는 순간, 이전에 실행된 INSERT가 자동으로 COMMIT됩니다. 이후 ROLLBACK을 실행해도 이미 COMMIT된 INSERT는 취소되지 않습니다. ROLLBACK은 CREATE TABLE 이후의 변경사항만 취소하지만, CREATE TABLE 자체도 DDL이므로 ROLLBACK 대상이 아닙니다. 최종 결과: INSERT 데이터(EMPNO=9999)는 테이블에 존재하고, TEMP_TABLE도 생성된 상태입니다.',
    options: [
      'ROLLBACK으로 INSERT와 CREATE TABLE 모두 취소된다.',
      'DDL 실행 시 암묵적 COMMIT 발생으로 INSERT가 확정되고, ROLLBACK 후에도 INSERT 데이터와 TEMP_TABLE이 존재한다.',
      'ROLLBACK으로 INSERT만 취소되고 TEMP_TABLE은 남는다.',
      'DDL은 트랜잭션과 무관하므로 ROLLBACK이 INSERT를 취소한다.',
    ],
    points: 10,
  },

  // --- TCL (2문항: 46~47) ---
  {
    id: 'exam5_p46',
    title: '46. SAVEPOINT의 활용',
    description:
      '다음 SQL 실행 후 최종 테이블 T의 상태로 올바른 것은?\n\n```sql\n-- 초기: T 테이블 빈 상태\nINSERT INTO T VALUES (1);\nSAVEPOINT SP1;\nINSERT INTO T VALUES (2);\nSAVEPOINT SP2;\nINSERT INTO T VALUES (3);\nROLLBACK TO SP1;\nINSERT INTO T VALUES (4);\nCOMMIT;\n```',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 40,
    answer: '3',
    explanation:
      'SAVEPOINT는 트랜잭션 내에서 부분 롤백 지점을 설정합니다. ROLLBACK TO SP1은 SP1 이후의 변경사항(INSERT 2, INSERT 3)을 취소하고 SP1 시점(INSERT 1만 있는 상태)으로 돌아갑니다. SP1 이전의 INSERT 1은 유지됩니다. 이후 INSERT 4를 실행하면 T에는 1과 4가 있습니다. COMMIT으로 확정되면 최종 상태는 {1, 4}입니다. ROLLBACK TO SAVEPOINT는 해당 SAVEPOINT 이후의 변경만 취소하고, SAVEPOINT 이전의 변경은 유지합니다.',
    options: [
      'T에 {1, 2, 3, 4} 존재',
      'T에 {1} 존재',
      'T에 {1, 4} 존재',
      'T에 {4} 존재',
    ],
    points: 10,
  },
  {
    id: 'exam5_p47',
    title: '47. 트랜잭션 격리 수준(Isolation Level)',
    description:
      '트랜잭션 격리 수준과 발생 가능한 현상에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 30,
    answer: '1',
    explanation:
      '트랜잭션 격리 수준은 4단계로 READ UNCOMMITTED < READ COMMITTED < REPEATABLE READ < SERIALIZABLE입니다. READ UNCOMMITTED는 커밋되지 않은 데이터를 읽을 수 있어 Dirty Read가 발생할 수 있습니다. READ COMMITTED는 커밋된 데이터만 읽으므로 Dirty Read는 방지되지만 Non-Repeatable Read(같은 트랜잭션 내 같은 쿼리의 결과가 다름)가 발생할 수 있습니다. REPEATABLE READ는 Non-Repeatable Read를 방지하지만 Phantom Read(새로운 행 삽입으로 결과 집합 변화)가 발생할 수 있습니다. SERIALIZABLE은 모든 이상현상을 방지하지만 성능이 가장 낮습니다.',
    options: [
      'READ UNCOMMITTED는 Dirty Read가 발생할 수 있고, SERIALIZABLE은 모든 이상현상을 방지한다.',
      'READ COMMITTED는 Phantom Read를 방지한다.',
      'REPEATABLE READ는 Dirty Read와 Non-Repeatable Read, Phantom Read 모두 방지한다.',
      '격리 수준이 높을수록 동시성이 높아진다.',
    ],
    points: 10,
  },

  // --- DCL (2문항: 48~49) ---
  {
    id: 'exam5_p48',
    title: '48. GRANT와 WITH GRANT OPTION',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n```sql\nGRANT SELECT, INSERT ON EMP TO USER_A WITH GRANT OPTION;\n```',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DCL',
    correctRate: 68,
    answer: '4',
    explanation:
      'GRANT 문은 특정 사용자에게 객체에 대한 권한을 부여합니다. WITH GRANT OPTION은 권한을 받은 사용자(USER_A)가 동일한 권한을 다른 사용자에게 다시 부여할 수 있도록 합니다. 즉, USER_A가 SELECT, INSERT 권한을 EMP 테이블에 대해 다른 사용자에게 부여할 수 있습니다. 주의: 권한을 부여한 원래 계정이 권한을 회수(REVOKE)하면, WITH GRANT OPTION으로 연쇄적으로 부여된 권한도 함께 회수됩니다.',
    options: [
      'USER_A는 EMP 테이블을 수정(UPDATE)할 수 있다.',
      'WITH GRANT OPTION은 시스템 권한에만 적용된다.',
      'USER_A는 다른 사용자에게 DELETE 권한을 부여할 수 있다.',
      'USER_A는 EMP 테이블에 SELECT, INSERT 권한을 가지며 다른 사용자에게 동일 권한을 부여할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam5_p49',
    title: '49. ROLE을 이용한 권한 관리',
    description:
      '다음 SQL의 실행 결과에 대한 설명으로 올바른 것은?\n\n```sql\nCREATE ROLE ANALYST_ROLE;\nGRANT SELECT ON EMP TO ANALYST_ROLE;\nGRANT SELECT ON DEPT TO ANALYST_ROLE;\nGRANT ANALYST_ROLE TO USER_B;\n```',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DCL',
    correctRate: 55,
    answer: '2',
    explanation:
      'ROLE은 여러 권한을 묶어 관리하는 객체입니다. ANALYST_ROLE을 생성하고 EMP와 DEPT의 SELECT 권한을 ROLE에 부여합니다. 그 다음 USER_B에게 ANALYST_ROLE을 부여하면 USER_B는 ANALYST_ROLE에 포함된 모든 권한(EMP, DEPT에 대한 SELECT)을 갖게 됩니다. ROLE을 사용하면 권한 관리가 편리하며, ROLE에 권한을 추가하면 해당 ROLE을 부여받은 모든 사용자에게 자동으로 권한이 부여됩니다. USER_B는 INSERT나 UPDATE 권한은 없습니다.',
    options: [
      'USER_B는 EMP와 DEPT 테이블에 INSERT, UPDATE, DELETE, SELECT 권한을 갖는다.',
      'USER_B는 EMP와 DEPT 테이블에 SELECT 권한을 갖는다.',
      'ANALYST_ROLE은 스키마 객체이므로 사용자에게 부여할 수 없다.',
      'ROLE에 부여된 권한은 사용자에게 자동 부여되지 않는다.',
    ],
    points: 10,
  },

  // --- 계층형쿼리 (1문항: 50) ---
  {
    id: 'exam5_p50',
    title: '50. 계층형 쿼리의 LEVEL과 CONNECT BY',
    description:
      '다음 계층형 쿼리에 대한 설명으로 올바른 것은?\n\n```sql\nSELECT LEVEL, EMPNO, ENAME, MGR,\n       LPAD(\' \', (LEVEL-1)*2) || ENAME AS 계층표현\nFROM EMP\nSTART WITH MGR IS NULL\nCONNECT BY PRIOR EMPNO = MGR\nORDER SIBLINGS BY ENAME;\n```',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 32,
    answer: '3',
    explanation:
      'Oracle의 계층형 쿼리에서 START WITH는 루트 노드 조건을 지정합니다. MGR IS NULL은 관리자가 없는 사원(최상위 관리자)을 루트로 지정합니다. CONNECT BY PRIOR EMPNO = MGR은 부모(PRIOR EMPNO)와 자식(MGR)의 연결 방향을 정의합니다. PRIOR가 EMPNO 앞에 있으므로 부모에서 자식 방향(Top-Down)으로 탐색합니다. LEVEL은 루트가 1이고 자식이 내려갈수록 증가합니다. LPAD(\' \', (LEVEL-1)*2)는 계층 깊이에 따라 들여쓰기를 합니다. ORDER SIBLINGS BY ENAME은 같은 부모의 자식들 사이에서만 ENAME으로 정렬하여 계층 구조를 유지합니다.',
    options: [
      'START WITH MGR IS NULL은 모든 사원을 루트로 시작한다.',
      'CONNECT BY PRIOR EMPNO = MGR은 자식에서 부모 방향(Bottom-Up)으로 탐색한다.',
      'LEVEL은 루트 노드가 1이며, ORDER SIBLINGS BY는 계층 구조를 유지하면서 형제 노드 간 정렬을 수행한다.',
      'ORDER SIBLINGS BY를 사용하면 계층 구조가 무시되고 전체 정렬이 적용된다.',
    ],
    points: 10,
  },
];
