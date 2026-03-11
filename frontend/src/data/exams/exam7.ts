import type { Problem } from '../../types';

// SQLD 모의고사 7회 (고급 난이도 - 목표 합격률 ~40%)
// 1과목: 데이터 모델링의 이해 (10문항, 20점)
// 2과목: SQL 기본 및 활용 (40문항, 80점)
// 난이도 배분: easy 8 / medium 22 / hard 20

export const EXAM_7_PROBLEMS: Problem[] = [
  // ===== 1과목: 데이터 모델링의 이해 (1~10번) =====
  // --- 데이터모델링 (1~5) ---
  {
    id: 'exam7_p1',
    title: '1. 식별자 관계와 비식별자 관계의 차이',
    description:
      '다음 중 식별자 관계(Identifying Relationship)와 비식별자 관계(Non-Identifying Relationship)에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 45,
    answer: '3',
    explanation:
      '식별자 관계에서는 부모 엔터티의 주식별자가 자식 엔터티의 주식별자 구성에 포함됩니다. 반면 비식별자 관계에서는 부모 엔터티의 주식별자가 자식 엔터티의 일반 속성으로만 포함됩니다. 식별자 관계는 자식 엔터티의 존재가 부모에 종속되어 부모가 없으면 자식도 존재할 수 없습니다. 비식별자 관계는 자식 엔터티가 독립적으로 존재할 수 있습니다. 식별자 관계는 ERD에서 실선으로, 비식별자 관계는 점선으로 표현합니다.',
    options: [
      '식별자 관계에서는 부모 엔터티의 주식별자가 자식 엔터티의 주식별자 구성에 포함된다.',
      '비식별자 관계에서는 부모 엔터티의 주식별자가 자식 엔터티의 일반 속성으로만 포함된다.',
      '식별자 관계는 ERD에서 점선으로 표현하고, 비식별자 관계는 실선으로 표현한다.',
      '비식별자 관계에서는 자식 엔터티가 부모 없이도 독립적으로 존재할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p2',
    title: '2. 엔터티 분류 - 중간 엔터티',
    description:
      '다음 설명에 해당하는 엔터티 유형으로 올바른 것은?\n\n"두 엔터티 사이의 M:N 관계를 해소하기 위해 생성되며, 양쪽 엔터티의 주식별자를 복합 기본키로 가지는 경우가 많다. 예를 들어 학생과 과목 사이의 수강 이력을 관리하는 엔터티가 이에 해당한다."',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 72,
    answer: '2',
    explanation:
      '교차 엔터티(Intersection Entity, 또는 연결 엔터티)는 두 엔터티 간의 M:N 관계를 해소하기 위해 생성되는 엔터티입니다. 양쪽 엔터티의 주식별자를 외래키로 참조하며, 이 두 FK의 조합이 주식별자가 되는 경우가 많습니다. 행위 엔터티는 업무 처리 과정에서 발생하는 사건을 기록하는 엔터티이고, 기본 엔터티는 독립적으로 존재하는 엔터티입니다.',
    options: [
      '기본 엔터티(Basic Entity)',
      '교차 엔터티(Intersection Entity)',
      '행위 엔터티(Active Entity)',
      '중심 엔터티(Central Entity)',
    ],
    points: 10,
  },
  {
    id: 'exam7_p3',
    title: '3. 속성의 원자성과 1NF 위반',
    description:
      '다음 테이블에서 1NF(제1정규형)를 위반하는 속성은?\n\n고객(고객ID, 고객명, 전화번호목록, 주소, 나이)\n\n위 테이블에서 전화번호목록 컬럼에는 \'010-1234-5678, 02-999-0000\' 형태로 여러 전화번호가 콤마로 구분되어 저장되어 있다.',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 78,
    answer: '1',
    explanation:
      '제1정규형(1NF)은 모든 속성이 원자값(Atomic Value)을 가져야 한다는 것입니다. 전화번호목록 컬럼에 여러 전화번호가 하나의 셀에 저장되어 있으면 원자성을 위반합니다. 이를 해결하려면 전화번호 테이블을 별도로 분리하거나, 각 전화번호를 별도 행으로 저장해야 합니다. 고객명, 주소, 나이는 단일 값을 가지므로 1NF를 위반하지 않습니다.',
    options: [
      '전화번호목록 (여러 값이 하나의 셀에 저장됨)',
      '고객명 (NULL이 허용되지 않을 수 있음)',
      '주소 (길이가 가변적임)',
      '나이 (파생 속성일 수 있음)',
    ],
    points: 10,
  },
  {
    id: 'exam7_p4',
    title: '4. 슈퍼타입/서브타입 변환 전략',
    description:
      '슈퍼타입/서브타입 모델을 물리 테이블로 변환하는 전략 중 "롤업(Roll-Up, 1개 테이블)" 전략에 대한 설명으로 올바른 것은?\n\n예시: 직원(슈퍼타입) - 정규직(서브타입), 계약직(서브타입)',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 35,
    answer: '4',
    explanation:
      '롤업(Roll-Up) 전략은 슈퍼타입과 모든 서브타입을 하나의 테이블로 통합하는 방식입니다. 장점은 조인이 없어 조회가 빠르고 구조가 단순하다는 것입니다. 단점은 서브타입에만 해당하는 컬럼들이 다른 서브타입 행에서는 NULL이 되어 NULL 값이 많아지고, 인덱스 효율이 떨어질 수 있습니다. 또한 서브타입 구분을 위한 타입 구분 컬럼이 반드시 필요합니다. 이 전략은 서브타입 간 데이터 차이가 크지 않고 조회 성능이 중요할 때 적합합니다.',
    options: [
      '슈퍼타입과 각 서브타입을 모두 별도 테이블로 유지하여 각 엔터티의 독립성을 보장한다.',
      '슈퍼타입 테이블만 유지하고 서브타입 특화 속성은 별도 테이블에 저장하여 조인으로 접근한다.',
      '각 서브타입을 독립 테이블로 만들고 슈퍼타입 테이블을 제거하여 서브타입별 조회를 최적화한다.',
      '슈퍼타입과 모든 서브타입을 하나의 테이블로 합쳐 서브타입 전용 컬럼은 해당 서브타입이 아닌 경우 NULL이 된다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p5',
    title: '5. 복합 식별자와 인조 식별자 선택',
    description:
      '주문 상세 테이블의 주식별자를 설계하려 한다. 아래 두 설계안 중 인조 식별자(Artificial Identifier)를 사용하는 것이 적합한 경우와 그 이유로 올바른 것은?\n\n[설계안 A] ORDER_DETAIL_ID (시퀀스 번호, 단일 PK)\n[설계안 B] ORDER_ID + PRODUCT_ID + LINE_SEQ (복합 PK)',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 33,
    answer: '2',
    explanation:
      '인조 식별자는 업무적으로 의미 있는 식별자가 너무 길거나 복잡한 복합키인 경우, 또는 FK로 자주 참조될 때 효율적입니다. 단, 인조 식별자를 사용하면 업무 식별자(복합키) 조합에 대한 UNIQUE 제약을 별도로 설정해야 중복을 방지할 수 있습니다. 인조 식별자가 있더라도 업무 유일성 보장을 위한 복합 UNIQUE 제약은 반드시 필요합니다. 인조 식별자는 데이터의 의미를 담지 않으므로 업무적 유일성을 자체적으로 보장하지 못합니다.',
    options: [
      '복합 PK(설계안 B)는 항상 인조 식별자(설계안 A)보다 성능이 나쁘므로 인조 식별자를 선택해야 한다.',
      '다른 테이블에서 FK로 참조가 빈번하고 복합키 구성이 3개 이상이면 인조 식별자가 유리하나, 복합키에 대한 UNIQUE 제약은 별도 설정이 필요하다.',
      '인조 식별자를 사용하면 업무 식별자 조합에 대한 UNIQUE 제약 없이도 중복 데이터 방지가 자동으로 보장된다.',
      '인조 식별자는 업무적 의미를 포함하므로 복합 PK보다 데이터 무결성이 더 강하게 유지된다.',
    ],
    points: 10,
  },

  // --- 정규화 (6~10) ---
  {
    id: 'exam7_p6',
    title: '6. 이행 함수 종속과 3NF',
    description:
      '다음 테이블에서 이행 함수 종속(Transitive Functional Dependency)이 발생하는 경우는?\n\n주문(주문번호, 고객번호, 고객명, 배송지, 주문금액)\n\n위 테이블에서 주문번호 → 고객번호 이고, 고객번호 → 고객명, 고객번호 → 배송지 관계가 성립한다.',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 50,
    answer: '3',
    explanation:
      '이행 함수 종속은 A → B이고 B → C일 때 A → C가 성립하는 경우입니다. 이 테이블에서 주문번호 → 고객번호 → 고객명, 주문번호 → 고객번호 → 배송지 가 이행 함수 종속입니다. 즉, 주문번호는 고객번호를 통해 간접적으로 고객명과 배송지를 결정합니다. 3NF는 이행 함수 종속을 제거해야 합니다. 해결 방법은 고객(고객번호, 고객명, 배송지)을 별도 테이블로 분리하는 것입니다.',
    options: [
      '주문번호 → 주문금액 (기본키가 직접 속성을 결정하므로 정상 함수 종속)',
      '주문번호 → 고객번호 (기본키가 직접 속성을 결정하므로 정상 함수 종속)',
      '주문번호 → 고객명 (주문번호 → 고객번호 → 고객명의 이행 종속)',
      '고객번호 → 배송지 (고객 엔터티 내의 정상 함수 종속)',
    ],
    points: 10,
  },
  {
    id: 'exam7_p7',
    title: '7. BCNF 위반 케이스',
    description:
      '다음 테이블이 BCNF(Boyce-Codd Normal Form)를 위반하는지 판단하시오.\n\n수강신청(학번, 과목코드, 교수번호)\n- (학번, 과목코드)가 복합 기본키\n- 각 과목은 담당 교수가 1명(교수번호 → 과목코드 성립)\n- 한 학생이 같은 과목을 다른 교수에게 들을 수 없음\n\n이 테이블의 정규형 위반 상태로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 28,
    answer: '4',
    explanation:
      'BCNF는 모든 함수 종속 X → Y에서 X가 슈퍼키여야 합니다. 이 테이블에서 교수번호 → 과목코드가 성립하는데, 교수번호는 슈퍼키가 아닙니다(교수번호만으로는 행을 유일하게 식별 불가). 따라서 BCNF를 위반합니다. 3NF는 비주요 속성이 키에 이행 종속되지 않으면 되는데, 교수번호는 기본키(학번+과목코드)의 부분이 아닌 일반 속성이고 교수번호 → 과목코드는 비주요 속성이 다른 비주요 속성을 결정하는 구조가 아니라 일반 속성이 기본키 구성요소를 결정하는 구조이므로 3NF는 만족하지만 BCNF는 위반합니다.',
    options: [
      '2NF를 위반한다. 학번만으로 교수번호를 결정할 수 있는 부분 함수 종속이 있기 때문이다.',
      '3NF를 위반한다. 비주요 속성 교수번호가 기본키에 이행 종속되기 때문이다.',
      '2NF와 3NF를 모두 위반한다. 복합키의 일부인 과목코드가 교수번호에 종속되기 때문이다.',
      'BCNF를 위반한다. 교수번호 → 과목코드 종속에서 교수번호가 슈퍼키가 아니기 때문이다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p8',
    title: '8. 4NF와 다중값 종속',
    description:
      '4NF(제4정규형)가 제거하려는 이상(Anomaly)의 원인으로 올바른 것은?\n\n다음 테이블을 참고하라.\n직원_기술_언어(직원번호, 기술, 외국어)\n- 직원번호 →→ 기술 (직원은 여러 기술 보유)\n- 직원번호 →→ 외국어 (직원은 여러 외국어 구사)\n- 기술과 외국어는 서로 독립적 (관련 없음)',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 25,
    answer: '2',
    explanation:
      '4NF는 다중값 종속(Multi-Valued Dependency, MVD)으로 인한 이상을 제거합니다. 다중값 종속은 A →→ B와 A →→ C에서 B와 C가 서로 독립적일 때 발생합니다. 이 경우 직원이 기술 3개, 외국어 2개를 가지면 6개 행이 필요하고, 기술 추가 시 외국어 수만큼 행을 추가해야 하는 삽입 이상이 발생합니다. 해결 방법은 직원_기술(직원번호, 기술)과 직원_언어(직원번호, 외국어)로 분리하는 것입니다.',
    options: [
      '부분 함수 종속으로 인한 삽입/삭제/수정 이상',
      '다중값 종속으로 인한 독립적인 다중값 속성들의 조합 폭발 이상',
      '이행 함수 종속으로 인한 데이터 중복 이상',
      '조인 종속으로 인한 무손실 분해 불가 이상',
    ],
    points: 10,
  },
  {
    id: 'exam7_p9',
    title: '9. 반정규화와 데이터 정합성 유지',
    description:
      '다음 반정규화 적용 시나리오에서 데이터 정합성 유지 방법으로 올바르지 않은 것은?\n\n[시나리오]\n주문(주문번호, 고객번호, 총주문금액) - 총주문금액은 반정규화된 파생 컬럼\n주문상세(상세번호, 주문번호, 상품금액)\n총주문금액 = 해당 주문의 주문상세.상품금액 합계\n\n주문상세가 INSERT/UPDATE/DELETE될 때 총주문금액 정합성을 유지하는 방법은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 48,
    answer: '3',
    explanation:
      '반정규화로 생성된 파생 컬럼의 정합성을 유지하는 방법에는 애플리케이션 레벨 처리(매번 SUM 재계산 후 UPDATE), 데이터베이스 트리거(주문상세 변경 시 자동으로 총주문금액 갱신), 배치 작업(주기적 재계산)이 있습니다. 테이블 삭제 후 뷰로 대체하면 반정규화를 해제하는 것으로 정합성 유지 방법이 아닙니다. 또한 READ ONLY 제약을 걸면 주문상세 추가 자체가 불가능해지므로 올바른 방법이 아닙니다.',
    options: [
      '주문상세 INSERT/UPDATE/DELETE 시 트리거를 활용하여 주문.총주문금액을 자동으로 갱신한다.',
      '애플리케이션에서 주문상세를 변경할 때마다 해당 주문의 상품금액 합계를 계산하여 주문.총주문금액을 UPDATE한다.',
      '주문 테이블에 총주문금액 컬럼 대신 CHECK 제약조건으로 자동 계산되도록 설정하면 별도 유지 없이 항상 정확한 값을 보장한다.',
      '정기 배치 작업으로 주문.총주문금액을 주문상세 합계로 재계산하여 갱신한다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p10',
    title: '10. 정규화 단계별 이상 제거 순서',
    description:
      '아래 단계를 정규화 진행 순서에 따라 올바르게 나열한 것은?\n\nA. 이행 함수 종속 제거\nB. 원자값이 아닌 속성 분리 (다중값 속성 제거)\nC. 부분 함수 종속 제거\nD. 다중값 종속 제거',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 68,
    answer: '1',
    explanation:
      '정규화 단계별 제거 대상:\n- 1NF: 원자값이 아닌 속성 분리 (B)\n- 2NF: 부분 함수 종속 제거 (C)\n- 3NF: 이행 함수 종속 제거 (A)\n- 4NF: 다중값 종속 제거 (D)\n따라서 순서는 B → C → A → D 입니다.',
    options: [
      'B → C → A → D',
      'C → B → A → D',
      'B → A → C → D',
      'A → B → C → D',
    ],
    points: 10,
  },

  // ===== 2과목: SQL 기본 및 활용 (11~50번) =====
  // --- JOIN (11~17) ---
  {
    id: 'exam7_p11',
    title: '11. CROSS JOIN 결과 행 수',
    description:
      '다음 쿼리의 결과 행 수로 올바른 것은?\n\nSELECT *\nFROM   (SELECT 1 AS N FROM DUAL\n         UNION ALL SELECT 2 FROM DUAL\n         UNION ALL SELECT 3 FROM DUAL) A\n       CROSS JOIN\n       (SELECT \'X\' AS C FROM DUAL\n         UNION ALL SELECT \'Y\' FROM DUAL) B\nWHERE  A.N <> 2;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 52,
    answer: '2',
    explanation:
      'CROSS JOIN은 두 집합의 카테시안 곱입니다. A 인라인 뷰는 1, 2, 3 총 3행을 생성합니다. B 인라인 뷰는 X, Y 총 2행을 생성합니다. CROSS JOIN 결과는 3 × 2 = 6행입니다. 여기에 WHERE A.N <> 2 조건이 적용되어 N=2인 행(2행: 2-X, 2-Y)이 제외됩니다. 최종 결과는 6 - 2 = 4행입니다.',
    options: ['6행', '4행', '2행', '3행'],
    points: 10,
  },
  {
    id: 'exam7_p12',
    title: '12. OUTER JOIN과 NULL 필터링',
    description:
      '다음 쿼리에서 결과로 포함되는 행에 대한 설명으로 올바른 것은?\n\n-- DEPT: 10, 20, 30, 40번 부서 존재\n-- EMP: 10, 20, 30번 부서에 소속 사원 존재 (40번 부서는 사원 없음)\nSELECT D.DEPTNO, D.DNAME, E.EMPNO\nFROM   DEPT D\n       LEFT OUTER JOIN EMP E ON D.DEPTNO = E.DEPTNO\nWHERE  E.EMPNO IS NULL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 55,
    answer: '4',
    explanation:
      'LEFT OUTER JOIN은 왼쪽 테이블(DEPT)의 모든 행과, 오른쪽 테이블(EMP)과 매칭되는 행을 반환합니다. 40번 부서는 EMP에 사원이 없으므로 LEFT JOIN 후 E.EMPNO가 NULL이 됩니다. WHERE E.EMPNO IS NULL 조건은 바로 이 40번 부서 행만 필터링합니다. 결과적으로 사원이 없는 부서(40번)의 행만 반환됩니다. 이것은 DEPT에는 있지만 EMP에 없는 데이터를 찾는 ANTI JOIN 패턴입니다.',
    options: [
      '모든 부서와 사원 정보가 반환된다.',
      '사원이 있는 10, 20, 30번 부서만 반환된다.',
      '아무 행도 반환되지 않는다.',
      '사원이 없는 40번 부서만 반환된다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p13',
    title: '13. NATURAL JOIN과 USING 절의 차이',
    description:
      '다음 두 쿼리의 결과 차이에 대한 설명으로 올바른 것은?\n\n[쿼리 A]\nSELECT * FROM EMP NATURAL JOIN DEPT;\n\n[쿼리 B]\nSELECT * FROM EMP JOIN DEPT USING (DEPTNO);\n\n-- EMP 테이블: EMPNO, ENAME, DEPTNO, MGR\n-- DEPT 테이블: DEPTNO, DNAME, LOC',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 42,
    answer: '3',
    explanation:
      'NATURAL JOIN은 두 테이블에서 이름이 같은 모든 컬럼으로 자동 조인합니다. 이름이 같은 컬럼이 DEPTNO만 있다면 동일하지만, 만약 EMP와 DEPT 모두에 다른 동명 컬럼(예: MGR이 양쪽에 있다면)이 있을 경우 의도치 않은 추가 조인 조건이 생깁니다. 두 방식 모두 결과의 DEPTNO 컬럼이 하나만 나타납니다(NATURAL JOIN과 USING은 공통 컬럼을 하나만 출력). ON 절을 사용하면 E.DEPTNO와 D.DEPTNO 두 컬럼이 모두 SELECT *에 포함될 수 있습니다. NATURAL JOIN은 컬럼 이름에 의존하므로 테이블 구조 변경 시 예상치 못한 오류가 생길 수 있어 실무에서는 USING이나 ON을 권장합니다.',
    options: [
      '두 쿼리는 완전히 동일하며 항상 같은 결과를 반환한다.',
      '쿼리 A는 DEPTNO 컬럼이 두 번 나타나고, 쿼리 B는 한 번만 나타난다.',
      '쿼리 A는 이름이 같은 모든 컬럼으로 자동 조인하므로 동명 컬럼이 DEPTNO 외에 추가로 존재하면 다른 결과가 나올 수 있다.',
      '쿼리 B는 WHERE 절과 동일한 처리를 하므로 두 DEPTNO 컬럼이 모두 결과에 나타난다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p14',
    title: '14. 다중 테이블 JOIN과 NULL 전파',
    description:
      '다음 쿼리 실행 결과에서 C.PROJECT_NAME이 NULL인 행의 수로 올바른 것은?\n\n-- A: 직원 5명 (EMP_ID: 1~5)\n-- B: 직원-프로젝트 매핑 (EMP_ID 1,2,3만 프로젝트 존재, PROJECT_ID 각 101,102,103)\n-- C: 프로젝트 (PROJECT_ID 101,103만 존재, 102는 없음)\n\nSELECT A.EMP_ID, B.PROJECT_ID, C.PROJECT_NAME\nFROM   A\n       LEFT JOIN B ON A.EMP_ID = B.EMP_ID\n       LEFT JOIN C ON B.PROJECT_ID = C.PROJECT_ID;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 32,
    answer: '3',
    explanation:
      '단계별 분석:\n1. A LEFT JOIN B: EMP_ID 1,2,3은 B와 매칭(PROJECT_ID 101,102,103), EMP_ID 4,5는 B에 없으므로 B 컬럼 NULL → 총 5행\n2. 결과 LEFT JOIN C: \n   - EMP_ID 1, PROJECT_ID 101 → C에 존재 → PROJECT_NAME 있음\n   - EMP_ID 2, PROJECT_ID 102 → C에 없음 → PROJECT_NAME NULL\n   - EMP_ID 3, PROJECT_ID 103 → C에 존재 → PROJECT_NAME 있음\n   - EMP_ID 4, PROJECT_ID NULL → C 조인 시 NULL=NULL은 FALSE → PROJECT_NAME NULL\n   - EMP_ID 5, PROJECT_ID NULL → 동일하게 PROJECT_NAME NULL\nPROJECT_NAME이 NULL인 행: EMP_ID 2, 4, 5 = 3행',
    options: ['1행', '2행', '3행', '4행'],
    points: 10,
  },
  {
    id: 'exam7_p15',
    title: '15. SELF JOIN 계층 조회',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\n-- EMP 테이블 데이터:\n-- EMPNO  ENAME   MGR\n-- 1000   KING    NULL\n-- 1001   JONES   1000\n-- 1002   SMITH   1001\n-- 1003   FORD    1001\n\nSELECT E.ENAME AS 직원, M.ENAME AS 상관\nFROM   EMP E\n       LEFT JOIN EMP M ON E.MGR = M.EMPNO\nWHERE  M.MGR IS NOT NULL;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 28,
    answer: '2',
    explanation:
      'LEFT JOIN 후 각 직원의 상관(M)을 연결합니다.\n- KING(1000): MGR NULL → M 행 없음 → M.ENAME NULL, M.MGR NULL\n- JONES(1001): MGR=1000(KING) → M.ENAME=KING, M.MGR=NULL\n- SMITH(1002): MGR=1001(JONES) → M.ENAME=JONES, M.MGR=1000\n- FORD(1003): MGR=1001(JONES) → M.ENAME=JONES, M.MGR=1000\n\nWHERE M.MGR IS NOT NULL 조건: M(상관)의 MGR이 NULL이 아닌 행만 선택\n- KING의 행: M이 없어 M.MGR=NULL → 제외\n- JONES의 행: M=KING, M.MGR=NULL → 제외\n- SMITH의 행: M=JONES, M.MGR=1000(NOT NULL) → 포함\n- FORD의 행: M=JONES, M.MGR=1000(NOT NULL) → 포함\n\n결과: SMITH-JONES, FORD-JONES (2행)',
    options: [
      'KING-NULL, JONES-KING, SMITH-JONES, FORD-JONES (4행)',
      'SMITH-JONES, FORD-JONES (2행)',
      'JONES-KING, SMITH-JONES, FORD-JONES (3행)',
      'SMITH-JONES (1행)',
    ],
    points: 10,
  },
  {
    id: 'exam7_p16',
    title: '16. ANSI JOIN과 Oracle JOIN 등가 변환',
    description:
      '다음 Oracle 방식의 OUTER JOIN 쿼리를 ANSI 표준 쿼리로 올바르게 변환한 것은?\n\nSELECT A.COL1, B.COL2\nFROM   TABLE_A A, TABLE_B B\nWHERE  A.KEY = B.KEY(+)\nAND    B.STATUS(+) = \'ACTIVE\';',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 72,
    answer: '1',
    explanation:
      'Oracle의 (+) 연산자는 해당 컬럼이 속한 테이블이 OUTER 측(NULL을 허용하는 측)임을 나타냅니다. B 쪽에 (+)가 붙어 있으므로 A가 기준(INNER), B가 OUTER입니다 → LEFT OUTER JOIN. 중요한 점은 B.STATUS(+) = \'ACTIVE\' 조건도 JOIN 조건으로 처리해야 합니다. ANSI에서 OUTER JOIN의 한쪽 테이블에 대한 필터 조건은 ON 절에 포함해야 WHERE 절에 넣으면 INNER JOIN과 동일하게 동작합니다. WHERE에 B.STATUS = \'ACTIVE\'를 넣으면 LEFT JOIN 후 NULL인 행이 제거되어 결과가 달라집니다.',
    options: [
      'SELECT A.COL1, B.COL2 FROM TABLE_A A LEFT OUTER JOIN TABLE_B B ON A.KEY = B.KEY AND B.STATUS = \'ACTIVE\'',
      'SELECT A.COL1, B.COL2 FROM TABLE_A A LEFT OUTER JOIN TABLE_B B ON A.KEY = B.KEY WHERE B.STATUS = \'ACTIVE\'',
      'SELECT A.COL1, B.COL2 FROM TABLE_A A RIGHT OUTER JOIN TABLE_B B ON A.KEY = B.KEY AND B.STATUS = \'ACTIVE\'',
      'SELECT A.COL1, B.COL2 FROM TABLE_A A FULL OUTER JOIN TABLE_B B ON A.KEY = B.KEY AND B.STATUS = \'ACTIVE\'',
    ],
    points: 10,
  },
  {
    id: 'exam7_p17',
    title: '17. 세 테이블 OUTER JOIN 순서 의존성',
    description:
      '다음 두 쿼리 A, B의 결과가 다른 이유로 올바른 것은?\n\n[쿼리 A]\nSELECT P.PID, O.OID, D.DID\nFROM   P\n       LEFT JOIN O ON P.PID = O.PID\n       INNER JOIN D ON O.OID = D.OID;\n\n[쿼리 B]\nSELECT P.PID, O.OID, D.DID\nFROM   P\n       LEFT JOIN O ON P.PID = O.PID\n       LEFT JOIN D ON O.OID = D.OID;\n\n-- P에 OID 없는 행이 있음',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 30,
    answer: '2',
    explanation:
      '쿼리 A에서 LEFT JOIN O 결과(P의 모든 행 포함)에 INNER JOIN D를 하면, O와 매칭되지 않은 P 행은 O.OID가 NULL이고, NULL = D.OID는 FALSE이므로 INNER JOIN 결과에서 제외됩니다. 결과적으로 쿼리 A는 O에 매칭되고 D에도 매칭되는 P 행만 반환합니다(사실상 P-O-D 모두 INNER JOIN과 유사). 쿼리 B는 LEFT JOIN O 후 LEFT JOIN D이므로 O에 매칭 없는 P 행도 최종 결과에 포함됩니다. LEFT JOIN 후 INNER JOIN을 적용하면 앞의 OUTER 효과가 사라지는 것이 핵심입니다.',
    options: [
      '두 쿼리는 항상 동일한 결과를 반환한다.',
      '쿼리 A는 LEFT JOIN 후 INNER JOIN D를 적용하여 O에 매칭 없는 P 행이 제거되어, P 전체를 보존하는 쿼리 B와 다른 결과가 나온다.',
      '쿼리 B가 더 적은 행을 반환한다. LEFT JOIN을 두 번 쓰면 조건이 더 엄격해지기 때문이다.',
      '두 쿼리의 차이는 D 테이블 조인 방식뿐이므로 P-O 매칭에서 동일한 결과를 반환한다.',
    ],
    points: 10,
  },

  // --- 함수 (18~23) ---
  {
    id: 'exam7_p18',
    title: '18. DECODE와 CASE의 NULL 비교 차이',
    description:
      '다음 두 쿼리의 결과 차이로 올바른 것은?\n\n-- COL1에 NULL 값이 포함된 테이블\nSELECT DECODE(COL1, NULL, \'NULL값\', \'다른값\') AS R1\nFROM   TEMP;\n\nSELECT CASE COL1 WHEN NULL THEN \'NULL값\' ELSE \'다른값\' END AS R2\nFROM   TEMP;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 28,
    answer: '1',
    explanation:
      'DECODE 함수는 내부적으로 NULL 비교 시 IS NULL과 동일하게 처리하므로 DECODE(COL1, NULL, \'NULL값\', \'다른값\')에서 COL1이 NULL이면 \'NULL값\'을 반환합니다. 그러나 단순 CASE 표현식(CASE COL1 WHEN NULL ...)은 내부적으로 COL1 = NULL을 평가하는데, NULL = NULL은 UNKNOWN이므로 ELSE 분기인 \'다른값\'을 반환합니다. CASE에서 NULL 처리를 하려면 CASE WHEN COL1 IS NULL THEN ...을 사용해야 합니다.',
    options: [
      'COL1이 NULL일 때 R1은 \'NULL값\', R2는 \'다른값\'을 반환한다.',
      'COL1이 NULL일 때 R1, R2 모두 \'NULL값\'을 반환한다.',
      'COL1이 NULL일 때 R1, R2 모두 \'다른값\'을 반환한다.',
      'COL1이 NULL일 때 R1은 NULL, R2는 \'NULL값\'을 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p19',
    title: '19. 날짜 함수 연산 결과',
    description:
      '다음 Oracle 쿼리의 실행 결과로 올바른 것은?\n\nSELECT MONTHS_BETWEEN(\n         TO_DATE(\'2024-03-31\', \'YYYY-MM-DD\'),\n         TO_DATE(\'2024-01-31\', \'YYYY-MM-DD\')\n       ) AS M1,\n       MONTHS_BETWEEN(\n         TO_DATE(\'2024-03-30\', \'YYYY-MM-DD\'),\n         TO_DATE(\'2024-01-31\', \'YYYY-MM-DD\')\n       ) AS M2\nFROM   DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 42,
    answer: '3',
    explanation:
      'MONTHS_BETWEEN(date1, date2)는 date1 - date2의 개월 수 차이를 반환합니다. 두 날짜가 모두 월말이거나 동일한 일자이면 정수를 반환합니다. M1: 2024-03-31과 2024-01-31 → 두 날짜 모두 31일(월말)이므로 정확히 2개월 → 결과: 2. M2: 2024-03-30과 2024-01-31 → 일자가 다르고 월말이 아닌 경우 소수 계산 → 30일에서 31일을 빼므로 정확히 2개월이 아님. Oracle에서 두 날짜가 각 월의 마지막 날이 아니면 일 단위 차이를 31로 나눔: (31-30)/31 = 약 1.967... → 결과: 약 1.9677',
    options: [
      'M1 = 2, M2 = 2',
      'M1 = 2.0, M2 = 1.5',
      'M1 = 2, M2 = 약 1.9677',
      'M1 = 약 1.9677, M2 = 약 1.9677',
    ],
    points: 10,
  },
  {
    id: 'exam7_p20',
    title: '20. REGEXP_SUBSTR 정규식 함수',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\nSELECT REGEXP_SUBSTR(\'ABC123DEF456\', \'[0-9]+\', 1, 2) AS R\nFROM   DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 45,
    answer: '4',
    explanation:
      'REGEXP_SUBSTR(source, pattern, position, occurrence)는 정규식 패턴에 매칭되는 부분 문자열을 반환합니다. source=\'ABC123DEF456\', pattern=\'[0-9]+\'(하나 이상의 숫자), position=1(처음부터 검색), occurrence=2(두 번째 매칭). 첫 번째 매칭: 123 (ABC 이후) → 두 번째 매칭: 456 (DEF 이후). 결과: \'456\'',
    options: ['\'123\'', '\'1\'', '\'12\'', '\'456\''],
    points: 10,
  },
  {
    id: 'exam7_p21',
    title: '21. NULLIF와 NVL2 중첩 사용',
    description:
      '다음 쿼리의 실행 결과로 올바른 것은?\n\n-- 데이터: COL_A = 0, COL_B = NULL\nSELECT NVL2(\n         NULLIF(COL_A, 0),\n         \'A가 0이 아님\',\n         NVL(COL_B, \'B도NULL\')\n       ) AS RESULT\nFROM   TEMP;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 25,
    answer: '3',
    explanation:
      'NULLIF(COL_A, 0): COL_A가 0이므로 0 = 0 → NULL을 반환.\nNVL2(expr1, expr2, expr3): expr1이 NULL이면 expr3 반환, NULL이 아니면 expr2 반환.\nNULLIF 결과가 NULL이므로 NVL2는 세 번째 인수를 반환합니다.\n세 번째 인수: NVL(COL_B, \'B도NULL\'). COL_B = NULL이므로 NVL은 \'B도NULL\'을 반환.\n최종 결과: \'B도NULL\'',
    options: [
      '\'A가 0이 아님\'',
      'NULL',
      '\'B도NULL\'',
      '0',
    ],
    points: 10,
  },
  {
    id: 'exam7_p22',
    title: '22. LISTAGG 함수와 내부 정렬',
    description:
      '다음 쿼리 결과로 올바른 것은?\n\n-- DEPT_MEMBER 테이블:\n-- DEPTNO  ENAME    SALARY\n-- 10      KING     5000\n-- 10      CLARK    2450\n-- 10      MILLER   1300\n\nSELECT DEPTNO,\n       LISTAGG(ENAME, \',\') WITHIN GROUP (ORDER BY SALARY DESC) AS NAMES\nFROM   DEPT_MEMBER\nWHERE  DEPTNO = 10\nGROUP BY DEPTNO;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 50,
    answer: '2',
    explanation:
      'LISTAGG 함수는 그룹 내 값을 지정한 구분자로 이어 붙입니다. WITHIN GROUP (ORDER BY SALARY DESC)는 연결 순서를 급여 내림차순으로 지정합니다. 급여 내림차순: KING(5000) > CLARK(2450) > MILLER(1300). 결과: \'KING,CLARK,MILLER\'',
    options: [
      '\'MILLER,CLARK,KING\'',
      '\'KING,CLARK,MILLER\'',
      '\'CLARK,KING,MILLER\'',
      '\'KING,MILLER,CLARK\'',
    ],
    points: 10,
  },
  {
    id: 'exam7_p23',
    title: '23. TO_CHAR 숫자 포맷과 반올림',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\nSELECT TO_CHAR(12345.678, \'99,999.99\') AS R1,\n       TO_CHAR(12345.678, \'FM99,999.99\') AS R2\nFROM   DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 42,
    answer: '1',
    explanation:
      'TO_CHAR(숫자, 포맷)에서 포맷 \'99,999.99\'는 천 단위 구분자와 소수 2자리를 표시합니다. 12345.678에서 소수 셋째 자리에서 반올림 → 12345.68. 결과에 앞뒤 공백이 포함됩니다. FM(Fill Mode) 접두사는 앞뒤 공백과 불필요한 0을 제거합니다. R1 = \' 12,345.68\' (앞에 공백 있음), R2 = \'12,345.68\' (공백 없음). Oracle TO_CHAR는 양수에 부호 자리로 앞에 1칸 공백이 생깁니다.',
    options: [
      'R1 = \' 12,345.68\' (앞에 공백), R2 = \'12,345.68\' (공백 없음)',
      'R1 = \'12,345.68\', R2 = \'12,345.68\'',
      'R1 = \' 12,345.678\', R2 = \'12,345.678\'',
      'R1 = \'12,345.67\', R2 = \'12345.68\'',
    ],
    points: 10,
  },

  // --- DML (24~27) ---
  {
    id: 'exam7_p24',
    title: '24. MERGE 문 UPDATE와 INSERT 조건',
    description:
      '다음 MERGE 문 실행 후 TARGET 테이블의 상태로 올바른 것은?\n\n-- TARGET: (ID=1, VAL=\'A\'), (ID=2, VAL=\'B\')\n-- SOURCE: (ID=2, VAL=\'X\'), (ID=3, VAL=\'Y\')\n\nMERGE INTO TARGET T\nUSING  SOURCE S ON (T.ID = S.ID)\nWHEN MATCHED THEN\n  UPDATE SET T.VAL = S.VAL\n  WHERE S.VAL != \'X\'\nWHEN NOT MATCHED THEN\n  INSERT (ID, VAL) VALUES (S.ID, S.VAL);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 30,
    answer: '3',
    explanation:
      'MERGE 실행 분석:\n- ID=1: SOURCE에 없음 → MATCHED 조건 미해당, NOT MATCHED도 아님(TARGET에 있음) → 변화 없음\n- ID=2: MATCHED (T.ID=2, S.ID=2 매칭) → UPDATE WHERE S.VAL != \'X\' → S.VAL=\'X\'이므로 WHERE 조건 FALSE → UPDATE 미실행 → T.VAL=\'B\' 유지\n- ID=3: NOT MATCHED (TARGET에 없음) → INSERT (3, \'Y\')\n\n최종 TARGET: (1, \'A\'), (2, \'B\'), (3, \'Y\')',
    options: [
      '(1, \'A\'), (2, \'X\'), (3, \'Y\')',
      '(1, \'A\'), (2, \'B\')',
      '(1, \'A\'), (2, \'B\'), (3, \'Y\')',
      '(2, \'X\'), (3, \'Y\')',
    ],
    points: 10,
  },
  {
    id: 'exam7_p25',
    title: '25. UPDATE와 서브쿼리 - 다중 컬럼 갱신',
    description:
      '다음 UPDATE 문에서 오류가 발생하는 경우는?\n\n[쿼리 A]\nUPDATE EMP E\nSET    (E.SAL, E.COMM) = (\n         SELECT SAL * 1.1, NVL(COMM, 0) + 100\n         FROM   EMP\n         WHERE  EMPNO = E.EMPNO\n       );\n\n[쿼리 B]\nUPDATE EMP\nSET    SAL = (SELECT AVG(SAL) FROM EMP GROUP BY DEPTNO);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 33,
    answer: '2',
    explanation:
      '쿼리 A는 스칼라 서브쿼리로 두 컬럼을 동시에 업데이트하는 Oracle 문법입니다. 서브쿼리가 자기 자신을 참조하지만 WHERE 조건으로 단일 행을 반환하므로 정상 동작합니다. 쿼리 B의 서브쿼리 SELECT AVG(SAL) FROM EMP GROUP BY DEPTNO는 부서 수만큼 여러 행을 반환할 수 있습니다. SET 절의 서브쿼리는 반드시 0 또는 1개 행을 반환해야 하며, 다중 행 반환 시 ORA-01427: single-row subquery returns more than one row 오류가 발생합니다.',
    options: [
      '쿼리 A는 두 컬럼을 서브쿼리로 동시에 갱신할 수 없어 오류가 발생한다.',
      '쿼리 B는 서브쿼리가 다중 행을 반환할 수 있어 오류가 발생한다.',
      '두 쿼리 모두 오류 없이 정상 실행된다.',
      '쿼리 A는 자기 참조 서브쿼리이므로 무한 루프 오류가 발생한다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p26',
    title: '26. INSERT ALL과 조건부 다중 삽입',
    description:
      '다음 쿼리의 실행 결과로 올바른 것은?\n\n-- SRC: (SCORE=85), (SCORE=72), (SCORE=60)\nINSERT ALL\n  WHEN SCORE >= 80 THEN INTO HIGH_SCORE(S) VALUES(SCORE)\n  WHEN SCORE >= 60 THEN INTO MID_SCORE(S) VALUES(SCORE)\n  ELSE INTO LOW_SCORE(S) VALUES(SCORE)\nSELECT SCORE FROM SRC;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 45,
    answer: '1',
    explanation:
      'INSERT ALL ... WHEN은 Oracle의 조건부 다중 테이블 INSERT입니다. 각 행에 대해 모든 WHEN 조건을 독립적으로 평가합니다(INSERT FIRST와 달리 여러 조건이 동시에 참일 수 있음).\n- SCORE=85: WHEN SCORE>=80 → HIGH_SCORE 삽입. WHEN SCORE>=60도 TRUE → MID_SCORE도 삽입.\n- SCORE=72: WHEN SCORE>=80 FALSE. WHEN SCORE>=60 TRUE → MID_SCORE 삽입.\n- SCORE=60: WHEN SCORE>=80 FALSE. WHEN SCORE>=60 TRUE → MID_SCORE 삽입.\n\nHIGH_SCORE: 85 (1행), MID_SCORE: 85, 72, 60 (3행), LOW_SCORE: 없음.',
    options: [
      'HIGH_SCORE에 85, MID_SCORE에 85, 72, 60 삽입 (INSERT ALL은 각 WHEN을 독립 평가)',
      'HIGH_SCORE에 85, MID_SCORE에 72, 60 삽입 (첫 번째 매칭 조건만 적용)',
      'HIGH_SCORE에 85, MID_SCORE에 72, LOW_SCORE에 60 삽입',
      'MID_SCORE에 85, 72, 60 삽입 (가장 낮은 조건 기준)',
    ],
    points: 10,
  },
  {
    id: 'exam7_p27',
    title: '27. DELETE와 TRUNCATE의 차이 - 롤백 및 트리거',
    description:
      '다음 중 DELETE와 TRUNCATE에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 70,
    answer: '4',
    explanation:
      'DELETE는 DML 명령으로 WHERE 절로 조건 지정이 가능하고, ROLLBACK이 가능하며, 각 행 삭제 시 DELETE 트리거가 발생합니다. TRUNCATE는 DDL 명령으로 테이블의 모든 데이터를 삭제하며, 자동으로 COMMIT되어 ROLLBACK이 불가능합니다. TRUNCATE는 행 단위로 처리하지 않으므로 DML 트리거(DELETE 트리거)가 발생하지 않습니다. DELETE는 UNDO 세그먼트에 변경 정보를 기록하지만, TRUNCATE는 UNDO를 최소화합니다.',
    options: [
      'DELETE는 ROLLBACK이 가능하지만, TRUNCATE는 자동 COMMIT되어 ROLLBACK이 불가능하다.',
      'DELETE는 WHERE 절로 특정 행만 삭제할 수 있지만, TRUNCATE는 모든 행을 삭제한다.',
      'TRUNCATE는 DML 트리거를 발생시키지 않지만, DELETE는 각 행 삭제 시 트리거가 발생할 수 있다.',
      'TRUNCATE는 COMMIT 전에 ROLLBACK 구문을 실행하면 원상 복구가 가능하다.',
    ],
    points: 10,
  },

  // --- 서브쿼리 (28~32) ---
  {
    id: 'exam7_p28',
    title: '28. 스칼라 서브쿼리의 NULL 처리',
    description:
      '다음 쿼리 결과에서 DEPT_AVG 컬럼의 값으로 올바른 것은?\n\n-- EMP: EMPNO=9999, DEPTNO=99 (99번 부서에 이 직원만 존재)\n-- DEPT_STAT: DEPTNO, AVG_SAL (10, 20, 30번 부서 통계만 존재, 99번 없음)\n\nSELECT E.EMPNO,\n       (SELECT D.AVG_SAL\n        FROM   DEPT_STAT D\n        WHERE  D.DEPTNO = E.DEPTNO) AS DEPT_AVG\nFROM   EMP E\nWHERE  E.EMPNO = 9999;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 55,
    answer: '3',
    explanation:
      '스칼라 서브쿼리는 SELECT 절에서 서브쿼리를 사용하여 단일 값을 반환합니다. EMPNO=9999의 DEPTNO=99에 대해 DEPT_STAT에서 D.DEPTNO=99인 행을 조회하면 해당 행이 없습니다. 스칼라 서브쿼리가 행을 반환하지 않으면(0건) NULL을 반환합니다. 따라서 DEPT_AVG = NULL이 됩니다. 오류가 발생하지 않고 NULL이 반환되는 것이 스칼라 서브쿼리의 특징입니다.',
    options: [
      '0',
      '오류 발생 (ORA-01427: 단일 행 서브쿼리가 0행을 반환)',
      'NULL',
      '9999 부서의 평균 급여',
    ],
    points: 10,
  },
  {
    id: 'exam7_p29',
    title: '29. NOT IN과 NULL이 포함된 서브쿼리',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\n-- DEPT 테이블: DEPTNO = 10, 20, 30, 40\n-- EMP 테이블의 DEPTNO: 10, 20, NULL (30, 40은 없음)\n\nSELECT DEPTNO\nFROM   DEPT\nWHERE  DEPTNO NOT IN (\n         SELECT DEPTNO FROM EMP\n       );',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 25,
    answer: '4',
    explanation:
      'NOT IN (서브쿼리) 에서 서브쿼리 결과에 NULL이 포함되면 전체 결과가 빈 집합이 됩니다. NOT IN은 내부적으로 DEPTNO != 10 AND DEPTNO != 20 AND DEPTNO != NULL로 평가됩니다. DEPTNO != NULL은 항상 UNKNOWN이므로, NULL이 서브쿼리 결과에 있으면 모든 비교가 UNKNOWN이 되어 WHERE 조건이 UNKNOWN을 TRUE로 처리하지 않아 아무 행도 반환하지 않습니다. 이것이 NULL이 포함된 서브쿼리에서 NOT IN 사용 시 항상 빈 결과가 나오는 이유입니다.',
    options: [
      '30, 40 (EMP에 없는 부서)',
      '30, 40, NULL 포함 처리되어 30, 40 반환',
      '10, 20 (EMP에 있는 부서가 제외됨)',
      '빈 결과 (서브쿼리 결과에 NULL이 있어 모든 비교가 UNKNOWN)',
    ],
    points: 10,
  },
  {
    id: 'exam7_p30',
    title: '30. 인라인 뷰와 페이징 쿼리',
    description:
      '다음 Oracle 페이징 쿼리에서 3번째부터 5번째 행(ROWNUM 기준)을 가져오는 올바른 쿼리는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 48,
    answer: '2',
    explanation:
      'Oracle에서 ROWNUM은 결과가 반환되면서 순차적으로 부여됩니다. WHERE ROWNUM BETWEEN 3 AND 5는 작동하지 않는데, ROWNUM >= 3 조건이 처음부터 TRUE가 될 수 없기 때문입니다(첫 행의 ROWNUM=1은 3이 아니므로 제외, 두 번째 행도 제외... 결국 빈 결과). 올바른 방법은 인라인 뷰에서 ROWNUM을 별칭으로 저장한 후 외부 쿼리에서 조건을 적용하는 것입니다.',
    options: [
      'SELECT * FROM EMP WHERE ROWNUM BETWEEN 3 AND 5',
      'SELECT * FROM (SELECT ROWNUM AS RN, E.* FROM EMP E) WHERE RN BETWEEN 3 AND 5',
      'SELECT * FROM EMP WHERE ROWNUM >= 3 AND ROWNUM <= 5',
      'SELECT * FROM EMP WHERE ROWNUM IN (3, 4, 5)',
    ],
    points: 10,
  },
  {
    id: 'exam7_p31',
    title: '31. 상관 서브쿼리와 EXISTS 성능',
    description:
      '다음 두 쿼리 A, B의 의미상 동일성 및 성능 특성에 대한 설명으로 올바른 것은?\n\n[쿼리 A]\nSELECT DEPTNO FROM DEPT D\nWHERE EXISTS (\n  SELECT 1 FROM EMP E WHERE E.DEPTNO = D.DEPTNO\n);\n\n[쿼리 B]\nSELECT DISTINCT DEPTNO\nFROM   EMP;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 32,
    answer: '3',
    explanation:
      '쿼리 A는 EMP에 사원이 있는 부서를 DEPT 기준으로 조회합니다(DEPT에 있는 부서 중 EMP에도 존재하는 것). 쿼리 B는 EMP에 있는 모든 부서를 조회합니다. 만약 EMP.DEPTNO에 DEPT에 없는 값이 있다면(참조 무결성이 강제되지 않는 경우) 두 쿼리는 결과가 다를 수 있습니다. EXISTS는 첫 번째 매칭 행을 찾으면 즉시 TRUE를 반환하므로 IN보다 효율적일 수 있습니다. 두 쿼리의 결과는 DEPT.DEPTNO가 EMP.DEPTNO의 상위 집합인 경우에만 같습니다.',
    options: [
      '두 쿼리는 항상 동일한 결과를 반환하므로 성능 측면에서만 차이가 있다.',
      '쿼리 B가 항상 더 많은 결과를 반환한다.',
      'EMP.DEPTNO에 DEPT에 없는 값이 있으면 쿼리 B가 더 많은 부서를 반환할 수 있으며, EXISTS는 첫 매칭 시 즉시 검색을 중단하여 IN보다 효율적일 수 있다.',
      '쿼리 A가 항상 더 많은 결과를 반환한다. DEPT 기준이므로 EMP에 없는 부서도 포함된다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p32',
    title: '32. WITH 절(CTE)과 재귀 쿼리',
    description:
      '다음 WITH 절 쿼리의 실행 결과 행 수로 올바른 것은?\n\nWITH CTE AS (\n  SELECT 1 AS N FROM DUAL\n  UNION ALL\n  SELECT N + 1 FROM CTE WHERE N < 5\n)\nSELECT N FROM CTE;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 50,
    answer: '3',
    explanation:
      '재귀 WITH 절(Recursive CTE)은 초기 집합에서 시작하여 종료 조건까지 반복 실행합니다. 초기: N=1. 재귀 단계: N+1이 WHERE N < 5를 만족하는 동안 반복. N=1 → 2, N=2 → 3, N=3 → 4, N=4 → 5, N=5 → WHERE N<5 FALSE로 종료. 결과: 1, 2, 3, 4, 5 → 5행. 단, Oracle에서는 일반 WITH 절이 재귀를 기본 지원하지 않으며, 표준 SQL 또는 Oracle 11gR2+에서 WITH ... CYCLE/SEARCH 문법을 사용합니다. 문제는 표준 SQL 재귀 CTE 기준입니다.',
    options: ['4행', '6행', '5행', '무한 루프로 오류 발생'],
    points: 10,
  },

  // --- 윈도우 함수 (33~36) ---
  {
    id: 'exam7_p33',
    title: '33. ROWS vs RANGE 프레임 비교',
    description:
      '다음 두 쿼리의 결과가 다를 수 있는 경우는?\n\n[쿼리 A - ROWS]\nSELECT SAL, SUM(SAL) OVER (\n  ORDER BY SAL\n  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n) AS CUM_SUM\nFROM EMP_DATA;\n\n[쿼리 B - RANGE]\nSELECT SAL, SUM(SAL) OVER (\n  ORDER BY SAL\n  RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n) AS CUM_SUM\nFROM EMP_DATA;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 28,
    answer: '2',
    explanation:
      'ROWS 프레임은 물리적 행 위치를 기준으로, RANGE 프레임은 논리적 값 범위를 기준으로 합니다. 동일한 SAL 값이 여러 행에 있을 때 차이가 발생합니다. ROWS CURRENT ROW는 현재 물리적 행만 포함하므로 동일 SAL 행들이 각각 다른 누적합을 가집니다. RANGE CURRENT ROW는 현재 행과 동일한 SAL 값을 가진 모든 행을 현재 프레임에 포함하므로, 동일 SAL 행들이 모두 같은 누적합(동일 SAL 모두 합산된 값)을 가집니다.',
    options: [
      '두 쿼리는 항상 동일한 결과를 반환한다.',
      'SAL 값이 중복된 행이 있을 때, ROWS는 행마다 다른 누적합을, RANGE는 동일 SAL 행끼리 같은 누적합을 반환한다.',
      'ROWS가 항상 더 큰 누적합을 반환한다.',
      'RANGE는 ORDER BY가 없으면 전체 파티션을 프레임으로 사용하지만 ROWS는 현재 행만 사용한다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p34',
    title: '34. RANK, DENSE_RANK, ROW_NUMBER 비교',
    description:
      '다음 쿼리 결과에서 EMP_ID=5의 각 함수 값으로 올바른 것은?\n\n-- SCORE 데이터 (ORDER BY SCORE DESC 기준):\n-- EMP_ID  SCORE\n-- 1       100\n-- 2       90\n-- 3       90\n-- 4       80\n-- 5       80\n\nSELECT EMP_ID,\n       RANK() OVER (ORDER BY SCORE DESC) AS RK,\n       DENSE_RANK() OVER (ORDER BY SCORE DESC) AS DRK,\n       ROW_NUMBER() OVER (ORDER BY SCORE DESC) AS RN\nFROM SCORE_TABLE;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 48,
    answer: '4',
    explanation:
      'SCORE 순서: 100(1위), 90(2위=2명), 80(4위=2명).\nEMP_ID=5의 SCORE=80:\n- RANK(): 동점자 수를 건너뜀. 100이 1위, 90이 2명 2위, 80은 4위(2명이 90으로 2, 3위를 차지하므로 다음은 4위). RANK=4.\n- DENSE_RANK(): 동점자가 있어도 연속 순위. 100=1, 90=2, 80=3. DENSE_RANK=3.\n- ROW_NUMBER(): 물리적 행 번호. 100, 90, 90, 80, 80 순서에서 EMP_ID=5가 5번째(정렬 후 ORDER가 보장되지 않아 4 또는 5가 될 수 있지만 일반적으로 5번째로 처리). RN=5(또는 4, 순서 비결정적).\n보기에서 가장 정확한 답: RANK=4, DENSE_RANK=3, RN=5',
    options: [
      'RK=4, DRK=4, RN=4',
      'RK=3, DRK=3, RN=5',
      'RK=4, DRK=3, RN=4',
      'RK=4, DRK=3, RN=5',
    ],
    points: 10,
  },
  {
    id: 'exam7_p35',
    title: '35. LAG 함수와 NULLS 처리',
    description:
      '다음 쿼리에서 ORDER_DATE=\'2024-03-01\'인 행의 PREV_AMOUNT 값으로 올바른 것은?\n\n-- SALES 데이터 (ORDER BY ORDER_DATE):\n-- ORDER_DATE   AMOUNT\n-- 2024-01-01   1000\n-- 2024-02-01   NULL\n-- 2024-03-01   1500\n\nSELECT ORDER_DATE, AMOUNT,\n       LAG(AMOUNT, 2, -1) OVER (ORDER BY ORDER_DATE) AS PREV_AMOUNT\nFROM SALES;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 32,
    answer: '1',
    explanation:
      'LAG(value, offset, default)는 현재 행에서 offset 행 이전의 값을 반환합니다. 반환할 행이 없으면 default 값을 반환합니다.\n- ORDER_DATE=\'2024-03-01\'은 세 번째 행\n- LAG(AMOUNT, 2, -1): 2행 이전 = 첫 번째 행(2024-01-01)의 AMOUNT\n- 첫 번째 행의 AMOUNT = 1000\n- 결과: 1000\n\n주의: offset=2이므로 두 번째 행(NULL)을 건너뛰고 첫 번째 행의 값을 가져옵니다. default(-1)는 이전 행이 존재하지 않을 때만 사용됩니다.',
    options: ['1000', 'NULL', '-1', '1500'],
    points: 10,
  },
  {
    id: 'exam7_p36',
    title: '36. NTILE과 버킷 분배',
    description:
      '다음 쿼리에서 7개 행을 3개 버킷으로 나눌 때 각 버킷의 행 수는?\n\nSELECT EMPNO, SAL,\n       NTILE(3) OVER (ORDER BY SAL DESC) AS BUCKET\nFROM EMP_7\nORDER BY SAL DESC;\n\n-- EMP_7: 7개 행 (SAL: 5000, 4000, 3000, 2500, 2000, 1500, 1000)',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 50,
    answer: '2',
    explanation:
      'NTILE(n)은 정렬된 행을 n개의 버킷으로 균등 분배합니다. 7행을 3버킷으로 나누면: 7 ÷ 3 = 2 나머지 1. 나머지가 있으면 앞 버킷부터 1개씩 추가로 배정합니다. 버킷 1: 3행 (5000, 4000, 3000), 버킷 2: 2행 (2500, 2000), 버킷 3: 2행 (1500, 1000).\n따라서 버킷1=3행, 버킷2=2행, 버킷3=2행.',
    options: [
      '버킷1=2행, 버킷2=2행, 버킷3=3행',
      '버킷1=3행, 버킷2=2행, 버킷3=2행',
      '버킷1=3행, 버킷2=3행, 버킷3=1행',
      '버킷1=2행, 버킷2=3행, 버킷3=2행',
    ],
    points: 10,
  },

  // --- 집합연산 (37~40) ---
  {
    id: 'exam7_p37',
    title: '37. UNION ALL vs UNION과 중복 제거',
    description:
      '다음 쿼리의 결과 행 수로 올바른 것은?\n\nSELECT 1 AS N FROM DUAL\nUNION ALL\nSELECT 1 FROM DUAL\nUNION\nSELECT 2 FROM DUAL\nUNION ALL\nSELECT 2 FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 25,
    answer: '3',
    explanation:
      'SQL 집합 연산의 우선순위: INTERSECT > UNION, UNION ALL, EXCEPT (동일 우선순위, 위에서 아래로 순서대로). 실제로는 순서대로 처리:\n1. SELECT 1 UNION ALL SELECT 1 → {1, 1}\n2. {1, 1} UNION SELECT 2 → {1, 2} (UNION은 중복 제거, 1이 2개이므로 1개로 통합)\n3. {1, 2} UNION ALL SELECT 2 → {1, 2, 2}\n최종 결과: 1, 2, 2 → 3행.',
    options: ['2행', '4행', '3행', '1행'],
    points: 10,
  },
  {
    id: 'exam7_p38',
    title: '38. INTERSECT와 NULL 동등성',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\nSELECT NULL AS COL FROM DUAL\nINTERSECT\nSELECT NULL AS COL FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 72,
    answer: '1',
    explanation:
      'INTERSECT 및 집합 연산(UNION, MINUS 등)에서는 NULL 비교가 일반 WHERE 절과 다릅니다. WHERE 절에서 NULL = NULL은 UNKNOWN이지만, 집합 연산에서는 NULL 값이 같다고 처리하여 중복 제거 및 교집합에 포함됩니다. 따라서 SELECT NULL INTERSECT SELECT NULL은 NULL 1행을 반환합니다. 이것은 SQL 표준의 특별한 처리입니다.',
    options: [
      'NULL 값 1행 반환 (집합 연산에서 NULL은 같은 값으로 처리)',
      '0행 반환 (NULL = NULL은 UNKNOWN이므로 교집합 없음)',
      '오류 발생 (NULL 컬럼으로 집합 연산 불가)',
      '2행 반환 (UNION ALL처럼 처리)',
    ],
    points: 10,
  },
  {
    id: 'exam7_p39',
    title: '39. MINUS(EXCEPT)와 ORDER BY 위치',
    description:
      '다음 집합 연산 쿼리에서 문법 오류가 발생하는 것은?\n\n[쿼리 A]\nSELECT DEPTNO FROM DEPT\nMINUS\nSELECT DEPTNO FROM EMP\nORDER BY DEPTNO;\n\n[쿼리 B]\nSELECT DEPTNO FROM DEPT\nORDER BY DEPTNO\nMINUS\nSELECT DEPTNO FROM EMP;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 55,
    answer: '2',
    explanation:
      'SQL 집합 연산에서 ORDER BY는 전체 집합 연산의 최종 결과에 대해 한 번만, 마지막에 작성해야 합니다. 쿼리 A는 전체 집합 연산(DEPT MINUS EMP) 후 ORDER BY를 적용하므로 올바른 문법입니다. 쿼리 B는 첫 번째 SELECT에 ORDER BY를 적용하려 하는데, 이는 집합 연산 중간에 ORDER BY가 위치하는 형태이므로 문법 오류입니다. Oracle을 포함한 대부분의 DBMS에서 이 경우 에러가 발생합니다.',
    options: [
      '쿼리 A에서 오류 발생 (MINUS 후 ORDER BY는 불가)',
      '쿼리 B에서 오류 발생 (집합 연산 중간에 ORDER BY 불가)',
      '두 쿼리 모두 오류 없이 실행된다.',
      '두 쿼리 모두 오류가 발생한다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p40',
    title: '40. 집합연산과 컬럼 수/타입 제약',
    description:
      '다음 집합 연산 쿼리 중 오류가 발생하는 것은?\n\n[쿼리 A]\nSELECT EMPNO, ENAME FROM EMP\nUNION\nSELECT DEPTNO, DNAME FROM DEPT;\n\n[쿼리 B]\nSELECT EMPNO, ENAME, NULL FROM EMP\nUNION\nSELECT DEPTNO, DNAME, LOC FROM DEPT;\n\n[쿼리 C]\nSELECT EMPNO, TO_CHAR(HIREDATE, \'YYYY\') FROM EMP\nUNION\nSELECT DEPTNO, DNAME FROM DEPT;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 45,
    answer: '4',
    explanation:
      '집합 연산의 규칙: 컬럼 수가 동일해야 하고, 대응하는 컬럼의 데이터 타입이 호환 가능해야 합니다. 쿼리 A: EMPNO(NUMBER)-DEPTNO(NUMBER), ENAME(VARCHAR2)-DNAME(VARCHAR2) → 타입 호환 → 정상. 쿼리 B: 컬럼 수 동일(3개), NULL은 어떤 타입에도 호환 → 정상. 쿼리 C: TO_CHAR(HIREDATE, \'YYYY\')는 문자(VARCHAR2), DNAME도 VARCHAR2 → 타입 호환 → 정상. 모두 오류가 없습니다. 쿼리 A, B, C 모두 정상이므로, 오류 발생 옵션은 "모두 정상 실행"입니다. 보기 4번이 정답.',
    options: [
      '쿼리 A (EMPNO와 DEPTNO의 타입이 다름)',
      '쿼리 B (NULL을 컬럼으로 사용 불가)',
      '쿼리 C (날짜와 문자 타입 불일치)',
      '모두 오류 없이 실행된다.',
    ],
    points: 10,
  },

  // --- DDL (41~44) ---
  {
    id: 'exam7_p41',
    title: '41. 제약조건 추가와 ENABLE VALIDATE',
    description:
      '기존에 데이터가 있는 테이블에 NOT NULL 제약조건을 추가하는 다음 ALTER 문의 실행 결과로 올바른 것은?\n\n-- EMPLOYEE 테이블에 EMAIL 컬럼 존재, 일부 행에 NULL 값 있음\nALTER TABLE EMPLOYEE MODIFY EMAIL NOT NULL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 52,
    answer: '2',
    explanation:
      '기존 테이블에 NOT NULL 제약조건을 추가할 때, 이미 해당 컬럼에 NULL 값이 존재하면 제약조건 추가가 실패합니다. Oracle에서 ORA-02296 오류가 발생합니다. NOT NULL은 NOVALIDATE 옵션을 사용하면 기존 데이터 검증 없이 제약조건을 추가할 수 있지만(새로운 DML에만 적용), 기본 VALIDATE 옵션에서는 기존 데이터도 검사하여 NULL이 있으면 오류가 납니다.',
    options: [
      '제약조건이 성공적으로 추가되고 기존 NULL 값은 기본값으로 자동 변환된다.',
      '기존 데이터에 NULL 값이 있으므로 제약조건 추가가 실패한다.',
      '제약조건이 추가되지만 기존 NULL 값은 유지되고 새로운 INSERT에만 NOT NULL이 적용된다.',
      'NULL 값이 있는 행은 자동으로 삭제되고 나머지 행에 제약조건이 적용된다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p42',
    title: '42. CASCADE CONSTRAINTS와 참조 테이블',
    description:
      '다음 DDL 실행 시 결과로 올바른 것은?\n\n-- PARENT_TABLE: PK(PARENT_ID)\n-- CHILD_TABLE: FK(PARENT_ID) REFERENCES PARENT_TABLE(PARENT_ID)\n\nDROP TABLE PARENT_TABLE CASCADE CONSTRAINTS;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 58,
    answer: '3',
    explanation:
      'DROP TABLE ... CASCADE CONSTRAINTS는 해당 테이블의 기본키(PK)를 참조하는 자식 테이블의 외래키(FK) 제약조건을 자동으로 삭제한 후 테이블을 삭제합니다. 이 명령으로 PARENT_TABLE은 삭제되고, CHILD_TABLE의 FK 제약조건도 삭제됩니다. 단, CHILD_TABLE 자체는 삭제되지 않습니다 - 테이블 구조와 데이터는 그대로 남고, 외래키 제약조건만 제거됩니다.',
    options: [
      'PARENT_TABLE과 CHILD_TABLE 모두 삭제된다.',
      'CHILD_TABLE이 먼저 삭제되고 PARENT_TABLE이 삭제된다.',
      'PARENT_TABLE만 삭제되고 CHILD_TABLE의 FK 제약조건은 삭제되지만 CHILD_TABLE은 유지된다.',
      'CASCADE CONSTRAINTS가 있어도 FK를 가진 자식 테이블이 있으면 오류가 발생한다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p43',
    title: '43. 뷰(View) 생성과 WITH CHECK OPTION',
    description:
      '다음 뷰 생성 후 INSERT 실행 시 결과로 올바른 것은?\n\nCREATE OR REPLACE VIEW V_DEPT10 AS\nSELECT EMPNO, ENAME, DEPTNO\nFROM   EMP\nWHERE  DEPTNO = 10\nWITH CHECK OPTION;\n\nINSERT INTO V_DEPT10 (EMPNO, ENAME, DEPTNO)\nVALUES (9999, \'TESTER\', 20);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DDL',
    correctRate: 35,
    answer: '2',
    explanation:
      'WITH CHECK OPTION은 뷰를 통한 DML 작업 시 WHERE 조건을 위반하는 변경을 방지합니다. 이 뷰는 DEPTNO = 10인 행만 보여주는데, DEPTNO = 20으로 INSERT를 시도하면 WITH CHECK OPTION이 이를 거부하고 오류를 발생시킵니다(ORA-01402: view WITH CHECK OPTION where-clause violation). 뷰의 WHERE 조건(DEPTNO = 10)을 벗어나는 행을 생성하려는 시도가 차단됩니다.',
    options: [
      'EMP 테이블에 DEPTNO=20인 행이 정상 삽입된다. (뷰는 조회 조건과 다른 데이터 삽입 가능)',
      'ORA-01402 오류 발생. WITH CHECK OPTION이 DEPTNO ≠ 10인 삽입을 차단한다.',
      '행은 삽입되지만 뷰에서는 보이지 않는다.',
      '뷰가 READ ONLY 속성이 없으므로 삽입은 성공하나 뷰가 자동으로 DEPTNO=10으로 변경한다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p44',
    title: '44. 인덱스 컬럼 순서와 선두 컬럼 원칙',
    description:
      '다음 인덱스와 쿼리에서 인덱스가 활용(선두 컬럼 조건 포함)되는 경우는?\n\n-- 인덱스: IDX_ORDER (CUST_ID, ORDER_DATE, STATUS)\n\n[쿼리 A] WHERE CUST_ID = 100 AND STATUS = \'DONE\'\n[쿼리 B] WHERE ORDER_DATE = \'2024-01-01\' AND STATUS = \'DONE\'\n[쿼리 C] WHERE CUST_ID = 100 AND ORDER_DATE >= \'2024-01-01\'\n[쿼리 D] WHERE STATUS = \'DONE\'',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 55,
    answer: '3',
    explanation:
      '복합 인덱스 IDX_ORDER (CUST_ID, ORDER_DATE, STATUS)는 선두 컬럼인 CUST_ID가 조건에 포함될 때 인덱스를 효율적으로 활용할 수 있습니다. 쿼리 A: CUST_ID(선두) 있음 → 인덱스 활용. STATUS는 CUST_ID 이후 연속이 아니지만 CUST_ID로 범위를 좁힌 후 STATUS 필터는 가능(부분 활용). 쿼리 B: ORDER_DATE만 있고 선두 CUST_ID 없음 → 인덱스 스캔 비효율. 쿼리 C: CUST_ID(선두) + ORDER_DATE(두 번째) → 가장 효율적 활용. 쿼리 D: STATUS만 있고 선두 없음 → 인덱스 활용 어려움. A와 C 모두 활용되지만, 선두+두 번째까지 조건이 있는 C가 가장 효율적입니다.',
    options: [
      '쿼리 B와 D만 인덱스를 활용한다.',
      '쿼리 D만 인덱스를 활용한다.',
      '쿼리 A와 쿼리 C가 인덱스를 활용하며, 쿼리 C가 가장 효율적이다.',
      '모든 쿼리가 동등하게 인덱스를 활용한다.',
    ],
    points: 10,
  },

  // --- TCL (45~47) ---
  {
    id: 'exam7_p45',
    title: '45. SAVEPOINT와 부분 롤백',
    description:
      '다음 트랜잭션 실행 순서에서 최종 커밋 후 테이블에 남아 있는 데이터로 올바른 것은?\n\n-- 초기: TABLE_T 비어 있음\nINSERT INTO TABLE_T VALUES (1);\nSAVEPOINT SP1;\nINSERT INTO TABLE_T VALUES (2);\nINSERT INTO TABLE_T VALUES (3);\nSAVEPOINT SP2;\nINSERT INTO TABLE_T VALUES (4);\nROLLBACK TO SP1;\nINSERT INTO TABLE_T VALUES (5);\nCOMMIT;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 30,
    answer: '3',
    explanation:
      '단계별 분석:\n1. INSERT 1 → {1}\n2. SAVEPOINT SP1 → SP1 지점\n3. INSERT 2, INSERT 3 → {1, 2, 3}\n4. SAVEPOINT SP2 → SP2 지점\n5. INSERT 4 → {1, 2, 3, 4}\n6. ROLLBACK TO SP1 → SP1 이후의 모든 변경(INSERT 2, 3, 4 취소, SP2도 무효화) → {1}\n7. INSERT 5 → {1, 5}\n8. COMMIT → 최종 확정\n\n최종 데이터: 1, 5',
    options: [
      '1, 2, 3, 5 (SP2까지만 롤백하고 SP1 이전 데이터 유지)',
      '1, 5, 4 (ROLLBACK TO SP1이 SP2 이전으로만 롤백)',
      '1, 5 (SP1으로 롤백 후 INSERT 5, COMMIT)',
      '5만 존재 (ROLLBACK이 모든 데이터를 지움)',
    ],
    points: 10,
  },
  {
    id: 'exam7_p46',
    title: '46. 트랜잭션 격리 수준과 팬텀 리드',
    description:
      '다음 중 REPEATABLE READ 격리 수준에서도 발생할 수 있는 현상으로 올바른 것은?\n\n[상황]\n트랜잭션 T1: SELECT COUNT(*) FROM ORDERS WHERE STATUS = \'PENDING\' (결과: 5건)\n트랜잭션 T2: INSERT INTO ORDERS (STATUS) VALUES (\'PENDING\'); COMMIT;\n트랜잭션 T1: SELECT COUNT(*) FROM ORDERS WHERE STATUS = \'PENDING\' (결과: ?)',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 28,
    answer: '2',
    explanation:
      '트랜잭션 격리 수준별 발생 현상:\n- READ UNCOMMITTED: 더티 리드, 비반복 읽기, 팬텀 리드 모두 발생\n- READ COMMITTED: 비반복 읽기, 팬텀 리드 발생\n- REPEATABLE READ: 팬텀 리드만 발생\n- SERIALIZABLE: 발생 안 함\n\nREPEATABLE READ는 동일 행의 데이터가 트랜잭션 내에서 변경되지 않음을 보장하지만(비반복 읽기 방지), 다른 트랜잭션이 INSERT한 새로운 행이 보이는 팬텀 리드는 막지 못합니다. T2가 커밋 후 T1이 다시 조회하면 6건을 볼 수 있습니다.',
    options: [
      '더티 리드 (Dirty Read). T2가 커밋하기 전 데이터를 T1이 읽는 현상',
      '팬텀 리드 (Phantom Read). T2의 INSERT 커밋 후 T1의 재조회 시 새로운 행이 나타나는 현상',
      '비반복 읽기 (Non-Repeatable Read). T2가 기존 행을 UPDATE 후 T1의 재조회 시 값이 달라지는 현상',
      'REPEATABLE READ에서는 위의 어떤 현상도 발생하지 않는다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p47',
    title: '47. DDL과 트랜잭션 자동 COMMIT',
    description:
      '다음 실행 시퀀스 후 롤백 가능한 작업으로 올바른 것은?\n\nINSERT INTO T VALUES (1);  -- ①\nINSERT INTO T VALUES (2);  -- ②\nCREATE TABLE T2 (ID NUMBER); -- ③ (DDL)\nINSERT INTO T VALUES (3);  -- ④\nROLLBACK;                  -- ⑤',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'TCL',
    correctRate: 55,
    answer: '4',
    explanation:
      'Oracle에서 DDL 문(CREATE, DROP, ALTER 등)은 실행 전 현재 트랜잭션을 자동으로 COMMIT하고, DDL 자체도 완료 후 자동 COMMIT됩니다. 따라서 ③ CREATE TABLE T2 실행 시 ①과 ②의 INSERT가 자동 커밋됩니다. ③ DDL 자체도 커밋됩니다. ④ INSERT INTO T VALUES (3)은 새 트랜잭션으로 시작됩니다. ⑤ ROLLBACK은 새 트랜잭션(④)만 롤백합니다. 최종: T에는 1, 2가 영구 저장, 3은 롤백. T2는 유지.',
    options: [
      '① ② ③ ④ 모두 롤백된다.',
      '③ DDL만 자동 커밋되고 ① ② ④는 모두 롤백된다.',
      '① ② ③이 자동 커밋되어 T에 1, 2, T2가 유지되고 ④도 커밋된다.',
      '① ②는 DDL 실행 전 자동 커밋, ③은 DDL 후 자동 커밋, ④만 ROLLBACK으로 취소된다.',
    ],
    points: 10,
  },

  // --- DCL (48) ---
  {
    id: 'exam7_p48',
    title: '48. GRANT OPTION과 권한 회수 연쇄',
    description:
      '다음 권한 부여 시나리오에서 REVOKE 실행 후 결과로 올바른 것은?\n\n-- 권한 부여 순서:\n-- 1. ADMIN이 USER_A에게 SELECT ON T WITH GRANT OPTION 부여\n-- 2. USER_A가 USER_B에게 SELECT ON T 부여 (WITH GRANT OPTION 없음)\n-- 3. USER_B가 USER_C에게 SELECT ON T 부여 시도\n\n-- 이후:\nREVOKE SELECT ON T FROM USER_A; -- ADMIN이 실행',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DCL',
    correctRate: 30,
    answer: '3',
    explanation:
      '권한 부여 체계:\n- ADMIN → USER_A (WITH GRANT OPTION 있음)\n- USER_A → USER_B (WITH GRANT OPTION 없음)\n- USER_B는 GRANT OPTION이 없으므로 USER_C에게 권한 부여 불가(오류 발생)\n\nADMIN이 USER_A의 권한을 회수(REVOKE)하면:\n- Oracle의 경우 WITH GRANT OPTION으로 부여된 권한을 회수하면 연쇄적으로(CASCADE) USER_A가 부여한 USER_B의 권한도 회수됩니다.\n- 따라서 USER_A, USER_B 모두 SELECT ON T 권한을 상실합니다.',
    options: [
      'USER_A만 권한을 잃고, USER_B는 이미 부여받은 권한을 유지한다.',
      'USER_A, USER_B, USER_C 모두 권한을 잃는다 (USER_C에게도 권한이 부여되어 있다고 가정).',
      'USER_A와 USER_B 모두 권한을 잃는다 (WITH GRANT OPTION 연쇄 회수).',
      'REVOKE는 직접 부여한 USER_A에게만 적용되므로 USER_B는 영향받지 않는다.',
    ],
    points: 10,
  },

  // --- 계층형 쿼리 (49~50) ---
  {
    id: 'exam7_p49',
    title: '49. CONNECT BY NOCYCLE과 순환 데이터',
    description:
      '다음 계층형 쿼리에서 NOCYCLE 없이 실행했을 때 오류가 발생하는 경우는?\n\n-- 조직 데이터:\n-- NODE_ID  PARENT_ID  NAME\n-- 1        NULL       ROOT\n-- 2        1          A\n-- 3        2          B\n-- 4        3          C\n-- 5        4          D\n\n-- 데이터 변경: UPDATE SET PARENT_ID=5 WHERE NODE_ID=2 (B→C→D→A→B 순환 생성)\n\nSELECT NODE_ID, NAME, LEVEL\nFROM   ORG\nSTART WITH PARENT_ID IS NULL\nCONNECT BY PRIOR NODE_ID = PARENT_ID;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '계층형쿼리',
    correctRate: 75,
    answer: '1',
    explanation:
      '계층형 쿼리에서 데이터에 순환 참조(Cycle)가 있으면 CONNECT BY가 무한 루프에 빠져 ORA-01436: CONNECT BY loop in user data 오류가 발생합니다. UPDATE 후 NODE_ID=2(A)의 PARENT_ID=5(D)로 변경되면 A→B(2→3)→C(3→4)→D(4→5)→A(5→2) 순환이 생성됩니다. 이때 NOCYCLE 없이 실행하면 Oracle은 순환 루프를 감지하고 오류를 발생시킵니다. NOCYCLE을 추가하면 순환 감지 시 해당 경로를 중단하고 CONNECT_BY_ISCYCLE 컬럼으로 순환 여부를 확인할 수 있습니다.',
    options: [
      'ORA-01436 오류 발생 (CONNECT BY loop in user data). 순환 참조로 무한 루프 감지.',
      '순환 참조가 있어도 Oracle이 자동으로 중복 방지하여 정상 결과를 반환한다.',
      '결과 없음 (0행). 순환 참조 감지 시 빈 결과를 반환한다.',
      'LEVEL 값이 계속 증가하며 쿼리가 무한히 실행된다.',
    ],
    points: 10,
  },
  {
    id: 'exam7_p50',
    title: '50. CONNECT BY와 PRIOR 방향 제어',
    description:
      '다음 두 계층형 쿼리의 조회 방향에 대한 설명으로 올바른 것은?\n\n-- ORG 테이블: EMP_ID, MANAGER_ID\n-- START WITH EMP_ID = 500 (특정 직원)\n\n[쿼리 A]\nSELECT EMP_ID, LEVEL\nFROM   ORG\nSTART WITH EMP_ID = 500\nCONNECT BY PRIOR EMP_ID = MANAGER_ID;\n\n[쿼리 B]\nSELECT EMP_ID, LEVEL\nFROM   ORG\nSTART WITH EMP_ID = 500\nCONNECT BY PRIOR MANAGER_ID = EMP_ID;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '계층형쿼리',
    correctRate: 70,
    answer: '2',
    explanation:
      'CONNECT BY PRIOR에서 PRIOR는 부모(이전 레벨)를 의미합니다.\n\n[쿼리 A] PRIOR EMP_ID = MANAGER_ID: "현재 행의 MANAGER_ID가 부모 행의 EMP_ID와 같다" → 부모에서 자식 방향(하향식, 관리자→부하직원)\nEMP_ID=500에서 시작하여 500이 관리자인 하위 직원들을 탐색합니다.\n\n[쿼리 B] PRIOR MANAGER_ID = EMP_ID: "현재 행의 EMP_ID가 부모 행의 MANAGER_ID와 같다" → 자식에서 부모 방향(상향식, 부하직원→관리자)\nEMP_ID=500에서 시작하여 500의 상위 관리자 체계를 탐색합니다.',
    options: [
      '두 쿼리 모두 EMP_ID=500부터 하향식(하위 조직)을 조회한다.',
      '쿼리 A는 EMP_ID=500부터 하향식(부하직원 방향), 쿼리 B는 상향식(관리자 방향)으로 조회한다.',
      '쿼리 A는 EMP_ID=500부터 상향식(관리자 방향), 쿼리 B는 하향식(부하직원 방향)으로 조회한다.',
      '두 쿼리 모두 EMP_ID=500의 직계 상위/하위 1단계만 반환한다.',
    ],
    points: 10,
  },
];
