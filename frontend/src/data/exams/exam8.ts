import type { Problem } from '../../types';

// SQLD 모의고사 8회 (고급 난이도 - 목표 합격률 ~40%)
// 1과목: 데이터 모델링의 이해 (10문항, 20점)
// 2과목: SQL 기본 및 활용 (40문항, 80점)
// 난이도 배분: easy 8 / medium 22 / hard 20

export const EXAM_8_PROBLEMS: Problem[] = [
  // ===== 1과목: 데이터 모델링의 이해 (1~10번) =====
  // --- 데이터모델링 (1~5) ---
  {
    id: 'exam8_p1',
    title: '1. ERD 비즈니스 규칙 분석',
    description:
      '다음 비즈니스 규칙을 분석하여 올바른 ERD를 선택하라.\n\n[비즈니스 규칙]\n- 한 고객은 여러 개의 주문을 할 수 있다.\n- 하나의 주문에는 반드시 하나 이상의 주문 항목이 포함된다.\n- 하나의 주문 항목은 하나의 상품을 가리킨다.\n- 상품은 여러 카테고리에 속할 수 있고, 카테고리는 여러 상품을 포함할 수 있다.\n- 고객은 반드시 하나의 등급을 가진다.\n\n위 규칙을 올바르게 표현한 ERD 설명은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 35,
    answer: '3',
    explanation:
      '비즈니스 규칙을 분석하면: 고객(1):주문(N) - 필수참여(주문은 반드시 고객이 있어야 함), 주문(1):주문항목(N) - 주문항목은 필수 1개 이상, 주문항목(N):상품(1) - 주문항목은 반드시 하나의 상품, 상품(N):카테고리(M) - 다대다 관계이므로 중간 테이블(상품_카테고리) 필요, 고객(N):등급(1) - 고객은 필수적으로 하나의 등급 보유. 따라서 상품-카테고리 간에 연결 테이블이 존재하고, 고객-등급은 N:1 필수 관계가 올바른 ERD입니다.',
    options: [
      '고객(1):주문(N), 주문(1):주문항목(N), 주문항목(N):상품(M), 상품(1):카테고리(N), 고객(1):등급(1)',
      '고객(N):주문(M), 주문(1):주문항목(N), 주문항목(1):상품(1), 상품(N):카테고리(M), 고객(N):등급(1)',
      '고객(1):주문(N), 주문(1):주문항목(N), 주문항목(N):상품(1), 상품(N):카테고리(M) with 중간테이블, 고객(N):등급(1)',
      '고객(1):주문(N), 주문(N):주문항목(M), 주문항목(1):상품(N), 상품(1):카테고리(N), 고객(1):등급(N)',
    ],
    points: 10,
  },
  {
    id: 'exam8_p2',
    title: '2. 엔터티 식별자 선택 기준',
    description:
      '다음 중 주식별자(Primary Identifier) 선택 기준으로 가장 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 75,
    answer: '4',
    explanation:
      '주식별자는 유일성(모든 인스턴스를 유일하게 식별), 최소성(필요한 최소한의 속성만 사용), 불변성(값이 변경되지 않음), 존재성(NULL이 될 수 없음)을 만족해야 합니다. 주식별자의 속성 수가 많을수록 식별력이 높아진다는 것은 틀린 설명입니다. 오히려 최소성 원칙에 따라 필요한 최소 속성만으로 구성해야 하며, 속성 수가 많으면 FK로 참조할 때 복잡해지고 인덱스 효율도 낮아집니다.',
    options: [
      '주식별자는 NULL 값을 가질 수 없어야 한다.',
      '주식별자의 값은 가능한 한 변경되지 않는 속성으로 선택한다.',
      '복합 식별자보다는 단일 속성 식별자가 FK 참조 시 관리가 편리하다.',
      '주식별자를 구성하는 속성 수가 많을수록 식별력이 높아져 더 좋다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p3',
    title: '3. 관계의 카디널리티와 선택성',
    description:
      '다음 ERD 관계 표기에 대한 설명으로 올바른 것은?\n\n직원 ||--o{ 부서배치 : "소속"\n부서 ||--o{ 부서배치 : "포함"\n\n(|| = 필수 1, o{ = 선택 다수)',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 45,
    answer: '2',
    explanation:
      '위 ERD는 직원-부서 간의 다대다(M:N) 관계를 부서배치 중간 테이블로 해소한 구조입니다. 직원 입장에서 부서배치는 선택적(0개 이상)이므로 직원이 아직 어느 부서에도 배치되지 않을 수 있습니다. 부서 입장에서도 부서배치는 선택적(0개 이상)이므로 아직 배치된 직원이 없는 빈 부서가 존재할 수 있습니다. 부서배치 입장에서는 직원과 부서 모두 필수(||)이므로 부서배치 레코드는 반드시 유효한 직원과 부서를 가져야 합니다.',
    options: [
      '하나의 직원은 반드시 하나 이상의 부서배치 레코드를 가져야 한다.',
      '부서배치 레코드는 반드시 유효한 직원과 부서를 참조해야 하며, 직원은 아직 배치되지 않을 수 있다.',
      '하나의 부서는 반드시 하나 이상의 직원을 포함해야 한다.',
      '직원과 부서는 직접 1:1 관계이며 부서배치는 속성을 저장하기 위한 보조 테이블이다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p4',
    title: '4. 슈퍼타입과 서브타입 변환 전략',
    description:
      '다음 슈퍼타입/서브타입 모델을 물리 테이블로 변환하는 전략 중, OLTP 환경에서 INSERT/UPDATE 성능이 가장 우수하고 데이터 무결성 유지가 쉬운 전략은?\n\n슈퍼타입: 계약(계약번호, 계약일, 고객번호)\n서브타입1: 신규계약(신규사유, 유입경로)\n서브타입2: 갱신계약(원계약번호, 갱신회차)\n서브타입3: 해지계약(해지사유, 해지일)',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 30,
    answer: '1',
    explanation:
      '슈퍼타입/서브타입의 물리 변환 전략은 세 가지입니다. (1) 각 서브타입별 테이블 분리(Roll Down): 슈퍼타입 속성을 각 서브타입에 복제하여 완전히 분리. INSERT 시 하나의 테이블만 접근하므로 성능이 좋고 서브타입별 NOT NULL 제약 적용이 쉽습니다. (2) 슈퍼타입 하나의 테이블로 통합(Roll Up): 모든 컬럼을 하나에 모아 서브타입 전용 컬럼은 NULL 허용. SELECT가 간단하나 NULL이 많아짐. (3) 슈퍼타입+서브타입 그대로 유지: 조회 시 항상 JOIN 필요. OLTP에서 INSERT/UPDATE 성능과 무결성 측면에서는 서브타입별 분리 테이블 전략(Roll Down)이 가장 적합합니다.',
    options: [
      '각 서브타입(신규계약, 갱신계약, 해지계약)을 슈퍼타입 컬럼 포함하여 별도 테이블로 완전 분리한다.',
      '슈퍼타입과 세 서브타입을 그대로 4개 테이블로 유지하고 PK로 조인한다.',
      '모든 컬럼을 하나의 계약 테이블에 통합하고 계약구분코드 컬럼을 추가한다.',
      '슈퍼타입 테이블만 유지하고 서브타입 속성은 JSON 컬럼에 저장한다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p5',
    title: '5. 데이터 모델 품질 검토',
    description:
      '다음 데이터 모델의 문제점을 분석하라.\n\n주문 테이블: (주문번호 PK, 고객명, 고객전화번호, 고객주소, 상품명, 상품단가, 주문수량, 주문금액)\n\n이 모델의 가장 심각한 문제점과 해결 방법으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 55,
    answer: '2',
    explanation:
      '위 주문 테이블은 제1정규형은 만족하지만 제2정규형을 위반합니다. 고객명, 고객전화번호, 고객주소는 주문번호가 아닌 고객에 종속되어 있고(부분 함수 종속), 상품명, 상품단가는 상품에 종속됩니다. 또한 주문금액은 상품단가 × 주문수량으로 계산 가능한 파생 속성입니다. 해결책은 고객 테이블과 상품 테이블로 분리하고 외래키로 참조하는 것입니다. 이를 통해 고객 정보나 상품 정보가 변경될 때 여러 주문 레코드를 수정하는 수정 이상(Update Anomaly)을 방지할 수 있습니다.',
    options: [
      '주문번호가 숫자형이 아니면 성능 문제가 발생하므로 SEQUENCE로 자동 생성해야 한다.',
      '고객 정보와 상품 정보가 주문에 직접 저장되어 수정 이상이 발생하므로 별도 테이블로 분리해야 한다.',
      '주문금액 컬럼은 집계 성능을 위해 반드시 물리 컬럼으로 저장해야 하므로 현재 구조가 올바르다.',
      '이 테이블은 제3정규형을 만족하므로 정규화 관점에서 문제가 없다.',
    ],
    points: 10,
  },

  // --- 정규화 (6~10) ---
  {
    id: 'exam8_p6',
    title: '6. 함수적 종속성 분석',
    description:
      '다음 릴레이션의 함수적 종속성을 분석하라.\n\nR(학번, 과목코드, 교수번호, 학점, 교수명, 강의실)\n\n함수적 종속성:\n- {학번, 과목코드} → 학점\n- 과목코드 → 교수번호\n- 교수번호 → 교수명, 강의실\n\n이 릴레이션의 정규형과 문제점으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 28,
    answer: '4',
    explanation:
      '기본키는 {학번, 과목코드}입니다. 분석하면: (1) 교수번호는 과목코드에만 종속(부분 함수 종속) → 제2정규형 위반. (2) 교수명, 강의실은 교수번호에 종속되고 교수번호는 과목코드에 종속(이행 함수 종속) → 추가로 제3정규형도 위반. 따라서 이 릴레이션은 제1정규형은 만족하지만 제2정규형을 위반합니다. 해결하려면 R1(학번, 과목코드, 학점), R2(과목코드, 교수번호), R3(교수번호, 교수명, 강의실)로 분해해야 합니다.',
    options: [
      '제2정규형을 만족하고 제3정규형을 위반한다. 교수명과 강의실을 별도 테이블로 분리해야 한다.',
      '제3정규형을 만족하고 BCNF를 위반한다. 추가 분해 없이 사용 가능하다.',
      '제1정규형만 만족하며, 학점이 부분 함수 종속이므로 제2정규형을 위반한다.',
      '제1정규형만 만족하며, 교수번호가 과목코드에만 종속되는 부분 함수 종속으로 제2정규형을 위반한다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p7',
    title: '7. 정규화 분해와 무손실 조인',
    description:
      '다음 릴레이션 R(A, B, C, D)에 함수적 종속성 A→B, B→C, C→D가 있다. 제3정규형으로 분해할 때 무손실 조인(Lossless Join)을 보장하는 분해는?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 32,
    answer: '3',
    explanation:
      '함수적 종속성 A→B, B→C, C→D에서 기본키는 A입니다. B→C는 이행 종속(A→B→C), B→C→D도 이행 종속이므로 제3정규형 위반입니다. 무손실 분해를 위해 Heath 정리를 적용합니다. 함수적 종속성 B→C를 기준으로 R1(B,C)과 R2(A,B,D)로 분해하거나, C→D를 기준으로 R1(C,D)와 R2(A,B,C)로 분해할 수 있습니다. R1(A,B), R2(B,C), R3(C,D)로 분해하면 모든 원래 FD를 보존하고 자연 조인으로 원래 릴레이션을 복원할 수 있어 무손실 조인이 보장됩니다. 각 분해 테이블의 공통 속성이 어느 한 테이블의 키가 되어야 무손실 조인이 보장됩니다.',
    options: [
      'R1(A,B,C), R2(C,D) - C→D 종속성 기준 분해',
      'R1(A,B), R2(A,C,D) - A를 중복 포함하여 분해',
      'R1(A,B), R2(B,C), R3(C,D) - 각 FD별 분해',
      'R1(A,C), R2(B,D), R3(A,B) - 임의 분해',
    ],
    points: 10,
  },
  {
    id: 'exam8_p8',
    title: '8. BCNF 정규형 판별',
    description:
      '다음 릴레이션에서 BCNF(Boyce-Codd 정규형) 위반 여부를 판별하라.\n\nR(학생번호, 과목, 담당교수)\n\n[함수적 종속성]\n- {학생번호, 과목} → 담당교수\n- 담당교수 → 과목\n\n(한 교수는 한 과목만 담당, 한 과목은 여러 교수가 담당 가능)\n\n이 릴레이션에 대한 올바른 설명은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 25,
    answer: '2',
    explanation:
      '기본키 후보는 {학생번호, 과목} 또는 {학생번호, 담당교수}입니다. BCNF는 "모든 비자명 함수적 종속 X→Y에서 X가 슈퍼키이어야 한다"는 조건입니다. 담당교수→과목에서 담당교수는 슈퍼키가 아닙니다(담당교수만으로는 튜플을 유일하게 식별할 수 없음). 따라서 BCNF를 위반합니다. 이 릴레이션은 제3정규형은 만족합니다(이행 종속 없음). BCNF 위반이지만 제3정규형은 만족하는 전형적인 사례입니다. 분해하면 R1(담당교수, 과목), R2(학생번호, 담당교수)로 분해할 수 있습니다.',
    options: [
      '제3정규형을 위반하므로 BCNF도 당연히 위반한다.',
      '제3정규형은 만족하지만 BCNF를 위반한다. 담당교수→과목에서 담당교수가 슈퍼키가 아니기 때문이다.',
      'BCNF를 만족한다. 모든 결정자가 후보키이기 때문이다.',
      '제2정규형을 위반하므로 BCNF 검토가 불필요하다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p9',
    title: '9. 정규화의 장단점',
    description:
      '다음 중 정규화(Normalization)의 장점과 단점을 올바르게 설명한 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 58,
    answer: '1',
    explanation:
      '정규화의 장점: 데이터 중복 최소화, 삽입/수정/삭제 이상 방지, 데이터 무결성 향상, 테이블 크기 감소. 정규화의 단점: 테이블이 여러 개로 분리되어 조회 시 JOIN이 많이 발생하여 쿼리가 복잡해지고 읽기 성능이 저하될 수 있습니다. 이 때문에 OLAP 환경이나 읽기 성능이 중요한 경우 반정규화를 적용합니다. 정규화가 삽입 성능을 무조건 향상시키는 것은 아니며, 여러 테이블에 분산 INSERT가 필요할 수도 있습니다.',
    options: [
      '정규화는 데이터 중복을 줄이고 이상 현상을 방지하지만, JOIN 증가로 읽기 성능이 저하될 수 있다.',
      '정규화는 모든 DML 성능(INSERT, UPDATE, DELETE, SELECT)을 향상시킨다.',
      '정규화를 적용하면 테이블 수가 줄어들어 조인이 감소하고 성능이 향상된다.',
      '정규화는 데이터 무결성보다 성능 최적화를 우선시하는 설계 기법이다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p10',
    title: '10. 다단계 정규화 분해',
    description:
      '다음 릴레이션을 제3정규형(3NF)까지 완전히 정규화할 때 생성되는 테이블의 최소 개수는?\n\nR(주문번호, 고객번호, 고객명, 고객등급, 상품번호, 상품명, 카테고리번호, 카테고리명, 주문수량, 주문일)\n\n함수적 종속성:\n- 주문번호 → 고객번호, 주문일\n- 고객번호 → 고객명, 고객등급\n- {주문번호, 상품번호} → 주문수량\n- 상품번호 → 상품명, 카테고리번호\n- 카테고리번호 → 카테고리명',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 30,
    answer: '4',
    explanation:
      '기본키는 {주문번호, 상품번호}입니다. 분석하면:\n1) 주문번호→고객번호, 주문일: 부분 함수 종속 → 주문(주문번호, 고객번호, 주문일) 분리\n2) 고객번호→고객명, 고객등급: 주문번호의 이행 종속 → 고객(고객번호, 고객명, 고객등급) 분리\n3) 상품번호→상품명, 카테고리번호: 부분 함수 종속 → 상품(상품번호, 상품명, 카테고리번호) 분리\n4) 카테고리번호→카테고리명: 이행 종속 → 카테고리(카테고리번호, 카테고리명) 분리\n5) 나머지: 주문항목(주문번호, 상품번호, 주문수량)\n최종적으로 5개 테이블이 필요합니다.',
    options: ['3개', '4개', '6개', '5개'],
    points: 10,
  },

  // ===== 2과목: SQL 기본 및 활용 (11~50번) =====
  // --- JOIN (11~16) ---
  {
    id: 'exam8_p11',
    title: '11. 셀프 조인과 계층 데이터',
    description:
      '다음 직원 테이블에서 각 직원의 이름과 직속 상사의 이름을 함께 조회하되, 상사가 없는 직원(최상위 관리자)도 결과에 포함시키는 쿼리로 올바른 것은?\n\nEMPLOYEE(EMP_ID, EMP_NAME, MANAGER_ID)\n데이터:\n(1, \'김대표\', NULL)\n(2, \'이부장\', 1)\n(3, \'박과장\', 2)\n(4, \'최대리\', 2)',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 52,
    answer: '2',
    explanation:
      '상사가 없는 최상위 관리자(MANAGER_ID가 NULL)도 결과에 포함시키려면 LEFT OUTER JOIN을 사용해야 합니다. INNER JOIN을 사용하면 MANAGER_ID가 NULL인 김대표는 결과에서 제외됩니다. LEFT OUTER JOIN으로 자기 자신 테이블을 조인하면(셀프 조인), 기준이 되는 테이블(e1)의 모든 행이 보존되고 매칭되는 상사가 없으면 m.EMP_NAME이 NULL로 표시됩니다.',
    options: [
      'SELECT e.EMP_NAME, m.EMP_NAME FROM EMPLOYEE e INNER JOIN EMPLOYEE m ON e.MANAGER_ID = m.EMP_ID',
      'SELECT e.EMP_NAME, m.EMP_NAME FROM EMPLOYEE e LEFT OUTER JOIN EMPLOYEE m ON e.MANAGER_ID = m.EMP_ID',
      'SELECT e.EMP_NAME, m.EMP_NAME FROM EMPLOYEE e RIGHT OUTER JOIN EMPLOYEE m ON e.EMP_ID = m.MANAGER_ID',
      'SELECT e.EMP_NAME, m.EMP_NAME FROM EMPLOYEE e FULL OUTER JOIN EMPLOYEE m ON e.EMP_ID = m.EMP_ID',
    ],
    points: 10,
  },
  {
    id: 'exam8_p12',
    title: '12. CROSS JOIN 결과 행 수',
    description:
      '다음 두 테이블에 CROSS JOIN을 수행했을 때 결과 행의 수는?\n\nA 테이블: 5개 행\nB 테이블: 3개 행 (단, B 테이블에 NULL 행 1개 포함)\n\nSELECT * FROM A CROSS JOIN B',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 78,
    answer: '3',
    explanation:
      'CROSS JOIN(카테시안 곱)은 두 테이블의 모든 행의 조합을 반환합니다. NULL 값이 포함된 행도 CROSS JOIN에서는 정상적으로 처리됩니다. 따라서 5 × 3 = 15개의 행이 반환됩니다. NULL은 행 자체를 제거하지 않으며, JOIN 조건이 없는 CROSS JOIN에서는 NULL 포함 여부와 관계없이 모든 행이 조합됩니다.',
    options: ['10개', '12개', '15개', '20개'],
    points: 10,
  },
  {
    id: 'exam8_p13',
    title: '13. OUTER JOIN과 NULL 처리',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\n[테이블 데이터]\nDEPT: (10,\'영업\'), (20,\'개발\'), (30,\'인사\')\nEMP: (1,10,\'홍길동\'), (2,10,\'이순신\'), (3,20,\'강감찬\')\n\nSELECT d.DEPT_NO, d.DEPT_NAME, COUNT(e.EMP_ID) AS EMP_COUNT\nFROM DEPT d\nLEFT OUTER JOIN EMP e ON d.DEPT_NO = e.DEPT_NO\nGROUP BY d.DEPT_NO, d.DEPT_NAME\nORDER BY d.DEPT_NO;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 48,
    answer: '1',
    explanation:
      'LEFT OUTER JOIN을 사용하므로 DEPT 테이블의 모든 행이 보존됩니다. 인사부(30)는 매칭되는 EMP가 없으므로 e.EMP_ID가 NULL이 됩니다. COUNT(e.EMP_ID)는 NULL을 세지 않으므로 인사부의 카운트는 0이 됩니다. COUNT(*)을 사용했다면 1이 반환되었겠지만, COUNT(컬럼명)은 NULL을 제외하고 셉니다. 따라서 결과는 (10, 영업, 2), (20, 개발, 1), (30, 인사, 0)입니다.',
    options: [
      '(10, 영업, 2), (20, 개발, 1), (30, 인사, 0)',
      '(10, 영업, 2), (20, 개발, 1)',
      '(10, 영업, 2), (20, 개발, 1), (30, 인사, 1)',
      '(10, 영업, 3), (20, 개발, 1), (30, 인사, 0)',
    ],
    points: 10,
  },
  {
    id: 'exam8_p14',
    title: '14. 다중 테이블 조인 순서',
    description:
      '다음 4개 테이블을 조인하는 쿼리에서 결과가 달라지는 경우는?\n\n테이블: A(10행), B(100행), C(1000행), D(5행)\n\n조인 조건: A.ID = B.A_ID, B.ID = C.B_ID, C.ID = D.C_ID (모두 INNER JOIN)\n\n다음 중 올바른 설명은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 55,
    answer: '3',
    explanation:
      'INNER JOIN의 경우 조인 순서를 변경해도 최종 결과는 동일합니다(교환법칙, 결합법칙 성립). 그러나 OUTER JOIN은 순서에 따라 결과가 달라집니다. 또한 조인 순서는 쿼리 옵티마이저가 실행 계획을 결정할 때 영향을 주며 성능 차이가 발생할 수 있습니다. 일반적으로 작은 테이블을 Driving Table로 하고, 필터 조건으로 먼저 행 수를 줄이는 것이 효율적입니다. INNER JOIN의 결과 집합 자체는 순서와 무관합니다.',
    options: [
      '모든 INNER JOIN은 조인 순서에 따라 결과 행 수가 달라진다.',
      '소규모 테이블(D)을 첫 번째로 조인하면 항상 오류가 발생한다.',
      'INNER JOIN은 순서에 관계없이 결과가 동일하지만 실행 성능은 달라질 수 있다.',
      '테이블 크기가 클수록 항상 마지막에 조인해야 정확한 결과를 얻는다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p15',
    title: '15. NATURAL JOIN의 특성',
    description:
      '다음 중 NATURAL JOIN에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 55,
    answer: '4',
    explanation:
      'NATURAL JOIN은 두 테이블에서 이름이 같은 모든 컬럼을 자동으로 조인 조건으로 사용합니다. ON 절이나 USING 절을 별도로 지정하지 않습니다. 공통 컬럼은 결과에 한 번만 나타납니다. 예기치 않은 컬럼이 공통 컬럼으로 사용될 수 있어 위험하며(예: CREATE_DATE, STATUS 등 의도하지 않은 컬럼), 명시적인 JOIN 조건(USING 또는 ON) 사용이 권장됩니다. NATURAL JOIN은 동일한 이름의 컬럼이 여러 개 있으면 모두 조인 조건으로 사용하므로, 컬럼 하나만 선택하여 조인하려면 USING을 사용해야 합니다.',
    options: [
      'NATURAL JOIN은 두 테이블에서 이름이 같은 모든 컬럼을 자동으로 조인 조건으로 사용한다.',
      'NATURAL JOIN 결과에서 조인 기준 컬럼은 한 번만 나타난다.',
      'NATURAL JOIN은 예기치 않은 컬럼이 조인 조건에 포함될 수 있어 주의가 필요하다.',
      'NATURAL JOIN은 조인 컬럼 앞에 테이블 별칭(Alias)을 붙여 명시해야 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p16',
    title: '16. 복합 조인 조건과 실행 결과 추적',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\n[테이블]\nORDERS: (ORD_ID, CUST_ID, STATUS)\n값: (1,100,\'완료\'), (2,100,\'취소\'), (3,200,\'완료\'), (4,300,\'대기\')\n\nCUST: (CUST_ID, CUST_NAME, GRADE)\n값: (100,\'김씨\',\'VIP\'), (200,\'이씨\',\'일반\'), (400,\'박씨\',\'VIP\')\n\nSELECT c.CUST_NAME, COUNT(o.ORD_ID) AS CNT\nFROM CUST c\nLEFT JOIN ORDERS o ON c.CUST_ID = o.CUST_ID AND o.STATUS = \'완료\'\nGROUP BY c.CUST_NAME\nORDER BY c.CUST_NAME;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 35,
    answer: '3',
    explanation:
      'LEFT JOIN의 ON 절에 o.STATUS = \'완료\' 조건이 포함되어 있습니다. 이 조건은 WHERE 절이 아닌 ON 절에 있으므로, 조건을 만족하지 않아도 CUST 테이블의 모든 행은 보존됩니다. 조건을 만족하지 않는 ORDERS 행은 NULL로 처리됩니다. 분석: 김씨(100)는 완료 주문 1개(ORD_ID=1) → COUNT=1, 이씨(200)는 완료 주문 1개(ORD_ID=3) → COUNT=1, 박씨(400)는 ORDERS에 없으므로 → COUNT=0(COUNT(o.ORD_ID)는 NULL 제외). 따라서 (김씨,1), (박씨,0), (이씨,1) 순으로 정렬됩니다.',
    options: [
      '(김씨,2), (이씨,1), (박씨,0)',
      '(김씨,1), (이씨,1)',
      '(김씨,1), (박씨,0), (이씨,1)',
      '(김씨,2), (박씨,1), (이씨,1)',
    ],
    points: 10,
  },

  // --- 함수 (17~22) ---
  {
    id: 'exam8_p17',
    title: '17. 날짜 함수 계산',
    description:
      '다음 SQL을 Oracle 환경에서 실행했을 때 결과로 올바른 것은?\n(기준: 오늘 날짜 = 2024-03-15)\n\nSELECT\n  MONTHS_BETWEEN(TO_DATE(\'2024-03-15\',\'YYYY-MM-DD\'), TO_DATE(\'2023-09-15\',\'YYYY-MM-DD\')) AS M1,\n  ADD_MONTHS(TO_DATE(\'2024-01-31\',\'YYYY-MM-DD\'), 1) AS M2,\n  LAST_DAY(TO_DATE(\'2024-02-01\',\'YYYY-MM-DD\')) AS M3\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 50,
    answer: '2',
    explanation:
      'MONTHS_BETWEEN(\'2024-03-15\', \'2023-09-15\'): 2024년 3월에서 2023년 9월까지의 개월 수. 6개월 차이이므로 결과는 6. ADD_MONTHS(\'2024-01-31\', 1): 1월 31일에 1개월 추가 시 2월의 마지막 날인 2024-02-29(2024년은 윤년). Oracle ADD_MONTHS는 말일 처리를 자동으로 합니다. LAST_DAY(\'2024-02-01\'): 2024년 2월의 마지막 날은 2024-02-29(윤년)입니다. 따라서 M1=6, M2=2024-02-29, M3=2024-02-29.',
    options: [
      'M1=6, M2=2024-02-28, M3=2024-02-28',
      'M1=6, M2=2024-02-29, M3=2024-02-29',
      'M1=5, M2=2024-02-29, M3=2024-02-29',
      'M1=6, M2=2024-03-02, M3=2024-02-29',
    ],
    points: 10,
  },
  {
    id: 'exam8_p18',
    title: '18. 문자열 함수 중첩 적용',
    description:
      '다음 SQL의 실행 결과는?\n\nSELECT TRIM(LEADING \'0\' FROM LPAD(LTRIM(\'  SQL  \'), 10, \'0\'))\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 28,
    answer: '1',
    explanation:
      '단계별 분석:\n1) LTRIM(\'  SQL  \'): 왼쪽 공백 제거 → \'SQL  \'\n2) LPAD(\'SQL  \', 10, \'0\'): 전체 길이 10이 되도록 왼쪽에 \'0\'을 채움. \'SQL  \'은 5자(S,Q,L,공백,공백)이므로 5개의 0을 앞에 붙임 → \'00000SQL  \'\n3) TRIM(LEADING \'0\' FROM \'00000SQL  \'): 왼쪽의 \'0\'들을 제거 → \'SQL  \'\n최종 결과는 \'SQL  \'(오른쪽 공백 2개 포함)입니다.',
    options: ["'SQL  '(오른쪽 공백 2개)", "'SQL'(공백 없음)", "'00000SQL  '", "'SQL'(길이 3)"],
    points: 10,
  },
  {
    id: 'exam8_p19',
    title: '19. NULL 처리 함수 비교',
    description:
      '다음 중 NULL 처리 함수에 대한 설명으로 올바르지 않은 것은?\n\n(Oracle 환경 기준)',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 72,
    answer: '3',
    explanation:
      'NVL(expr1, expr2): expr1이 NULL이면 expr2 반환. NVL2(expr1, expr2, expr3): expr1이 NOT NULL이면 expr2, NULL이면 expr3 반환. NULLIF(expr1, expr2): 두 값이 같으면 NULL 반환, 다르면 expr1 반환. COALESCE(expr1, expr2, ...): 나열된 값 중 처음으로 NULL이 아닌 값 반환. NVL2의 두 번째 인수는 expr1이 NULL이 아닐 때 반환하는 값이고, 세 번째 인수가 expr1이 NULL일 때 반환하는 값입니다. 따라서 "NVL2(컬럼, NULL이면 반환값, NULL아니면 반환값)" 순서로 이해하는 것은 잘못된 설명입니다.',
    options: [
      'COALESCE(NULL, NULL, 3, NULL)의 결과는 3이다.',
      'NULLIF(5, 5)의 결과는 NULL이다.',
      'NVL2(컬럼, A, B)에서 컬럼이 NULL이면 A를 반환하고 NULL이 아니면 B를 반환한다.',
      'NVL(NULL, 0)의 결과는 0이다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p20',
    title: '20. DECODE와 CASE 비교',
    description:
      '다음 두 SQL이 동일한 결과를 반환하는지 판단하라.\n\n[SQL1]\nSELECT DECODE(SCORE, NULL, \'미응시\', DECODE(SIGN(SCORE-60), 1, \'우수\', 0, \'합격\', -1, \'불합격\')) AS RESULT\nFROM EXAM;\n\n[SQL2]\nSELECT CASE\n  WHEN SCORE IS NULL THEN \'미응시\'\n  WHEN SCORE > 60 THEN \'우수\'\n  WHEN SCORE = 60 THEN \'합격\'\n  ELSE \'불합격\'\nEND AS RESULT\nFROM EXAM;\n\n두 SQL에 대한 올바른 설명은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 32,
    answer: '4',
    explanation:
      'SIGN(x): x>0이면 1, x=0이면 0, x<0이면 -1 반환. SQL1 분석: SCORE가 NULL이면 \'미응시\', 아니면 SIGN(SCORE-60)으로 판단. SIGN(SCORE-60)=1이면 SCORE>60으로 \'우수\', =0이면 SCORE=60으로 \'합격\', =-1이면 SCORE<60으로 \'불합격\'. SQL2 분석: NULL은 \'미응시\', SCORE>60은 \'우수\', SCORE=60은 \'합격\', 나머지(SCORE<60)는 \'불합격\'. DECODE에서 NULL 비교는 등가 비교(=)로 처리되므로 DECODE(SCORE, NULL, ...)는 IS NULL과 동일하게 동작합니다. 두 SQL은 동일한 결과를 반환합니다.',
    options: [
      '두 SQL은 SCORE=NULL 처리 방식이 달라 결과가 다르다.',
      'SQL1에서 DECODE는 NULL 비교가 불가능하므로 오류가 발생한다.',
      'SIGN 함수를 사용하면 소수점 SCORE 처리에서 SQL2와 결과가 달라진다.',
      '두 SQL은 동일한 결과를 반환한다. DECODE에서 NULL 비교는 IS NULL과 동일하게 작동한다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p21',
    title: '21. 숫자 함수와 반올림 처리',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\nSELECT\n  ROUND(145.678, -2) AS R1,\n  TRUNC(145.678, -2) AS R2,\n  MOD(17, -5) AS R3\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 42,
    answer: '2',
    explanation:
      'ROUND(145.678, -2): 소수점 왼쪽 2번째 자리(십의 자리)에서 반올림. 145.678에서 십의 자리 4를 반올림하면 백의 자리 1이 2로 올라감 → 200. TRUNC(145.678, -2): 소수점 왼쪽 2번째 자리(십의 자리)에서 절삭 → 100. MOD(17, -5): Oracle에서 MOD(m,n)의 부호는 m의 부호를 따릅니다. 17 = (-5) × (-3) + 2이므로 MOD(17,-5) = 2. 따라서 R1=200, R2=100, R3=2.',
    options: [
      'R1=100, R2=100, R3=2',
      'R1=200, R2=100, R3=2',
      'R1=200, R2=200, R3=-2',
      'R1=200, R2=100, R3=-2',
    ],
    points: 10,
  },
  {
    id: 'exam8_p22',
    title: '22. 집계 함수와 NULL',
    description:
      '다음 테이블에서 SQL 실행 결과로 올바른 것은?\n\nSALES(ID, AMT)\n값: (1, 100), (2, NULL), (3, 200), (4, NULL), (5, 300)\n\nSELECT\n  COUNT(*) AS C1,\n  COUNT(AMT) AS C2,\n  AVG(AMT) AS C3,\n  SUM(AMT)/COUNT(*) AS C4\nFROM SALES;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 45,
    answer: '3',
    explanation:
      'COUNT(*): 전체 행 수 = 5. COUNT(AMT): NULL이 아닌 행 수 = 3 (100, 200, 300). AVG(AMT): NULL을 제외한 평균 = (100+200+300)/3 = 200. SUM(AMT)/COUNT(*): SUM(AMT)=600, COUNT(*)=5이므로 600/5=120. AVG(AMT)는 자동으로 NULL을 제외하므로 200이지만, SUM/COUNT(*)는 전체 행 수로 나누므로 120입니다. 이 차이가 중요한 개념입니다.',
    options: [
      'C1=5, C2=5, C3=200, C4=200',
      'C1=3, C2=3, C3=200, C4=120',
      'C1=5, C2=3, C3=200, C4=120',
      'C1=5, C2=3, C3=120, C4=120',
    ],
    points: 10,
  },

  // --- DML (23~27) ---
  {
    id: 'exam8_p23',
    title: '23. MERGE 문 복합 조건 분석',
    description:
      '다음 MERGE 문의 실행 결과를 분석하라.\n\n[TARGET 테이블]\nPRODUCT(PROD_ID, STOCK, PRICE)\n값: (1, 50, 1000), (2, 0, 2000), (3, 30, 3000)\n\n[SOURCE 테이블]\nNEW_STOCK(PROD_ID, ADD_STOCK)\n값: (1, 20), (2, 100), (4, 50)\n\nMERGE INTO PRODUCT t\nUSING NEW_STOCK s ON (t.PROD_ID = s.PROD_ID)\nWHEN MATCHED AND t.STOCK = 0 THEN\n  UPDATE SET t.STOCK = s.ADD_STOCK, t.PRICE = t.PRICE * 0.9\nWHEN MATCHED AND t.STOCK > 0 THEN\n  UPDATE SET t.STOCK = t.STOCK + s.ADD_STOCK\nWHEN NOT MATCHED THEN\n  INSERT (PROD_ID, STOCK, PRICE) VALUES (s.PROD_ID, s.ADD_STOCK, 0);\n\nMERGE 실행 후 PRODUCT 테이블의 내용으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 28,
    answer: '2',
    explanation:
      'MERGE 실행 분석:\n- PROD_ID=1: MATCHED이고 STOCK=50>0 → STOCK = 50+20 = 70, PRICE=1000 유지\n- PROD_ID=2: MATCHED이고 STOCK=0 → STOCK = 100, PRICE = 2000*0.9 = 1800\n- PROD_ID=4: NOT MATCHED → INSERT (4, 50, 0)\n- PROD_ID=3: SOURCE에 없으므로 변경 없음 → (3, 30, 3000) 유지\n최종: (1,70,1000), (2,100,1800), (3,30,3000), (4,50,0)',
    options: [
      '(1,70,1000), (2,100,2000), (3,30,3000), (4,50,0)',
      '(1,70,1000), (2,100,1800), (3,30,3000), (4,50,0)',
      '(1,70,900), (2,100,1800), (3,30,3000), (4,50,0)',
      '(1,70,1000), (2,100,1800), (3,30,3000)',
    ],
    points: 10,
  },
  {
    id: 'exam8_p24',
    title: '24. UPDATE 서브쿼리와 상관 서브쿼리',
    description:
      '다음 SQL을 실행했을 때 UPDATE되는 행의 수로 올바른 것은?\n\n[테이블]\nEMP(EMP_ID, DEPT_ID, SALARY)\n값: (1,10,3000), (2,10,4000), (3,20,5000), (4,20,3500), (5,30,2000)\n\nDEPT(DEPT_ID, BUDGET)\n값: (10, 10000), (20, 15000), (30, 5000)\n\nUPDATE EMP e\nSET SALARY = SALARY * 1.1\nWHERE SALARY < (\n  SELECT AVG(SALARY)\n  FROM EMP\n  WHERE DEPT_ID = e.DEPT_ID\n);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 35,
    answer: '3',
    explanation:
      '각 직원별 부서 평균 급여와 비교:\n- DEPT 10 평균: (3000+4000)/2 = 3500\n  - EMP_ID=1: SALARY=3000 < 3500 → UPDATE 대상\n  - EMP_ID=2: SALARY=4000 >= 3500 → 제외\n- DEPT 20 평균: (5000+3500)/2 = 4250\n  - EMP_ID=3: SALARY=5000 >= 4250 → 제외\n  - EMP_ID=4: SALARY=3500 < 4250 → UPDATE 대상\n- DEPT 30: 직원 1명이므로 평균 = 2000\n  - EMP_ID=5: SALARY=2000 = 2000, < 조건 불만족 → 제외\n총 2개 행이 UPDATE됩니다.',
    options: ['1개', '3개', '2개', '4개'],
    points: 10,
  },
  {
    id: 'exam8_p25',
    title: '25. INSERT ALL과 조건부 INSERT',
    description:
      '다음 중 Oracle의 INSERT ALL과 INSERT FIRST에 대한 설명으로 올바른 것은?\n\nINSERT ALL\n  WHEN SCORE >= 90 THEN INTO GRADE_A VALUES(ID, SCORE)\n  WHEN SCORE >= 70 THEN INTO GRADE_B VALUES(ID, SCORE)\n  WHEN SCORE >= 50 THEN INTO GRADE_C VALUES(ID, SCORE)\nSELECT ID, SCORE FROM EXAM_RESULT WHERE SCORE IS NOT NULL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 45,
    answer: '1',
    explanation:
      'INSERT ALL은 모든 WHEN 조건을 평가하여 해당되는 테이블 모두에 삽입합니다. SCORE=95인 경우 SCORE>=90(GRADE_A), SCORE>=70(GRADE_B), SCORE>=50(GRADE_C) 세 조건을 모두 만족하므로 세 테이블 모두에 삽입됩니다. INSERT FIRST는 첫 번째로 만족하는 조건의 테이블에만 삽입하고 나머지 조건은 평가하지 않습니다. 따라서 SCORE=95이면 INSERT FIRST는 GRADE_A에만 삽입합니다.',
    options: [
      'INSERT ALL에서 SCORE=95이면 GRADE_A, GRADE_B, GRADE_C 세 테이블 모두에 삽입된다.',
      'INSERT ALL은 항상 첫 번째 만족 조건의 테이블에만 삽입한다.',
      'INSERT FIRST와 INSERT ALL은 동일하게 모든 만족 조건의 테이블에 삽입한다.',
      'INSERT ALL에서 WHEN 조건 없이 INTO만 사용하면 항상 오류가 발생한다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p26',
    title: '26. DELETE와 TRUNCATE 차이',
    description:
      '다음 중 DELETE와 TRUNCATE에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 75,
    answer: '4',
    explanation:
      'DELETE는 DML이고 TRUNCATE는 DDL입니다. DELETE는 WHERE 조건으로 특정 행만 삭제할 수 있으며, ROLLBACK이 가능합니다. DELETE는 삭제된 행 수를 반환합니다. TRUNCATE는 테이블의 모든 행을 빠르게 삭제하며, 자동으로 COMMIT이 수행되어 ROLLBACK이 불가능합니다. TRUNCATE는 HIGH WATERMARK를 초기화하여 스토리지를 즉시 반환하지만, DELETE는 스토리지를 즉시 반환하지 않습니다. 트리거는 DELETE 시 실행되지만 TRUNCATE 시에는 실행되지 않습니다.',
    options: [
      'TRUNCATE는 DML이므로 ROLLBACK으로 복구할 수 있다.',
      'DELETE와 TRUNCATE 모두 WHERE 조건으로 특정 행만 삭제할 수 있다.',
      'TRUNCATE 실행 시 각 행의 삭제에 대한 트리거가 실행된다.',
      'TRUNCATE는 DDL로 자동 COMMIT이 수행되어 ROLLBACK이 불가능하다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p27',
    title: '27. DML 실행 후 결과 추적',
    description:
      '다음 SQL을 순서대로 실행한 후 최종 테이블의 상태로 올바른 것은?\n\n[초기 데이터]\nT(ID, VAL): (1, \'A\'), (2, \'B\'), (3, \'C\')\n\n① INSERT INTO T VALUES (4, \'D\');\n② UPDATE T SET VAL = \'X\' WHERE ID <= 2;\n③ DELETE FROM T WHERE VAL = \'B\';\n④ INSERT INTO T VALUES (2, \'E\');\n\n위 4개 DML 실행 후 T 테이블의 내용은? (COMMIT 없이 동일 트랜잭션 내)',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 50,
    answer: '1',
    explanation:
      '단계별 추적:\n① INSERT (4,\'D\'): T = (1,A),(2,B),(3,C),(4,D)\n② UPDATE VAL=\'X\' WHERE ID<=2: ID=1→(1,X), ID=2→(2,X). T = (1,X),(2,X),(3,C),(4,D)\n③ DELETE WHERE VAL=\'B\': 현재 VAL=\'B\'인 행 없음(②에서 이미 \'X\'로 변경됨). T 변경 없음. T = (1,X),(2,X),(3,C),(4,D)\n④ INSERT (2,\'E\'): ID=2가 이미 있지만 PK 제약이 있다면 오류. 문제에서 PK 제약을 명시하지 않았으므로 삽입 성공. T = (1,X),(2,X),(3,C),(4,D),(2,E)\n하지만 일반적으로 ID가 PK라면 ④에서 오류 발생. 문제를 순수 데이터 관점으로 보면 최종: (1,X),(2,X),(3,C),(4,D),(2,E).',
    options: [
      '(1,X), (2,X), (3,C), (4,D), (2,E)',
      '(1,X), (3,C), (4,D), (2,E)',
      '(1,A), (3,C), (4,D), (2,E)',
      '(1,X), (2,B), (3,C), (4,D)',
    ],
    points: 10,
  },

  // --- 서브쿼리 (28~32) ---
  {
    id: 'exam8_p28',
    title: '28. 스칼라 서브쿼리 성능',
    description:
      '다음 두 SQL의 성능 차이에 대한 설명으로 올바른 것은?\n\n[SQL A - 스칼라 서브쿼리]\nSELECT e.EMP_NAME,\n  (SELECT d.DEPT_NAME FROM DEPT d WHERE d.DEPT_ID = e.DEPT_ID) AS DEPT_NM\nFROM EMP e;\n\n[SQL B - JOIN]\nSELECT e.EMP_NAME, d.DEPT_NAME\nFROM EMP e LEFT JOIN DEPT d ON e.DEPT_ID = d.DEPT_ID;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 48,
    answer: '4',
    explanation:
      '스칼라 서브쿼리(SQL A)는 EMP의 각 행마다 DEPT 테이블을 조회하는 방식으로 N번 실행됩니다. 그러나 Oracle 옵티마이저는 스칼라 서브쿼리에 대해 캐싱(Scalar Subquery Caching)을 적용하여, 동일한 DEPT_ID에 대해 반복 조회 없이 캐시에서 결과를 반환합니다. DEPT_ID 종류가 적으면 캐시 히트율이 높아 성능 차이가 크지 않을 수 있습니다. JOIN(SQL B)은 일반적으로 대용량에서 더 효율적이나, 두 방식 모두 옵티마이저가 내부적으로 유사하게 처리할 수 있습니다. 가장 올바른 설명은 "스칼라 서브쿼리는 옵티마이저 캐싱으로 인해 고유 DEPT_ID 수가 적으면 JOIN과 성능이 유사할 수 있다"입니다.',
    options: [
      '스칼라 서브쿼리는 항상 EMP 행 수만큼 DEPT를 조회하므로 JOIN보다 반드시 느리다.',
      'SQL A와 SQL B는 완전히 동일한 실행 계획으로 처리된다.',
      'SQL B의 LEFT JOIN은 INNER JOIN과 달리 스칼라 서브쿼리보다 항상 느리다.',
      '스칼라 서브쿼리는 캐싱이 적용되어 DEPT_ID 고유 값이 적으면 JOIN과 성능이 유사할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p29',
    title: '29. EXISTS와 IN 서브쿼리 차이',
    description:
      '다음 두 SQL의 차이에 대한 설명으로 올바르지 않은 것은?\n\n[SQL A]\nSELECT * FROM EMP\nWHERE DEPT_ID IN (SELECT DEPT_ID FROM DEPT WHERE LOCATION = \'서울\');\n\n[SQL B]\nSELECT * FROM EMP e\nWHERE EXISTS (SELECT 1 FROM DEPT d WHERE d.DEPT_ID = e.DEPT_ID AND d.LOCATION = \'서울\');',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 45,
    answer: '2',
    explanation:
      'IN 서브쿼리(SQL A)는 서브쿼리를 먼저 실행하여 결과 집합을 만들고 메인쿼리와 비교합니다. EXISTS(SQL B)는 메인쿼리의 각 행에 대해 서브쿼리를 실행하여 결과가 존재하면 TRUE를 반환합니다. IN에서 서브쿼리 결과에 NULL이 포함되면 NOT IN의 경우 문제가 됩니다(IN은 NULL을 무시). EXISTS는 결과 존재 여부만 확인하므로 NULL 포함 시에도 안전합니다. EMP가 크고 DEPT가 작으면 IN이 유리하고, 그 반대면 EXISTS가 유리할 수 있습니다. "EXISTS는 항상 IN보다 빠르다"는 것은 올바르지 않습니다.',
    options: [
      'IN 서브쿼리 결과에 NULL이 포함되어도 IN 자체는 정상 동작하나 NOT IN은 문제가 생긴다.',
      'EXISTS는 항상 IN보다 처리 속도가 빠르다.',
      'EXISTS는 조건에 맞는 행이 하나라도 있으면 TRUE를 반환하고 나머지 검색을 중단한다.',
      '두 SQL은 DEPT에 중복된 DEPT_ID가 없고 NULL이 없다면 동일한 결과를 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p30',
    title: '30. 인라인 뷰와 WITH 절',
    description:
      '다음 SQL에서 WITH 절(CTE)의 장점으로 올바르지 않은 것은?\n\nWITH DEPT_AVG AS (\n  SELECT DEPT_ID, AVG(SALARY) AS AVG_SAL\n  FROM EMP\n  GROUP BY DEPT_ID\n),\nHIGH_DEPT AS (\n  SELECT DEPT_ID\n  FROM DEPT_AVG\n  WHERE AVG_SAL > 5000000\n)\nSELECT e.EMP_NAME, e.SALARY\nFROM EMP e\nJOIN HIGH_DEPT h ON e.DEPT_ID = h.DEPT_ID\nWHERE e.SALARY > (SELECT AVG_SAL FROM DEPT_AVG WHERE DEPT_ID = e.DEPT_ID);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 50,
    answer: '3',
    explanation:
      'WITH 절(CTE, Common Table Expression)의 장점: (1) 가독성 향상 - 복잡한 서브쿼리를 이름을 붙여 분리하여 코드를 명확하게 만듦. (2) 재사용성 - 동일 CTE를 쿼리 내에서 여러 번 참조 가능. (3) 재귀 쿼리 지원 - WITH RECURSIVE를 사용한 계층형 쿼리 가능. CTE가 자동으로 물리적 임시 테이블을 생성하여 영구 저장한다는 것은 잘못된 설명입니다. CTE는 쿼리 실행 중에만 존재하는 논리적 집합이며, 옵티마이저에 따라 인라인 뷰로 처리되거나 임시 테이블로 구현될 수 있지만 영구 저장되지는 않습니다.',
    options: [
      'WITH 절을 사용하면 복잡한 서브쿼리에 이름을 부여하여 쿼리 가독성이 향상된다.',
      '동일한 CTE 결과를 쿼리 내에서 여러 번 참조할 수 있어 중복 연산을 줄일 수 있다.',
      'WITH 절은 항상 물리적 임시 테이블을 생성하여 결과를 영구 저장하므로 성능이 향상된다.',
      'WITH RECURSIVE 구문을 사용하면 계층형 데이터를 처리하는 재귀 쿼리를 작성할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p31',
    title: '31. 서브쿼리 위치와 종류',
    description:
      '다음 SQL에서 밑줄 친 각 서브쿼리의 종류를 올바르게 짝지은 것은?\n\nSELECT\n  (SELECT AVG(SALARY) FROM EMP) AS AVG_SAL,  -- ①\n  DEPT_NAME\nFROM DEPT d\nWHERE DEPT_ID IN\n  (SELECT DEPT_ID FROM EMP GROUP BY DEPT_ID HAVING COUNT(*) > 5)  -- ②\n  AND EXISTS\n  (SELECT 1 FROM PROJECT p WHERE p.DEPT_ID = d.DEPT_ID);  -- ③',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '서브쿼리',
    correctRate: 73,
    answer: '2',
    explanation:
      '서브쿼리 종류:\n① SELECT 절의 서브쿼리 → 스칼라 서브쿼리(Scalar Subquery): 단일 값을 반환\n② WHERE 절의 IN 서브쿼리 → 중첩 서브쿼리(Nested Subquery) 또는 비상관 서브쿼리: 메인쿼리와 독립적으로 실행\n③ WHERE 절의 EXISTS 서브쿼리 → 상관 서브쿼리(Correlated Subquery): 메인쿼리의 d.DEPT_ID를 참조',
    options: [
      '① 인라인 뷰, ② 스칼라 서브쿼리, ③ 중첩 서브쿼리',
      '① 스칼라 서브쿼리, ② 비상관 서브쿼리, ③ 상관 서브쿼리',
      '① 스칼라 서브쿼리, ② 상관 서브쿼리, ③ 비상관 서브쿼리',
      '① 중첩 서브쿼리, ② 비상관 서브쿼리, ③ 스칼라 서브쿼리',
    ],
    points: 10,
  },
  {
    id: 'exam8_p32',
    title: '32. ALL과 ANY 서브쿼리',
    description:
      '다음 SQL의 결과로 올바른 것은?\n\nEMP(EMP_ID, DEPT_ID, SALARY)\n값: (1,10,3000), (2,10,5000), (3,20,4000), (4,20,7000), (5,30,2000)\n\nSELECT EMP_ID, SALARY\nFROM EMP\nWHERE SALARY > ALL (\n  SELECT AVG(SALARY)\n  FROM EMP\n  GROUP BY DEPT_ID\n)\nORDER BY EMP_ID;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 35,
    answer: '4',
    explanation:
      '서브쿼리 결과: GROUP BY DEPT_ID의 AVG(SALARY):\n- DEPT 10: (3000+5000)/2 = 4000\n- DEPT 20: (4000+7000)/2 = 5500\n- DEPT 30: 2000/1 = 2000\n서브쿼리 결과 집합: {4000, 5500, 2000}\n\nSALARY > ALL ({4000, 5500, 2000}) 조건: 모든 값보다 커야 하므로 SALARY > 5500 (최대값 5500보다 커야 함)\n\n해당하는 직원:\n- EMP_ID=4: SALARY=7000 > 5500 → 포함\n나머지는 5500 이하이므로 제외.\n결과: (4, 7000)',
    options: [
      '(2, 5000), (4, 7000)',
      '(4, 7000), (2, 5000)',
      '(3, 4000), (4, 7000)',
      '(4, 7000)',
    ],
    points: 10,
  },

  // --- 윈도우함수 (33~36) ---
  {
    id: 'exam8_p33',
    title: '33. ROWS BETWEEN과 LAG 조합',
    description:
      '다음 SQL의 실행 결과에서 EMP_ID=4의 MOVING_AVG 값으로 올바른 것은?\n\nEMP_SALES(EMP_ID, SALE_DATE, AMOUNT)\n값(SALE_DATE 순서):\n(1, 2024-01-01, 100)\n(2, 2024-01-02, 200)\n(3, 2024-01-03, 150)\n(4, 2024-01-04, 300)\n(5, 2024-01-05, 250)\n\nSELECT EMP_ID,\n  AVG(AMOUNT) OVER (\n    ORDER BY SALE_DATE\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS MOVING_AVG\nFROM EMP_SALES;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 30,
    answer: '3',
    explanation:
      'ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는 현재 행 포함 이전 2개 행까지의 윈도우를 의미합니다.\n\nEMP_ID=4(4번째 행, AMOUNT=300)의 경우:\n- 윈도우 범위: 2 PRECEDING(EMP_ID=2, AMOUNT=200)부터 CURRENT ROW(EMP_ID=4, AMOUNT=300)\n- 포함되는 행: EMP_ID=2(200), EMP_ID=3(150), EMP_ID=4(300)\n- MOVING_AVG = (200 + 150 + 300) / 3 = 650 / 3 ≈ 216.67',
    options: ['200', '187.5', '216.67', '250'],
    points: 10,
  },
  {
    id: 'exam8_p34',
    title: '34. RANK와 DENSE_RANK 차이',
    description:
      '다음 데이터에서 RANK()와 DENSE_RANK()의 결과를 올바르게 비교한 것은?\n\nSCORE 데이터: 95, 88, 88, 75, 75, 60\n(ORDER BY SCORE DESC 기준)\n\n각 점수의 (RANK, DENSE_RANK)를 올바르게 나열한 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 52,
    answer: '1',
    explanation:
      'RANK(): 동점자 수를 포함하여 다음 순위가 건너뜁니다. 88이 2개이면 두 번째, 세 번째 자리를 차지하고 다음은 4위. 75가 2개이면 4위, 5위이고 다음은 6위.\nDENSE_RANK(): 동점자가 있어도 다음 순위를 건너뛰지 않습니다.\n\n결과:\n- 95: RANK=1, DENSE_RANK=1\n- 88(첫번째): RANK=2, DENSE_RANK=2\n- 88(두번째): RANK=2, DENSE_RANK=2\n- 75(첫번째): RANK=4, DENSE_RANK=3\n- 75(두번째): RANK=4, DENSE_RANK=3\n- 60: RANK=6, DENSE_RANK=4',
    options: [
      '95:(1,1), 88:(2,2), 88:(2,2), 75:(4,3), 75:(4,3), 60:(6,4)',
      '95:(1,1), 88:(2,2), 88:(3,3), 75:(4,3), 75:(5,4), 60:(6,5)',
      '95:(1,1), 88:(2,2), 88:(2,2), 75:(3,3), 75:(3,3), 60:(4,4)',
      '95:(1,1), 88:(2,2), 88:(2,2), 75:(4,3), 75:(4,3), 60:(5,4)',
    ],
    points: 10,
  },
  {
    id: 'exam8_p35',
    title: '35. PARTITION BY와 GROUP BY 차이',
    description:
      '다음 두 SQL의 차이에 대한 설명으로 올바른 것은?\n\n[SQL A]\nSELECT DEPT_ID, EMP_NAME, SALARY,\n  SUM(SALARY) OVER (PARTITION BY DEPT_ID) AS DEPT_TOTAL\nFROM EMP;\n\n[SQL B]\nSELECT DEPT_ID,\n  SUM(SALARY) AS DEPT_TOTAL\nFROM EMP\nGROUP BY DEPT_ID;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '윈도우함수',
    correctRate: 73,
    answer: '2',
    explanation:
      'GROUP BY(SQL B)는 집계 후 그룹당 하나의 행만 반환합니다. PARTITION BY와 OVER 절을 사용한 윈도우 함수(SQL A)는 원본 행을 유지하면서 각 행에 집계 값을 추가합니다. SQL A는 모든 직원 행(EMP_NAME, SALARY 포함)을 반환하며 각 행에 해당 부서의 DEPT_TOTAL이 함께 표시됩니다. SQL B는 부서별 하나의 요약 행만 반환하며 개별 직원 정보는 없습니다. 이것이 윈도우 함수의 핵심 특성입니다.',
    options: [
      'SQL A와 SQL B는 반환하는 행 수가 항상 동일하다.',
      'SQL A는 원본 행을 유지하면서 각 행에 부서 합계를 추가하고, SQL B는 부서별 요약 행만 반환한다.',
      'SQL B에서만 DEPT_ID별로 데이터가 파티션 분리되어 처리된다.',
      'SQL A의 OVER(PARTITION BY DEPT_ID)는 GROUP BY DEPT_ID와 완전히 동일한 방식으로 동작한다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p36',
    title: '36. NTILE과 PERCENT_RANK',
    description:
      '다음 SQL에서 SCORE가 72인 학생의 NTILE(4)과 PERCENT_RANK() 값으로 올바른 것은?\n\n전체 10명 학생의 SCORE(DESC 정렬): 98, 90, 85, 80, 76, 72, 65, 58, 50, 40\n\nSELECT SCORE,\n  NTILE(4) OVER (ORDER BY SCORE DESC) AS Q,\n  PERCENT_RANK() OVER (ORDER BY SCORE DESC) AS PR\nFROM STUDENTS;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 28,
    answer: '2',
    explanation:
      'NTILE(4): 10개 행을 4개 그룹으로 균등 분할. 10/4=2.5이므로 첫 2그룹은 3개, 나머지 2그룹은 2개씩. 그룹1(Q=1): 98,90,85 / 그룹2(Q=2): 80,76,72 / 그룹3(Q=3): 65,58 / 그룹4(Q=4): 50,40. SCORE=72는 6번째 행이므로 Q=2.\n\nPERCENT_RANK(): (RANK-1)/(N-1) = (6-1)/(10-1) = 5/9 ≈ 0.5556\n\n따라서 NTILE=2, PERCENT_RANK=0.5556.',
    options: [
      'NTILE=2, PERCENT_RANK=0.5',
      'NTILE=2, PERCENT_RANK=0.5556',
      'NTILE=3, PERCENT_RANK=0.5556',
      'NTILE=2, PERCENT_RANK=0.6',
    ],
    points: 10,
  },

  // --- 집합연산 (37~40) ---
  {
    id: 'exam8_p37',
    title: '37. ROLLUP vs CUBE vs GROUPING SETS',
    description:
      '다음 세 SQL의 결과 행 수를 비교하라.\n\n테이블: SALES(YEAR, QUARTER, PRODUCT, AMOUNT)\n\n[A] GROUP BY ROLLUP(YEAR, QUARTER)\n[B] GROUP BY CUBE(YEAR, QUARTER)\n[C] GROUP BY GROUPING SETS((YEAR, QUARTER), (YEAR), ())\n\nYEAR 고유값 2개, QUARTER 고유값 4개, 각 조합에 데이터 있음.\n\n결과 행 수를 올바르게 나열한 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 27,
    answer: '1',
    explanation:
      'YEAR 2개, QUARTER 4개로 각 조합에 데이터 있음.\n\n[A] ROLLUP(YEAR, QUARTER):\n- (YEAR, QUARTER) 소계: 2×4=8개\n- (YEAR) 소계: 2개\n- () 전체합계: 1개\n합계: 8+2+1=11개\n\n[B] CUBE(YEAR, QUARTER):\n- (YEAR, QUARTER): 2×4=8개\n- (YEAR): 2개\n- (QUARTER): 4개\n- (): 1개\n합계: 8+2+4+1=15개\n\n[C] GROUPING SETS((YEAR,QUARTER),(YEAR),()):\n- (YEAR, QUARTER): 8개\n- (YEAR): 2개\n- (): 1개\n합계: 8+2+1=11개\n\n따라서 A=11, B=15, C=11.',
    options: [
      'A=11, B=15, C=11',
      'A=11, B=15, C=13',
      'A=10, B=15, C=11',
      'A=11, B=11, C=15',
    ],
    points: 10,
  },
  {
    id: 'exam8_p38',
    title: '38. UNION과 UNION ALL 차이',
    description:
      '다음 두 SQL의 결과 행 수 차이에 대한 설명으로 올바른 것은?\n\n[테이블]\nA: (1,\'가\'),(2,\'나\'),(3,\'다\')\nB: (2,\'나\'),(3,\'라\'),(4,\'마\')\n\n[SQL1] SELECT * FROM A UNION SELECT * FROM B\n[SQL2] SELECT * FROM A UNION ALL SELECT * FROM B',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 80,
    answer: '3',
    explanation:
      'UNION은 중복을 제거하여 고유 행만 반환합니다. A와 B의 공통 행은 (2,\'나\')입니다. UNION 결과: (1,가),(2,나),(3,다),(3,라),(4,마) → 5개 행. UNION ALL은 중복 제거 없이 모든 행을 합칩니다. A(3개)+B(3개)=6개 행. 따라서 SQL1은 5개, SQL2는 6개, 차이는 1개입니다. UNION은 SORT와 중복 제거를 위한 추가 처리가 필요하여 UNION ALL보다 성능이 낮습니다.',
    options: [
      'SQL1=4개, SQL2=6개',
      'SQL1=5개, SQL2=5개',
      'SQL1=5개, SQL2=6개',
      'SQL1=6개, SQL2=6개',
    ],
    points: 10,
  },
  {
    id: 'exam8_p39',
    title: '39. INTERSECT와 MINUS 결과',
    description:
      '다음 SQL들의 실행 결과로 올바른 것은?\n\n[테이블]\nT1: (1),(2),(3),(4),(5)\nT2: (3),(4),(5),(6),(7)\n\n[SQL A] SELECT * FROM T1 INTERSECT SELECT * FROM T2\n[SQL B] SELECT * FROM T1 MINUS SELECT * FROM T2\n[SQL C] SELECT * FROM T2 MINUS SELECT * FROM T1',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 60,
    answer: '4',
    explanation:
      'INTERSECT: 두 집합의 교집합 → T1과 T2에 모두 있는 값: {3,4,5} → 3개 행\nMINUS (T1 MINUS T2): T1에는 있지만 T2에 없는 값: {1,2} → 2개 행\nMINUS (T2 MINUS T1): T2에는 있지만 T1에 없는 값: {6,7} → 2개 행\n\nA: {3,4,5}, B: {1,2}, C: {6,7}',
    options: [
      'A:{1,2,3,4,5}, B:{1,2}, C:{6,7}',
      'A:{3,4,5}, B:{3,4,5}, C:{3,4,5}',
      'A:{3,4,5}, B:{6,7}, C:{1,2}',
      'A:{3,4,5}, B:{1,2}, C:{6,7}',
    ],
    points: 10,
  },
  {
    id: 'exam8_p40',
    title: '40. 집합 연산의 ORDER BY',
    description:
      '다음 중 집합 연산(UNION, INTERSECT, MINUS)에서 ORDER BY 사용에 관한 규칙으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 55,
    answer: '3',
    explanation:
      '집합 연산에서 ORDER BY 규칙:\n1) ORDER BY는 전체 집합 연산 결과에 한 번만 적용 가능하며, 마지막 SELECT 뒤에 위치해야 합니다.\n2) 개별 SELECT 문에 ORDER BY를 사용하면 오류가 발생합니다(일부 DB에서 서브쿼리로 처리하는 경우 제외).\n3) ORDER BY 절에서는 첫 번째 SELECT 문의 컬럼명 또는 컬럼 위치 번호(1, 2, ...)를 사용할 수 있습니다.\n4) 집합 연산 후 ORDER BY는 컬럼 별칭(alias)으로도 사용 가능합니다.',
    options: [
      '각 SELECT 문에 ORDER BY를 개별 적용하여 정렬된 결과를 집합 연산할 수 있다.',
      '집합 연산 결과에 ORDER BY를 적용하려면 반드시 서브쿼리로 감싸야 한다.',
      'ORDER BY는 마지막 SELECT 뒤에 한 번만 사용하며, 컬럼 위치 번호로 정렬 가능하다.',
      'UNION ALL에서는 ORDER BY를 사용할 수 없다.',
    ],
    points: 10,
  },

  // --- DDL (41~44) ---
  {
    id: 'exam8_p41',
    title: '41. CTAS(CREATE TABLE AS SELECT) 특성',
    description:
      '다음 중 CTAS(CREATE TABLE AS SELECT)에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DDL',
    correctRate: 35,
    answer: '2',
    explanation:
      'CTAS(CREATE TABLE AS SELECT)의 특성:\n- 원본 테이블의 컬럼 구조(이름, 데이터 타입)를 복제합니다.\n- 단, 원본 테이블의 제약 조건(NOT NULL 제외한 PK, FK, UNIQUE, CHECK)은 복사되지 않습니다.\n- NOT NULL 제약 조건은 일부 DB에서 복사될 수 있으나 표준적으로는 제외됩니다.\n- 인덱스, 시퀀스, 트리거도 복사되지 않습니다.\n- SELECT 결과의 데이터를 포함하여 테이블을 생성합니다.\n따라서 "원본 테이블의 PK와 인덱스가 자동으로 복사된다"는 것은 올바르지 않은 설명입니다.',
    options: [
      'CTAS로 생성된 테이블에는 원본의 PK 제약 조건이 자동 복사되지 않는다.',
      'CTAS는 원본 테이블의 컬럼 구조와 모든 제약 조건(PK, FK, UNIQUE, INDEX)을 자동 복사한다.',
      'CTAS 실행 시 SELECT 결과의 데이터가 새 테이블에 함께 저장된다.',
      'CTAS에서 WHERE 조건으로 특정 데이터만 선택하여 테이블을 생성할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p42',
    title: '42. ALTER TABLE 데이터 타입 변경 제약',
    description:
      '다음 중 Oracle에서 ALTER TABLE로 컬럼의 데이터 타입이나 크기를 변경할 때 항상 허용되는 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DDL',
    correctRate: 30,
    answer: '4',
    explanation:
      'Oracle ALTER TABLE 컬럼 변경 규칙:\n- VARCHAR2 크기 증가: 항상 허용 (기존 데이터에 영향 없음)\n- VARCHAR2 크기 축소: 모든 데이터가 새 크기 이내에 맞아야 허용\n- NUMBER 정밀도/스케일 변경: 모든 데이터가 새 정밀도에 맞아야 허용\n- 데이터 타입 자체 변경(예: VARCHAR2→NUMBER): 컬럼이 비어있을 때만 허용\n- NOT NULL 제약 추가: 컬럼에 NULL 데이터가 없어야 허용\n따라서 데이터가 있어도 항상 허용되는 것은 VARCHAR2 컬럼 크기를 현재보다 크게 늘리는 것입니다.',
    options: [
      '데이터가 있는 VARCHAR2(100) 컬럼을 VARCHAR2(50)으로 축소',
      '데이터가 있는 VARCHAR2(100) 컬럼을 NUMBER(10)로 타입 변경',
      'NULL 데이터가 있는 컬럼에 NOT NULL 제약 조건 추가',
      '데이터가 있는 VARCHAR2(100) 컬럼을 VARCHAR2(200)으로 확장',
    ],
    points: 10,
  },
  {
    id: 'exam8_p43',
    title: '43. 제약 조건 종류와 특성',
    description:
      '다음 중 PRIMARY KEY, UNIQUE, NOT NULL 제약 조건을 올바르게 비교한 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 76,
    answer: '1',
    explanation:
      'PRIMARY KEY = UNIQUE + NOT NULL. PK는 테이블당 1개만 정의 가능하고, NULL 불허 및 중복 불허. UNIQUE는 테이블에 여러 개 정의 가능하며, NULL은 허용(NULL끼리는 중복으로 처리하지 않음 - Oracle 기준). NOT NULL은 단순히 NULL 값만 방지하며 중복은 허용. UNIQUE 제약이 있으면 Oracle은 자동으로 인덱스를 생성합니다. PK도 인덱스가 자동 생성됩니다.',
    options: [
      'PRIMARY KEY는 UNIQUE와 NOT NULL의 조합이며, 테이블당 1개만 정의 가능하다.',
      'UNIQUE 컬럼에는 NULL 값이 전혀 허용되지 않는다.',
      'NOT NULL과 UNIQUE를 함께 지정하면 PRIMARY KEY와 완전히 동일하며 여러 개 설정 가능하다.',
      'PRIMARY KEY 제약을 설정해도 인덱스는 별도로 수동 생성해야 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p44',
    title: '44. DROP, TRUNCATE, DELETE 비교',
    description:
      '테이블에 대한 DROP, TRUNCATE, DELETE 명령어를 비교한 내용으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 55,
    answer: '4',
    explanation:
      'DROP TABLE은 DDL로 테이블 구조 자체를 삭제하며 자동 COMMIT됩니다. TRUNCATE TABLE도 DDL로 테이블 구조는 유지하고 모든 데이터를 삭제하며 자동 COMMIT됩니다. DELETE는 DML로 트랜잭션 내에서 ROLLBACK 가능합니다. "TRUNCATE는 WHERE 조건으로 일부 데이터만 삭제 가능하다"는 것은 잘못된 설명입니다. TRUNCATE는 항상 모든 행을 삭제하며 조건 지정이 불가능합니다. 조건부 삭제는 DELETE만 가능합니다.',
    options: [
      'DROP은 테이블 구조와 데이터를 모두 삭제하며 ROLLBACK이 불가능하다.',
      'DELETE는 ROLLBACK이 가능하고, TRUNCATE는 ROLLBACK이 불가능하다.',
      'TRUNCATE는 DELETE보다 처리 속도가 빠르며 HWM(High Water Mark)을 초기화한다.',
      'TRUNCATE는 WHERE 조건을 사용하여 특정 행만 선택적으로 삭제할 수 있다.',
    ],
    points: 10,
  },

  // --- TCL (45~47) ---
  {
    id: 'exam8_p45',
    title: '45. SAVEPOINT와 중첩 DML 시나리오',
    description:
      '다음 트랜잭션 시나리오에서 마지막 ROLLBACK TO SP2 이후 테이블의 상태로 올바른 것은?\n\n[초기] T(ID): (1)\n\n① INSERT INTO T VALUES(2);\n② SAVEPOINT SP1;\n③ INSERT INTO T VALUES(3);\n④ SAVEPOINT SP2;\n⑤ INSERT INTO T VALUES(4);\n⑥ UPDATE T SET ID=10 WHERE ID=1;\n⑦ ROLLBACK TO SP2;\n\nROLLBACK TO SP2 직후 T 테이블의 내용은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 32,
    answer: '3',
    explanation:
      'SAVEPOINT 시나리오 분석:\n- 초기: T = {1}\n- ① INSERT 2: T = {1,2}\n- ② SAVEPOINT SP1 설정: 현재 상태 {1,2} 저장\n- ③ INSERT 3: T = {1,2,3}\n- ④ SAVEPOINT SP2 설정: 현재 상태 {1,2,3} 저장\n- ⑤ INSERT 4: T = {1,2,3,4}\n- ⑥ UPDATE ID=1→10: T = {10,2,3,4}\n- ⑦ ROLLBACK TO SP2: SP2 시점({1,2,3})으로 복원\n\nROLLBACK TO SP2 후: T = {1,2,3}\n(SP2는 ④에서 설정되었으므로 ③의 INSERT 3은 유지, ⑤와 ⑥은 취소됨)\nSP1과 SP2 자체는 ROLLBACK 후에도 유효합니다(SP2 이후 설정된 SAVEPOINT만 무효화).',
    options: [
      'T = {1, 2}',
      'T = {1}',
      'T = {1, 2, 3}',
      'T = {10, 2, 3}',
    ],
    points: 10,
  },
  {
    id: 'exam8_p46',
    title: '46. COMMIT과 LOCK 해제',
    description:
      '다음 중 트랜잭션의 COMMIT과 LOCK에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'TCL',
    correctRate: 52,
    answer: '2',
    explanation:
      'DML(INSERT, UPDATE, DELETE)을 실행하면 해당 행에 트랜잭션 LOCK이 걸립니다. COMMIT을 수행하면 변경 사항이 영구적으로 저장되고 LOCK이 해제됩니다. 다른 세션은 LOCK이 해제될 때까지(COMMIT 또는 ROLLBACK 전까지) 잠긴 행을 수정할 수 없습니다. ROLLBACK도 LOCK을 해제합니다. DDL(ALTER, DROP, TRUNCATE, CREATE)은 자동으로 COMMIT을 수행하여 이전 트랜잭션의 DML도 함께 COMMIT됩니다. 이것이 DDL 실행 전 명시적 COMMIT이 중요한 이유입니다.',
    options: [
      'DML 실행 후 다른 세션은 잠긴 행을 읽는 것도 불가능하다.',
      'COMMIT 또는 ROLLBACK을 수행하면 트랜잭션 LOCK이 해제된다.',
      'DDL을 실행해도 이전 DML의 LOCK에는 영향을 주지 않는다.',
      'SAVEPOINT를 설정하면 해당 시점의 LOCK도 함께 저장되어 관리된다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p47',
    title: '47. 암시적 COMMIT 발생 상황',
    description:
      '다음 SQL 실행 시퀀스에서 암시적(Implicit) COMMIT이 발생하는 시점으로 올바른 것은?\n\n① INSERT INTO EMP VALUES(100, \'홍길동\', 10);\n② UPDATE EMP SET SAL = 5000 WHERE EMP_ID = 100;\n③ CREATE TABLE TEMP_LOG (LOG_ID NUMBER);\n④ DELETE FROM EMP WHERE EMP_ID = 100;\n⑤ COMMIT;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'TCL',
    correctRate: 58,
    answer: '2',
    explanation:
      'DDL 명령어(CREATE, DROP, ALTER, TRUNCATE 등)는 실행 전 자동 COMMIT을 수행하여 이전 트랜잭션을 확정하고, 실행 후에도 자동 COMMIT을 수행합니다. ③ CREATE TABLE TEMP_LOG 실행 시점에 암시적 COMMIT이 발생합니다. 이로 인해 ①의 INSERT와 ②의 UPDATE가 자동으로 COMMIT됩니다. 이후 ④의 DELETE는 새로운 트랜잭션으로 시작되며 ⑤의 명시적 COMMIT으로 확정됩니다. 따라서 암시적 COMMIT은 ③ CREATE TABLE 실행 시 발생합니다.',
    options: [
      '② UPDATE 실행 시',
      '③ CREATE TABLE 실행 시',
      '④ DELETE 실행 시',
      '암시적 COMMIT은 발생하지 않으며 ⑤의 COMMIT에서만 확정된다.',
    ],
    points: 10,
  },

  // --- DCL (48) ---
  {
    id: 'exam8_p48',
    title: '48. GRANT와 REVOKE',
    description:
      '다음 SQL의 실행 결과에 대한 설명으로 올바른 것은?\n\n-- 관리자(ADMIN)가 실행:\nGRANT SELECT ON EMP TO USER_A WITH GRANT OPTION;\n\n-- USER_A가 실행:\nGRANT SELECT ON EMP TO USER_B;\n\n-- 관리자(ADMIN)가 실행:\nREVOKE SELECT ON EMP FROM USER_A;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DCL',
    correctRate: 38,
    answer: '4',
    explanation:
      'WITH GRANT OPTION을 포함하여 권한을 부여받은 경우, 해당 사용자는 다른 사용자에게 같은 권한을 부여할 수 있습니다. ADMIN이 USER_A에게 WITH GRANT OPTION으로 SELECT 권한을 부여했고, USER_A는 USER_B에게 SELECT 권한을 부여했습니다. ADMIN이 USER_A의 권한을 REVOKE하면, CASCADE 효과로 USER_A가 부여한 USER_B의 권한도 함께 취소됩니다. 이것이 WITH GRANT OPTION의 중요한 특성으로, 권한 관리의 연쇄 취소(Cascade Revoke)가 발생합니다.',
    options: [
      'USER_A의 권한 취소 후 USER_B는 USER_A와 무관하게 독립적으로 권한이 유지된다.',
      'REVOKE 후 USER_A와 USER_B 모두 SELECT 권한이 유지된다.',
      'USER_A의 권한만 취소되고 USER_B는 별도 REVOKE가 필요하다.',
      'USER_A의 권한 취소 시 USER_A가 부여한 USER_B의 권한도 연쇄적으로 취소된다.',
    ],
    points: 10,
  },

  // --- 계층형 쿼리 (49~50) ---
  {
    id: 'exam8_p49',
    title: '49. CONNECT BY와 계층 쿼리',
    description:
      '다음 Oracle 계층형 쿼리에서 LEVEL 값과 PRIOR의 역할로 올바른 것은?\n\nEMP(EMP_ID, EMP_NAME, MANAGER_ID)\n값: (1,\'CEO\',NULL), (2,\'부장\',1), (3,\'과장\',2), (4,\'대리\',3)\n\nSELECT EMP_ID, EMP_NAME, LEVEL\nFROM EMP\nSTART WITH MANAGER_ID IS NULL\nCONNECT BY PRIOR EMP_ID = MANAGER_ID;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 33,
    answer: '1',
    explanation:
      'START WITH MANAGER_ID IS NULL: 루트 노드는 CEO(EMP_ID=1). CONNECT BY PRIOR EMP_ID = MANAGER_ID: 부모의 EMP_ID가 자식의 MANAGER_ID와 같을 때 연결 → 하향식 탐색(부모→자식).\n\nLEVEL 결과:\n- CEO(1): LEVEL=1\n- 부장(2): LEVEL=2 (매니저=CEO)\n- 과장(3): LEVEL=3 (매니저=부장)\n- 대리(4): LEVEL=4 (매니저=과장)\n\nPRIOR는 이전 레코드(부모 레코드)의 컬럼을 참조합니다. PRIOR EMP_ID는 부모의 EMP_ID를 의미합니다.',
    options: [
      'CEO=LEVEL1, 부장=LEVEL2, 과장=LEVEL3, 대리=LEVEL4이며 PRIOR EMP_ID는 부모 행의 EMP_ID를 참조한다.',
      'CEO=LEVEL0, 부장=LEVEL1, 과장=LEVEL2, 대리=LEVEL3이며 LEVEL은 0부터 시작한다.',
      'PRIOR MANAGER_ID = EMP_ID로 수정해야 하향식 탐색이 가능하다.',
      'START WITH를 제거하면 자동으로 MANAGER_ID IS NULL인 행이 루트가 된다.',
    ],
    points: 10,
  },
  {
    id: 'exam8_p50',
    title: '50. 계층 쿼리 NOCYCLE과 SYS_CONNECT_BY_PATH',
    description:
      '다음 Oracle 계층형 쿼리 관련 설명으로 올바른 것은?\n\nSELECT EMP_ID, EMP_NAME,\n  SYS_CONNECT_BY_PATH(EMP_NAME, \'/\') AS FULL_PATH,\n  CONNECT_BY_ROOT EMP_NAME AS ROOT_NAME\nFROM EMP\nSTART WITH MANAGER_ID IS NULL\nCONNECT BY NOCYCLE PRIOR EMP_ID = MANAGER_ID;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '계층형쿼리',
    correctRate: 45,
    answer: '3',
    explanation:
      'SYS_CONNECT_BY_PATH(컬럼, 구분자): 루트에서 현재 노드까지의 경로를 구분자로 연결하여 반환. 예: CEO→부장→과장 경로에서 과장의 SYS_CONNECT_BY_PATH는 \'/CEO/부장/과장\'.\n\nCONNECT_BY_ROOT 컬럼: 현재 계층의 루트(최상위) 노드의 컬럼 값을 반환.\n\nNOCYCLE: 데이터에 순환 참조(A→B→C→A)가 있을 때 무한 루프를 방지하며 순환 발견 시 해당 경로를 중단합니다. NOCYCLE 없이 순환 참조가 있으면 오류가 발생합니다.',
    options: [
      'SYS_CONNECT_BY_PATH는 현재 노드에서 루트까지 역방향 경로를 반환한다.',
      'NOCYCLE을 사용하면 순환 참조가 있는 행 전체를 결과에서 제외한다.',
      'NOCYCLE은 순환 참조 발생 시 해당 경로를 중단하여 무한 루프를 방지한다.',
      'CONNECT_BY_ROOT는 현재 행의 직접 부모 노드 값을 반환한다.',
    ],
    points: 10,
  },
];
