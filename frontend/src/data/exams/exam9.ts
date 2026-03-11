import type { Problem } from '../../types';

// SQLD 모의고사 9회 (고급 난이도 - 목표 합격률 ~40%)
// 1과목: 데이터 모델링의 이해 (10문항, 20점)
// 2과목: SQL 기본 및 활용 (40문항, 80점)
// 난이도 배분: easy 8 / medium 22 / hard 20

export const EXAM_9_PROBLEMS: Problem[] = [
  // ===== 1과목: 데이터 모델링의 이해 (1~10번) =====
  // --- 데이터모델링 (1~5) ---
  {
    id: 'exam9_p1',
    title: '1. 엔터티 도출 적정성 판단',
    description:
      '다음 업무 요건을 분석하여 엔터티를 도출하려 한다.\n\n[업무 요건]\n- 병원은 여러 진료과를 운영하며, 각 진료과에는 복수의 의사가 소속된다.\n- 환자는 진료 예약을 통해 특정 의사에게 진료를 받는다.\n- 하나의 진료에 대해 여러 건의 처방이 발생할 수 있다.\n- 처방에는 약품 처방과 검사 처방 두 종류가 있다.\n- 약품은 약품 분류 체계에 따라 관리된다.\n\n다음 중 엔터티 도출 결과로 가장 적절하지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 32,
    answer: '3',
    explanation:
      '진료예약과 진료는 별도의 엔터티로 분리되어야 합니다. 예약은 미래 시점의 일정 관리이고, 진료는 실제 수행된 의료 행위를 기록하는 것으로 성격이 다릅니다. 또한 예약 취소, 예약 변경 등의 이력이 진료와 독립적으로 관리되어야 합니다. 진료예약을 진료 엔터티의 속성으로 포함시키면 예약만 존재하고 진료가 아직 수행되지 않은 상태를 표현하기 어렵습니다.',
    options: [
      '병원, 진료과, 의사, 환자, 진료예약, 진료, 처방, 약품처방, 검사처방, 약품, 약품분류를 엔터티로 도출한다.',
      '처방을 슈퍼타입으로, 약품처방과 검사처방을 서브타입으로 모델링한다.',
      '진료예약은 별도 엔터티 없이 진료 엔터티의 속성(예약일시, 예약상태)으로 포함시킨다.',
      '약품분류는 계층 구조를 가질 수 있으므로 자기참조(Self-Reference) 관계를 설정한다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p2',
    title: '2. 논리 모델의 관계 해석',
    description:
      '다음 논리 모델의 관계를 해석한 것 중 올바르지 않은 것은?\n\n[관계 표기]\n수강신청 ─── 학생 (N:1, 수강신청 쪽 필수)\n수강신청 ─── 강좌 (N:1, 수강신청 쪽 필수)\n강좌 ─── 교수 (N:1, 강좌 쪽 필수)\n학생 ─── 학과 (N:1, 학생 쪽 선택)\n성적 ─── 수강신청 (1:1, 성적 쪽 선택)',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 48,
    answer: '4',
    explanation:
      '성적과 수강신청이 1:1 관계이고 성적 쪽이 선택적이라는 것은, 하나의 수강신청에 대해 성적이 0건 또는 1건 존재할 수 있다는 의미입니다. 즉, 수강신청은 했지만 아직 성적이 부여되지 않은 상태가 가능합니다. 보기 4번은 "수강신청 없이 성적만 단독 존재 가능"이라고 했지만, 성적→수강신청 관계에서 수강신청 쪽이 필수이므로 수강신청 없는 성적은 존재할 수 없습니다.',
    options: [
      '한 학생은 여러 강좌에 수강신청할 수 있고, 한 강좌에 여러 학생이 수강신청할 수 있다.',
      '학과에 소속되지 않은 학생(무학과)이 존재할 수 있다.',
      '수강신청은 했지만 아직 성적이 부여되지 않은 상태가 존재할 수 있다.',
      '수강신청 없이 성적만 단독으로 존재할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p3',
    title: '3. 속성의 분류와 특징',
    description:
      '다음 중 속성(Attribute)의 분류에 대한 설명으로 가장 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '데이터모델링',
    correctRate: 72,
    answer: '2',
    explanation:
      '설계속성(Designed Attribute)은 업무에 필요한 데이터 이외에 시스템 설계 단계에서 데이터를 효과적으로 관리하기 위해 추가한 속성입니다. 일련번호, 코드 등이 대표적입니다. 파생속성(Derived Attribute)은 다른 속성으로부터 계산되거나 유도되어 생성되는 속성으로, 합계, 평균, 나이(생년월일로부터 계산) 등이 해당됩니다. 보기 2번은 설계속성과 파생속성의 설명을 뒤바꿔 놓았습니다.',
    options: [
      '기본속성(Basic Attribute)은 업무로부터 직접 추출한 속성으로, 이름, 전화번호 등이 해당한다.',
      '설계속성(Designed Attribute)은 다른 속성들로부터 계산이나 변환에 의해 생성되는 속성이다.',
      '파생속성은 데이터 정합성 유지를 위해 가급적 최소화하는 것이 바람직하다.',
      '하나의 엔터티에는 기본속성, 설계속성, 파생속성이 혼재할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p4',
    title: '4. 식별자 관계와 비식별자 관계',
    description:
      '다음 테이블 설계를 보고, 식별자 관계(Identifying)와 비식별자 관계(Non-Identifying)의 적용이 올바르지 않은 것은?\n\n[테이블 구조]\n주문(주문번호 PK)\n주문상세(주문번호 PK/FK, 상세순번 PK) → 주문 참조\n배송(배송번호 PK, 주문번호 FK) → 주문 참조\n결제(결제번호 PK, 주문번호 FK NOT NULL) → 주문 참조',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 28,
    answer: '4',
    explanation:
      '주문상세는 주문번호가 PK의 일부(PK/FK)이므로 주문과 식별자 관계입니다. 배송은 배송번호가 독립 PK이고 주문번호는 일반 FK이므로 비식별자 관계입니다. 결제도 결제번호가 독립 PK이고 주문번호는 일반 FK(NOT NULL)이므로 비식별자 관계입니다. 보기 4번은 결제의 주문번호에 NOT NULL이 붙어있으므로 식별자 관계라고 했지만, NOT NULL 제약은 필수 참여를 의미할 뿐 식별자 관계를 의미하지 않습니다. 식별자 관계는 부모의 PK가 자식의 PK 일부가 되어야 합니다.',
    options: [
      '주문상세는 주문과 식별자 관계이며, 주문 없이 주문상세가 독립적으로 존재할 수 없다.',
      '배송은 주문과 비식별자 관계이며, 배송번호라는 독자적인 식별자를 가진다.',
      '주문상세의 PK는 (주문번호, 상세순번)으로 구성된 복합 식별자이다.',
      '결제는 주문번호가 NOT NULL이므로 주문과 식별자 관계에 해당한다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p5',
    title: '5. 데이터 모델 품질 검증',
    description:
      '다음 중 데이터 모델의 품질 검증 기준에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 52,
    answer: '3',
    explanation:
      '완전성(Completeness)은 업무에 필요한 모든 데이터가 모델에 정의되어 있는지를 검증하는 기준입니다. 중복성(Non-Redundancy)은 동일한 정보가 여러 곳에 중복 저장되지 않는지를 검증합니다. 보기 3번은 "일관성은 동일한 데이터가 중복 없이 하나의 장소에서만 관리되는 것"이라고 했지만, 이는 중복성(Non-Redundancy)에 대한 설명입니다. 일관성(Consistency)은 데이터 모델의 구조, 명명 규칙, 관계 정의 등이 전체적으로 모순 없이 통일되어 있는지를 검증하는 기준입니다.',
    options: [
      '완전성은 업무에서 필요로 하는 모든 데이터가 데이터 모델에 정의되어 있는지 확인한다.',
      '준거성은 데이터 모델이 표기법, 명명규칙 등의 표준을 준수하고 있는지 확인한다.',
      '일관성은 동일한 데이터가 중복 없이 하나의 장소에서만 관리되는 것을 의미한다.',
      '활용성은 데이터 모델이 실제 업무 활용과 향후 확장에 적합한 구조인지 확인한다.',
    ],
    points: 10,
  },
  // --- 정규화 (6~10) ---
  {
    id: 'exam9_p6',
    title: '6. 정규화 단계별 이상 현상 분석',
    description:
      '다음 테이블에서 발생할 수 있는 이상 현상과 이를 해결하기 위한 정규화 단계를 올바르게 짝지은 것은?\n\n[수강 테이블]\n| 학번 | 과목코드 | 교수명 | 교수소속학과 | 성적 |\n|------|----------|--------|-------------|------|\n| S001 | C101 | 김교수 | 컴퓨터공학 | A+ |\n| S001 | C102 | 이교수 | 경영학 | B+ |\n| S002 | C101 | 김교수 | 컴퓨터공학 | A0 |\n\nPK: (학번, 과목코드)\n함수적 종속: 과목코드→교수명, 교수명→교수소속학과',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 25,
    answer: '2',
    explanation:
      '이 테이블에는 두 가지 문제가 있습니다. 첫째, 과목코드→교수명은 PK의 일부(과목코드)에만 종속되는 부분 함수 종속으로, 이는 2NF 위반입니다. 둘째, 교수명→교수소속학과는 PK가 아닌 일반 속성(교수명)에 종속되는 이행 함수 종속으로, 이는 3NF 위반입니다. 따라서 2NF를 적용하여 부분 종속을 제거하고, 이후 3NF를 적용하여 이행 종속을 제거해야 합니다.',
    options: [
      '교수소속학과가 과목코드에 직접 종속되므로 2NF만 적용하면 모든 이상 현상이 해결된다.',
      '2NF를 적용하여 부분 함수 종속을 제거하고, 3NF를 적용하여 이행 함수 종속을 제거해야 한다.',
      '교수명→교수소속학과는 다치 종속이므로 4NF를 적용해야 한다.',
      '모든 비주요 속성이 PK에 완전 함수 종속하므로 이 테이블은 이미 3NF이다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p7',
    title: '7. BCNF 위반 사례 판별',
    description:
      '다음 테이블이 3NF는 만족하지만 BCNF를 위반하는 경우를 올바르게 식별한 것은?\n\n[수강지도 테이블]\n| 학번 | 과목 | 담당교수 |\n|------|------|----------|\n\n제약 조건:\n- 한 학생은 같은 과목을 한 번만 수강한다.\n- 한 교수는 하나의 과목만 담당한다.\n- 같은 과목을 여러 교수가 담당할 수 있다.\n\n후보키: (학번, 과목), (학번, 담당교수)',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 22,
    answer: '3',
    explanation:
      '3NF는 비주요 속성이 후보키에 이행적으로 종속되지 않으면 만족됩니다. 이 테이블에서 모든 속성(학번, 과목, 담당교수)이 후보키의 구성원이므로 비주요 속성이 없어 3NF는 자동으로 만족됩니다. 그러나 BCNF는 모든 결정자가 후보키여야 합니다. 담당교수→과목이라는 함수적 종속이 존재하는데, 담당교수는 후보키가 아닙니다. 따라서 후보키가 아닌 담당교수가 결정자가 되어 BCNF를 위반합니다.',
    options: [
      '학번→과목이 성립하여 부분 함수 종속이 발생하므로 BCNF를 위반한다.',
      '과목→담당교수가 성립하고 과목이 후보키가 아니므로 BCNF를 위반한다.',
      '담당교수→과목이 성립하고 담당교수가 후보키가 아니므로 BCNF를 위반한다.',
      '비주요 속성이 존재하지 않으므로 3NF와 BCNF를 모두 만족한다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p8',
    title: '8. 반정규화의 적용 판단',
    description:
      '다음 상황에서 반정규화(Denormalization) 기법의 적용이 가장 부적절한 경우는?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 55,
    answer: '4',
    explanation:
      '반정규화는 읽기 성능을 위해 데이터 중복을 허용하는 기법으로, 조회 빈도가 높고 조인 비용이 큰 경우에 적용합니다. 보기 4번의 경우, INSERT가 초당 수천 건이고 조회는 거의 없는 로그 테이블에 반정규화를 적용하면 쓰기 부담만 증가합니다. 반정규화는 데이터 중복 관리 비용이 발생하므로 쓰기 위주의 테이블에는 오히려 성능 저하를 유발합니다.',
    options: [
      '월별 매출 집계를 위해 매번 수백만 건의 주문 데이터를 GROUP BY 하는 것을 피하고자 월별 매출 합계 컬럼을 추가하는 경우',
      '자주 조회되는 고객 목록에서 매번 등급 테이블을 조인하는 비용을 줄이기 위해 고객 테이블에 등급명을 중복 저장하는 경우',
      '게시판 목록 조회 시 매번 댓글 테이블을 COUNT 하는 비용을 줄이기 위해 게시글 테이블에 댓글 수 컬럼을 추가하는 경우',
      'INSERT가 초당 수천 건 발생하고 조회는 거의 없는 센서 로그 테이블에 장비명을 중복 저장하는 경우',
    ],
    points: 10,
  },
  {
    id: 'exam9_p9',
    title: '9. 함수적 종속성 추론',
    description:
      '다음 함수적 종속이 주어졌을 때, Armstrong 공리를 적용하여 추론할 수 있는 함수적 종속으로 올바르지 않은 것은?\n\nFD1: A → B\nFD2: B → C\nFD3: C, D → E\nFD4: A → D',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 26,
    answer: '4',
    explanation:
      'Armstrong 공리(반사율, 확대율, 이행률)를 적용합니다. A→B(FD1)이고 B→C(FD2)이므로 이행률에 의해 A→C가 성립합니다. A→D(FD4)이고 A→C(방금 추론)이므로 A→C,D가 성립합니다. C,D→E(FD3)이므로 A→E가 성립합니다. 따라서 A→B,C,D,E가 모두 성립합니다. 그러나 E→A는 주어진 종속에서 추론할 수 없습니다. E를 결정자로 하는 어떤 함수적 종속도 주어지지 않았기 때문입니다.',
    options: [
      'A → C (FD1과 FD2의 이행률 적용)',
      'A → E (A→C,D 추론 후 FD3 적용)',
      'A → B, C, D, E (위 추론 결과의 합집합)',
      'E → A (FD3의 역방향 적용)',
    ],
    points: 10,
  },
  {
    id: 'exam9_p10',
    title: '10. 정규화와 성능의 관계',
    description:
      '다음 중 정규화와 데이터베이스 성능에 대한 설명으로 가장 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 58,
    answer: '2',
    explanation:
      '정규화를 수행하면 테이블이 분해되어 조인이 증가하지만, 각 테이블의 크기가 줄어들어 조회 범위가 감소합니다. 또한 중복이 제거되므로 UPDATE 시 하나의 레코드만 수정하면 되어 갱신 성능이 향상됩니다. 정규화가 항상 조회 성능을 저하시키는 것은 아니며, 오히려 불필요한 컬럼이 제거된 좁은 테이블에서의 인덱스 스캔이 더 효율적일 수 있습니다.',
    options: [
      '정규화는 항상 조회 성능을 저하시키므로 운영 환경에서는 반정규화가 필수이다.',
      '정규화를 통해 테이블 크기가 줄어들면 오히려 특정 조회 패턴에서 성능이 향상될 수 있다.',
      '5NF까지 정규화를 완료하면 어떤 경우에도 데이터 이상 현상이 발생하지 않는다.',
      '정규화 수준이 높을수록 INSERT 성능은 반드시 저하된다.',
    ],
    points: 10,
  },

  // ===== 2과목: SQL 기본 및 활용 (11~50번) =====
  // --- JOIN (11~17) ---
  {
    id: 'exam9_p11',
    title: '11. NATURAL JOIN과 USING 절의 차이',
    description:
      '다음 두 테이블이 있다.\n\nCREATE TABLE 부서 (부서ID NUMBER, 부서명 VARCHAR2(50), 위치ID NUMBER);\nCREATE TABLE 직원 (직원ID NUMBER, 이름 VARCHAR2(50), 부서ID NUMBER, 위치ID NUMBER);\n\n다음 중 NATURAL JOIN에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 42,
    answer: '3',
    explanation:
      'NATURAL JOIN은 두 테이블에서 동일한 이름을 가진 모든 컬럼을 자동으로 조인 조건에 사용합니다. 부서와 직원 테이블에는 부서ID와 위치ID라는 두 개의 동일 이름 컬럼이 있으므로, NATURAL JOIN은 부서ID와 위치ID 모두를 조인 조건으로 사용합니다. 만약 부서ID만으로 조인하고 싶다면 SELECT * FROM 직원 JOIN 부서 USING (부서ID)를 사용해야 합니다.',
    options: [
      'NATURAL JOIN은 부서ID만을 조인 조건으로 사용하며, 위치ID는 무시한다.',
      'NATURAL JOIN 결과에서 부서ID와 위치ID 컬럼이 각각 두 번씩 나타난다.',
      'NATURAL JOIN은 부서ID와 위치ID 모두를 조인 조건으로 사용하므로 USING (부서ID)와 결과가 다를 수 있다.',
      'NATURAL JOIN에서 특정 컬럼을 제외하려면 EXCEPT 키워드를 사용한다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p12',
    title: '12. 다중 테이블 OUTER JOIN 결과 분석',
    description:
      '다음 3개 테이블과 쿼리의 결과 행 수를 구하시오.\n\nT1: (1), (2), (3)\nT2: (1), (2)\nT3: (1)\n\n(각 테이블은 id 컬럼 하나만 보유)\n\nSELECT T1.id, T2.id, T3.id\nFROM T1\nLEFT OUTER JOIN T2 ON T1.id = T2.id\nLEFT OUTER JOIN T3 ON T2.id = T3.id;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 45,
    answer: '2',
    explanation:
      'LEFT OUTER JOIN이므로 T1의 모든 행이 유지됩니다.\n- T1.id=1: T2.id=1 매칭, T3.id=1 매칭 → (1, 1, 1)\n- T1.id=2: T2.id=2 매칭, T3에 id=2 없음 → (2, 2, NULL)\n- T1.id=3: T2에 id=3 없음 → T2.id=NULL, T3 조인 조건이 NULL=T3.id로 매칭 불가 → (3, NULL, NULL)\n\n따라서 총 3행이 반환됩니다.',
    options: [
      '1행',
      '3행',
      '6행',
      '9행',
    ],
    points: 10,
  },
  {
    id: 'exam9_p13',
    title: '13. CROSS JOIN과 셀프 조인 조합',
    description:
      '다음 테이블과 쿼리의 결과 행 수는?\n\nCREATE TABLE 색상 (코드 CHAR(1));\nINSERT INTO 색상 VALUES (\'R\');\nINSERT INTO 색상 VALUES (\'G\');\nINSERT INTO 색상 VALUES (\'B\');\n\nSELECT A.코드 AS 색상1, B.코드 AS 색상2\nFROM 색상 A CROSS JOIN 색상 B\nWHERE A.코드 < B.코드;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 68,
    answer: '1',
    explanation:
      'CROSS JOIN은 카테시안 곱으로 3×3=9행을 만듭니다. WHERE A.코드 < B.코드 조건으로 필터링하면:\n- (B, G), (B, R), (G, R) → 3행\nCHAR 타입의 비교는 ASCII 값으로 하며, B(66) < G(71) < R(82)입니다.',
    options: [
      '3행',
      '6행',
      '9행',
      '0행',
    ],
    points: 10,
  },
  {
    id: 'exam9_p14',
    title: '14. FULL OUTER JOIN과 NULL 처리',
    description:
      '다음 두 테이블과 쿼리의 결과로 올바른 것은?\n\n고객 테이블: (고객ID: 10, 이름: \'김\'), (고객ID: 20, 이름: \'이\'), (고객ID: 30, 이름: \'박\')\n주문 테이블: (주문ID: 1, 고객ID: 10), (주문ID: 2, 고객ID: 20), (주문ID: 3, 고객ID: 40)\n\nSELECT COUNT(*)\nFROM 고객 C FULL OUTER JOIN 주문 O ON C.고객ID = O.고객ID\nWHERE C.고객ID IS NULL OR O.주문ID IS NULL;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 30,
    answer: '3',
    explanation:
      'FULL OUTER JOIN 결과:\n- (10, 김, 1, 10) → 매칭\n- (20, 이, 2, 20) → 매칭\n- (30, 박, NULL, NULL) → 고객만 존재 (주문 없음)\n- (NULL, NULL, 3, 40) → 주문만 존재 (고객 없음)\n\nWHERE 조건: C.고객ID IS NULL OR O.주문ID IS NULL\n- (30, 박, NULL, NULL): O.주문ID IS NULL → 통과\n- (NULL, NULL, 3, 40): C.고객ID IS NULL → 통과\n\n따라서 COUNT(*)=2입니다.',
    options: [
      '1',
      '3',
      '2',
      '4',
    ],
    points: 10,
  },
  {
    id: 'exam9_p15',
    title: '15. 비등가 조인(Non-Equi Join) 활용',
    description:
      '다음 테이블과 쿼리의 결과로 올바른 것은?\n\nCREATE TABLE 등급기준 (\n  등급 VARCHAR2(10), 하한 NUMBER, 상한 NUMBER\n);\n-- 데이터: (\'Bronze\', 0, 999), (\'Silver\', 1000, 4999), (\'Gold\', 5000, 9999)\n\nCREATE TABLE 고객 (\n  고객명 VARCHAR2(20), 누적구매액 NUMBER\n);\n-- 데이터: (\'김\', 500), (\'이\', 1000), (\'박\', 5000), (\'최\', 10000)\n\nSELECT G.고객명, E.등급\nFROM 고객 G JOIN 등급기준 E\nON G.누적구매액 BETWEEN E.하한 AND E.상한;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 50,
    answer: '2',
    explanation:
      'BETWEEN은 하한과 상한을 모두 포함(inclusive)합니다.\n- 김(500): 0~999 범위 → Bronze\n- 이(1000): 1000~4999 범위 → Silver\n- 박(5000): 5000~9999 범위 → Gold\n- 최(10000): 어떤 범위에도 해당하지 않음 → 결과에서 제외\n\n따라서 3행이 반환되며, 최 고객은 결과에 나타나지 않습니다.',
    options: [
      '4행 반환 (최 고객은 등급이 NULL로 표시)',
      '3행 반환 (최 고객은 등급 범위를 초과하여 제외됨)',
      '3행 반환 (김 고객이 하한 0에 해당하지 않아 제외됨)',
      '5행 반환 (이 고객이 Bronze와 Silver 두 등급에 모두 매칭됨)',
    ],
    points: 10,
  },
  {
    id: 'exam9_p16',
    title: '16. 셀프 조인을 통한 선후배 관계 추출',
    description:
      '다음 테이블과 쿼리의 결과 행 수는?\n\nCREATE TABLE 사원 (사번 NUMBER, 이름 VARCHAR2(20), 입사일 DATE);\n-- 데이터:\n-- (101, \'김\', \'2020-01-15\'),\n-- (102, \'이\', \'2020-01-15\'),\n-- (103, \'박\', \'2021-03-01\'),\n-- (104, \'최\', \'2022-06-10\')\n\nSELECT A.이름 AS 선배, B.이름 AS 후배\nFROM 사원 A JOIN 사원 B\nON A.입사일 < B.입사일;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 48,
    answer: '3',
    explanation:
      '셀프 조인에서 A.입사일 < B.입사일 조건으로 선배-후배 쌍을 구합니다.\n입사일 기준: 김=이(2020-01-15) < 박(2021-03-01) < 최(2022-06-10)\n\n- 김→박, 김→최 (2쌍)\n- 이→박, 이→최 (2쌍)\n- 박→최 (1쌍)\n\n김과 이는 입사일이 같으므로 서로 선후배 관계가 아닙니다.\n총 5행이 반환됩니다.',
    options: [
      '3행',
      '4행',
      '5행',
      '6행',
    ],
    points: 10,
  },
  {
    id: 'exam9_p17',
    title: '17. 복합 조인 조건과 결과 예측',
    description:
      '다음 테이블과 쿼리에서 결과에 포함되지 않는 행은?\n\nCREATE TABLE 프로젝트 (프로젝트ID CHAR(3), 시작일 DATE, 종료일 DATE);\n-- (\'P01\', \'2024-01-01\', \'2024-06-30\')\n-- (\'P02\', \'2024-04-01\', \'2024-12-31\')\n-- (\'P03\', \'2025-01-01\', \'2025-03-31\')\n\nCREATE TABLE 인력 (사번 NUMBER, 투입시작 DATE, 투입종료 DATE);\n-- (201, \'2024-03-01\', \'2024-09-30\')\n-- (202, \'2024-07-01\', \'2024-08-31\')\n-- (203, \'2025-04-01\', \'2025-06-30\')\n\nSELECT P.프로젝트ID, I.사번\nFROM 프로젝트 P JOIN 인력 I\nON I.투입시작 <= P.종료일\nAND I.투입종료 >= P.시작일;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 28,
    answer: '4',
    explanation:
      '이 조인 조건은 기간 겹침(overlap) 검사입니다. 두 기간이 겹치려면 "한쪽 시작이 다른쪽 종료 이전이고, 한쪽 종료가 다른쪽 시작 이후"여야 합니다.\n\n- P01(01~06) ∩ 201(03~09): 03≤06 AND 09≥01 → 겹침 ✓\n- P01(01~06) ∩ 202(07~08): 07≤06 → 거짓 → 겹치지 않음 ✗\n- P02(04~12) ∩ 201(03~09): 03≤12 AND 09≥04 → 겹침 ✓\n- P02(04~12) ∩ 202(07~08): 07≤12 AND 08≥04 → 겹침 ✓\n- P03(25/01~25/03) ∩ 203(25/04~25/06): 04/01≤03/31 → 거짓 → 겹치지 않음 ✗\n\n따라서 P03-203은 결과에 포함되지 않습니다.',
    options: [
      'P01-201',
      'P02-201',
      'P02-202',
      'P03-203',
    ],
    points: 10,
  },
  // --- 함수 (18~23) ---
  {
    id: 'exam9_p18',
    title: '18. NVL, NVL2, NULLIF, COALESCE 종합',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\nSELECT\n  NVL(NULL, \'X\') AS C1,\n  NVL2(NULL, \'A\', \'B\') AS C2,\n  NVL2(\'Y\', \'A\', \'B\') AS C3,\n  NULLIF(100, 100) AS C4,\n  COALESCE(NULL, NULL, 30, 40) AS C5\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 44,
    answer: '1',
    explanation:
      '각 함수의 동작:\n- NVL(NULL, \'X\'): 첫 번째 인자가 NULL이므로 \'X\' 반환 → C1=X\n- NVL2(NULL, \'A\', \'B\'): 첫 번째 인자가 NULL이면 세 번째 인자 반환 → C2=B\n- NVL2(\'Y\', \'A\', \'B\'): 첫 번째 인자가 NOT NULL이면 두 번째 인자 반환 → C3=A\n- NULLIF(100, 100): 두 값이 같으면 NULL 반환 → C4=NULL\n- COALESCE(NULL, NULL, 30, 40): 첫 번째 NOT NULL 값 반환 → C5=30',
    options: [
      'C1=X, C2=B, C3=A, C4=NULL, C5=30',
      'C1=NULL, C2=A, C3=B, C4=100, C5=30',
      'C1=X, C2=A, C3=B, C4=NULL, C5=40',
      'C1=X, C2=B, C3=A, C4=100, C5=30',
    ],
    points: 10,
  },
  {
    id: 'exam9_p19',
    title: '19. 문자열 함수 중첩 결과 예측',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\nSELECT\n  SUBSTR(REPLACE(\'2024-01-15\', \'-\', \'\'), 5, 4) AS C1,\n  LPAD(TRIM(\'  42  \'), 5, \'0\') AS C2,\n  INSTR(\'ABCABCABC\', \'BC\', 3, 2) AS C3\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 30,
    answer: '2',
    explanation:
      '단계별 분석:\n- C1: REPLACE(\'2024-01-15\', \'-\', \'\') → \'20240115\', SUBSTR(\'20240115\', 5, 4) → \'0115\'\n- C2: TRIM(\'  42  \') → \'42\', LPAD(\'42\', 5, \'0\') → \'00042\'\n- C3: INSTR(\'ABCABCABC\', \'BC\', 3, 2) → 3번째 위치부터 탐색을 시작하여 \'BC\'의 2번째 출현 위치를 찾음. 3번째 위치부터 보면 \'CABCABC\'. 1번째 BC는 위치 5(원본 기준), 2번째 BC는 위치 8(원본 기준) → C3=8',
    options: [
      'C1=0115, C2=00042, C3=5',
      'C1=0115, C2=00042, C3=8',
      'C1=0115, C2=42000, C3=8',
      'C1=2401, C2=00042, C3=5',
    ],
    points: 10,
  },
  {
    id: 'exam9_p20',
    title: '20. DECODE와 CASE 표현식 비교',
    description:
      '다음 두 쿼리의 결과가 다른 경우를 올바르게 설명한 것은?\n\n-- 쿼리 A\nSELECT DECODE(NULL, NULL, \'같음\', \'다름\') AS 결과A FROM DUAL;\n\n-- 쿼리 B\nSELECT CASE NULL WHEN NULL THEN \'같음\' ELSE \'다름\' END AS 결과B FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 25,
    answer: '3',
    explanation:
      'DECODE 함수는 NULL과 NULL을 같다고 판단합니다. 따라서 DECODE(NULL, NULL, \'같음\', \'다름\')은 \'같음\'을 반환합니다.\n반면 CASE 표현식에서 CASE NULL WHEN NULL THEN은 내부적으로 NULL = NULL로 비교하는데, SQL에서 NULL = NULL은 UNKNOWN이므로 THEN 절을 실행하지 않고 ELSE로 빠져 \'다름\'을 반환합니다.\n이것은 DECODE와 CASE의 중요한 차이점입니다.',
    options: [
      '두 쿼리 모두 \'같음\'을 반환한다.',
      '두 쿼리 모두 \'다름\'을 반환한다.',
      '쿼리 A는 \'같음\', 쿼리 B는 \'다름\'을 반환한다.',
      '쿼리 A는 \'다름\', 쿼리 B는 \'같음\'을 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p21',
    title: '21. 날짜 함수와 형변환',
    description:
      '다음 쿼리의 결과로 올바른 것은? (Oracle 기준)\n\nSELECT\n  TO_CHAR(ADD_MONTHS(TO_DATE(\'20240131\', \'YYYYMMDD\'), 1), \'YYYYMMDD\') AS C1,\n  TO_CHAR(LAST_DAY(TO_DATE(\'2024-02-10\', \'YYYY-MM-DD\')), \'DD\') AS C2,\n  MONTHS_BETWEEN(TO_DATE(\'20240501\', \'YYYYMMDD\'), TO_DATE(\'20240201\', \'YYYYMMDD\')) AS C3\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 40,
    answer: '4',
    explanation:
      '각 결과:\n- C1: 2024-01-31에 1개월을 더하면 Oracle의 ADD_MONTHS는 월말 처리를 합니다. 2024년 2월의 마지막 날은 29일(윤년)이므로 C1=20240229\n- C2: 2024-02-10의 해당 월 마지막 날은 2024-02-29(윤년)이므로 C2=29\n- C3: MONTHS_BETWEEN은 두 날짜 사이의 개월 수를 반환합니다. 5월1일-2월1일=3개월 → C3=3',
    options: [
      'C1=20240228, C2=28, C3=3',
      'C1=20240301, C2=29, C3=3',
      'C1=20240229, C2=29, C3=2',
      'C1=20240229, C2=29, C3=3',
    ],
    points: 10,
  },
  {
    id: 'exam9_p22',
    title: '22. 숫자 함수 결과 예측',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\nSELECT\n  ROUND(156.789, -2) AS C1,\n  TRUNC(156.789, -1) AS C2,\n  MOD(-15, 4) AS C3,\n  CEIL(-3.7) AS C4\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 42,
    answer: '1',
    explanation:
      '각 결과:\n- C1: ROUND(156.789, -2)는 소수점 기준 왼쪽 2자리(백의 자리)에서 반올림. 156을 백의 자리에서 반올림하면 200 → C1=200\n- C2: TRUNC(156.789, -1)는 십의 자리 아래를 버림. 156 → 150 → C2=150\n- C3: MOD(-15, 4)는 -15를 4로 나눈 나머지. Oracle에서 MOD(a,b) = a - b*TRUNC(a/b). TRUNC(-15/4)=TRUNC(-3.75)=-3. -15 - 4*(-3) = -15+12 = -3 → C3=-3\n- C4: CEIL(-3.7)는 -3.7보다 크거나 같은 가장 작은 정수 → -3 → C4=-3',
    options: [
      'C1=200, C2=150, C3=-3, C4=-3',
      'C1=200, C2=150, C3=1, C4=-4',
      'C1=100, C2=150, C3=-3, C4=-3',
      'C1=200, C2=160, C3=-3, C4=-4',
    ],
    points: 10,
  },
  {
    id: 'exam9_p23',
    title: '23. 암시적 형변환과 비교 연산',
    description:
      '다음 중 Oracle에서 암시적 형변환(Implicit Type Conversion)으로 인해 인덱스를 사용하지 못하는 쿼리를 올바르게 식별한 것은?\n\n-- 테이블: 주문 (주문코드 VARCHAR2(10) PK, 주문금액 NUMBER, 주문일 DATE)\n-- 인덱스: 주문코드에 B-Tree 인덱스 존재\n\n① SELECT * FROM 주문 WHERE 주문코드 = 1001;\n② SELECT * FROM 주문 WHERE 주문코드 = \'1001\';\n③ SELECT * FROM 주문 WHERE 주문금액 = \'5000\';\n④ SELECT * FROM 주문 WHERE 주문일 = \'2024-01-15\';',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 32,
    answer: '1',
    explanation:
      '①에서 주문코드는 VARCHAR2 타입인데 숫자 1001과 비교합니다. Oracle은 문자와 숫자를 비교할 때 문자를 숫자로 변환합니다. 이때 주문코드 컬럼에 TO_NUMBER()가 적용되어 컬럼이 가공되므로 인덱스를 사용할 수 없습니다(인덱스 스캔 불가, Full Table Scan 발생).\n②는 VARCHAR2 = VARCHAR2로 형변환 없이 인덱스 사용 가능.\n③은 NUMBER 컬럼에 문자 \'5000\'이 숫자 5000으로 변환되며, 컬럼 자체는 변환되지 않으므로 인덱스가 있다면 사용 가능.\n④는 DATE 컬럼에 문자열이 NLS_DATE_FORMAT에 따라 변환됩니다.',
    options: [
      '①번 — VARCHAR2 컬럼에 숫자를 비교하여 컬럼에 TO_NUMBER()가 적용되므로 인덱스 사용 불가',
      '②번 — 문자열 리터럴이 인덱스 컬럼과 호환되지 않아 인덱스 사용 불가',
      '③번 — NUMBER 컬럼에 문자열을 비교하여 컬럼에 TO_CHAR()가 적용되므로 인덱스 사용 불가',
      '④번 — DATE 컬럼에 문자열을 비교하여 컬럼에 TO_CHAR()가 적용되므로 인덱스 사용 불가',
    ],
    points: 10,
  },
  // --- DML (24~28) ---
  {
    id: 'exam9_p24',
    title: '24. INSERT ALL과 조건부 INSERT',
    description:
      '다음 쿼리의 실행 결과로 올바른 것은?\n\nCREATE TABLE 상반기 (월 NUMBER, 매출 NUMBER);\nCREATE TABLE 하반기 (월 NUMBER, 매출 NUMBER);\nCREATE TABLE 전체 (월 NUMBER, 매출 NUMBER);\n\nINSERT ALL\n  WHEN 월 <= 6 THEN INTO 상반기 VALUES (월, 매출)\n  WHEN 월 > 6 THEN INTO 하반기 VALUES (월, 매출)\n  INTO 전체 VALUES (월, 매출)\nSELECT 3 AS 월, 500 AS 매출 FROM DUAL\nUNION ALL\nSELECT 9, 800 FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 25,
    answer: '2',
    explanation:
      'INSERT ALL에서 조건부 WHEN과 무조건 INTO가 혼합되어 있습니다.\n\n행1 (월=3, 매출=500):\n- WHEN 3<=6 → 상반기에 (3, 500) INSERT\n- WHEN 3>6 → 조건 불만족, 하반기 INSERT 안 함\n- 무조건 INTO 전체 → (3, 500) INSERT\n\n행2 (월=9, 매출=800):\n- WHEN 9<=6 → 조건 불만족\n- WHEN 9>6 → 하반기에 (9, 800) INSERT\n- 무조건 INTO 전체 → (9, 800) INSERT\n\n결과: 상반기 1행, 하반기 1행, 전체 2행 = 총 4행 INSERT',
    options: [
      '상반기 1행, 하반기 1행, 전체 0행',
      '상반기 1행, 하반기 1행, 전체 2행',
      '상반기 1행, 하반기 1행, 전체 1행',
      '오류 발생 (조건부와 무조건부 INSERT를 혼합할 수 없음)',
    ],
    points: 10,
  },
  {
    id: 'exam9_p25',
    title: '25. MERGE 문 동작 분석',
    description:
      '다음 MERGE 문 실행 후 재고 테이블의 상태로 올바른 것은?\n\n재고 테이블 (초기):\n| 상품코드 | 수량 |\n|----------|------|\n| A001 | 100 |\n| A002 | 50 |\n\n입고 테이블:\n| 상품코드 | 입고량 |\n|----------|--------|\n| A002 | 30 |\n| A003 | 200 |\n\nMERGE INTO 재고 T\nUSING 입고 S\nON (T.상품코드 = S.상품코드)\nWHEN MATCHED THEN\n  UPDATE SET T.수량 = T.수량 + S.입고량\nWHEN NOT MATCHED THEN\n  INSERT (상품코드, 수량) VALUES (S.상품코드, S.입고량);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 55,
    answer: '3',
    explanation:
      'MERGE 문은 대상(재고)과 소스(입고)를 ON 조건으로 비교합니다.\n\n- A002: 재고와 입고 모두 존재(MATCHED) → UPDATE: 수량 = 50 + 30 = 80\n- A003: 입고에만 존재(NOT MATCHED) → INSERT: (A003, 200)\n- A001: 재고에만 존재하지만 입고에 없으므로 MERGE 대상이 아님 → 변동 없음\n\n최종 재고: A001(100), A002(80), A003(200)',
    options: [
      'A001(100), A002(30), A003(200)',
      'A002(80), A003(200) — A001은 삭제됨',
      'A001(100), A002(80), A003(200)',
      'A001(100), A002(80)',
    ],
    points: 10,
  },
  {
    id: 'exam9_p26',
    title: '26. DELETE와 TRUNCATE의 차이',
    description:
      '다음 중 DELETE와 TRUNCATE에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 70,
    answer: '4',
    explanation:
      'DELETE는 DML로서 WHERE 절로 행 단위 삭제가 가능하고, ROLLBACK으로 복구할 수 있으며, 삭제 시 로그를 기록합니다. TRUNCATE는 DDL로서 테이블의 모든 행을 한 번에 제거하고, AUTO COMMIT이 발생하여 ROLLBACK이 불가능합니다. TRUNCATE는 DELETE보다 빠르지만 WHERE 절을 사용할 수 없습니다. 보기 4번의 "TRUNCATE는 테이블 구조도 함께 제거한다"는 틀린 설명으로, 테이블 구조를 제거하는 것은 DROP입니다.',
    options: [
      'DELETE는 WHERE 절을 사용하여 특정 행만 삭제할 수 있다.',
      'TRUNCATE는 DDL이므로 실행 즉시 AUTO COMMIT이 발생한다.',
      'DELETE는 행 단위로 로그를 기록하므로 대량 데이터 삭제 시 TRUNCATE보다 느리다.',
      'TRUNCATE는 테이블의 데이터와 함께 테이블 구조(컬럼 정의)도 제거한다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p27',
    title: '27. UPDATE 서브쿼리와 상관 관계',
    description:
      '다음 UPDATE 문 실행 후 결과로 올바른 것은?\n\n직원 테이블:\n| 사번 | 이름 | 부서코드 | 급여 |\n|------|------|----------|------|\n| 1 | 김 | D01 | 3000 |\n| 2 | 이 | D01 | 4000 |\n| 3 | 박 | D02 | 5000 |\n\n부서평균 테이블:\n| 부서코드 | 평균급여 |\n|----------|----------|\n| D01 | 0 |\n| D02 | 0 |\n\nUPDATE 부서평균 D\nSET D.평균급여 = (\n  SELECT AVG(E.급여)\n  FROM 직원 E\n  WHERE E.부서코드 = D.부서코드\n);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 60,
    answer: '1',
    explanation:
      '상관 서브쿼리(Correlated Subquery)로 부서별 평균 급여를 계산합니다.\n\n- D01: AVG(3000, 4000) = 3500\n- D02: AVG(5000) = 5000\n\n최종 부서평균: D01(3500), D02(5000)',
    options: [
      'D01(3500), D02(5000)',
      'D01(4000), D02(5000)',
      'D01(3000), D02(5000)',
      '오류 발생 (상관 서브쿼리에서 AVG 사용 불가)',
    ],
    points: 10,
  },
  {
    id: 'exam9_p28',
    title: '28. 다중 테이블 DELETE 순서',
    description:
      '다음 테이블에 외래키 제약이 설정되어 있을 때, 데이터 삭제 순서로 올바른 것은?\n\nCREATE TABLE 학과 (학과코드 VARCHAR2(5) PRIMARY KEY);\nCREATE TABLE 학생 (학번 VARCHAR2(10) PRIMARY KEY, 학과코드 VARCHAR2(5) REFERENCES 학과);\nCREATE TABLE 수강 (학번 VARCHAR2(10) REFERENCES 학생, 과목코드 VARCHAR2(10), PRIMARY KEY(학번, 과목코드));\nCREATE TABLE 성적 (학번 VARCHAR2(10), 과목코드 VARCHAR2(10), 점수 NUMBER,\n  FOREIGN KEY(학번, 과목코드) REFERENCES 수강);',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 75,
    answer: '2',
    explanation:
      '외래키 제약이 있는 경우, 자식 테이블의 데이터를 먼저 삭제해야 부모 테이블의 데이터를 삭제할 수 있습니다. 참조 관계를 따라가면:\n학과 ← 학생 ← 수강 ← 성적\n\n따라서 가장 말단의 자식인 성적부터 삭제하고, 수강 → 학생 → 학과 순서로 삭제해야 합니다.',
    options: [
      '학과 → 학생 → 수강 → 성적',
      '성적 → 수강 → 학생 → 학과',
      '학생 → 수강 → 성적 → 학과',
      '수강 → 성적 → 학생 → 학과',
    ],
    points: 10,
  },
  // --- DDL (29~32) ---
  {
    id: 'exam9_p29',
    title: '29. ALTER TABLE 제약조건 관리',
    description:
      '다음 중 Oracle에서 ALTER TABLE 문으로 수행할 수 없는 작업은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 48,
    answer: '3',
    explanation:
      'Oracle의 ALTER TABLE로 컬럼 추가(ADD), 컬럼 수정(MODIFY), 컬럼 삭제(DROP COLUMN), 제약조건 추가/삭제/활성화/비활성화, 테이블명 변경(RENAME TO) 등이 가능합니다. 그러나 기존 제약조건의 이름을 변경하려면 해당 제약조건을 DROP한 후 새 이름으로 다시 ADD해야 합니다. RENAME CONSTRAINT 구문은 Oracle 12c 이후에는 지원되지만, SQLD 시험 범위에서는 일반적으로 제약조건 이름 변경을 직접 지원하지 않는 것으로 봅니다. 보기 3번의 제약조건 컬럼 변경(예: FK가 참조하는 컬럼을 직접 변경)은 불가능하며, DROP 후 재생성해야 합니다.',
    options: [
      '기존 테이블에 새로운 컬럼을 추가한다.',
      '기존 컬럼의 데이터 타입 크기를 변경한다.',
      '기존 외래키 제약조건이 참조하는 컬럼을 직접 변경한다.',
      '기존 제약조건을 비활성화(DISABLE)한다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p30',
    title: '30. CREATE TABLE AS SELECT (CTAS) 특성',
    description:
      '다음 CTAS 문 실행 후 생성된 테이블에 대한 설명으로 올바르지 않은 것은?\n\nCREATE TABLE 직원_백업 AS\nSELECT 사번, 이름, 급여\nFROM 직원\nWHERE 부서코드 = \'D01\';\n\n원본 직원 테이블: 사번(PK), 이름(NOT NULL), 부서코드(FK→부서), 급여(DEFAULT 0)',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 42,
    answer: '4',
    explanation:
      'CTAS(CREATE TABLE AS SELECT)는 원본 테이블의 데이터와 컬럼 구조를 복사하지만, 제약조건은 NOT NULL만 복사됩니다. PK, FK, UNIQUE, CHECK 제약조건 및 DEFAULT 값은 복사되지 않습니다. 따라서 직원_백업 테이블에는 사번의 PK 제약, 부서코드의 FK 제약, 급여의 DEFAULT 0이 존재하지 않습니다. 이름의 NOT NULL 제약만 유지됩니다.',
    options: [
      '직원_백업 테이블에는 부서코드 = \'D01\'인 데이터만 저장된다.',
      '원본 직원 테이블의 PK(사번) 제약조건은 복사되지 않는다.',
      '원본의 이름 NOT NULL 제약은 직원_백업에도 유지된다.',
      '원본의 급여 DEFAULT 0 설정이 직원_백업에도 동일하게 적용된다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p31',
    title: '31. 참조 무결성 제약의 옵션',
    description:
      '다음 테이블 정의에서 부서 테이블의 행을 삭제할 때 각 옵션의 동작으로 올바르지 않은 것은?\n\n-- 옵션 A\nCREATE TABLE 사원A (사번 NUMBER PK, 부서ID NUMBER REFERENCES 부서(부서ID) ON DELETE CASCADE);\n\n-- 옵션 B\nCREATE TABLE 사원B (사번 NUMBER PK, 부서ID NUMBER REFERENCES 부서(부서ID) ON DELETE SET NULL);\n\n-- 옵션 C (기본)\nCREATE TABLE 사원C (사번 NUMBER PK, 부서ID NUMBER REFERENCES 부서(부서ID));',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 72,
    answer: '3',
    explanation:
      'ON DELETE CASCADE: 부모 행 삭제 시 참조하는 자식 행도 함께 삭제됩니다.\nON DELETE SET NULL: 부모 행 삭제 시 자식의 FK 컬럼이 NULL로 설정됩니다.\n기본 옵션(RESTRICT/NO ACTION): 자식이 참조하고 있으면 부모 행 삭제가 거부됩니다.\n\n보기 3번은 "SET NULL 옵션에서 자식 행이 삭제된다"고 했지만, SET NULL은 자식 행을 삭제하는 것이 아니라 FK 값을 NULL로 변경합니다.',
    options: [
      '옵션 A: 부서 삭제 시 해당 부서에 속한 사원A의 행도 함께 삭제된다.',
      '옵션 C: 사원C가 참조하고 있는 부서 행은 삭제할 수 없다.',
      '옵션 B: 부서 삭제 시 해당 부서에 속한 사원B의 행이 함께 삭제된다.',
      '옵션 A의 CASCADE는 연쇄 삭제를 의미하며 다단계 참조에도 적용될 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p32',
    title: '32. VIEW와 INLINE VIEW의 차이',
    description:
      '다음 중 VIEW(뷰)에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 50,
    answer: '2',
    explanation:
      'VIEW는 논리적 테이블로서 자체적으로 데이터를 저장하지 않고, 기반 테이블의 데이터를 조회할 때마다 정의된 SELECT 문을 실행합니다. 단순 뷰(단일 테이블, 함수/GROUP BY 없음)는 INSERT, UPDATE, DELETE가 가능하지만, 복합 뷰(조인, 그룹 함수, DISTINCT 등 포함)는 DML이 제한됩니다. 보기 2번은 "뷰를 통한 DML은 항상 가능하다"고 했지만 이는 틀린 설명입니다.',
    options: [
      '뷰는 기반 테이블의 데이터를 저장하지 않고, 조회 시마다 SELECT 문을 실행한다.',
      '뷰를 통한 INSERT, UPDATE, DELETE는 어떤 뷰에서든 항상 가능하다.',
      'INLINE VIEW는 FROM 절에 사용되는 서브쿼리로, 데이터베이스에 저장되지 않는다.',
      'WITH READ ONLY 옵션을 사용하면 뷰를 통한 DML을 명시적으로 차단할 수 있다.',
    ],
    points: 10,
  },
  // --- 서브쿼리 (33~37) ---
  {
    id: 'exam9_p33',
    title: '33. 상관 서브쿼리와 EXISTS',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\n부서 테이블: (D01, \'영업\'), (D02, \'개발\'), (D03, \'인사\')\n직원 테이블: (1, \'김\', D01), (2, \'이\', D01), (3, \'박\', D02)\n\nSELECT 부서명\nFROM 부서 D\nWHERE NOT EXISTS (\n  SELECT 1 FROM 직원 E WHERE E.부서코드 = D.부서코드\n);',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '서브쿼리',
    correctRate: 75,
    answer: '3',
    explanation:
      'NOT EXISTS는 상관 서브쿼리가 결과를 반환하지 않는 행만 선택합니다.\n\n- D01(영업): 직원 김, 이가 존재 → EXISTS 참 → NOT EXISTS 거짓 → 제외\n- D02(개발): 직원 박이 존재 → EXISTS 참 → NOT EXISTS 거짓 → 제외\n- D03(인사): 직원 없음 → EXISTS 거짓 → NOT EXISTS 참 → 선택\n\n따라서 \'인사\'만 반환됩니다.',
    options: [
      '영업, 개발',
      '영업, 개발, 인사',
      '인사',
      '결과 없음 (0행)',
    ],
    points: 10,
  },
  {
    id: 'exam9_p34',
    title: '34. 스칼라 서브쿼리의 NULL 처리',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\n직원 테이블:\n| 사번 | 이름 | 부서코드 |\n|------|------|----------|\n| 1 | 김 | D01 |\n| 2 | 이 | D02 |\n| 3 | 박 | D99 |\n\n부서 테이블:\n| 부서코드 | 부서명 |\n|----------|--------|\n| D01 | 영업 |\n| D02 | 개발 |\n\nSELECT 이름,\n  (SELECT 부서명 FROM 부서 WHERE 부서코드 = E.부서코드) AS 부서명\nFROM 직원 E\nORDER BY 사번;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 58,
    answer: '2',
    explanation:
      '스칼라 서브쿼리는 각 행에 대해 하나의 값을 반환합니다. 일치하는 행이 없으면 NULL을 반환합니다.\n\n- 김(D01): 부서명 = 영업\n- 이(D02): 부서명 = 개발\n- 박(D99): 부서 테이블에 D99 없음 → 부서명 = NULL\n\n결과: (김, 영업), (이, 개발), (박, NULL)',
    options: [
      '(김, 영업), (이, 개발) — 박은 결과에서 제외',
      '(김, 영업), (이, 개발), (박, NULL)',
      '오류 발생 — 스칼라 서브쿼리에서 일치 행이 없으면 에러',
      '(김, 영업), (이, 개발), (박, \'\')',
    ],
    points: 10,
  },
  {
    id: 'exam9_p35',
    title: '35. 다중 행 서브쿼리 연산자 비교',
    description:
      '다음 데이터에서 각 쿼리의 결과를 비교하시오.\n\n직원 테이블:\n| 사번 | 이름 | 급여 |\n|------|------|------|\n| 1 | 김 | 3000 |\n| 2 | 이 | 5000 |\n| 3 | 박 | 7000 |\n| 4 | 최 | 4000 |\n\n-- 쿼리 A\nSELECT 이름 FROM 직원 WHERE 급여 > ALL (SELECT 급여 FROM 직원 WHERE 사번 IN (1, 4));\n\n-- 쿼리 B\nSELECT 이름 FROM 직원 WHERE 급여 > ANY (SELECT 급여 FROM 직원 WHERE 사번 IN (1, 4));',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 35,
    answer: '4',
    explanation:
      '서브쿼리 결과: 사번 1(급여 3000), 사번 4(급여 4000) → (3000, 4000)\n\n- > ALL (3000, 4000): 모든 값보다 큰 것 = 4000보다 큰 것 → 이(5000), 박(7000)\n- > ANY (3000, 4000): 어느 하나보다 큰 것 = 3000보다 큰 것 → 이(5000), 박(7000), 최(4000)\n\n쿼리 A: 이, 박 (2명)\n쿼리 B: 이, 박, 최 (3명)',
    options: [
      '쿼리 A: 박 / 쿼리 B: 이, 박, 최',
      '쿼리 A: 이, 박 / 쿼리 B: 이, 박',
      '쿼리 A: 이, 박, 최 / 쿼리 B: 이, 박',
      '쿼리 A: 이, 박 / 쿼리 B: 이, 박, 최',
    ],
    points: 10,
  },
  {
    id: 'exam9_p36',
    title: '36. 인라인 뷰와 ROWNUM 활용',
    description:
      '다음 쿼리의 결과로 올바른 것은? (Oracle 기준)\n\n직원 테이블:\n| 사번 | 이름 | 급여 |\n|------|------|------|\n| 1 | 김 | 5000 |\n| 2 | 이 | 3000 |\n| 3 | 박 | 7000 |\n| 4 | 최 | 6000 |\n| 5 | 정 | 4000 |\n\nSELECT 이름, 급여\nFROM (\n  SELECT 이름, 급여\n  FROM 직원\n  ORDER BY 급여 DESC\n)\nWHERE ROWNUM <= 3;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 52,
    answer: '1',
    explanation:
      '인라인 뷰에서 먼저 급여 내림차순으로 정렬합니다: 박(7000), 최(6000), 김(5000), 정(4000), 이(3000).\n그 후 ROWNUM <= 3 조건으로 상위 3개를 추출합니다.\n\n결과: 박(7000), 최(6000), 김(5000)\n\n주의: ROWNUM은 인라인 뷰 없이 바로 ORDER BY와 함께 사용하면 정렬 전에 ROWNUM이 할당되어 원하는 결과를 얻을 수 없습니다. 인라인 뷰로 먼저 정렬 후 ROWNUM을 적용하는 것이 올바른 패턴입니다.',
    options: [
      '박(7000), 최(6000), 김(5000)',
      '김(5000), 이(3000), 박(7000)',
      '이(3000), 정(4000), 김(5000)',
      '박(7000), 최(6000), 김(5000), 정(4000), 이(3000)',
    ],
    points: 10,
  },
  {
    id: 'exam9_p37',
    title: '37. 다중 컬럼 서브쿼리',
    description:
      '다음 쿼리의 결과로 올바른 것은?\n\n매출 테이블:\n| 지역 | 월 | 금액 |\n|------|-----|------|\n| 서울 | 1 | 1000 |\n| 서울 | 2 | 1500 |\n| 부산 | 1 | 800 |\n| 부산 | 2 | 1200 |\n| 대구 | 1 | 600 |\n\nSELECT 지역, 월, 금액\nFROM 매출\nWHERE (지역, 금액) IN (\n  SELECT 지역, MAX(금액)\n  FROM 매출\n  GROUP BY 지역\n);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 33,
    answer: '2',
    explanation:
      '서브쿼리는 지역별 최대 금액을 구합니다:\n- 서울: MAX(1000, 1500) = 1500\n- 부산: MAX(800, 1200) = 1200\n- 대구: MAX(600) = 600\n\n다중 컬럼 IN 조건으로 (지역, 금액) 쌍이 일치하는 행을 찾습니다:\n- (서울, 1500) → 서울/2월/1500 ✓\n- (부산, 1200) → 부산/2월/1200 ✓\n- (대구, 600) → 대구/1월/600 ✓\n\n결과: 3행',
    options: [
      '(서울, 2, 1500)',
      '(서울, 2, 1500), (부산, 2, 1200), (대구, 1, 600)',
      '(서울, 2, 1500), (부산, 2, 1200)',
      '5행 전체 반환',
    ],
    points: 10,
  },
  // --- GROUP BY (38~41) ---
  {
    id: 'exam9_p38',
    title: '38. GROUP BY와 HAVING의 실행 순서',
    description:
      '다음 쿼리의 결과 행 수는?\n\n주문 테이블:\n| 고객ID | 상품 | 수량 |\n|--------|------|------|\n| C01 | A | 5 |\n| C01 | B | 3 |\n| C01 | C | 2 |\n| C02 | A | 10 |\n| C02 | B | 1 |\n| C03 | A | 7 |\n\nSELECT 고객ID, SUM(수량) AS 총수량\nFROM 주문\nWHERE 수량 >= 3\nGROUP BY 고객ID\nHAVING SUM(수량) >= 10;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'GROUP BY',
    correctRate: 45,
    answer: '2',
    explanation:
      'SQL 실행 순서: FROM → WHERE → GROUP BY → HAVING → SELECT\n\n1. WHERE 수량 >= 3 필터링:\n   (C01, A, 5), (C01, B, 3), (C02, A, 10), (C03, A, 7)\n   → C01의 C(수량 2)와 C02의 B(수량 1)가 제외됨\n\n2. GROUP BY 고객ID:\n   C01: 5+3 = 8\n   C02: 10\n   C03: 7\n\n3. HAVING SUM(수량) >= 10:\n   C01(8) → 제외, C02(10) → 통과, C03(7) → 제외\n\n결과: 1행 (C02만)',
    options: [
      '2행',
      '1행',
      '3행',
      '0행',
    ],
    points: 10,
  },
  {
    id: 'exam9_p39',
    title: '39. ROLLUP과 CUBE의 결과 비교',
    description:
      '다음 데이터에 대해 ROLLUP과 CUBE의 결과 행 수 차이로 올바른 것은?\n\n매출 테이블:\n| 연도 | 분기 | 금액 |\n|------|------|------|\n| 2023 | Q1 | 100 |\n| 2023 | Q2 | 200 |\n| 2024 | Q1 | 150 |\n| 2024 | Q2 | 250 |\n\n-- 쿼리 A: GROUP BY ROLLUP(연도, 분기)\n-- 쿼리 B: GROUP BY CUBE(연도, 분기)',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'GROUP BY',
    correctRate: 28,
    answer: '3',
    explanation:
      'ROLLUP(연도, 분기)의 그룹화 집합:\n1. (연도, 분기) → 4행: (2023,Q1), (2023,Q2), (2024,Q1), (2024,Q2)\n2. (연도) → 2행: (2023,NULL), (2024,NULL)\n3. () → 1행: (NULL,NULL)\n총 7행\n\nCUBE(연도, 분기)의 그룹화 집합:\n1. (연도, 분기) → 4행\n2. (연도) → 2행\n3. (분기) → 2행: (NULL,Q1), (NULL,Q2)\n4. () → 1행\n총 9행\n\nCUBE가 ROLLUP보다 2행 더 많습니다. (분기별 소계가 추가됨)',
    options: [
      'ROLLUP 6행, CUBE 8행 (차이 2행)',
      'ROLLUP 7행, CUBE 7행 (차이 없음)',
      'ROLLUP 7행, CUBE 9행 (차이 2행)',
      'ROLLUP 7행, CUBE 11행 (차이 4행)',
    ],
    points: 10,
  },
  {
    id: 'exam9_p40',
    title: '40. GROUPING SETS 활용',
    description:
      '다음 쿼리와 동일한 결과를 반환하는 것은?\n\nSELECT 부서, 직급, SUM(급여)\nFROM 직원\nGROUP BY GROUPING SETS ((부서), (직급), ());',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'GROUP BY',
    correctRate: 40,
    answer: '3',
    explanation:
      'GROUPING SETS는 지정된 그룹화 조합만 생성합니다.\nGROUPING SETS ((부서), (직급), ())는 세 가지 그룹화를 수행합니다:\n1. (부서): 부서별 급여 합계 (직급은 NULL)\n2. (직급): 직급별 급여 합계 (부서는 NULL)\n3. (): 전체 급여 합계 (부서, 직급 모두 NULL)\n\n이는 세 개의 GROUP BY 결과를 UNION ALL로 합친 것과 같습니다.',
    options: [
      'GROUP BY ROLLUP(부서, 직급)과 동일하다.',
      'GROUP BY CUBE(부서, 직급)과 동일하다.',
      '부서별 합계, 직급별 합계, 전체 합계를 UNION ALL로 결합한 것과 동일하다.',
      '부서-직급 조합별 합계와 전체 합계만 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam9_p41',
    title: '41. GROUP BY에서 NULL 처리',
    description:
      '다음 데이터와 쿼리의 결과로 올바른 것은?\n\n직원 테이블:\n| 이름 | 부서 | 급여 |\n|------|------|------|\n| 김 | A | 3000 |\n| 이 | A | 4000 |\n| 박 | NULL | 5000 |\n| 최 | NULL | 2000 |\n| 정 | B | 6000 |\n\nSELECT 부서, COUNT(*) AS 인원, SUM(급여) AS 급여합\nFROM 직원\nGROUP BY 부서\nORDER BY 부서;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'GROUP BY',
    correctRate: 38,
    answer: '4',
    explanation:
      'GROUP BY에서 NULL은 하나의 그룹으로 취급됩니다.\n\n- 부서 A: 김, 이 → 인원 2, 급여합 7000\n- 부서 B: 정 → 인원 1, 급여합 6000\n- 부서 NULL: 박, 최 → 인원 2, 급여합 7000\n\nORDER BY 부서에서 NULL은 Oracle에서 기본적으로 마지막에 정렬됩니다.\n결과: (A, 2, 7000), (B, 1, 6000), (NULL, 2, 7000)',
    options: [
      '(A, 2, 7000), (B, 1, 6000) — NULL 부서는 제외됨',
      '(NULL, 2, 7000), (A, 2, 7000), (B, 1, 6000)',
      '오류 발생 — NULL 값으로 GROUP BY 불가',
      '(A, 2, 7000), (B, 1, 6000), (NULL, 2, 7000)',
    ],
    points: 10,
  },
  // --- 윈도우함수 (42~45) ---
  {
    id: 'exam9_p42',
    title: '42. ROW_NUMBER, RANK, DENSE_RANK 비교',
    description:
      '다음 데이터에 대한 윈도우 함수 결과로 올바른 것은?\n\n성적 테이블:\n| 이름 | 점수 |\n|------|------|\n| 김 | 95 |\n| 이 | 90 |\n| 박 | 90 |\n| 최 | 85 |\n\nSELECT 이름,\n  RANK() OVER (ORDER BY 점수 DESC) AS RK,\n  DENSE_RANK() OVER (ORDER BY 점수 DESC) AS DRK,\n  ROW_NUMBER() OVER (ORDER BY 점수 DESC) AS RN\nFROM 성적;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '윈도우함수',
    correctRate: 68,
    answer: '1',
    explanation:
      '점수 내림차순 정렬: 김(95), 이(90), 박(90), 최(85)\n\n- RANK: 동일 값에 같은 순위 부여 후 다음 순위 건너뜀 → 1, 2, 2, 4\n- DENSE_RANK: 동일 값에 같은 순위 부여 후 다음 순위 연속 → 1, 2, 2, 3\n- ROW_NUMBER: 항상 고유 순번 (동일 값도 별도 번호) → 1, 2, 3, 4\n\n최의 RANK는 4 (2등이 2명이라 3을 건너뜀), DENSE_RANK는 3 (건너뛰지 않음)',
    options: [
      '최: RK=4, DRK=3, RN=4',
      '최: RK=3, DRK=3, RN=4',
      '최: RK=4, DRK=4, RN=4',
      '최: RK=3, DRK=2, RN=4',
    ],
    points: 10,
  },
  {
    id: 'exam9_p43',
    title: '43. LAG와 LEAD 함수 활용',
    description:
      '다음 데이터와 쿼리의 결과에서 사번 3의 행에 해당하는 값으로 올바른 것은?\n\n직원 테이블:\n| 사번 | 이름 | 입사일 |\n|------|------|------------|\n| 1 | 김 | 2020-01-01 |\n| 2 | 이 | 2021-06-15 |\n| 3 | 박 | 2022-03-10 |\n| 4 | 최 | 2023-09-20 |\n\nSELECT 사번, 이름,\n  LAG(이름, 1, \'없음\') OVER (ORDER BY 입사일) AS 이전입사자,\n  LEAD(이름, 2) OVER (ORDER BY 입사일) AS 두칸뒤입사자\nFROM 직원;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 45,
    answer: '3',
    explanation:
      'LAG(이름, 1, \'없음\')은 정렬 기준으로 1행 이전 값을 가져오며, 없으면 \'없음\'을 반환합니다.\nLEAD(이름, 2)는 정렬 기준으로 2행 이후 값을 가져오며, 없으면 NULL을 반환합니다.\n\n입사일 순서: 김(1) → 이(2) → 박(3) → 최(4)\n\n사번 3(박)의 경우:\n- LAG(이름, 1): 1행 이전 = 이 → 이전입사자 = \'이\'\n- LEAD(이름, 2): 2행 이후 = 사번 5(없음) → 두칸뒤입사자 = NULL',
    options: [
      '이전입사자=김, 두칸뒤입사자=최',
      '이전입사자=이, 두칸뒤입사자=최',
      '이전입사자=이, 두칸뒤입사자=NULL',
      '이전입사자=없음, 두칸뒤입사자=NULL',
    ],
    points: 10,
  },
  {
    id: 'exam9_p44',
    title: '44. 윈도우 프레임 절(ROWS vs RANGE)',
    description:
      '다음 데이터와 쿼리에서 사번 3의 누적합(C1)과 이동평균(C2) 값으로 올바른 것은?\n\n급여 테이블:\n| 사번 | 급여 |\n|------|------|\n| 1 | 1000 |\n| 2 | 2000 |\n| 3 | 3000 |\n| 4 | 4000 |\n| 5 | 5000 |\n\nSELECT 사번, 급여,\n  SUM(급여) OVER (ORDER BY 사번 ROWS UNBOUNDED PRECEDING) AS C1,\n  AVG(급여) OVER (ORDER BY 사번 ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS C2\nFROM 급여;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 22,
    answer: '2',
    explanation:
      '사번 3 기준:\n\nC1 (ROWS UNBOUNDED PRECEDING): 처음부터 현재 행까지의 합\n= 1000 + 2000 + 3000 = 6000\n\nC2 (ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING): 이전 1행 ~ 다음 1행의 평균\n= AVG(2000, 3000, 4000) = 9000/3 = 3000\n\n따라서 C1=6000, C2=3000',
    options: [
      'C1=6000, C2=2000',
      'C1=6000, C2=3000',
      'C1=3000, C2=3000',
      'C1=6000, C2=2500',
    ],
    points: 10,
  },
  {
    id: 'exam9_p45',
    title: '45. PARTITION BY와 집계 윈도우 함수',
    description:
      '다음 데이터와 쿼리에서 사번 4의 결과 값으로 올바른 것은?\n\n직원 테이블:\n| 사번 | 부서 | 급여 |\n|------|------|------|\n| 1 | A | 3000 |\n| 2 | A | 5000 |\n| 3 | B | 4000 |\n| 4 | B | 6000 |\n| 5 | B | 2000 |\n\nSELECT 사번, 부서, 급여,\n  MAX(급여) OVER (PARTITION BY 부서) AS 부서최대,\n  급여 - AVG(급여) OVER (PARTITION BY 부서) AS 부서평균차,\n  COUNT(*) OVER (PARTITION BY 부서) AS 부서인원\nFROM 직원;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 30,
    answer: '3',
    explanation:
      '사번 4는 부서 B에 속합니다.\n부서 B의 데이터: 사번3(4000), 사번4(6000), 사번5(2000)\n\n- 부서최대: MAX(4000, 6000, 2000) = 6000\n- 부서평균차: 6000 - AVG(4000, 6000, 2000) = 6000 - 4000 = 2000\n- 부서인원: COUNT(*) = 3\n\n따라서 사번 4: 부서최대=6000, 부서평균차=2000, 부서인원=3',
    options: [
      '부서최대=6000, 부서평균차=1000, 부서인원=3',
      '부서최대=6000, 부서평균차=2000, 부서인원=5',
      '부서최대=6000, 부서평균차=2000, 부서인원=3',
      '부서최대=5000, 부서평균차=2000, 부서인원=2',
    ],
    points: 10,
  },
  // --- ORDER BY (46~47) ---
  {
    id: 'exam9_p46',
    title: '46. ORDER BY의 NULL 정렬과 별칭 사용',
    description:
      '다음 쿼리의 결과 정렬 순서로 올바른 것은? (Oracle 기준)\n\n직원 테이블:\n| 이름 | 급여 | 보너스 |\n|------|------|--------|\n| 김 | 5000 | 1000 |\n| 이 | 3000 | NULL |\n| 박 | 5000 | NULL |\n| 최 | 3000 | 500 |\n\nSELECT 이름, 급여, 보너스,\n  급여 + NVL(보너스, 0) AS 총액\nFROM 직원\nORDER BY 총액 DESC, 이름 ASC;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'ORDER BY',
    correctRate: 35,
    answer: '2',
    explanation:
      '각 직원의 총액 계산:\n- 김: 5000 + NVL(1000, 0) = 6000\n- 이: 3000 + NVL(NULL, 0) = 3000\n- 박: 5000 + NVL(NULL, 0) = 5000\n- 최: 3000 + NVL(500, 0) = 3500\n\nORDER BY 총액 DESC: 김(6000) → 박(5000) → 최(3500) → 이(3000)\n총액이 같은 경우 이름 ASC로 정렬하지만, 여기서는 총액이 모두 다르므로 추가 정렬 불필요.\n\nOracle에서 SELECT 절의 별칭(총액)을 ORDER BY에서 사용할 수 있습니다.',
    options: [
      '김 → 박 → 이 → 최',
      '김 → 박 → 최 → 이',
      '박 → 김 → 최 → 이',
      '오류 발생 (SELECT 별칭을 ORDER BY에서 사용 불가)',
    ],
    points: 10,
  },
  {
    id: 'exam9_p47',
    title: '47. ORDER BY 컬럼 번호와 표현식',
    description:
      '다음 중 ORDER BY 절에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'ORDER BY',
    correctRate: 70,
    answer: '4',
    explanation:
      'ORDER BY 절 특성:\n- SELECT 절의 컬럼 순서 번호를 사용할 수 있습니다 (ORDER BY 1, 2 등).\n- SELECT에 없는 컬럼이라도 FROM 테이블의 컬럼이면 ORDER BY에 사용 가능합니다.\n- NULL은 Oracle에서 기본적으로 가장 큰 값으로 취급되어 ASC에서 마지막, DESC에서 처음에 옵니다.\n- GROUP BY를 사용한 경우 ORDER BY에는 GROUP BY에 명시된 컬럼이나 집계 함수만 사용 가능합니다.\n\n보기 4번은 "ORDER BY는 반드시 SELECT에 명시된 컬럼만 사용 가능하다"고 했지만 이는 틀립니다.',
    options: [
      'ORDER BY 절에 SELECT 절의 컬럼 순서 번호(1, 2, ...)를 사용할 수 있다.',
      'Oracle에서 NULL은 ASC 정렬 시 기본적으로 마지막에 위치한다.',
      'NULLS FIRST, NULLS LAST 키워드로 NULL의 정렬 위치를 명시할 수 있다.',
      'ORDER BY 절에는 반드시 SELECT 절에 명시된 컬럼만 사용할 수 있다.',
    ],
    points: 10,
  },
  // --- 집합연산 (48~49) ---
  {
    id: 'exam9_p48',
    title: '48. 집합 연산자의 결과 예측',
    description:
      '다음 쿼리들의 결과 행 수로 올바른 것은?\n\n테이블 A: (1), (2), (2), (3)\n테이블 B: (2), (3), (3), (4)\n\n-- 쿼리 1\nSELECT * FROM A UNION SELECT * FROM B;\n\n-- 쿼리 2\nSELECT * FROM A UNION ALL SELECT * FROM B;\n\n-- 쿼리 3\nSELECT * FROM A INTERSECT SELECT * FROM B;\n\n-- 쿼리 4\nSELECT * FROM A MINUS SELECT * FROM B;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '집합연산',
    correctRate: 40,
    answer: '1',
    explanation:
      '각 집합 연산의 결과:\n\n- UNION (중복 제거): {1, 2, 3, 4} = 4행\n- UNION ALL (중복 유지): A의 4행 + B의 4행 = 8행\n- INTERSECT (교집합, 중복 제거): {2, 3} = 2행\n- MINUS (차집합, A-B, 중복 제거): A의 고유값 {1,2,3}에서 B의 고유값 {2,3,4}를 빼면 {1} = 1행\n\n쿼리1=4, 쿼리2=8, 쿼리3=2, 쿼리4=1',
    options: [
      '쿼리1=4, 쿼리2=8, 쿼리3=2, 쿼리4=1',
      '쿼리1=6, 쿼리2=8, 쿼리3=2, 쿼리4=1',
      '쿼리1=4, 쿼리2=8, 쿼리3=4, 쿼리4=2',
      '쿼리1=4, 쿼리2=6, 쿼리3=2, 쿼리4=1',
    ],
    points: 10,
  },
  {
    id: 'exam9_p49',
    title: '49. 집합 연산자와 ORDER BY 규칙',
    description:
      '다음 중 집합 연산자 사용 시 ORDER BY에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 35,
    answer: '3',
    explanation:
      '집합 연산자 사용 시 ORDER BY 규칙:\n- ORDER BY는 전체 결과의 가장 마지막에 한 번만 사용할 수 있습니다.\n- ORDER BY에는 첫 번째 SELECT 절의 컬럼명이나 별칭, 또는 컬럼 순서 번호를 사용합니다.\n- 각 개별 SELECT 문에 ORDER BY를 붙일 수 없습니다 (인라인 뷰로 감싸면 가능).\n\n보기 3번은 "각 SELECT 문마다 ORDER BY를 사용하여 개별적으로 정렬 후 합칠 수 있다"고 했지만, 이는 SQL 문법 오류를 발생시킵니다.',
    options: [
      'ORDER BY는 전체 집합 연산의 마지막에 한 번만 사용할 수 있다.',
      'ORDER BY에 첫 번째 SELECT 문의 컬럼 별칭을 사용할 수 있다.',
      '각 SELECT 문마다 ORDER BY를 사용하여 개별적으로 정렬한 후 합칠 수 있다.',
      'ORDER BY에 컬럼 순서 번호(1, 2, ...)를 사용할 수 있다.',
    ],
    points: 10,
  },
  // --- TCL (50) ---
  {
    id: 'exam9_p50',
    title: '50. SAVEPOINT와 트랜잭션 제어',
    description:
      '다음 트랜잭션 실행 후 테이블에 남아 있는 데이터로 올바른 것은?\n\nCREATE TABLE T1 (val NUMBER);\n\nINSERT INTO T1 VALUES (1);\nSAVEPOINT SP1;\nINSERT INTO T1 VALUES (2);\nSAVEPOINT SP2;\nINSERT INTO T1 VALUES (3);\nROLLBACK TO SP1;\nINSERT INTO T1 VALUES (4);\nCOMMIT;\n\nSELECT * FROM T1 ORDER BY val;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 33,
    answer: '2',
    explanation:
      '단계별 추적:\n1. INSERT 1 → T1: {1}\n2. SAVEPOINT SP1\n3. INSERT 2 → T1: {1, 2}\n4. SAVEPOINT SP2\n5. INSERT 3 → T1: {1, 2, 3}\n6. ROLLBACK TO SP1 → SP1 이후의 모든 작업(INSERT 2, SAVEPOINT SP2, INSERT 3)이 취소됨 → T1: {1}\n7. INSERT 4 → T1: {1, 4}\n8. COMMIT → {1, 4} 확정\n\n주의: ROLLBACK TO SP1은 SP1 시점으로 되돌리므로, SP1 이후에 생성된 SP2도 무효화됩니다. 최종 결과는 1, 4입니다.',
    options: [
      '1, 2, 4',
      '1, 4',
      '1, 2, 3, 4',
      '4',
    ],
    points: 10,
  },
];
