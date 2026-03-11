import type { Problem } from '../../types';

// SQLD 모의고사 6회 (중급 난이도 - 목표 합격률 ~45%)
// 1과목: 데이터 모델링의 이해 (10문항, 20점)
// 2과목: SQL 기본 및 활용 (40문항, 80점)
// 난이도 배분: easy 12 / medium 23 / hard 15

export const EXAM_6_PROBLEMS: Problem[] = [
  // ===== 1과목: 데이터 모델링의 이해 (1~10번) =====
  // --- 데이터모델링 (1~5) ---
  {
    id: 'exam6_p1',
    title: '1. 인덱스 설계와 외래키',
    description:
      '외래키(FK)가 있는 테이블에서 인덱스 설계 시 고려해야 할 사항으로 올바른 것은?\n\n다음 테이블 구조를 참고하라.\n\nORDER(ORDER_ID PK, CUSTOMER_ID FK, PRODUCT_ID FK, ORDER_DATE)\n\n이 테이블에서 CUSTOMER_ID와 PRODUCT_ID에 인덱스를 생성해야 하는 이유로 가장 적절한 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 52,
    answer: '2',
    explanation:
      '외래키 컬럼에 인덱스를 생성하는 주된 이유는 참조 무결성 제약 조건 체크 성능과 JOIN 성능 향상입니다. 부모 테이블에서 삭제나 수정이 발생할 때 자식 테이블의 FK를 빠르게 조회해야 하므로, FK 컬럼에 인덱스가 없으면 전체 테이블 스캔(Full Table Scan)이 발생합니다. 특히 CUSTOMER_ID로 주문 조회, PRODUCT_ID로 주문 조회 등의 쿼리에서 성능이 크게 향상됩니다.',
    options: [
      'FK 컬럼에는 자동으로 UNIQUE 제약이 부여되어 인덱스가 필요 없다.',
      'FK 컬럼에 인덱스를 생성하면 부모-자식 JOIN 성능과 무결성 체크 성능이 향상된다.',
      'PK 인덱스가 있으면 FK 인덱스는 별도 생성이 필요 없다.',
      'FK 인덱스는 INSERT/UPDATE 성능만 향상시키고 SELECT에는 영향이 없다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p2',
    title: '2. 조인 최적화와 데이터 모델',
    description:
      '다음 중 데이터 모델 설계 시 조인(JOIN) 성능을 고려한 설계 전략으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 48,
    answer: '3',
    explanation:
      '조인 최적화를 위한 모델 설계 전략으로는 자주 함께 조회되는 컬럼을 같은 테이블에 배치하는 반정규화, 조인 컬럼에 인덱스 생성, 불필요한 조인을 줄이기 위한 중간 집계 테이블 활용 등이 있습니다. 무조건 테이블 수를 최소화하는 것은 조회 성능에 유리할 수 있으나, 데이터 중복과 무결성 문제를 초래하므로 설계 전략으로 적절하지 않습니다. 조인 성능 최적화의 핵심은 필요한 데이터를 최소한의 접근으로 가져오는 것입니다.',
    options: [
      '자주 함께 조회되는 컬럼은 같은 테이블에 배치하는 반정규화를 고려한다.',
      '조인 조건으로 사용되는 컬럼에는 인덱스를 생성한다.',
      '조인 성능을 위해 무조건 테이블 수를 최소화하여 모든 데이터를 하나의 테이블에 모아야 한다.',
      '집계가 빈번히 필요한 경우 요약 테이블을 별도로 설계하여 조인을 줄인다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p3',
    title: '3. 반정규화 적용 기준',
    description:
      '다음 중 반정규화(Denormalization)를 적용하기에 가장 적절한 상황은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 40,
    answer: '4',
    explanation:
      '반정규화는 성능 저하가 명확히 확인되고, 다른 방법(인덱스 최적화, 쿼리 튜닝 등)으로 해결이 어려울 때 적용합니다. 조회 횟수가 극히 빈번하고 대용량 데이터에서 여러 테이블을 항상 조인해야 하는 경우가 반정규화의 최적 적용 사례입니다. 데이터 입력/수정이 빈번한 OLTP 환경에서는 반정규화로 인한 무결성 유지 비용이 증가하므로 신중해야 합니다.',
    options: [
      '데이터 입력과 수정이 매우 빈번한 OLTP 환경에서 무결성을 강화하고자 할 때',
      '테이블 개수를 줄여 데이터베이스 관리를 단순화하고자 할 때',
      '정규화가 아직 완료되지 않은 데이터 모델에 데이터를 빠르게 저장해야 할 때',
      '대용량 데이터에서 여러 테이블의 조인이 항상 필요한 빈번한 조회 쿼리의 성능이 문제될 때',
    ],
    points: 10,
  },
  {
    id: 'exam6_p4',
    title: '4. 반정규화의 종류',
    description:
      '반정규화 기법 중 테이블 수직 분할(Vertical Partitioning)에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 50,
    answer: '2',
    explanation:
      '테이블 수직 분할은 하나의 테이블을 컬럼 기준으로 두 개 이상의 테이블로 나누는 것입니다. 자주 접근하는 컬럼과 그렇지 않은 컬럼을 분리하여 I/O 효율을 높입니다. 예를 들어 사원 테이블에서 자주 조회되는 기본 정보(사원번호, 이름, 부서)와 rarely 접근되는 상세 정보(사진, 이력, 계약서)를 분리하는 것입니다. 이는 테이블을 합치는 것이 아니라 분리하는 것입니다.',
    options: [
      '수직 분할은 행(Row)을 기준으로 테이블을 여러 개로 나누는 것이다.',
      '수직 분할은 컬럼(Column)을 기준으로 테이블을 나누어 자주 접근하는 컬럼과 그렇지 않은 컬럼을 분리한다.',
      '수직 분할을 적용하면 기본키가 변경되어 참조 무결성이 깨진다.',
      '수직 분할은 여러 테이블을 하나로 합쳐 조인을 없애는 기법이다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p5',
    title: '5. 외래키 참조 무결성 액션',
    description:
      '부모 테이블의 행을 삭제할 때 자식 테이블의 외래키(FK) 컬럼을 NULL로 설정하는 참조 무결성 옵션은?\n\nCREATE TABLE CHILD (\n  CHILD_ID NUMBER PRIMARY KEY,\n  PARENT_ID NUMBER,\n  CONSTRAINT FK_PARENT\n    FOREIGN KEY (PARENT_ID) REFERENCES PARENT(PARENT_ID)\n    ON DELETE [?]\n);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 55,
    answer: '3',
    explanation:
      '외래키의 참조 무결성 액션 종류: CASCADE - 부모 삭제 시 자식도 함께 삭제, SET NULL - 부모 삭제 시 자식의 FK 컬럼을 NULL로 설정, SET DEFAULT - 부모 삭제 시 자식의 FK 컬럼을 DEFAULT 값으로 설정, NO ACTION/RESTRICT - 자식이 존재하면 부모 삭제를 거부. SET NULL은 FK 컬럼이 NULL을 허용해야 사용 가능합니다.',
    options: [
      'CASCADE',
      'NO ACTION',
      'SET NULL',
      'SET DEFAULT',
    ],
    points: 10,
  },

  // --- 정규화 (6~10) ---
  {
    id: 'exam6_p6',
    title: '6. 이상현상과 정규화',
    description:
      '다음 테이블 R(학번, 동아리코드, 동아리명, 지도교수)이 있다. 이 테이블에서 동아리코드 → 동아리명, 동아리코드 → 지도교수의 종속 관계가 있고 기본키는 (학번, 동아리코드)이다. 이 테이블에서 발생하는 이상현상으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 53,
    answer: '4',
    explanation:
      '이 테이블에는 부분 함수 종속(동아리코드 → 동아리명, 지도교수)이 존재하여 2NF를 위반합니다. 이로 인해 삽입 이상(학생 없이 동아리 정보를 등록할 수 없음), 삭제 이상(특정 동아리의 마지막 학생을 삭제하면 동아리 정보도 삭제됨), 갱신 이상(지도교수 변경 시 해당 동아리의 모든 행을 수정해야 함)이 발생합니다. 조인 종속은 4NF, 5NF에서 다루는 개념으로 이 상황과 직접적인 관련이 없습니다.',
    options: [
      '삽입 이상 - 소속 학생이 없으면 동아리 정보를 등록할 수 없다.',
      '삭제 이상 - 동아리의 마지막 학생을 삭제하면 동아리명과 지도교수 정보도 사라진다.',
      '갱신 이상 - 지도교수 변경 시 해당 동아리의 모든 행을 수정해야 한다.',
      '조인 이상 - 두 테이블을 조인하면 데이터가 중복 생성된다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p7',
    title: '7. 제4정규형과 다중값 종속',
    description:
      '제4정규형(4NF)에서 제거하는 종속 유형으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 32,
    answer: '1',
    explanation:
      '정규화 단계별 제거 종속: 1NF - 반복 그룹(원자값 위반), 2NF - 부분 함수 종속, 3NF - 이행적 종속, BCNF - 결정자가 후보키가 아닌 함수 종속, 4NF - 다중값 종속(MVD, Multi-Valued Dependency), 5NF - 조인 종속. 다중값 종속은 A →→ B 형태로, A의 한 값에 B의 여러 값이 독립적으로 대응되는 관계입니다.',
    options: [
      '다중값 종속(MVD, Multi-Valued Dependency)',
      '이행적 종속(Transitive Dependency)',
      '부분 함수 종속(Partial Functional Dependency)',
      '조인 종속(Join Dependency)',
    ],
    points: 10,
  },
  {
    id: 'exam6_p8',
    title: '8. 반정규화와 데이터 무결성',
    description:
      '반정규화를 적용할 때 데이터 무결성을 유지하기 위한 방법으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 58,
    answer: '4',
    explanation:
      '반정규화 시 데이터 무결성 유지 방법: 트리거(Trigger)를 사용하여 데이터 변경 시 중복 데이터를 자동 동기화, 배치 프로그램으로 주기적 동기화, 뷰(View)를 활용하여 원본 데이터를 유지하면서 조회 성능을 향상. 반정규화 후에도 NOT NULL, CHECK, UNIQUE 등의 제약 조건은 계속 사용해야 합니다. 정규화를 완전히 포기하는 것은 무결성 유지 방법이 아닙니다.',
    options: [
      '트리거를 사용하여 중복 데이터를 자동으로 동기화한다.',
      '배치 작업으로 주기적으로 중복 데이터를 동기화한다.',
      '뷰(View)를 활용하여 실제 중복 없이 조회 성능을 향상시킨다.',
      '반정규화 후에는 NOT NULL, UNIQUE 등의 제약 조건을 모두 제거한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p9',
    title: '9. 정규화 역추적과 성능',
    description:
      '3NF로 정규화된 테이블을 반정규화할 때의 트레이드오프에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 72,
    answer: '2',
    explanation:
      '반정규화는 조회(SELECT) 성능을 향상시키는 반면, 데이터 중복으로 인해 입력(INSERT), 수정(UPDATE), 삭제(DELETE) 성능이 저하될 수 있습니다. 또한 데이터 이상현상(Anomaly)이 다시 발생할 가능성이 있습니다. 반정규화는 정규화를 포기하는 것이 아니라, 성능을 위해 의도적으로 중복을 허용하는 것입니다.',
    options: [
      '반정규화를 하면 DML(INSERT/UPDATE/DELETE) 성능과 조회 성능이 모두 향상된다.',
      '반정규화는 조회 성능을 향상시키지만, DML 성능 저하와 데이터 이상현상 위험이 증가한다.',
      '반정규화를 하면 정규화 시 분리된 테이블이 통합되어 데이터 무결성이 강화된다.',
      '반정규화와 정규화는 목적이 동일하므로 상호 배타적이지 않다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p10',
    title: '10. 1NF 위반 사례',
    description:
      '다음 테이블에서 제1정규형(1NF)을 위반하는 항목은?\n\n학생(학번, 이름, 수강과목목록, 연락처)\n\n수강과목목록: \'데이터베이스, 알고리즘, 네트워크\'와 같이 콤마로 구분된 값이 하나의 컬럼에 저장됨',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 80,
    answer: '3',
    explanation:
      '제1정규형(1NF)은 모든 속성이 원자값(Atomic Value)을 가져야 한다는 조건입니다. 수강과목목록 컬럼에 여러 과목이 콤마로 구분되어 저장되는 것은 원자값이 아닌 반복 그룹(Repeating Group)으로, 1NF를 위반합니다. 이를 해결하려면 각 수강과목을 별도의 행으로 분리해야 합니다.',
    options: [
      '학번 컬럼 - 숫자와 문자가 혼용될 수 있다.',
      '이름 컬럼 - 동명이인이 있을 수 있다.',
      '수강과목목록 컬럼 - 여러 값이 하나의 셀에 콤마로 구분되어 저장되어 원자값이 아니다.',
      '연락처 컬럼 - NULL을 허용한다.',
    ],
    points: 10,
  },

  // ===== 2과목: SQL 기본 및 활용 (11~50번) =====

  // --- JOIN (11~16) ---
  {
    id: 'exam6_p11',
    title: '11. CROSS JOIN의 결과 행 수',
    description:
      '다음 SQL의 결과로 반환되는 행(Row)의 수는?\n\nTABLE A: 5행\nTABLE B: 4행\n\nSELECT *\nFROM A CROSS JOIN B;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 78,
    answer: '2',
    explanation:
      'CROSS JOIN(카티시안 곱)은 두 테이블의 모든 행의 조합을 반환합니다. A 테이블의 각 행이 B 테이블의 모든 행과 결합되므로, 결과 행 수는 A의 행 수 × B의 행 수 = 5 × 4 = 20행이 됩니다. CROSS JOIN은 조인 조건이 없으므로 WHERE 절이나 ON 절 없이 모든 조합이 생성됩니다.',
    options: [
      '9행 (5 + 4)',
      '20행 (5 × 4)',
      '5행 (A 테이블 행 수)',
      '1행 (집계 결과)',
    ],
    points: 10,
  },
  {
    id: 'exam6_p12',
    title: '12. OUTER JOIN과 NULL 처리',
    description:
      '다음 SQL의 결과에서 DEPT_NAME이 NULL로 출력되는 행은 어떤 경우인가?\n\nSELECT E.EMP_NAME, D.DEPT_NAME\nFROM EMP E\nLEFT OUTER JOIN DEPT D\n  ON E.DEPT_ID = D.DEPT_ID;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 82,
    answer: '1',
    explanation:
      'LEFT OUTER JOIN은 왼쪽 테이블(EMP)의 모든 행을 유지합니다. EMP의 DEPT_ID에 대응하는 DEPT 테이블의 행이 없는 경우(즉, 부서에 소속되지 않은 사원), DEPT_NAME은 NULL이 됩니다. 반대로 DEPT에만 존재하는 행은 결과에 포함되지 않습니다.',
    options: [
      'EMP에는 존재하지만 DEPT에는 존재하지 않는 DEPT_ID를 가진 사원',
      'DEPT에는 존재하지만 EMP에는 존재하지 않는 DEPT_ID를 가진 부서',
      'EMP와 DEPT 모두에 존재하지 않는 DEPT_ID',
      'EMP의 DEPT_ID가 NULL인 경우에만 DEPT_NAME이 NULL로 출력된다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p13',
    title: '13. INNER JOIN과 WHERE 조인의 차이',
    description:
      '다음 두 SQL의 결과 차이로 올바른 것은?\n\n[SQL A]\nSELECT E.EMP_NAME, D.DEPT_NAME\nFROM EMP E\nINNER JOIN DEPT D ON E.DEPT_ID = D.DEPT_ID\nWHERE E.SALARY > 3000;\n\n[SQL B]\nSELECT E.EMP_NAME, D.DEPT_NAME\nFROM EMP E, DEPT D\nWHERE E.DEPT_ID = D.DEPT_ID\n  AND E.SALARY > 3000;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 72,
    answer: '3',
    explanation:
      'ANSI 표준 INNER JOIN과 전통적인 WHERE 절 조인(Implicit Join)은 INNER JOIN의 경우 동일한 결과를 반환합니다. SQL A와 SQL B는 동일한 결과를 반환합니다. INNER JOIN은 ON 절에 조인 조건을, OUTER JOIN은 LEFT/RIGHT JOIN을 명시적으로 작성하므로 가독성과 명확성이 높아 ANSI 표준 문법이 권장됩니다. 두 SQL은 동일한 실행 계획을 가질 가능성이 높습니다.',
    options: [
      'SQL A는 INNER JOIN이므로 더 많은 행을 반환한다.',
      'SQL B는 OUTER JOIN이므로 NULL 행이 포함된다.',
      '두 SQL은 동일한 결과를 반환한다.',
      'SQL A만 SALARY 조건이 적용된다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p14',
    title: '14. NATURAL JOIN의 특성',
    description:
      '다음 중 NATURAL JOIN에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 55,
    answer: '4',
    explanation:
      'NATURAL JOIN은 두 테이블에서 동일한 이름과 데이터 타입을 가진 모든 컬럼을 자동으로 조인 조건으로 사용합니다. NATURAL JOIN의 결과에서 공통 컬럼은 한 번만 출력됩니다. ON 절이나 USING 절을 함께 사용할 수 없습니다. NATURAL JOIN은 공통 컬럼 이름이 우연히 일치할 경우 의도치 않은 조인이 발생할 수 있어 주의가 필요합니다. 공통 컬럼을 지정하려면 USING 절을 사용합니다.',
    options: [
      'NATURAL JOIN은 ON 절 없이 자동으로 공통 컬럼을 조인 조건으로 사용한다.',
      'NATURAL JOIN 결과에서 공통 컬럼은 한 번만 출력된다.',
      'NATURAL JOIN은 두 테이블에 동일한 이름과 타입의 컬럼이 있어야 한다.',
      'NATURAL JOIN에서 원하는 조인 컬럼을 명시하려면 ON 절을 추가하면 된다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p15',
    title: '15. 다중 테이블 JOIN 순서',
    description:
      '3개 테이블을 조인하는 다음 SQL에서 괄호로 표현한 조인 순서가 성능에 미치는 영향으로 올바른 것은?\n\nSELECT *\nFROM A\nJOIN B ON A.ID = B.A_ID\nJOIN C ON B.ID = C.B_ID\nWHERE A.STATUS = \'ACTIVE\';',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 38,
    answer: '2',
    explanation:
      '옵티마이저는 비용 기반(Cost-Based)으로 최적의 조인 순서를 결정합니다. 일반적으로 WHERE 조건으로 먼저 필터링되는 테이블(드라이빙 테이블)을 첫 번째로 처리하면 중간 결과 집합 크기가 줄어 성능이 향상됩니다. A.STATUS = ACTIVE 조건이 있으므로 A 테이블을 먼저 필터링하고, 그 결과를 B, C 순으로 조인하는 것이 일반적으로 효율적입니다. 그러나 실제 최적 순서는 각 테이블의 통계 정보(행 수, 인덱스 등)에 따라 달라집니다.',
    options: [
      '조인 순서는 항상 SQL 작성 순서(A→B→C)대로 고정되어 성능에 영향이 없다.',
      '일반적으로 WHERE 조건으로 가장 많이 필터링되는 테이블을 먼저 처리하면 중간 결과가 줄어 성능이 향상된다.',
      '조인 순서와 무관하게 최종 결과는 항상 동일하지만 행 수도 동일하다.',
      'C 테이블을 항상 먼저 처리해야 최적의 성능을 낼 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p16',
    title: '16. SELF JOIN 활용',
    description:
      '다음 SQL은 EMP 테이블에서 각 사원의 관리자 이름을 조회한다. 결과에 대한 설명으로 올바른 것은?\n\nSELECT E.EMP_NAME AS 사원명,\n       M.EMP_NAME AS 관리자명\nFROM EMP E\nLEFT OUTER JOIN EMP M\n  ON E.MGR_ID = M.EMP_ID;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 60,
    answer: '3',
    explanation:
      'SELF JOIN은 동일한 테이블을 서로 다른 별칭으로 두 번 참조하여 같은 테이블 내 행들 간의 관계를 표현합니다. LEFT OUTER JOIN을 사용했으므로 관리자가 없는 사원(MGR_ID가 NULL이거나 대응하는 관리자가 없는 경우)도 결과에 포함되며, 이 경우 관리자명은 NULL로 출력됩니다. INNER JOIN을 사용했다면 관리자가 없는 사원(최고 관리자 등)은 결과에서 제외됩니다.',
    options: [
      'SELF JOIN에서 같은 테이블을 두 번 사용하면 오류가 발생한다.',
      'INNER JOIN으로 변경해도 결과는 동일하다.',
      'LEFT OUTER JOIN이므로 관리자가 없는 사원도 결과에 포함되고 관리자명은 NULL이 된다.',
      '관리자명이 NULL인 행은 자동으로 제외된다.',
    ],
    points: 10,
  },

  // --- 함수 (17~22) ---
  {
    id: 'exam6_p17',
    title: '17. NVL과 COALESCE 비교',
    description:
      '다음 두 함수의 차이점으로 올바른 것은?\n\nNVL(expr1, expr2)\nCOALESCE(expr1, expr2, expr3, ...)',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 75,
    answer: '2',
    explanation:
      'NVL(expr1, expr2)은 Oracle 고유 함수로 expr1이 NULL이면 expr2를 반환합니다. 인수가 2개로 고정됩니다. COALESCE(expr1, expr2, expr3, ...)는 ANSI 표준 함수로, 인수 목록에서 첫 번째로 NULL이 아닌 값을 반환합니다. 여러 개의 인수를 받을 수 있어 더 유연합니다. COALESCE는 모든 인수가 NULL이면 NULL을 반환합니다.',
    options: [
      'NVL은 여러 인수를 받을 수 있지만 COALESCE는 2개 인수만 받는다.',
      'COALESCE는 ANSI 표준으로 여러 인수를 받아 첫 번째 NULL이 아닌 값을 반환하지만, NVL은 Oracle 고유 함수로 2개 인수만 받는다.',
      'NVL과 COALESCE는 완전히 동일한 기능을 수행한다.',
      'COALESCE는 NULL이 아닌 값을 NULL로 변환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p18',
    title: '18. CASE WHEN의 활용',
    description:
      '다음 SQL의 결과로 올바른 것은?\n\nSELECT CASE\n         WHEN 100 > 200 THEN \'A\'\n         WHEN 100 = 100 THEN \'B\'\n         WHEN 100 < 200 THEN \'C\'\n         ELSE \'D\'\n       END AS RESULT\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 80,
    answer: '2',
    explanation:
      'CASE WHEN은 위에서부터 순서대로 조건을 평가하여 처음으로 TRUE인 조건의 THEN 결과를 반환합니다. 첫 번째 조건(100 > 200)은 FALSE이므로 건너뜁니다. 두 번째 조건(100 = 100)이 TRUE이므로 \'B\'를 반환하고 CASE 문이 종료됩니다. 세 번째 조건은 평가되지 않습니다.',
    options: [
      'A',
      'B',
      'C',
      'D',
    ],
    points: 10,
  },
  {
    id: 'exam6_p19',
    title: '19. 문자열 함수 조합',
    description:
      '다음 SQL의 결과로 올바른 것은?\n\nSELECT SUBSTR(REPLACE(\'HELLO WORLD\', \'WORLD\', \'SQL\'), 7)\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 58,
    answer: '3',
    explanation:
      "단계별 처리: 1) REPLACE('HELLO WORLD', 'WORLD', 'SQL') → 'HELLO SQL' (WORLD를 SQL로 교체). 2) SUBSTR('HELLO SQL', 7) → 7번째 위치부터 끝까지 추출. 'HELLO SQL'에서 H=1, E=2, L=3, L=4, O=5, 공백=6, S=7이므로 7번째부터는 'SQL'이 됩니다.",
    options: [
      'WORLD',
      'HELLO',
      'SQL',
      'HELLO SQL',
    ],
    points: 10,
  },
  {
    id: 'exam6_p20',
    title: '20. 날짜 함수와 연산',
    description:
      '다음 SQL에서 오늘 날짜가 2024-03-15이고 HIRE_DATE가 2022-01-01인 경우, MONTHS_BETWEEN 함수의 결과로 올바른 것은?\n\nSELECT TRUNC(MONTHS_BETWEEN(SYSDATE, HIRE_DATE)) AS 근속월수\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 55,
    answer: '2',
    explanation:
      'MONTHS_BETWEEN(date1, date2)는 두 날짜 사이의 개월 수를 반환합니다. 2024-03-15부터 2022-01-01까지: 2022-01 → 2024-03은 2년 2개월 + 14일 = 약 26.46개월. TRUNC는 소수점을 버리므로 결과는 26이 됩니다. 정확히는 (2024-2022)×12 + (3-1) = 24 + 2 = 26개월에 일수 차이가 추가됩니다.',
    options: [
      '25',
      '26',
      '27',
      '28',
    ],
    points: 10,
  },
  {
    id: 'exam6_p21',
    title: '21. 집계 함수와 NULL',
    description:
      '다음 테이블에서 SQL 실행 결과로 올바른 것은?\n\n점수 테이블 SCORES:\n┌─────────┐\n│  SCORE  │\n├─────────┤\n│   90    │\n│   80    │\n│  NULL   │\n│   70    │\n│  NULL   │\n└─────────┘\n\nSELECT COUNT(*), COUNT(SCORE), AVG(SCORE), SUM(SCORE)\nFROM SCORES;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 62,
    answer: '1',
    explanation:
      'COUNT(*)는 NULL을 포함한 모든 행 수를 반환하므로 5. COUNT(SCORE)는 NULL을 제외한 행 수를 반환하므로 3. AVG(SCORE)는 NULL을 제외한 값들의 평균으로 (90+80+70)/3 = 80. SUM(SCORE)는 NULL을 제외한 합계로 90+80+70 = 240. 집계 함수는 기본적으로 NULL을 제외하고 계산합니다.',
    options: [
      'COUNT(*)=5, COUNT(SCORE)=3, AVG(SCORE)=80, SUM(SCORE)=240',
      'COUNT(*)=5, COUNT(SCORE)=5, AVG(SCORE)=48, SUM(SCORE)=240',
      'COUNT(*)=3, COUNT(SCORE)=3, AVG(SCORE)=80, SUM(SCORE)=240',
      'COUNT(*)=5, COUNT(SCORE)=3, AVG(SCORE)=NULL, SUM(SCORE)=NULL',
    ],
    points: 10,
  },
  {
    id: 'exam6_p22',
    title: '22. TO_CHAR와 TO_DATE 변환',
    description:
      "다음 SQL의 결과로 올바른 것은?\n\nSELECT TO_CHAR(TO_DATE('20240315', 'YYYYMMDD'), 'YYYY-MM-DD')\nFROM DUAL;",
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 76,
    answer: '4',
    explanation:
      "TO_DATE('20240315', 'YYYYMMDD')는 문자열 '20240315'를 날짜 타입으로 변환합니다. TO_CHAR(날짜, 'YYYY-MM-DD')는 날짜를 'YYYY-MM-DD' 형식의 문자열로 변환합니다. 따라서 최종 결과는 '2024-03-15'입니다.",
    options: [
      "'20240315'",
      "'2024/03/15'",
      "'20240315'",
      "'2024-03-15'",
    ],
    points: 10,
  },

  // --- DML (23~27) ---
  {
    id: 'exam6_p23',
    title: '23. MERGE 문의 MATCHED 절',
    description:
      '다음 MERGE 문에서 MERGE INTO TARGET T 실행 후 TARGET 테이블의 결과로 올바른 것은?\n\nTARGET 테이블 초기 데이터:\nID=1, VAL=\'OLD\'\nID=2, VAL=\'OLD\'\n\nSOURCE 테이블 데이터:\nID=1, VAL=\'NEW\'\nID=3, VAL=\'INSERT\'\n\nMERGE INTO TARGET T\nUSING SOURCE S\n  ON (T.ID = S.ID)\nWHEN MATCHED THEN\n  UPDATE SET T.VAL = S.VAL\nWHEN NOT MATCHED THEN\n  INSERT (ID, VAL) VALUES (S.ID, S.VAL);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 42,
    answer: '3',
    explanation:
      'MERGE 문 처리: 1) ID=1: SOURCE에도 존재(MATCHED) → UPDATE: VAL을 OLD에서 NEW로 변경. 2) ID=2: SOURCE에 없음(TARGET에만 존재) → MERGE에서 NOT MATCHED는 SOURCE 기준이므로 TARGET에만 있는 행은 처리 대상이 아님. ID=2는 그대로 유지. 3) ID=3: SOURCE에만 존재(NOT MATCHED) → INSERT: (3, INSERT) 추가. 최종 TARGET: ID=1/VAL=NEW, ID=2/VAL=OLD, ID=3/VAL=INSERT',
    options: [
      'ID=1/VAL=NEW만 존재 (ID=2, ID=3 삭제)',
      'ID=1/VAL=NEW, ID=2/VAL=NEW, ID=3/VAL=INSERT',
      'ID=1/VAL=NEW, ID=2/VAL=OLD, ID=3/VAL=INSERT',
      'ID=1/VAL=OLD, ID=2/VAL=OLD, ID=3/VAL=INSERT',
    ],
    points: 10,
  },
  {
    id: 'exam6_p24',
    title: '24. MERGE WHEN MATCHED DELETE',
    description:
      '다음 MERGE 문에서 DELETE 절의 동작으로 올바른 것은?\n\nMERGE INTO TARGET T\nUSING SOURCE S\n  ON (T.ID = S.ID)\nWHEN MATCHED THEN\n  UPDATE SET T.VAL = S.VAL\n  DELETE WHERE T.VAL = \'DELETE_ME\';',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 30,
    answer: '2',
    explanation:
      'MERGE의 WHEN MATCHED DELETE 절은 UPDATE 후의 값을 기준으로 삭제 여부를 결정합니다. 즉, UPDATE SET T.VAL = S.VAL이 실행된 후, 업데이트된 T.VAL 값이 DELETE_ME인 행을 삭제합니다. SOURCE의 VAL이 DELETE_ME인 경우 MATCH된 TARGET 행은 먼저 업데이트되고 그 다음 삭제됩니다. DELETE는 WHEN MATCHED 절의 UPDATE와 함께만 사용할 수 있으며, UPDATE 없이 단독으로 사용할 수 없습니다.',
    options: [
      'DELETE 절은 TARGET에서 조건을 만족하는 모든 행을 삭제한다.',
      'DELETE는 UPDATE 후의 값을 기준으로 조건을 평가하여 해당 행을 삭제한다.',
      'DELETE 절은 SOURCE에서 조건을 만족하는 행을 삭제한다.',
      'DELETE는 UPDATE와 독립적으로 실행되어 UPDATE 전 값을 기준으로 삭제한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p25',
    title: '25. INSERT ALL과 조건부 INSERT',
    description:
      '다음 SQL의 동작으로 올바른 것은?\n\nINSERT ALL\n  WHEN SAL > 5000 THEN INTO HIGH_SAL_EMP\n  WHEN SAL > 3000 THEN INTO MID_SAL_EMP\n  WHEN SAL <= 3000 THEN INTO LOW_SAL_EMP\nSELECT EMP_NAME, SAL FROM EMP;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 45,
    answer: '1',
    explanation:
      'INSERT ALL에서 WHEN 절(조건부 다중 INSERT)은 각 조건을 독립적으로 평가합니다. SAL이 6000인 사원은 SAL > 5000(TRUE)이어서 HIGH_SAL_EMP에 입력되고, SAL > 3000(TRUE)이어서 MID_SAL_EMP에도 입력됩니다. 즉, 여러 WHEN 조건을 모두 평가하여 조건을 만족하는 모든 테이블에 INSERT합니다. 조건이 상호 배타적이지 않으면 한 행이 여러 테이블에 입력될 수 있습니다. INSERT FIRST를 사용하면 첫 번째로 만족하는 조건에만 INSERT합니다.',
    options: [
      'SAL이 6000인 사원은 HIGH_SAL_EMP와 MID_SAL_EMP 모두에 INSERT된다.',
      'SAL이 6000인 사원은 HIGH_SAL_EMP에만 INSERT된다 (가장 먼저 만족하는 조건).',
      'SAL이 6000인 사원은 모든 테이블에 INSERT된다.',
      'INSERT ALL은 조건을 평가하지 않고 무조건 모든 테이블에 INSERT한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p26',
    title: '26. UPDATE 서브쿼리와 스칼라',
    description:
      '다음 UPDATE 문이 실행되면 어떤 결과가 나타나는가?\n\nUPDATE DEPT D\nSET TOTAL_SAL = (\n  SELECT SUM(SAL)\n  FROM EMP\n  WHERE DEPT_ID = D.DEPT_ID\n)\nWHERE EXISTS (\n  SELECT 1 FROM EMP\n  WHERE DEPT_ID = D.DEPT_ID\n);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 38,
    answer: '2',
    explanation:
      'SET 절의 스칼라 서브쿼리는 각 DEPT 행에 대해 해당 부서 사원들의 급여 합계를 계산합니다. WHERE EXISTS 서브쿼리는 사원이 한 명 이상 있는 부서만 UPDATE 대상으로 제한합니다. 사원이 없는 부서는 TOTAL_SAL이 업데이트되지 않습니다. 이 패턴은 관련 데이터가 있는 행만 집계값으로 업데이트할 때 유용합니다.',
    options: [
      '모든 부서의 TOTAL_SAL이 NULL로 업데이트된다.',
      '사원이 있는 부서만 해당 부서의 급여 합계로 TOTAL_SAL이 업데이트된다.',
      '사원이 없는 부서도 TOTAL_SAL이 0으로 업데이트된다.',
      'EXISTS 서브쿼리가 있으면 SET 절 서브쿼리는 실행되지 않는다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p27',
    title: '27. 다중 행 INSERT 성능',
    description:
      '동일한 데이터를 대량으로 INSERT할 때 성능 관점에서 올바른 설명은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 60,
    answer: '4',
    explanation:
      '대량 INSERT 성능 최적화: 1) INSERT INTO ... SELECT는 단일 SQL로 대량 데이터를 처리하므로 반복 INSERT보다 빠릅니다. 2) COMMIT 빈도를 줄이면 트랜잭션 관리 오버헤드가 감소합니다. 3) 인덱스가 많으면 각 INSERT마다 인덱스를 갱신해야 하므로 INSERT 성능이 저하됩니다. 4) Direct Path Insert(/*+ APPEND */ 힌트)를 사용하면 Undo 로그를 최소화하여 성능이 향상됩니다. 5) 테이블 파티셔닝을 활용하면 병렬 INSERT가 가능합니다.',
    options: [
      '인덱스가 많을수록 INSERT 성능이 향상된다.',
      '각 행마다 COMMIT을 수행하면 데이터 안전성과 성능이 모두 향상된다.',
      '여러 개의 단건 INSERT가 하나의 INSERT ... SELECT보다 항상 빠르다.',
      'INSERT ... SELECT는 대량 데이터를 단일 SQL로 처리하므로 반복 INSERT보다 일반적으로 성능이 우수하다.',
    ],
    points: 10,
  },

  // --- 서브쿼리 (28~32) ---
  {
    id: 'exam6_p28',
    title: '28. 인라인 뷰와 파생 테이블',
    description:
      '다음 SQL에서 인라인 뷰(Inline View)에 대한 설명으로 올바른 것은?\n\nSELECT D.DEPT_NAME, S.AVG_SAL\nFROM DEPT D\nJOIN (\n  SELECT DEPT_ID, AVG(SAL) AS AVG_SAL\n  FROM EMP\n  GROUP BY DEPT_ID\n) S ON D.DEPT_ID = S.DEPT_ID\nWHERE S.AVG_SAL > 4000;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 62,
    answer: '1',
    explanation:
      '인라인 뷰(Inline View)는 FROM 절에 위치하는 서브쿼리로, 파생 테이블(Derived Table)이라고도 합니다. 인라인 뷰는 쿼리 내에서만 존재하는 가상의 테이블로, 실제 뷰(CREATE VIEW)와 달리 데이터베이스에 저장되지 않습니다. 쿼리의 가독성을 높이고 복잡한 집계 결과를 임시 테이블처럼 활용할 수 있습니다. WHERE 절에서 인라인 뷰의 집계 결과(AVG_SAL)를 직접 참조할 수 있습니다.',
    options: [
      '인라인 뷰는 FROM 절에 위치하는 서브쿼리로, 쿼리 내에서만 존재하는 가상 테이블이다.',
      '인라인 뷰는 실제 뷰(CREATE VIEW)와 동일하게 데이터베이스에 저장된다.',
      '인라인 뷰는 WHERE 절에만 사용할 수 있다.',
      '인라인 뷰 내부에서는 GROUP BY를 사용할 수 없다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p29',
    title: '29. 상관 서브쿼리의 동작',
    description:
      '다음 상관 서브쿼리(Correlated Subquery)의 실행 방식으로 올바른 것은?\n\nSELECT EMP_NAME, SAL, DEPT_ID\nFROM EMP E1\nWHERE SAL > (\n  SELECT AVG(SAL)\n  FROM EMP E2\n  WHERE E2.DEPT_ID = E1.DEPT_ID\n);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 40,
    answer: '2',
    explanation:
      '상관 서브쿼리는 외부 쿼리의 컬럼(E1.DEPT_ID)을 참조하므로, 외부 쿼리의 각 행마다 서브쿼리가 독립적으로 실행됩니다. 이 쿼리는 각 사원이 속한 부서의 평균 급여를 계산하고, 해당 부서 평균보다 급여가 높은 사원을 조회합니다. 외부 쿼리가 N행을 반환하면 서브쿼리는 최대 N번 실행될 수 있어 대용량에서는 성능 주의가 필요합니다.',
    options: [
      '서브쿼리는 처음 한 번만 실행되고 결과가 캐시되어 모든 행에 동일하게 적용된다.',
      '외부 쿼리의 각 행마다 해당 행의 DEPT_ID를 사용하여 서브쿼리가 독립적으로 실행된다.',
      '상관 서브쿼리는 항상 IN 또는 EXISTS와 함께만 사용된다.',
      '서브쿼리 내 E2.DEPT_ID = E1.DEPT_ID 조건은 조인이 아니라 HAVING 절의 역할을 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p30',
    title: '30. 스칼라 서브쿼리의 제약',
    description:
      '다음 중 스칼라 서브쿼리(Scalar Subquery)의 제약 조건으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 55,
    answer: '3',
    explanation:
      '스칼라 서브쿼리는 단 하나의 행과 하나의 컬럼(스칼라 값)만 반환해야 합니다. 여러 행을 반환하면 오류(ORA-01427: 단일 행 하위 질의에 둘 이상의 행이 리턴되었습니다)가 발생합니다. 스칼라 서브쿼리는 SELECT 절, WHERE 절, HAVING 절, ORDER BY 절 등 단일 값이 필요한 곳에 사용할 수 있습니다. 여러 행이 반환될 수 있는 경우 IN, EXISTS, ANY, ALL 연산자를 사용해야 합니다.',
    options: [
      '스칼라 서브쿼리는 오직 WHERE 절에서만 사용할 수 있다.',
      '스칼라 서브쿼리는 여러 컬럼을 반환할 수 있지만, 행은 하나만 반환해야 한다.',
      '스칼라 서브쿼리는 반드시 하나의 행과 하나의 컬럼만 반환해야 하며, 여러 행 반환 시 오류가 발생한다.',
      '스칼라 서브쿼리가 NULL을 반환하면 오류가 발생한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p31',
    title: '31. EXISTS와 IN의 차이',
    description:
      '다음 두 SQL의 성능 차이에 대한 설명으로 올바른 것은?\n\n[SQL A - EXISTS 사용]\nSELECT C.CUST_NAME\nFROM CUSTOMER C\nWHERE EXISTS (\n  SELECT 1 FROM ORDERS O\n  WHERE O.CUST_ID = C.CUST_ID\n);\n\n[SQL B - IN 사용]\nSELECT C.CUST_NAME\nFROM CUSTOMER C\nWHERE C.CUST_ID IN (\n  SELECT CUST_ID FROM ORDERS\n);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 38,
    answer: '4',
    explanation:
      'EXISTS vs IN 성능 비교: EXISTS는 서브쿼리에서 조건을 만족하는 첫 번째 행이 발견되는 순간 실행을 멈춥니다(Short-circuit). IN은 서브쿼리의 전체 결과 집합을 먼저 구성합니다. ORDERS 테이블이 크고 CUSTOMER가 작을 때: EXISTS가 유리(서브쿼리를 일찍 종료). CUSTOMER가 크고 ORDERS가 작을 때: IN이 유리(작은 결과 집합으로 비교). 서브쿼리 결과에 NULL이 있으면 IN은 의도치 않은 결과를 줄 수 있지만 EXISTS는 영향 없음. 실제 성능은 옵티마이저와 데이터 특성에 따라 달라집니다.',
    options: [
      'EXISTS는 항상 IN보다 느리다.',
      'IN은 서브쿼리를 한 번만 실행하므로 항상 EXISTS보다 빠르다.',
      '두 SQL은 항상 동일한 성능을 보인다.',
      'EXISTS는 첫 번째 매칭 행 발견 시 서브쿼리를 종료하는 Short-circuit 평가를 하며, IN은 전체 서브쿼리 결과를 구성한다. 어느 쪽이 빠른지는 데이터 분포에 따라 다르다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p32',
    title: '32. WITH 절(CTE) 기본',
    description:
      '다음 SQL에서 WITH 절(CTE, Common Table Expression)에 대한 설명으로 올바른 것은?\n\nWITH DEPT_SAL AS (\n  SELECT DEPT_ID, SUM(SAL) AS TOTAL_SAL\n  FROM EMP\n  GROUP BY DEPT_ID\n)\nSELECT D.DEPT_NAME, DS.TOTAL_SAL\nFROM DEPT D\nJOIN DEPT_SAL DS ON D.DEPT_ID = DS.DEPT_ID\nORDER BY DS.TOTAL_SAL DESC;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 60,
    answer: '2',
    explanation:
      'WITH 절(CTE)은 쿼리 내에서 재사용 가능한 임시 결과 집합을 정의합니다. 인라인 뷰와 달리 WITH 절은 쿼리 맨 앞에 정의되어 이후 쿼리에서 테이블처럼 참조할 수 있습니다. 한 번 정의한 CTE는 같은 쿼리 내에서 여러 번 참조 가능합니다. WITH 절은 데이터베이스에 저장되지 않으며 해당 쿼리 실행 동안만 존재합니다. 재귀 CTE(RECURSIVE)를 사용하면 계층적 데이터 처리가 가능합니다.',
    options: [
      'WITH 절은 CREATE VIEW와 동일하게 데이터베이스에 저장된다.',
      'WITH 절(CTE)은 쿼리 내에서 임시로 정의되어 이후 쿼리에서 테이블처럼 참조할 수 있으며, 한 번 정의하면 같은 쿼리에서 여러 번 참조 가능하다.',
      'WITH 절 내부에서는 GROUP BY를 사용할 수 없다.',
      'WITH 절은 FROM 절에서만 참조할 수 있다.',
    ],
    points: 10,
  },

  // --- 윈도우함수 (33~36) ---
  {
    id: 'exam6_p33',
    title: '33. 복수 윈도우 함수 조합',
    description:
      '다음 SQL의 결과에서 각 컬럼의 값으로 올바른 것은?\n\nEMP 테이블 (부서별 급여):\nDEPT=A, SAL=3000\nDEPT=A, SAL=4000\nDEPT=B, SAL=5000\n\nSELECT DEPT, SAL,\n       SUM(SAL) OVER (PARTITION BY DEPT) AS DEPT_SUM,\n       AVG(SAL) OVER () AS TOTAL_AVG,\n       RANK() OVER (ORDER BY SAL DESC) AS RNK\nFROM EMP;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 35,
    answer: '2',
    explanation:
      'SUM OVER(PARTITION BY DEPT): A부서 합계=7000, B부서 합계=5000. AVG OVER(): 전체 평균=(3000+4000+5000)/3=4000. RANK OVER(ORDER BY SAL DESC): SAL=5000 → 1위, SAL=4000 → 2위, SAL=3000 → 3위. 하나의 SELECT에서 여러 OVER 절을 가진 윈도우 함수를 동시에 사용할 수 있으며, 각각 독립적인 파티션/정렬 기준을 가질 수 있습니다.',
    options: [
      'DEPT=A/SAL=3000: DEPT_SUM=3000, TOTAL_AVG=4000, RNK=3',
      'DEPT=A/SAL=3000: DEPT_SUM=7000, TOTAL_AVG=4000, RNK=3',
      'DEPT=A/SAL=3000: DEPT_SUM=7000, TOTAL_AVG=3000, RNK=1',
      'DEPT=A/SAL=3000: DEPT_SUM=7000, TOTAL_AVG=4000, RNK=1',
    ],
    points: 10,
  },
  {
    id: 'exam6_p34',
    title: '34. ROWS BETWEEN 프레임 설정',
    description:
      '다음 SQL에서 ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING의 의미로 올바른 것은?\n\nSELECT ORDER_DATE, SALES,\n       AVG(SALES) OVER (\n         ORDER BY ORDER_DATE\n         ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING\n       ) AS MOVING_AVG\nFROM DAILY_SALES;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 32,
    answer: '1',
    explanation:
      '윈도우 프레임 ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING은 현재 행을 기준으로 이전 1행, 현재 행, 이후 1행을 포함한 3행의 이동 평균을 계산합니다. ORDER_DATE가 3번째 행이라면 2번째, 3번째, 4번째 행의 SALES 평균을 계산합니다. 첫 번째 행은 이전 행이 없으므로 현재+다음 행 2개, 마지막 행은 이후 행이 없으므로 이전+현재 행 2개의 평균이 됩니다.',
    options: [
      '현재 행의 이전 1행, 현재 행, 이후 1행 총 최대 3행을 포함하는 이동 평균을 계산한다.',
      '현재 행부터 이후 2행까지 총 3행을 포함하는 누적 평균을 계산한다.',
      '전체 파티션의 모든 행을 포함하는 전체 평균을 계산한다.',
      '이전 1행과 이후 1행만 포함하고 현재 행은 제외한 평균을 계산한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p35',
    title: '35. LAG와 LEAD 함수',
    description:
      '다음 SQL에서 LAG 함수를 사용하여 전월 대비 매출 증감을 구하는 쿼리로 올바른 것은?\n\n월별 매출 데이터에서 당월 매출에서 전월 매출을 뺀 값을 DIFF 컬럼으로 출력하라.',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 58,
    answer: '4',
    explanation:
      'LAG(컬럼, N)은 현재 행에서 N번째 이전 행의 값을 가져옵니다. LAG(SALES, 1)은 이전 행(전월)의 매출을 반환합니다. SALES - LAG(SALES, 1) OVER (ORDER BY MONTH)가 당월 매출에서 전월 매출을 뺀 증감입니다. 첫 번째 행은 이전 행이 없으므로 LAG 결과가 NULL이 되어 DIFF도 NULL이 됩니다. LEAD는 이후 행의 값을 가져오는 함수입니다.',
    options: [
      'SELECT MONTH, SALES, LEAD(SALES, 1) OVER (ORDER BY MONTH) - SALES AS DIFF FROM MONTHLY_SALES',
      'SELECT MONTH, SALES, SALES - NEXT(SALES) OVER (ORDER BY MONTH) AS DIFF FROM MONTHLY_SALES',
      'SELECT MONTH, SALES, PREV(SALES) OVER (ORDER BY MONTH) - SALES AS DIFF FROM MONTHLY_SALES',
      'SELECT MONTH, SALES, SALES - LAG(SALES, 1) OVER (ORDER BY MONTH) AS DIFF FROM MONTHLY_SALES',
    ],
    points: 10,
  },
  {
    id: 'exam6_p36',
    title: '36. NTILE 함수의 활용',
    description:
      '다음 SQL에서 NTILE(4) 함수의 결과로 올바른 것은?\n\n급여 데이터 (오름차순): 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000\n\nSELECT SAL, NTILE(4) OVER (ORDER BY SAL) AS QUARTILE\nFROM EMP ORDER BY SAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 50,
    answer: '3',
    explanation:
      'NTILE(N)은 행을 N개의 동일한 크기의 그룹으로 나누어 그룹 번호(1~N)를 반환합니다. 9개 행을 4그룹으로 나누면: 9÷4=2나머지1. 나머지가 있으면 앞 그룹부터 1씩 추가 배분합니다. 1그룹: 3행(1000, 2000, 3000), 2그룹: 2행(4000, 5000), 3그룹: 2행(6000, 7000), 4그룹: 2행(8000, 9000). SAL=5000은 2그룹(QUARTILE=2)에 속합니다.',
    options: [
      'SAL=5000은 QUARTILE=1 (하위 25% 그룹)',
      'SAL=5000은 QUARTILE=3 (상위 50% 그룹)',
      'SAL=5000은 QUARTILE=2 (2번째 그룹)',
      'SAL=5000은 QUARTILE=4 (최상위 그룹)',
    ],
    points: 10,
  },

  // --- 집합연산 (37~40) ---
  {
    id: 'exam6_p37',
    title: '37. UNION과 NULL 처리',
    description:
      '다음 SQL의 결과로 올바른 것은?\n\nSELECT 1 AS NUM, NULL AS NAME FROM DUAL\nUNION\nSELECT 1, NULL FROM DUAL\nUNION\nSELECT 2, \'김철수\' FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 52,
    answer: '2',
    explanation:
      'UNION은 중복 행을 제거하고 합집합을 반환합니다. NULL 비교에서 UNION은 NULL = NULL로 처리(중복으로 간주)합니다. (1, NULL)이 두 번 나타나지만 UNION에서 동일한 행으로 처리되어 하나만 남습니다. 따라서 결과는 (1, NULL)과 (2, 김철수)로 2행입니다.',
    options: [
      '3행: (1, NULL), (1, NULL), (2, 김철수)',
      '2행: (1, NULL), (2, 김철수)',
      '1행: (2, 김철수) - NULL 포함 행은 제거됨',
      '오류 발생 - NULL을 포함한 UNION은 허용되지 않음',
    ],
    points: 10,
  },
  {
    id: 'exam6_p38',
    title: '38. INTERSECT와 MINUS 연산',
    description:
      '다음 SQL에 대한 설명으로 올바른 것은?\n\n[집합 A]: SELECT EMP_ID FROM EMP WHERE DEPT = \'영업\'\n[집합 B]: SELECT EMP_ID FROM EMP WHERE BONUS > 500\n\nA INTERSECT B 와 A MINUS B의 의미를 올바르게 설명한 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 74,
    answer: '1',
    explanation:
      'INTERSECT는 두 집합의 교집합으로, 두 결과 집합에 모두 존재하는 행을 반환합니다. A INTERSECT B는 영업 부서이면서 보너스가 500 초과인 사원입니다. MINUS(Oracle) 또는 EXCEPT(표준 SQL)는 차집합으로, 첫 번째 집합에서 두 번째 집합에 있는 행을 제외합니다. A MINUS B는 영업 부서이지만 보너스가 500 이하인 사원입니다.',
    options: [
      'A INTERSECT B: 영업 부서이면서 보너스 500 초과인 사원, A MINUS B: 영업 부서이지만 보너스 500 이하인 사원',
      'A INTERSECT B: 영업 또는 보너스 500 초과인 사원, A MINUS B: 영업 부서인 사원',
      'A INTERSECT B: 영업 부서이지만 보너스 500 이하인 사원, A MINUS B: 영업 부서이면서 보너스 500 초과인 사원',
      'INTERSECT와 MINUS는 동일한 결과를 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p39',
    title: '39. UNION ALL과 ORDER BY',
    description:
      '다음 SQL에서 ORDER BY 절의 위치와 동작으로 올바른 것은?\n\nSELECT EMP_NAME, SAL FROM EMP WHERE DEPT = \'영업\'\nUNION ALL\nSELECT EMP_NAME, SAL FROM EMP WHERE DEPT = \'개발\'\nORDER BY SAL DESC;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 73,
    answer: '3',
    explanation:
      'SET 연산자(UNION, UNION ALL, INTERSECT, MINUS)를 사용할 때 ORDER BY는 전체 쿼리의 맨 끝에 한 번만 작성합니다. 각 개별 SELECT에 ORDER BY를 작성하면 오류가 발생합니다. ORDER BY SAL DESC는 UNION ALL의 전체 결과(영업+개발 부서 사원)를 급여 내림차순으로 정렬합니다. UNION ALL은 중복을 제거하지 않으므로 동일한 이름과 급여의 사원이 두 부서에 있으면 모두 포함됩니다.',
    options: [
      'ORDER BY는 첫 번째 SELECT 문 다음에 작성해야 한다.',
      'UNION ALL이면 ORDER BY를 사용할 수 없다.',
      'ORDER BY는 SET 연산자 전체의 맨 끝에 작성하며, 영업+개발 전체 결과를 정렬한다.',
      'ORDER BY는 각 SELECT에 개별 적용되어야 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p40',
    title: '40. SET 연산자의 컬럼 수와 타입',
    description:
      '다음 중 SET 연산자(UNION, UNION ALL, INTERSECT, MINUS) 사용 시 제약 조건으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 78,
    answer: '2',
    explanation:
      'SET 연산자를 사용하려면 각 SELECT 문의 컬럼 수가 동일해야 합니다. 각 컬럼의 데이터 타입은 호환 가능해야 합니다(예: NUMBER와 VARCHAR2는 일부 상황에서 자동 변환되지만 완전히 호환되지 않을 수 있음). 결과 컬럼명은 첫 번째 SELECT의 컬럼명을 따릅니다. ORDER BY에서 컬럼명은 첫 번째 SELECT의 컬럼명을 사용하거나 컬럼 순서(위치 번호)를 사용할 수 있습니다.',
    options: [
      '각 SELECT의 컬럼 수는 달라도 되지만 데이터 타입은 동일해야 한다.',
      '각 SELECT의 컬럼 수가 동일해야 하고, 대응하는 컬럼의 데이터 타입이 호환 가능해야 한다.',
      '결과 컬럼명은 마지막 SELECT의 컬럼명을 따른다.',
      'ORDER BY에서 컬럼명은 반드시 마지막 SELECT의 컬럼명을 사용해야 한다.',
    ],
    points: 10,
  },

  // --- DDL (41~43) ---
  {
    id: 'exam6_p41',
    title: '41. ALTER TABLE과 제약 조건 추가',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\nCREATE TABLE PRODUCT (\n  PROD_ID NUMBER,\n  PROD_NAME VARCHAR2(100),\n  PRICE NUMBER\n);\n\nALTER TABLE PRODUCT\n  ADD CONSTRAINT PK_PRODUCT PRIMARY KEY (PROD_ID);\n\nALTER TABLE PRODUCT\n  MODIFY PRICE NUMBER DEFAULT 0 NOT NULL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 55,
    answer: '1',
    explanation:
      'ALTER TABLE ADD CONSTRAINT는 기존 테이블에 PK 제약 조건을 추가합니다. 이때 테이블에 이미 데이터가 있다면 PROD_ID에 NULL이나 중복값이 없어야 합니다. ALTER TABLE MODIFY는 컬럼의 데이터 타입이나 제약 조건을 변경합니다. PRICE에 DEFAULT 0과 NOT NULL을 추가합니다. 단, 기존에 PRICE가 NULL인 데이터가 있으면 NOT NULL 제약 추가가 실패할 수 있습니다.',
    options: [
      'PRODUCT 테이블에 PROD_ID를 PK로, PRICE를 DEFAULT 0 NOT NULL로 설정한다. 기존 NULL 데이터가 있으면 NOT NULL 추가 실패.',
      'ALTER TABLE로는 기존 컬럼의 NOT NULL 제약을 추가할 수 없다.',
      'ADD CONSTRAINT로 PK를 추가하면 기존 데이터가 모두 삭제된다.',
      'MODIFY 구문에서 DEFAULT와 NOT NULL은 동시에 설정할 수 없다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p42',
    title: '42. DROP과 TRUNCATE, DELETE 비교',
    description:
      '다음 중 DROP TABLE, TRUNCATE TABLE, DELETE FROM TABLE의 차이점을 올바르게 설명한 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 76,
    answer: '4',
    explanation:
      'DROP TABLE: DDL, 테이블 구조와 데이터 모두 삭제, 롤백 불가, 관련 인덱스/제약/뷰도 함께 삭제. TRUNCATE TABLE: DDL, 테이블 구조는 유지하고 데이터만 전체 삭제, 롤백 불가, High-water mark 리셋. DELETE FROM TABLE: DML, WHERE 없으면 전체 삭제, 롤백 가능, 삭제한 행 수만큼 로그 생성. 공통점: 세 명령 모두 데이터를 삭제합니다.',
    options: [
      'DROP은 롤백이 가능하지만 TRUNCATE는 불가능하다.',
      'TRUNCATE는 WHERE 절로 특정 행만 삭제할 수 있다.',
      'DELETE는 DDL이므로 자동 커밋된다.',
      'DELETE는 DML로 롤백 가능하고, TRUNCATE와 DROP은 DDL로 롤백이 불가능하다. DROP은 구조까지 삭제한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p43',
    title: '43. 뷰(View)의 특성과 제약',
    description:
      '다음 중 뷰(View)에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 58,
    answer: '3',
    explanation:
      '뷰(View)는 하나 이상의 테이블을 기반으로 정의된 가상 테이블입니다. 뷰 자체는 데이터를 저장하지 않고, 뷰를 조회할 때마다 정의된 SELECT가 실행됩니다. 뷰를 통한 DML(INSERT/UPDATE/DELETE)은 제약이 있습니다: GROUP BY, DISTINCT, 집계 함수, JOIN이 포함된 뷰, 또는 WITH READ ONLY 옵션이 있는 뷰는 DML이 불가능합니다. 단순 단일 테이블 뷰는 DML이 가능합니다. 뷰는 보안성(특정 컬럼만 노출), 독립성, 복잡한 쿼리의 단순화 등의 장점이 있습니다.',
    options: [
      '뷰는 자체적으로 데이터를 저장하지 않고, 기반 테이블의 데이터를 참조한다.',
      '뷰를 통해 특정 컬럼만 노출시켜 데이터 보안을 강화할 수 있다.',
      '모든 뷰를 통해 INSERT, UPDATE, DELETE가 항상 가능하다.',
      'WITH READ ONLY 옵션을 사용하면 뷰를 통한 DML이 불가능하다.',
    ],
    points: 10,
  },

  // --- TCL (44~46) ---
  {
    id: 'exam6_p44',
    title: '44. SAVEPOINT와 부분 롤백',
    description:
      '다음 트랜잭션 처리 결과로 테이블에 남아 있는 데이터는?\n\nINSERT INTO T VALUES (1);\nSAVEPOINT SP1;\nINSERT INTO T VALUES (2);\nSAVEPOINT SP2;\nINSERT INTO T VALUES (3);\nROLLBACK TO SP1;\nINSERT INTO T VALUES (4);\nCOMMIT;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 40,
    answer: '3',
    explanation:
      '처리 순서: (1) INSERT 1 → (2) SP1 저장 → (3) INSERT 2 → (4) SP2 저장 → (5) INSERT 3 → (6) ROLLBACK TO SP1: SP1 이후 변경사항(INSERT 2, INSERT 3) 취소, SP1 상태(INSERT 1만 있는 상태)로 복귀 → (7) INSERT 4 → (8) COMMIT. 최종 커밋된 데이터: 1과 4. ROLLBACK TO SP1은 SP1 이후의 변경만 취소하고 SP1까지의 변경(INSERT 1)은 유지합니다.',
    options: [
      '1, 2, 3, 4 (모두 COMMIT되어 저장)',
      '1, 4 (ROLLBACK이 없어서)',
      '1, 4 (ROLLBACK TO SP1으로 2와 3이 취소된 후 4가 추가되어 COMMIT)',
      '4만 남음 (ROLLBACK TO SP1으로 1도 취소됨)',
    ],
    points: 10,
  },
  {
    id: 'exam6_p45',
    title: '45. 트랜잭션의 격리 수준',
    description:
      '트랜잭션 격리 수준(Isolation Level) 중 REPEATABLE READ에서 방지하는 현상과 허용되는 현상으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 33,
    answer: '2',
    explanation:
      '격리 수준별 현상: READ UNCOMMITTED - Dirty Read 허용, Non-Repeatable Read 허용, Phantom Read 허용. READ COMMITTED - Dirty Read 방지, Non-Repeatable Read 허용, Phantom Read 허용. REPEATABLE READ - Dirty Read 방지, Non-Repeatable Read 방지, Phantom Read 허용. SERIALIZABLE - 세 가지 모두 방지. REPEATABLE READ는 같은 트랜잭션 내 동일 쿼리 반복 시 항상 같은 결과(Non-Repeatable Read 방지)를 보장하지만, 새로운 행이 추가되어 결과 집합이 달라지는 Phantom Read는 허용합니다.',
    options: [
      'Dirty Read 허용, Non-Repeatable Read 방지, Phantom Read 방지',
      'Dirty Read 방지, Non-Repeatable Read 방지, Phantom Read 허용',
      'Dirty Read 방지, Non-Repeatable Read 허용, Phantom Read 방지',
      'Dirty Read 허용, Non-Repeatable Read 허용, Phantom Read 방지',
    ],
    points: 10,
  },
  {
    id: 'exam6_p46',
    title: '46. COMMIT과 DDL의 암묵적 커밋',
    description:
      '다음 SQL 실행 순서에서 최종적으로 테이블 T에 존재하는 데이터는?\n\nINSERT INTO T VALUES (1);\nINSERT INTO T VALUES (2);\nCREATE TABLE T2 (ID NUMBER);\nROLLBACK;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'TCL',
    correctRate: 48,
    answer: '4',
    explanation:
      'Oracle에서 DDL(CREATE TABLE, DROP TABLE 등)을 실행하면 이전의 미완료 트랜잭션이 자동으로 COMMIT됩니다(묵시적 COMMIT). 따라서 CREATE TABLE T2 실행 전에 INSERT 1, 2가 자동 COMMIT됩니다. 이후 ROLLBACK은 이미 COMMIT된 INSERT 1, 2를 취소할 수 없습니다. 최종적으로 T 테이블에는 1과 2가 남아 있습니다. 이는 Oracle의 특성으로, 다른 DBMS에서는 다를 수 있습니다.',
    options: [
      '아무 데이터도 없음 (ROLLBACK으로 모두 취소)',
      '1만 남음',
      '2만 남음',
      '1과 2 모두 남음 (DDL 실행으로 묵시적 COMMIT 발생)',
    ],
    points: 10,
  },

  // --- DCL (47~48) ---
  {
    id: 'exam6_p47',
    title: '47. ROLE을 이용한 권한 관리',
    description:
      '다음 중 ROLE을 이용한 권한 관리에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DCL',
    correctRate: 55,
    answer: '1',
    explanation:
      'ROLE은 관련된 권한들의 집합으로, 여러 사용자에게 동일한 권한 집합을 일괄 부여하거나 회수할 때 유용합니다. ROLE에 권한을 부여하고, 사용자에게 ROLE을 부여하면 해당 ROLE의 모든 권한이 사용자에게 전달됩니다. ROLE은 중첩 가능합니다(ROLE에 다른 ROLE을 부여 가능). REVOKE를 통해 ROLE을 회수하면 해당 ROLE을 통해 부여된 모든 권한이 함께 회수됩니다. 이는 개별 권한을 일일이 관리하는 것보다 효율적입니다.',
    options: [
      'ROLE은 권한들의 집합으로, ROLE을 사용자에게 부여하면 ROLE 내의 모든 권한이 전달되며, ROLE 회수 시 관련 권한이 모두 회수된다.',
      'ROLE은 데이터베이스 오브젝트에 대한 권한만 포함할 수 있고, 시스템 권한은 포함할 수 없다.',
      'ROLE은 한 사용자에게만 부여할 수 있으며 여러 사용자 동시 부여는 불가능하다.',
      'ROLE을 삭제하면 해당 ROLE을 부여받은 사용자의 모든 권한이 삭제된다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p48',
    title: '48. GRANT WITH GRANT OPTION',
    description:
      '다음 권한 부여 시나리오에서 권한 전파 관계로 올바른 것은?\n\nDBA가 USER_A에게: GRANT SELECT ON EMP TO USER_A WITH GRANT OPTION;\nUSER_A가 USER_B에게: GRANT SELECT ON EMP TO USER_B;\nDBA가 USER_A의 권한 회수: REVOKE SELECT ON EMP FROM USER_A;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DCL',
    correctRate: 35,
    answer: '3',
    explanation:
      'WITH GRANT OPTION은 권한을 받은 사용자가 다른 사용자에게 동일 권한을 부여할 수 있게 합니다. 연쇄(CASCADE) 회수: DBA가 USER_A의 권한을 REVOKE하면 USER_A가 WITH GRANT OPTION으로 부여한 USER_B의 권한도 함께 자동으로 회수됩니다. 즉, USER_A → USER_B로 전파된 권한도 함께 취소됩니다. 이는 Oracle의 기본 동작이며, REVOKE 시 연쇄적으로 권한이 회수되어 권한 체인이 끊어집니다.',
    options: [
      'USER_A의 권한만 회수되고 USER_B는 여전히 SELECT 권한을 유지한다.',
      'DBA만 REVOKE할 수 있으므로 USER_B의 권한을 회수하려면 별도로 REVOKE해야 한다.',
      'USER_A의 권한을 REVOKE하면 USER_A가 부여한 USER_B의 권한도 연쇄적으로 함께 회수된다.',
      'WITH GRANT OPTION으로 부여된 권한은 DBA만 회수할 수 있다.',
    ],
    points: 10,
  },

  // --- 계층형쿼리 (49~50) ---
  {
    id: 'exam6_p49',
    title: '49. 재귀 CTE를 이용한 계층 탐색',
    description:
      '다음 재귀 CTE(Recursive CTE) SQL에서 각 부분의 역할로 올바른 것은?\n\nWITH RECURSIVE EMP_HIER AS (\n  -- 앵커 쿼리\n  SELECT EMP_ID, EMP_NAME, MGR_ID, 0 AS LVL\n  FROM EMP\n  WHERE MGR_ID IS NULL\n  \n  UNION ALL\n  \n  -- 재귀 쿼리\n  SELECT E.EMP_ID, E.EMP_NAME, E.MGR_ID, H.LVL + 1\n  FROM EMP E\n  JOIN EMP_HIER H ON E.MGR_ID = H.EMP_ID\n)\nSELECT * FROM EMP_HIER;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 35,
    answer: '2',
    explanation:
      '재귀 CTE의 구조: 1) 앵커(Anchor) 쿼리 - 재귀의 시작점으로 조건을 만족하는 초기 행을 반환합니다. MGR_ID IS NULL인 최상위 관리자를 시작점으로 설정하고 LVL=0으로 초기화합니다. 2) UNION ALL - 앵커 결과와 재귀 결과를 합칩니다. 3) 재귀(Recursive) 쿼리 - CTE 자신(EMP_HIER)을 참조하여 이전 레벨의 사원을 부모로 가지는 하위 사원을 찾고 LVL을 1 증가시킵니다. 재귀는 더 이상 매칭되는 행이 없을 때 종료됩니다.',
    options: [
      '앵커 쿼리는 종료 조건을 정의하고, 재귀 쿼리는 시작점을 정의한다.',
      '앵커 쿼리는 최상위 루트(시작점)를 정의하고, 재귀 쿼리는 CTE 자신을 참조하여 하위 계층을 단계적으로 탐색한다.',
      '재귀 CTE는 항상 무한 루프가 발생하므로 ROWNUM으로 제한해야 한다.',
      'UNION ALL을 UNION으로 변경하면 중복 없이 더 효율적으로 동작한다.',
    ],
    points: 10,
  },
  {
    id: 'exam6_p50',
    title: '50. Oracle 계층형 쿼리 CONNECT BY',
    description:
      '다음 Oracle 계층형 쿼리에서 NOCYCLE 옵션의 역할로 올바른 것은?\n\nSELECT LEVEL, EMP_ID, EMP_NAME, MGR_ID,\n       SYS_CONNECT_BY_PATH(EMP_NAME, \'/\') AS PATH\nFROM EMP\nSTART WITH MGR_ID IS NULL\nCONNECT BY NOCYCLE PRIOR EMP_ID = MGR_ID;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 30,
    answer: '4',
    explanation:
      'CONNECT BY NOCYCLE은 데이터에 순환 참조(Cycle)가 있을 때 무한 루프를 방지합니다. 예를 들어 A→B→C→A처럼 순환 관계가 있는 경우, NOCYCLE 없이 CONNECT BY를 사용하면 ORA-01436 오류가 발생합니다. NOCYCLE을 추가하면 순환이 감지될 때 해당 경로를 중단하고 다음 행으로 넘어갑니다. SYS_CONNECT_BY_PATH는 루트부터 현재 행까지의 경로를 지정한 구분자로 연결하여 반환합니다. LEVEL은 계층의 깊이를 나타내는 의사 컬럼입니다.',
    options: [
      'NOCYCLE은 계층 탐색의 최대 레벨 수를 제한한다.',
      'NOCYCLE은 NULL 값을 가진 MGR_ID 행을 제외한다.',
      'NOCYCLE은 PRIOR 키워드 없이 계층을 탐색할 수 있게 한다.',
      'NOCYCLE은 데이터에 순환 참조가 있을 때 무한 루프를 방지하고, 순환이 감지되면 해당 경로를 중단한다.',
    ],
    points: 10,
  },
];
