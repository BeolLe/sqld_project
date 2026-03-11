import type { Problem } from '../../types';

// SQLD 모의고사 10회 (고급 난이도 - 목표 합격률 ~40%)
// 1과목: 데이터 모델링의 이해 (10문항, 20점)
// 2과목: SQL 기본 및 활용 (40문항, 80점)
// 난이도 배분: easy 8 / medium 22 / hard 20

export const EXAM_10_PROBLEMS: Problem[] = [
  // ===== 1과목: 데이터 모델링의 이해 (1~10번) =====
  // --- 데이터모델링 (1~5) ---
  {
    id: 'exam10_p1',
    title: '1. 개념적 데이터 모델에서 속성 분류',
    description:
      '항공 예약 시스템을 개념적 데이터 모델로 설계할 때, 다음 속성들을 분류한 것으로 가장 올바른 것은?\n\n[속성 목록]\n가. 탑승권번호\n나. 총 탑승 횟수\n다. 좌석등급\n라. 예약일시\n마. 마일리지 잔액\n바. 출발 공항 코드',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 42,
    answer: '2',
    explanation:
      '기본 속성은 업무에서 직접 추출한 본래의 속성(다. 좌석등급, 라. 예약일시, 바. 출발 공항 코드), 설계 속성은 모델링 과정에서 새로 만든 속성(가. 탑승권번호), 파생 속성은 다른 속성으로부터 계산되어 나온 속성(나. 총 탑승 횟수, 마. 마일리지 잔액)입니다. 총 탑승 횟수는 탑승 이력을 COUNT하여 파생되고, 마일리지 잔액은 적립/사용 내역의 합산으로 파생됩니다.',
    options: [
      '기본속성: 가, 다, 라 / 설계속성: 바 / 파생속성: 나, 마',
      '기본속성: 다, 라, 바 / 설계속성: 가 / 파생속성: 나, 마',
      '기본속성: 다, 라, 마 / 설계속성: 가 / 파생속성: 나, 바',
      '기본속성: 가, 다, 바 / 설계속성: 라 / 파생속성: 나, 마',
    ],
    points: 10,
  },
  {
    id: 'exam10_p2',
    title: '2. 엔터티 도출과 관계 설정의 오류 분석',
    description:
      '도서관 관리 시스템의 논리 데이터 모델에서 다음과 같은 엔터티와 관계가 도출되었다. 모델링 관점에서 가장 문제가 되는 것은?\n\n[엔터티]\n- 회원(회원번호PK, 이름, 연락처, 회원등급)\n- 도서(도서코드PK, 제목, 저자, ISBN, 출판사명, 출판사전화번호)\n- 대출(대출번호PK, 회원번호FK, 도서코드FK, 대출일, 반납예정일, 반납일)\n- 예약(예약번호PK, 회원번호FK, 도서코드FK, 예약일, 예약상태)',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 28,
    answer: '3',
    explanation:
      '도서 엔터티에 출판사명과 출판사전화번호가 포함되어 있는 것은 이행적 함수 종속(transitive dependency)에 해당합니다. 출판사명이 결정되면 출판사전화번호가 결정되므로, 도서코드 → 출판사명 → 출판사전화번호의 이행 종속이 발생합니다. 이는 출판사를 별도 엔터티로 분리해야 하는 전형적인 사례이며, 갱신 이상(Anomaly)을 유발합니다. 대출과 예약이 별도 엔터티인 것은 업무 프로세스가 다르므로 적절합니다.',
    options: [
      '회원 엔터티에 회원등급 속성이 포함되어 있어 별도 엔터티로 분리해야 한다.',
      '대출 엔터티와 예약 엔터티를 하나로 통합하여 슈퍼타입으로 관리해야 한다.',
      '도서 엔터티에 출판사명과 출판사전화번호가 함께 존재하여 이행적 함수 종속이 발생한다.',
      '예약 엔터티의 예약상태는 파생 속성이므로 제거해야 한다.',
    ],
    points: 10,
  },
  {
    id: 'exam10_p3',
    title: '3. 식별자 관계와 비식별자 관계의 선택',
    description:
      '온라인 쇼핑몰에서 다음 두 가지 설계 방안이 있다. 각 방안의 차이에 대한 설명으로 가장 올바르지 않은 것은?\n\n[방안 A - 식별자 관계]\n주문(주문번호PK) → 주문상세(주문번호PK/FK, 상세순번PK)\n\n[방안 B - 비식별자 관계]\n주문(주문번호PK) → 주문상세(상세ID PK, 주문번호FK)',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 32,
    answer: '4',
    explanation:
      '식별자 관계(방안 A)에서는 부모의 PK가 자식의 PK 일부가 되므로, 주문상세를 조회할 때 주문번호를 포함한 복합키로 접근할 수 있어 특정 주문의 상세 조회 시 클러스터링 효과로 I/O가 줄어들 수 있습니다. 비식별자 관계(방안 B)에서는 자식이 독립적인 PK를 가지므로 부모 테이블과 조인 없이도 자식 테이블 단독 조회가 가능합니다. 그러나 "비식별자 관계가 항상 조인 성능이 우수하다"는 것은 잘못된 설명입니다. 식별자 관계는 부모키가 PK에 포함되어 클러스터링 인덱스에 의한 범위 스캔이 유리한 경우가 많습니다.',
    options: [
      '방안 A는 주문번호별 상세 데이터가 물리적으로 인접하게 저장되어 범위 조회에 유리하다.',
      '방안 B는 주문상세의 PK가 단일 컬럼이므로 다른 테이블에서 FK로 참조하기 편리하다.',
      '방안 A에서 자식 테이블의 PK 컬럼 수가 계층이 깊어질수록 누적 증가하는 단점이 있다.',
      '방안 B는 조인이 필요 없으므로 항상 방안 A보다 조인 성능이 우수하다.',
    ],
    points: 10,
  },
  {
    id: 'exam10_p4',
    title: '4. 반정규화 기법의 적용 판단',
    description:
      '대학 수강신청 시스템에서 아래와 같은 성능 문제가 보고되었다. 가장 적절한 반정규화 기법은?\n\n[현황]\n- 학과 테이블(50건), 교수 테이블(500건), 강좌 테이블(3,000건), 수강 테이블(연간 200만 건)\n- 학생이 자신의 수강 내역을 조회할 때 "강좌명, 교수명, 학과명"을 함께 표시\n- 해당 조회는 하루 평균 10만 건 발생\n- 현재 수강 → 강좌 → 교수 → 학과 순으로 3단계 조인이 필요하여 응답 속도가 3초 이상',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 48,
    answer: '2',
    explanation:
      '이 경우 조회 빈도가 매우 높고(하루 10만 건), 3단계 조인으로 인한 성능 저하가 발생합니다. 수강 테이블에 강좌명, 교수명, 학과명을 중복 컬럼으로 추가하는 것이 가장 적절합니다. 학과, 교수, 강좌 테이블의 데이터는 빈번하게 변경되지 않으므로 데이터 정합성 위험이 낮고, 조인을 제거하여 큰 성능 향상을 기대할 수 있습니다. 테이블 분할(파티셔닝)은 조인 자체를 줄이지 못하며, 뷰는 논리적 편의일 뿐 성능 개선 효과가 없습니다.',
    options: [
      '수강 테이블을 학기별로 수평 분할(파티셔닝)하여 조회 범위를 축소한다.',
      '수강 테이블에 강좌명, 교수명, 학과명 컬럼을 중복 추가하여 조인을 제거한다.',
      '강좌, 교수, 학과 테이블을 하나로 통합하여 조인 단계를 줄인다.',
      '수강 내역 조회용 뷰(View)를 생성하여 SQL을 단순화한다.',
    ],
    points: 10,
  },
  {
    id: 'exam10_p5',
    title: '5. 데이터 모델의 품질 검증',
    description:
      '다음 중 데이터 모델 품질 검증 항목과 그 설명이 올바르게 짝지어지지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 50,
    answer: '4',
    explanation:
      '정확성(Correctness)은 업무 규칙과 요구사항을 데이터 모델이 올바르게 반영하고 있는지를 의미합니다. 완전성(Completeness)은 필요한 모든 데이터가 모델에 포함되어 있는지, 준수성(Compliance)은 표준과 명명 규칙을 준수하는지, 일관성(Consistency)은 동일 개념이 여러 곳에서 같은 방식으로 표현되는지를 의미합니다. 보기 4의 "일관성은 물리적 저장 공간의 효율성을 검증하는 항목"이라는 설명은 잘못되었습니다. 저장 공간 효율성은 물리 데이터 모델 설계 시 고려 사항이지 일관성의 정의가 아닙니다.',
    options: [
      '정확성(Correctness): 업무 규칙과 요구사항이 데이터 모델에 정확하게 반영되었는지 검증',
      '완전성(Completeness): 필수 엔터티, 속성, 관계가 누락 없이 모두 포함되었는지 검증',
      '준수성(Compliance): 데이터 표준, 명명 규칙, 도메인 정의 등의 준수 여부 검증',
      '일관성(Consistency): 물리적 저장 공간의 효율성을 검증하는 항목',
    ],
    points: 10,
  },
  // --- 정규화 (6~10) ---
  {
    id: 'exam10_p6',
    title: '6. 제1정규형 위반 사례 분석',
    description:
      '다음 테이블이 제1정규형(1NF)을 위반하는 이유로 가장 정확한 것은?\n\n[항공편 테이블]\n항공편코드(PK) | 출발지 | 도착지 | 경유지목록\nKE101         | ICN    | LAX    | NRT, HNL\nOZ202         | ICN    | CDG    | NULL\nKE303         | ICN    | SYD    | SIN, BKK, SYD',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 72,
    answer: '1',
    explanation:
      '제1정규형(1NF)은 모든 속성 값이 원자값(Atomic Value)을 가져야 합니다. 경유지목록 컬럼에 "NRT, HNL"이나 "SIN, BKK, SYD"처럼 하나의 셀에 여러 값이 콤마로 구분되어 저장되어 있으므로 원자성을 위반합니다. 이를 해결하려면 경유지를 별도 테이블로 분리하거나 각 경유지를 개별 행으로 분리해야 합니다.',
    options: [
      '경유지목록 컬럼에 여러 값이 콤마로 구분되어 저장되어 원자성을 위반한다.',
      '경유지목록에 NULL이 존재하여 제1정규형을 위반한다.',
      '항공편코드가 단일 컬럼 PK이므로 복합키가 필요하다.',
      '출발지와 도착지가 중복될 가능성이 있어 후보키가 부족하다.',
    ],
    points: 10,
  },
  {
    id: 'exam10_p7',
    title: '7. 제2정규형과 부분 함수 종속',
    description:
      '다음 테이블에서 제2정규형(2NF) 위반을 해소하기 위한 올바른 분해는?\n\n[수강평가 테이블]\nPK: (학번, 과목코드)\n속성: 학생명, 학과코드, 과목명, 담당교수, 평가점수\n\n함수 종속:\n- 학번 → 학생명, 학과코드\n- 과목코드 → 과목명, 담당교수\n- (학번, 과목코드) → 평가점수',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 55,
    answer: '3',
    explanation:
      '제2정규형은 부분 함수 종속을 제거하는 것입니다. 복합키 (학번, 과목코드)에 대해 학생명과 학과코드는 학번에만 종속(부분 종속)이고, 과목명과 담당교수는 과목코드에만 종속(부분 종속)입니다. 평가점수만 (학번, 과목코드) 전체에 완전 함수 종속입니다. 따라서 학생(학번PK, 학생명, 학과코드), 과목(과목코드PK, 과목명, 담당교수), 수강평가(학번PK/FK, 과목코드PK/FK, 평가점수)로 분해해야 합니다.',
    options: [
      '학생(학번, 학생명) / 수강평가(학번, 과목코드, 학과코드, 과목명, 담당교수, 평가점수)',
      '과목(과목코드, 과목명, 담당교수) / 수강평가(학번, 과목코드, 학생명, 학과코드, 평가점수)',
      '학생(학번, 학생명, 학과코드) / 과목(과목코드, 과목명, 담당교수) / 수강평가(학번, 과목코드, 평가점수)',
      '학생(학번, 학생명) / 학과(학과코드, 학과명) / 과목(과목코드, 과목명) / 수강평가(학번, 과목코드, 담당교수, 평가점수)',
    ],
    points: 10,
  },
  {
    id: 'exam10_p8',
    title: '8. 제3정규형과 이행적 종속 판별',
    description:
      '다음 테이블에서 제3정규형(3NF)을 만족시키기 위해 분리해야 할 이행적 함수 종속을 모두 고르면?\n\n[물류센터 테이블]\nPK: 센터코드\n속성: 센터명, 지역코드, 지역명, 관할본부코드, 관할본부명, 본부장사번, 본부장이름\n\n함수 종속:\n- 센터코드 → 센터명, 지역코드, 관할본부코드\n- 지역코드 → 지역명\n- 관할본부코드 → 관할본부명, 본부장사번\n- 본부장사번 → 본부장이름',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 25,
    answer: '4',
    explanation:
      '이행적 함수 종속은 A → B → C 형태에서 A → C가 이행적으로 성립하는 것입니다. 센터코드 → 지역코드 → 지역명 (지역명이 이행 종속), 센터코드 → 관할본부코드 → 관할본부명, 본부장사번 (관할본부명과 본부장사번이 이행 종속), 관할본부코드 → 본부장사번 → 본부장이름 (본부장이름이 이행 종속). 따라서 지역(지역코드, 지역명), 관할본부(관할본부코드, 관할본부명, 본부장사번), 직원(본부장사번, 본부장이름)을 각각 분리해야 합니다. 총 3개의 이행적 종속 체인이 존재합니다.',
    options: [
      '센터코드 → 지역코드 → 지역명 하나만 해당한다.',
      '센터코드 → 지역코드 → 지역명, 센터코드 → 관할본부코드 → 관할본부명 두 가지만 해당한다.',
      '센터코드 → 관할본부코드 → 본부장사번 → 본부장이름 하나의 체인만 해당한다.',
      '지역코드 → 지역명, 관할본부코드 → 관할본부명/본부장사번, 본부장사번 → 본부장이름 세 가지 모두 해당한다.',
    ],
    points: 10,
  },
  {
    id: 'exam10_p9',
    title: '9. BCNF 위반과 해소',
    description:
      '다음 테이블은 제3정규형을 만족하지만 BCNF를 위반한다. 그 이유로 가장 올바른 것은?\n\n[세미나 배정 테이블]\nPK: (참가자ID, 세미나주제)\n속성: 강사ID\n\n제약조건:\n- 하나의 세미나 주제에 대해 강사는 한 명만 배정된다.\n- 한 강사는 하나의 세미나 주제만 담당한다.\n- 한 참가자는 같은 주제의 세미나를 중복 수강할 수 없다.\n\n함수 종속:\n- (참가자ID, 세미나주제) → 강사ID\n- 강사ID → 세미나주제\n- 세미나주제 → 강사ID',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 22,
    answer: '2',
    explanation:
      'BCNF는 모든 결정자가 후보키여야 한다는 조건입니다. 이 테이블에서 강사ID → 세미나주제 종속이 존재하는데, 강사ID는 후보키가 아닙니다(강사ID만으로는 참가자ID를 결정할 수 없으므로). 마찬가지로 세미나주제 → 강사ID 종속에서 세미나주제 단독으로도 후보키가 아닙니다. 후보키는 (참가자ID, 세미나주제)와 (참가자ID, 강사ID)인데, 강사ID와 세미나주제 각각이 결정자이면서 후보키가 아니므로 BCNF를 위반합니다.',
    options: [
      '기본키가 복합키이므로 무조건 BCNF를 위반한다.',
      '강사ID가 결정자이지만 후보키가 아니어서 BCNF를 위반한다.',
      '참가자ID → 세미나주제 종속이 존재하여 BCNF를 위반한다.',
      '세미나주제에 대한 부분 함수 종속이 존재하여 BCNF를 위반한다.',
    ],
    points: 10,
  },
  {
    id: 'exam10_p10',
    title: '10. 정규화와 성능 트레이드오프',
    description:
      '다음 중 정규화 수준과 데이터베이스 성능의 관계에 대한 설명으로 가장 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '정규화',
    correctRate: 68,
    answer: '3',
    explanation:
      '정규화를 수행하면 데이터 중복이 제거되어 INSERT/UPDATE/DELETE 시 갱신 이상이 줄어들고 데이터 무결성이 향상됩니다. 그러나 테이블이 분해되어 조인이 증가하므로 조회(SELECT) 성능이 저하될 수 있습니다. "정규화 수준이 높을수록 모든 유형의 SQL 성능이 향상된다"는 잘못된 설명입니다. 조회 성능 저하를 보완하기 위해 필요 시 반정규화를 적용하며, 이는 의도적으로 중복을 허용하여 조인을 줄이는 전략입니다.',
    options: [
      '정규화를 통해 데이터 중복이 제거되면 INSERT/UPDATE 시 갱신 이상(Anomaly)을 방지할 수 있다.',
      '정규화로 테이블이 분해되면 특정 조회에서 조인 횟수가 증가하여 SELECT 성능이 저하될 수 있다.',
      '정규화 수준이 높을수록 모든 유형의 SQL 성능이 향상된다.',
      '반정규화는 조회 성능 향상을 위해 의도적으로 중복을 허용하되, 데이터 정합성 관리 비용이 증가한다.',
    ],
    points: 10,
  },
  // ===== 2과목: SQL 기본 및 활용 (11~50번) =====
  // --- JOIN (11~17) ---
  {
    id: 'exam10_p11',
    title: '11. 세 테이블 OUTER JOIN 결과 분석',
    description:
      '다음 테이블과 SQL의 실행 결과로 출력되는 행의 수는?\n\n[창고] 테이블\n창고ID | 창고명\nW1     | 서울창고\nW2     | 부산창고\nW3     | 대전창고\n\n[재고] 테이블\n재고ID | 창고ID | 품목코드 | 수량\nI1     | W1     | P100     | 50\nI2     | W1     | P200     | 30\nI3     | W2     | P100     | 20\n\n[품목] 테이블\n품목코드 | 품목명\nP100     | 노트북\nP200     | 모니터\nP300     | 키보드\n\nSELECT W.창고명, M.품목명, S.수량\nFROM 창고 W\nLEFT OUTER JOIN 재고 S ON W.창고ID = S.창고ID\nLEFT OUTER JOIN 품목 M ON S.품목코드 = M.품목코드;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 30,
    answer: '3',
    explanation:
      'LEFT OUTER JOIN이므로 왼쪽 테이블(창고)의 모든 행이 보존됩니다. 첫 번째 JOIN 결과: W1-I1(P100,50), W1-I2(P200,30), W2-I3(P100,20), W3-NULL-NULL-NULL → 4행. 두 번째 JOIN에서 재고가 있는 행은 품목과 매칭: W1-노트북-50, W1-모니터-30, W2-노트북-20. W3은 재고가 NULL이므로 품목코드도 NULL이어서 품목과 매칭되지 않지만 LEFT JOIN이므로 W3-NULL-NULL로 보존. 최종 4행 출력.',
    options: [
      '3행',
      '6행',
      '4행',
      '9행',
    ],
    points: 10,
  },
  {
    id: 'exam10_p12',
    title: '12. CROSS JOIN과 조건 필터링',
    description:
      '다음 SQL의 실행 결과에서 출력되는 행의 수는?\n\n[색상] 테이블 (3건): 빨강, 파랑, 초록\n[사이즈] 테이블 (4건): S, M, L, XL\n\nSELECT C.색상, S.사이즈\nFROM 색상 C\nCROSS JOIN 사이즈 S\nWHERE NOT (C.색상 = \'빨강\' AND S.사이즈 = \'XL\')\n  AND NOT (C.색상 = \'초록\' AND S.사이즈 IN (\'S\', \'M\'));',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 52,
    answer: '2',
    explanation:
      'CROSS JOIN은 3 × 4 = 12행을 생성합니다. 첫 번째 NOT 조건으로 빨강-XL 1행 제외, 두 번째 NOT 조건으로 초록-S, 초록-M 2행 제외. 제외 조건이 겹치지 않으므로 총 12 - 1 - 2 = 9행이 출력됩니다.',
    options: [
      '8행',
      '9행',
      '10행',
      '12행',
    ],
    points: 10,
  },
  {
    id: 'exam10_p13',
    title: '13. SELF JOIN을 이용한 데이터 비교',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\n[기온] 테이블\n측정일     | 온도\n2025-07-01 | 32\n2025-07-02 | 35\n2025-07-03 | 33\n2025-07-04 | 38\n2025-07-05 | 36\n\nSELECT A.측정일 AS 당일, B.측정일 AS 전일,\n       A.온도 - B.온도 AS 온도차\nFROM 기온 A\nJOIN 기온 B ON A.측정일 = B.측정일 + 1\nWHERE A.온도 - B.온도 > 2;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 58,
    answer: '1',
    explanation:
      'SELF JOIN으로 A.측정일 = B.측정일 + 1 조건은 당일과 전일을 매칭합니다. 각 쌍의 온도차: 7/2-7/1=3, 7/3-7/2=-2, 7/4-7/3=5, 7/5-7/4=-2. WHERE 조건(온도차 > 2)을 만족하는 것은 7/2(차이3), 7/4(차이5) 두 행입니다.',
    options: [
      '(2025-07-02, 2025-07-01, 3)과 (2025-07-04, 2025-07-03, 5) 2행',
      '(2025-07-04, 2025-07-03, 5) 1행만 출력',
      '(2025-07-02, 2025-07-01, 3) 1행만 출력',
      '결과 없음 (0행)',
    ],
    points: 10,
  },
  {
    id: 'exam10_p14',
    title: '14. NATURAL JOIN과 USING 절의 차이',
    description:
      '다음 두 SQL 중 결과가 달라지는 경우는?\n\n[차량] 테이블: 차량ID, 모델명, 제조사코드\n[제조사] 테이블: 제조사코드, 제조사명, 차량ID\n\n-- SQL1\nSELECT * FROM 차량 NATURAL JOIN 제조사;\n\n-- SQL2\nSELECT * FROM 차량 JOIN 제조사 USING (제조사코드);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 26,
    answer: '2',
    explanation:
      'NATURAL JOIN은 두 테이블에서 이름이 같은 모든 컬럼을 자동으로 조인 조건에 사용합니다. 차량과 제조사 테이블에는 제조사코드와 차량ID 두 컬럼이 공통이므로, NATURAL JOIN은 (제조사코드 AND 차량ID) 두 조건으로 조인합니다. 반면 USING (제조사코드)는 제조사코드만으로 조인합니다. 따라서 차량ID 값이 두 테이블 간 다른 경우 결과가 달라집니다. NATURAL JOIN은 의도치 않은 컬럼까지 조인 조건에 포함하므로 주의해야 합니다.',
    options: [
      '두 SQL은 항상 같은 결과를 반환한다.',
      'NATURAL JOIN은 차량ID도 조인 조건에 포함하므로 결과 행 수가 줄어들 수 있다.',
      'USING 절은 제조사코드 컬럼을 결과에서 제외하므로 출력 컬럼 수만 다르다.',
      'NATURAL JOIN은 OUTER JOIN으로 동작하므로 결과 행이 더 많다.',
    ],
    points: 10,
  },
  {
    id: 'exam10_p15',
    title: '15. 다중 조인 시 조인 순서와 결과',
    description:
      '다음 SQL에서 INNER JOIN과 LEFT JOIN의 순서에 따라 결과가 달라진다. 올바른 결과 행 수는?\n\n[팀] 테이블: (T1, 개발팀), (T2, 기획팀), (T3, 디자인팀)\n[멤버] 테이블: (M1, T1, 홍길동), (M2, T1, 김철수), (M3, T2, 이영희)\n[프로젝트배정] 테이블: (M1, PJ1), (M1, PJ2), (M3, PJ1)\n\nSELECT T.팀명, MB.이름, PA.프로젝트코드\nFROM 팀 T\nLEFT JOIN 멤버 MB ON T.팀ID = MB.팀ID\nINNER JOIN 프로젝트배정 PA ON MB.멤버ID = PA.멤버ID;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 24,
    answer: '1',
    explanation:
      'LEFT JOIN 후 INNER JOIN이 적용됩니다. 먼저 팀 LEFT JOIN 멤버: T1-M1(홍길동), T1-M2(김철수), T2-M3(이영희), T3-NULL. 이후 INNER JOIN 프로젝트배정: M1-PJ1, M1-PJ2, M3-PJ1만 매칭됩니다. M2(김철수)는 프로젝트배정이 없어 제거, T3도 멤버ID가 NULL이므로 제거. 최종 3행: (개발팀, 홍길동, PJ1), (개발팀, 홍길동, PJ2), (기획팀, 이영희, PJ1). LEFT JOIN 뒤에 INNER JOIN이 오면 LEFT JOIN의 보존 효과가 후속 INNER JOIN에 의해 제거될 수 있으므로 주의해야 합니다.',
    options: [
      '3행',
      '4행',
      '5행',
      '6행',
    ],
    points: 10,
  },
  {
    id: 'exam10_p16',
    title: '16. FULL OUTER JOIN과 NULL 처리',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\n[공급자] 테이블\n공급자ID | 공급자명\nS1       | 알파상사\nS2       | 베타무역\nS3       | 감마유통\n\n[납품] 테이블\n납품ID | 공급자ID | 자재코드\nD1     | S1       | MT01\nD2     | S2       | MT02\nD3     | S4       | MT03\n\nSELECT COALESCE(G.공급자명, \'미등록\') AS 공급자,\n       COALESCE(N.자재코드, \'납품없음\') AS 자재\nFROM 공급자 G\nFULL OUTER JOIN 납품 N ON G.공급자ID = N.공급자ID;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 28,
    answer: '4',
    explanation:
      'FULL OUTER JOIN은 양쪽 테이블의 모든 행을 보존합니다. 매칭되는 행: S1-D1(알파상사, MT01), S2-D2(베타무역, MT02). 왼쪽만: S3(감마유통)는 납품이 없으므로 자재코드=NULL → COALESCE로 "납품없음". 오른쪽만: D3의 공급자ID S4는 공급자 테이블에 없으므로 공급자명=NULL → COALESCE로 "미등록". 최종 4행: (알파상사, MT01), (베타무역, MT02), (감마유통, 납품없음), (미등록, MT03).',
    options: [
      '3행: 알파상사-MT01, 베타무역-MT02, 감마유통-납품없음',
      '3행: 알파상사-MT01, 베타무역-MT02, 미등록-MT03',
      '5행 (감마유통과 미등록 각각 2행씩)',
      '4행: 알파상사-MT01, 베타무역-MT02, 감마유통-납품없음, 미등록-MT03',
    ],
    points: 10,
  },
  {
    id: 'exam10_p17',
    title: '17. 안티 조인(Anti Join) 패턴 구현',
    description:
      '다음 중 "한 번도 주문한 적 없는 고객"을 조회하는 SQL로 가장 비효율적인 것은?\n\n[고객] 테이블: 고객ID, 고객명\n[주문] 테이블: 주문ID, 고객ID, 주문일',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 45,
    answer: '3',
    explanation:
      'NOT IN 서브쿼리에서 서브쿼리 결과에 NULL이 포함되면 전체 결과가 공집합이 되는 문제가 있어 가장 비효율적이며 위험합니다. 주문 테이블의 고객ID에 NULL이 하나라도 있으면 NOT IN 조건이 UNKNOWN으로 평가되어 어떤 행도 반환되지 않습니다. 반면 NOT EXISTS, LEFT JOIN + IS NULL, MINUS(EXCEPT) 방식은 NULL 안전합니다.',
    options: [
      'SELECT C.* FROM 고객 C LEFT JOIN 주문 O ON C.고객ID = O.고객ID WHERE O.주문ID IS NULL',
      'SELECT * FROM 고객 WHERE NOT EXISTS (SELECT 1 FROM 주문 WHERE 주문.고객ID = 고객.고객ID)',
      'SELECT * FROM 고객 WHERE 고객ID NOT IN (SELECT 고객ID FROM 주문)',
      'SELECT 고객ID, 고객명 FROM 고객 MINUS SELECT C.고객ID, C.고객명 FROM 고객 C JOIN 주문 O ON C.고객ID = O.고객ID',
    ],
    points: 10,
  },
  // --- 함수 (18~23) ---
  {
    id: 'exam10_p18',
    title: '18. NULL과 비교 연산의 결과',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\nSELECT CASE\n         WHEN NULL = NULL THEN \'같다\'\n         WHEN NULL <> NULL THEN \'다르다\'\n         WHEN NULL IS NULL THEN \'NULL이다\'\n         ELSE \'알수없다\'\n       END AS 결과\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 55,
    answer: '3',
    explanation:
      'SQL에서 NULL과의 모든 비교 연산(=, <>, <, > 등)은 UNKNOWN을 반환합니다. NULL = NULL은 TRUE가 아니라 UNKNOWN이고, NULL <> NULL도 UNKNOWN입니다. CASE WHEN은 UNKNOWN을 FALSE처럼 처리하여 해당 분기를 실행하지 않습니다. NULL IS NULL만이 TRUE를 반환합니다. 따라서 세 번째 WHEN 절이 실행되어 "NULL이다"가 출력됩니다.',
    options: [
      '같다',
      '다르다',
      'NULL이다',
      '알수없다',
    ],
    points: 10,
  },
  {
    id: 'exam10_p19',
    title: '19. 날짜 함수 조합 문제',
    description:
      '다음 SQL의 실행 결과는? (Oracle 기준)\n\nSELECT TO_CHAR(\n         ADD_MONTHS(LAST_DAY(TO_DATE(\'20250215\', \'YYYYMMDD\')), -1) + 1,\n         \'YYYY-MM-DD\'\n       ) AS 결과\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 22,
    answer: '2',
    explanation:
      '단계별 계산: 1) TO_DATE(\'20250215\', \'YYYYMMDD\') → 2025-02-15. 2) LAST_DAY(2025-02-15) → 2025-02-28 (2025년은 평년). 3) ADD_MONTHS(2025-02-28, -1) → 2025-01-31 (1개월 전). ADD_MONTHS는 말일에서 1개월 전이면 이전 달 말일을 반환합니다. 4) 2025-01-31 + 1 → 2025-02-01. 최종 결과: 2025-02-01.',
    options: [
      '2025-01-31',
      '2025-02-01',
      '2025-02-28',
      '2025-01-28',
    ],
    points: 10,
  },
  {
    id: 'exam10_p20',
    title: '20. DECODE와 중첩 CASE 변환',
    description:
      '다음 DECODE 문과 동일한 결과를 반환하는 CASE 문은?\n\nSELECT DECODE(등급, \'A\', DECODE(구분, \'내부\', 1000, \'외부\', 2000, 500),\n                    \'B\', DECODE(구분, \'내부\', 800, 300),\n                    100) AS 결과\nFROM 거래처;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 30,
    answer: '1',
    explanation:
      'DECODE는 중첩될 수 있으며, 각 DECODE의 마지막 인자는 기본값입니다. 등급=A이고 구분=내부이면 1000, 구분=외부이면 2000, 그 외 500. 등급=B이고 구분=내부이면 800, 그 외 300. 등급이 A, B 모두 아니면 100. 이를 CASE로 변환하면 중첩 CASE WHEN 구조가 됩니다.',
    options: [
      'CASE WHEN 등급=\'A\' THEN CASE WHEN 구분=\'내부\' THEN 1000 WHEN 구분=\'외부\' THEN 2000 ELSE 500 END WHEN 등급=\'B\' THEN CASE WHEN 구분=\'내부\' THEN 800 ELSE 300 END ELSE 100 END',
      'CASE WHEN 등급=\'A\' AND 구분=\'내부\' THEN 1000 WHEN 등급=\'A\' AND 구분=\'외부\' THEN 2000 WHEN 등급=\'B\' AND 구분=\'내부\' THEN 800 ELSE 100 END',
      'CASE 등급 WHEN \'A\' THEN 1000 WHEN \'B\' THEN 800 ELSE CASE 구분 WHEN \'내부\' THEN 500 ELSE 100 END END',
      'CASE WHEN 등급=\'A\' THEN CASE WHEN 구분=\'내부\' THEN 1000 ELSE 2000 END WHEN 등급=\'B\' THEN CASE WHEN 구분=\'내부\' THEN 800 ELSE 300 END ELSE 100 END',
    ],
    points: 10,
  },
  {
    id: 'exam10_p21',
    title: '21. 문자열 함수 조합',
    description:
      '다음 SQL의 실행 결과는? (Oracle 기준)\n\nSELECT REPLACE(\n         SUBSTR(\n           LPAD(\'SQL\', 8, \'*#\'),\n           3, 4\n         ),\n         \'#\', \'@\'\n       ) AS 결과\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 40,
    answer: '3',
    explanation:
      '단계별 계산: 1) LPAD(\'SQL\', 8, \'*#\') → 8자리로 왼쪽 채움. \'SQL\'은 3자이므로 5자를 \'*#\' 반복으로 채움: \'*#*#*SQL\'. 2) SUBSTR(\'*#*#*SQL\', 3, 4) → 3번째 위치부터 4글자: \'*#*S\'. 3) REPLACE(\'*#*S\', \'#\', \'@\') → \'*@*S\'. 최종 결과: \'*@*S\'.',
    options: [
      '*#*S',
      '**@S',
      '*@*S',
      '#*@S',
    ],
    points: 10,
  },
  {
    id: 'exam10_p22',
    title: '22. NVL, NVL2, NULLIF 함수의 구분',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\n[직급] 테이블\n사번 | 현재직급 | 이전직급\n101  | 과장    | 대리\n102  | 부장    | NULL\n103  | NULL    | 차장\n104  | 대리    | 대리\n\nSELECT 사번,\n       NVL2(이전직급, \'승진\', \'신규\') AS 구분,\n       NULLIF(현재직급, 이전직급) AS 비교결과\nFROM 직급;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '함수',
    correctRate: 28,
    answer: '2',
    explanation:
      'NVL2(expr1, val1, val2)는 expr1이 NOT NULL이면 val1, NULL이면 val2를 반환합니다. NULLIF(a, b)는 a=b이면 NULL, 아니면 a를 반환합니다. 사번101: 이전직급=대리(NOT NULL) → 승진, NULLIF(과장, 대리)=과장. 사번102: 이전직급=NULL → 신규, NULLIF(부장, NULL) - NULL과의 비교는 UNKNOWN이므로 같지 않으므로 부장 반환. 사번103: 이전직급=차장(NOT NULL) → 승진, NULLIF(NULL, 차장) - 현재직급이 NULL이고 NULL≠차장이므로 NULL 반환(NULLIF는 첫 번째 인자 반환이므로 NULL). 사번104: 이전직급=대리(NOT NULL) → 승진, NULLIF(대리, 대리)=NULL.',
    options: [
      '101-승진-과장, 102-신규-NULL, 103-승진-차장, 104-승진-NULL',
      '101-승진-과장, 102-신규-부장, 103-승진-NULL, 104-승진-NULL',
      '101-승진-과장, 102-신규-부장, 103-신규-차장, 104-승진-NULL',
      '101-승진-과장, 102-신규-NULL, 103-승진-NULL, 104-승진-대리',
    ],
    points: 10,
  },
  {
    id: 'exam10_p23',
    title: '23. 숫자 함수와 형변환',
    description:
      '다음 SQL의 실행 결과는? (Oracle 기준)\n\nSELECT TRUNC(15.789, -1) + MOD(-17, 5) + CEIL(-3.2) AS 결과\nFROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 42,
    answer: '4',
    explanation:
      '단계별 계산: 1) TRUNC(15.789, -1): 소수점 기준 -1자리(일의 자리)에서 절삭 → 10. 2) MOD(-17, 5): Oracle에서 MOD는 피제수의 부호를 따름. -17 = 5*(-4) + 3이므로... 실제로 -17/5 = -3 나머지 -2. MOD(-17, 5) = -17 - 5*TRUNC(-17/5) = -17 - 5*(-3) = -17 + 15 = -2. 3) CEIL(-3.2): -3.2보다 크거나 같은 최소 정수 → -3. 최종: 10 + (-2) + (-3) = 5.',
    options: [
      '3',
      '7',
      '8',
      '5',
    ],
    points: 10,
  },
  // --- DML (24~28) ---
  {
    id: 'exam10_p24',
    title: '24. INSERT 서브쿼리와 컬럼 매핑',
    description:
      '다음 SQL 실행 시 발생하는 결과로 올바른 것은?\n\n[월별매출요약] 테이블: 연월(VARCHAR2), 총매출(NUMBER), 건수(NUMBER)\n[일별매출] 테이블: 매출일(DATE), 매출액(NUMBER), 고객ID(VARCHAR2)\n\nINSERT INTO 월별매출요약 (연월, 총매출, 건수)\nSELECT TO_CHAR(매출일, \'YYYYMM\'),\n       SUM(매출액),\n       COUNT(*)\nFROM 일별매출\nWHERE 매출일 >= TO_DATE(\'20250101\', \'YYYYMMDD\')\n  AND 매출일 < TO_DATE(\'20250401\', \'YYYYMMDD\')\nGROUP BY TO_CHAR(매출일, \'YYYYMM\');',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 75,
    answer: '2',
    explanation:
      'INSERT INTO ... SELECT 구문은 서브쿼리의 결과를 대상 테이블에 삽입합니다. 서브쿼리는 2025년 1~3월 데이터를 월별로 그룹핑하여 연월, 총매출, 건수를 계산합니다. GROUP BY 결과가 3개 월(202501, 202502, 202503)이므로 최대 3건이 삽입됩니다. VALUES 키워드 없이 SELECT를 직접 사용하는 것은 올바른 문법이며, SELECT 컬럼과 INSERT 컬럼의 수와 타입이 일치하므로 정상 실행됩니다.',
    options: [
      'VALUES 키워드가 없어 문법 오류가 발생한다.',
      '정상 실행되며, GROUP BY 결과인 최대 3건이 삽입된다.',
      'SELECT에 GROUP BY가 있으면 INSERT 서브쿼리로 사용할 수 없다.',
      '정상 실행되지만 일별매출의 모든 행이 개별적으로 삽입된다.',
    ],
    points: 10,
  },
  {
    id: 'exam10_p25',
    title: '25. MERGE 문의 동작 분석',
    description:
      '다음 MERGE 문 실행 후 [재고현황] 테이블의 최종 상태로 올바른 것은?\n\n[재고현황] 테이블 (BEFORE)\n품목코드 | 재고수량 | 최종입고일\nA01      | 100      | 2025-01-10\nA02      | 50       | 2025-01-15\n\n[금일입고] 테이블\n품목코드 | 입고수량 | 입고일\nA02      | 30       | 2025-02-01\nA03      | 80       | 2025-02-01\n\nMERGE INTO 재고현황 T\nUSING 금일입고 S\nON (T.품목코드 = S.품목코드)\nWHEN MATCHED THEN\n  UPDATE SET T.재고수량 = T.재고수량 + S.입고수량,\n             T.최종입고일 = S.입고일\nWHEN NOT MATCHED THEN\n  INSERT (품목코드, 재고수량, 최종입고일)\n  VALUES (S.품목코드, S.입고수량, S.입고일);',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 68,
    answer: '3',
    explanation:
      'MERGE 문은 ON 조건으로 매칭 여부를 판단합니다. A02는 양쪽에 존재(MATCHED) → UPDATE: 재고수량 50+30=80, 최종입고일=2025-02-01. A03는 재고현황에 없음(NOT MATCHED) → INSERT: (A03, 80, 2025-02-01). A01은 금일입고에 없으므로 MERGE 대상이 아닌 행으로 변경 없이 유지. 최종: A01(100, 2025-01-10), A02(80, 2025-02-01), A03(80, 2025-02-01).',
    options: [
      'A01(100, 2025-01-10), A02(80, 2025-02-01)',
      'A02(80, 2025-02-01), A03(80, 2025-02-01)',
      'A01(100, 2025-01-10), A02(80, 2025-02-01), A03(80, 2025-02-01)',
      'A01(100, 2025-02-01), A02(80, 2025-02-01), A03(80, 2025-02-01)',
    ],
    points: 10,
  },
  {
    id: 'exam10_p26',
    title: '26. UPDATE와 서브쿼리의 상관관계',
    description:
      '다음 UPDATE 문 실행 후 [영업실적] 테이블에서 사원번호 E03의 실적등급 값은?\n\n[영업실적] 테이블\n사원번호 | 매출합계 | 실적등급\nE01      | 5000     | NULL\nE02      | 3000     | NULL\nE03      | 8000     | NULL\nE04      | 1500     | NULL\n\nUPDATE 영업실적\nSET 실적등급 = (\n  SELECT CASE\n           WHEN 순위 <= 1 THEN \'S\'\n           WHEN 순위 <= 2 THEN \'A\'\n           ELSE \'B\'\n         END\n  FROM (\n    SELECT 사원번호,\n           RANK() OVER (ORDER BY 매출합계 DESC) AS 순위\n    FROM 영업실적\n  ) R\n  WHERE R.사원번호 = 영업실적.사원번호\n);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 32,
    answer: '1',
    explanation:
      '인라인 뷰에서 매출합계 기준 내림차순 RANK: E03(8000)=1위, E01(5000)=2위, E02(3000)=3위, E04(1500)=4위. E03의 순위는 1이므로 CASE 조건 \'순위 <= 1\'에 해당하여 \'S\'가 됩니다. 상관 서브쿼리로 각 사원의 사원번호를 매칭하여 해당 등급을 UPDATE합니다.',
    options: [
      'S',
      'A',
      'B',
      'NULL',
    ],
    points: 10,
  },
  {
    id: 'exam10_p27',
    title: '27. DELETE와 EXISTS를 이용한 조건부 삭제',
    description:
      '다음 SQL 실행 후 [수강신청] 테이블에서 삭제되는 행의 수는?\n\n[수강신청] 테이블\n신청ID | 학번   | 과목코드 | 신청일\nR1     | ST01   | CS101    | 2025-03-01\nR2     | ST01   | CS102    | 2025-03-01\nR3     | ST02   | CS101    | 2025-03-02\nR4     | ST03   | CS103    | 2025-03-01\nR5     | ST02   | CS104    | 2025-03-03\n\n[폐강과목] 테이블\n과목코드 | 사유\nCS102    | 수강인원미달\nCS104    | 교수부재\n\nDELETE FROM 수강신청 A\nWHERE EXISTS (\n  SELECT 1 FROM 폐강과목 B\n  WHERE A.과목코드 = B.과목코드\n);',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 78,
    answer: '2',
    explanation:
      'EXISTS 서브쿼리는 수강신청의 각 행에 대해 폐강과목 테이블에 동일 과목코드가 존재하는지 확인합니다. CS102는 폐강과목에 존재 → R2 삭제. CS104도 폐강과목에 존재 → R5 삭제. CS101, CS103은 폐강과목에 없으므로 R1, R3, R4는 유지. 총 2건 삭제.',
    options: [
      '1건',
      '2건',
      '3건',
      '5건 (전체)',
    ],
    points: 10,
  },
  {
    id: 'exam10_p28',
    title: '28. 다중 테이블 INSERT',
    description:
      '다음 SQL에 대한 설명으로 올바르지 않은 것은? (Oracle 기준)\n\nINSERT ALL\n  WHEN 매출액 >= 10000 THEN\n    INTO 대형거래 (거래ID, 금액) VALUES (거래번호, 매출액)\n  WHEN 매출액 >= 5000 AND 매출액 < 10000 THEN\n    INTO 중형거래 (거래ID, 금액) VALUES (거래번호, 매출액)\n  ELSE\n    INTO 소형거래 (거래ID, 금액) VALUES (거래번호, 매출액)\nSELECT 거래번호, 매출액 FROM 일일거래;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 48,
    answer: '4',
    explanation:
      'INSERT ALL은 조건별로 각 대상 테이블에 데이터를 삽입합니다. 이 구문에서는 WHEN 조건이 순차적으로 평가되며, 매출액이 10000 이상이면 대형거래에, 5000~9999이면 중형거래에, 나머지는 소형거래에 삽입됩니다. INSERT ALL에서 하나의 원본 행이 여러 WHEN 조건을 만족하면 여러 테이블에 중복 삽입될 수 있지만, 이 경우 WHEN 조건이 상호 배타적이므로 중복은 발생하지 않습니다. "INSERT ALL은 항상 모든 WHEN 조건을 평가하므로 매출액 15000인 행은 대형거래와 중형거래 모두에 삽입된다"는 잘못된 설명입니다 — 이 구문의 조건은 상호 배타적으로 작성되어 있어 하나의 테이블에만 삽입됩니다.',
    options: [
      'INSERT ALL은 하나의 SELECT 결과를 여러 대상 테이블에 분배할 수 있다.',
      'ELSE 절에 의해 WHEN 조건에 해당하지 않는 행은 소형거래 테이블에 삽입된다.',
      'INSERT FIRST를 사용하면 첫 번째로 만족하는 WHEN 절만 실행된다.',
      '매출액 15000인 행은 INSERT ALL이므로 대형거래와 중형거래 테이블 모두에 삽입된다.',
    ],
    points: 10,
  },
  // --- DDL (29~32) ---
  {
    id: 'exam10_p29',
    title: '29. 제약조건 추가와 기존 데이터 검증',
    description:
      '다음 테이블에 제약조건을 추가할 때 성공하는 것은?\n\n[측정값] 테이블\n측정ID | 센서코드 | 측정수치 | 측정일시\n1      | SN01     | 25.3     | 2025-01-01 10:00\n2      | SN02     | NULL     | 2025-01-01 10:05\n3      | SN01     | 30.1     | 2025-01-01 10:10\n4      | SN03     | -5.0     | NULL',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 44,
    answer: '3',
    explanation:
      '제약조건 추가 시 기존 데이터가 제약조건을 만족해야 합니다. 1번: 측정수치에 NOT NULL → 측정ID 2의 측정수치가 NULL이므로 실패. 2번: 측정일시에 NOT NULL → 측정ID 4의 측정일시가 NULL이므로 실패. 3번: 센서코드에 NOT NULL → 모든 행의 센서코드가 값이 있으므로 성공. 4번: (센서코드, 측정일시)에 UNIQUE → 센서코드SN01이 2건이지만 측정일시가 다르므로 UNIQUE는 만족하지만, 측정ID 4의 측정일시가 NULL이므로 복합 UNIQUE에서 NULL 포함 행은 허용됩니다. 그러나 3번이 가장 확실히 성공합니다.',
    options: [
      'ALTER TABLE 측정값 ADD CONSTRAINT ck_val NOT NULL (측정수치)',
      'ALTER TABLE 측정값 ADD CONSTRAINT ck_dt NOT NULL (측정일시)',
      'ALTER TABLE 측정값 MODIFY 센서코드 NOT NULL',
      'ALTER TABLE 측정값 ADD CONSTRAINT uq_sensor UNIQUE (센서코드)',
    ],
    points: 10,
  },
  {
    id: 'exam10_p30',
    title: '30. ALTER TABLE의 컬럼 변경 제약',
    description:
      '다음 중 Oracle에서 ALTER TABLE로 컬럼을 변경할 때 오류가 발생하는 것은?\n\n[수주] 테이블 (현재 100건 존재)\n수주번호 NUMBER(10)    PK\n고객코드 VARCHAR2(10)  NOT NULL\n수주금액 NUMBER(15,2)\n비고     VARCHAR2(200)\n상태코드 CHAR(1)       -- 모든 행에 값이 존재',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 40,
    answer: '2',
    explanation:
      'Oracle에서 컬럼 변경 시: 데이터가 있는 컬럼의 크기를 줄이려면 기존 데이터가 새 크기에 모두 들어가야 합니다. VARCHAR2(200)→VARCHAR2(500)은 확장이므로 항상 가능. VARCHAR2(10)→VARCHAR2(5)는 기존 고객코드 중 5자를 초과하는 데이터가 있으면 실패합니다. 데이터가 있는 컬럼의 타입을 변경하려면 컬럼이 비어있어야 합니다. CHAR(1)에 모든 행에 값이 있으므로 VARCHAR2(1)로 타입 변경이 불가합니다.',
    options: [
      'ALTER TABLE 수주 MODIFY 비고 VARCHAR2(500)',
      'ALTER TABLE 수주 MODIFY 상태코드 VARCHAR2(1)',
      'ALTER TABLE 수주 MODIFY 수주금액 NUMBER(18,2)',
      'ALTER TABLE 수주 ADD 등록일 DATE DEFAULT SYSDATE',
    ],
    points: 10,
  },
  {
    id: 'exam10_p31',
    title: '31. CASCADE 옵션과 참조 무결성',
    description:
      '다음 DDL에서 부서 테이블의 D10 행을 DELETE할 때 발생하는 결과로 올바른 것은?\n\nCREATE TABLE 부서 (\n  부서코드 CHAR(3) PRIMARY KEY,\n  부서명   VARCHAR2(50)\n);\n\nCREATE TABLE 사원 (\n  사원번호 NUMBER PRIMARY KEY,\n  사원명   VARCHAR2(30),\n  부서코드 CHAR(3),\n  CONSTRAINT fk_dept FOREIGN KEY (부서코드)\n    REFERENCES 부서(부서코드)\n    ON DELETE SET NULL\n);\n\n-- 데이터: 부서(D10, 영업부), 사원(1, 김영업, D10), 사원(2, 박영업, D10)\n\nDELETE FROM 부서 WHERE 부서코드 = \'D10\';',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 70,
    answer: '3',
    explanation:
      'ON DELETE SET NULL 옵션이 설정되어 있으므로, 부서 테이블에서 D10을 삭제하면 사원 테이블에서 부서코드가 D10인 행들의 부서코드 값이 NULL로 변경됩니다. 부서 행은 정상 삭제되고, 사원 행은 삭제되지 않으며 FK 컬럼만 NULL로 설정됩니다.',
    options: [
      '참조하는 사원 데이터가 있으므로 삭제 오류 발생',
      '부서와 사원 모두 삭제됨 (CASCADE)',
      '부서 D10 삭제, 사원의 부서코드가 NULL로 변경됨',
      '부서 D10 삭제, 사원의 부서코드가 기본값으로 변경됨',
    ],
    points: 10,
  },
  {
    id: 'exam10_p32',
    title: '32. 인덱스 생성과 활용',
    description:
      '다음 중 인덱스 설계에 대한 설명으로 가장 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 48,
    answer: '4',
    explanation:
      '복합 인덱스에서 컬럼 순서는 매우 중요합니다. (A, B, C) 순서의 복합 인덱스는 A 단독 조건, A+B 조건, A+B+C 조건의 WHERE 절에서 활용 가능하지만, B 단독이나 C 단독 조건에서는 인덱스를 효율적으로 활용하기 어렵습니다. "복합 인덱스의 컬럼 순서는 성능에 영향을 주지 않는다"는 명백히 잘못된 설명입니다.',
    options: [
      '분포도(Selectivity)가 좋은 컬럼, 즉 고유 값의 비율이 높은 컬럼에 인덱스를 생성하면 효과적이다.',
      'DML이 빈번한 테이블에 인덱스가 많으면 INSERT/UPDATE/DELETE 성능이 저하된다.',
      'UNIQUE 인덱스는 해당 컬럼 값의 유일성을 보장하며, NULL은 여러 행에 존재할 수 있다.',
      '복합 인덱스의 컬럼 순서는 성능에 영향을 주지 않으므로 어떤 순서든 동일한 효과를 가진다.',
    ],
    points: 10,
  },
  // --- 서브쿼리 (33~37) ---
  {
    id: 'exam10_p33',
    title: '33. 상관 서브쿼리와 EXISTS의 동작',
    description:
      '다음 SQL의 실행 결과로 출력되는 항공편 수는?\n\n[항공편] 테이블\n편명   | 출발지 | 도착지 | 운항요일\nKE901  | ICN    | NRT    | 월수금\nKE902  | ICN    | LAX    | 매일\nKE903  | ICN    | CDG    | 화목토\nKE904  | GMP    | CJU    | 매일\n\n[예약] 테이블\n예약번호 | 편명   | 승객수\nB001     | KE901  | 150\nB002     | KE902  | 280\nB003     | KE902  | 190\nB004     | KE904  | 50\n\nSELECT F.편명, F.도착지\nFROM 항공편 F\nWHERE EXISTS (\n  SELECT 1 FROM 예약 R\n  WHERE R.편명 = F.편명\n  HAVING SUM(R.승객수) > 200\n);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 24,
    answer: '1',
    explanation:
      '상관 서브쿼리에서 각 항공편에 대해 예약 테이블에서 해당 편명의 총 승객수를 계산합니다. KE901: SUM=150 (200 이하 → FALSE), KE902: SUM=280+190=470 (200 초과 → TRUE), KE903: 예약 없음 → SUM은 NULL, HAVING 조건 불만족 → FALSE, KE904: SUM=50 (200 이하 → FALSE). EXISTS는 서브쿼리가 행을 반환하면 TRUE입니다. HAVING 없이 WHERE만 있었다면 다르지만, HAVING SUM > 200을 만족하는 것은 KE902뿐. 따라서 1건 출력: KE902-LAX.',
    options: [
      '1건 (KE902)',
      '2건 (KE902, KE904)',
      '3건 (KE901, KE902, KE904)',
      '0건',
    ],
    points: 10,
  },
  {
    id: 'exam10_p34',
    title: '34. 인라인 뷰와 TOP-N 분석',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\n[판매] 테이블\n판매원ID | 지역   | 판매금액\nS01      | 서울   | 500\nS02      | 서울   | 700\nS03      | 부산   | 600\nS04      | 부산   | 400\nS05      | 대전   | 800\nS06      | 대전   | 300\n\nSELECT 지역, 판매원ID, 판매금액\nFROM (\n  SELECT 지역, 판매원ID, 판매금액,\n         ROW_NUMBER() OVER (PARTITION BY 지역 ORDER BY 판매금액 DESC) AS RN\n  FROM 판매\n)\nWHERE RN = 1;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 62,
    answer: '2',
    explanation:
      'ROW_NUMBER()는 PARTITION BY 지역별로 판매금액 내림차순 순번을 부여합니다. 서울: S02(700)=1, S01(500)=2. 부산: S03(600)=1, S04(400)=2. 대전: S05(800)=1, S06(300)=2. 외부 쿼리에서 RN=1만 필터링하면 각 지역의 최고 판매원: 서울-S02(700), 부산-S03(600), 대전-S05(800). 총 3건.',
    options: [
      '1건: 대전-S05-800',
      '3건: 서울-S02-700, 부산-S03-600, 대전-S05-800',
      '3건: 서울-S01-500, 부산-S04-400, 대전-S06-300',
      '6건 (전체)',
    ],
    points: 10,
  },
  {
    id: 'exam10_p35',
    title: '35. 스칼라 서브쿼리의 제약과 NULL',
    description:
      '다음 SQL에서 화물코드 \'FG05\'에 대한 출력 결과로 올바른 것은?\n\n[화물] 테이블\n화물코드 | 화물명   | 창고ID\nFG01     | 전자부품 | WH1\nFG02     | 식료품   | WH2\nFG03     | 의류     | WH1\nFG04     | 가구     | WH3\nFG05     | 화학물   | WH9\n\n[창고] 테이블\n창고ID | 창고명     | 관리자\nWH1    | 중앙창고   | 김관리\nWH2    | 냉동창고   | 이관리\nWH3    | 대형창고   | 박관리\n\nSELECT H.화물코드, H.화물명,\n       (SELECT C.창고명 FROM 창고 C WHERE C.창고ID = H.창고ID) AS 보관창고\nFROM 화물 H;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 58,
    answer: '3',
    explanation:
      '스칼라 서브쿼리는 각 행에 대해 하나의 값을 반환합니다. 화물코드 FG05의 창고ID는 WH9인데, 창고 테이블에 WH9가 존재하지 않으므로 서브쿼리는 결과가 없어 NULL을 반환합니다. 스칼라 서브쿼리가 결과 행이 없으면 오류가 아니라 NULL을 반환하는 것이 특징입니다. 반면 2건 이상 반환하면 오류가 발생합니다.',
    options: [
      '화물코드 FG05 행이 결과에서 제외된다.',
      '서브쿼리에서 매칭되는 행이 없어 오류가 발생한다.',
      'FG05, 화학물, NULL로 출력된다.',
      'FG05, 화학물, 빈 문자열(\'\')로 출력된다.',
    ],
    points: 10,
  },
  {
    id: 'exam10_p36',
    title: '36. 다중 컬럼 서브쿼리',
    description:
      '다음 SQL의 실행 결과로 출력되는 행의 수는?\n\n[성적] 테이블\n학번   | 과목   | 점수\nST01   | 수학   | 95\nST01   | 영어   | 88\nST02   | 수학   | 92\nST02   | 영어   | 95\nST03   | 수학   | 88\nST03   | 영어   | 90\n\nSELECT 학번, 과목, 점수\nFROM 성적\nWHERE (과목, 점수) IN (\n  SELECT 과목, MAX(점수)\n  FROM 성적\n  GROUP BY 과목\n);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 35,
    answer: '2',
    explanation:
      '서브쿼리에서 과목별 최고 점수: 수학 MAX=95, 영어 MAX=95. 다중 컬럼 IN 조건으로 (과목, 점수) 쌍이 (수학, 95) 또는 (영어, 95)인 행을 찾습니다. ST01의 수학 95 → 매칭, ST02의 영어 95 → 매칭. 총 2건 출력.',
    options: [
      '1건',
      '2건',
      '3건',
      '6건',
    ],
    points: 10,
  },
  {
    id: 'exam10_p37',
    title: '37. WITH 절(CTE)의 재귀적 사용 제한',
    description:
      '다음 SQL에 대한 설명으로 올바르지 않은 것은?\n\nWITH 분기매출 AS (\n  SELECT 지점코드,\n         CASE WHEN EXTRACT(MONTH FROM 매출일) BETWEEN 1 AND 3 THEN \'Q1\'\n              WHEN EXTRACT(MONTH FROM 매출일) BETWEEN 4 AND 6 THEN \'Q2\'\n              WHEN EXTRACT(MONTH FROM 매출일) BETWEEN 7 AND 9 THEN \'Q3\'\n              ELSE \'Q4\'\n         END AS 분기,\n         SUM(매출액) AS 분기매출액\n  FROM 매출\n  GROUP BY 지점코드,\n           CASE WHEN EXTRACT(MONTH FROM 매출일) BETWEEN 1 AND 3 THEN \'Q1\'\n                WHEN EXTRACT(MONTH FROM 매출일) BETWEEN 4 AND 6 THEN \'Q2\'\n                WHEN EXTRACT(MONTH FROM 매출일) BETWEEN 7 AND 9 THEN \'Q3\'\n                ELSE \'Q4\'\n           END\n)\nSELECT A.지점코드, A.분기, A.분기매출액,\n       ROUND(A.분기매출액 / B.연매출 * 100, 1) AS 비중\nFROM 분기매출 A\nJOIN (\n  SELECT 지점코드, SUM(분기매출액) AS 연매출\n  FROM 분기매출\n  GROUP BY 지점코드\n) B ON A.지점코드 = B.지점코드;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 50,
    answer: '3',
    explanation:
      'WITH 절(CTE)은 쿼리 내에서 임시 결과 집합을 정의하며, 동일 쿼리에서 여러 번 참조할 수 있습니다. 이 SQL에서 분기매출 CTE는 메인 쿼리의 FROM절과 인라인 뷰 내에서 두 번 참조됩니다. CTE는 인라인 뷰와 달리 한 번 정의하고 여러 번 사용할 수 있어 가독성과 유지보수성이 좋습니다. "WITH 절은 한 번만 참조할 수 있다"는 잘못된 설명입니다.',
    options: [
      'WITH 절에서 정의한 분기매출은 메인 쿼리에서 테이블처럼 사용할 수 있다.',
      'JOIN 내부의 인라인 뷰에서 분기매출 CTE를 다시 참조하여 연매출을 계산하고 있다.',
      'WITH 절로 정의된 CTE는 메인 쿼리에서 한 번만 참조할 수 있다.',
      'CTE를 사용하면 동일한 서브쿼리를 반복 작성하지 않아도 되어 가독성이 향상된다.',
    ],
    points: 10,
  },
  // --- GROUP BY (38~41) ---
  {
    id: 'exam10_p38',
    title: '38. GROUP BY와 HAVING에서의 집계 함수 비교',
    description:
      '다음 SQL의 실행 결과로 출력되는 행의 수는?\n\n[배송] 테이블\n배송ID | 배송업체 | 지역   | 배송비\nD1     | 한진     | 서울   | 3000\nD2     | 한진     | 부산   | 5000\nD3     | CJ      | 서울   | 2500\nD4     | CJ      | 서울   | 3500\nD5     | 로젠     | 대전   | 4000\nD6     | 로젠     | 서울   | 3000\nD7     | 로젠     | 부산   | 6000\n\nSELECT 배송업체, COUNT(DISTINCT 지역) AS 배송지역수,\n       AVG(배송비) AS 평균배송비\nFROM 배송\nGROUP BY 배송업체\nHAVING COUNT(*) >= 2 AND AVG(배송비) > 3000;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'GROUP BY',
    correctRate: 52,
    answer: '2',
    explanation:
      '업체별 집계: 한진: COUNT(*)=2, 배송지역수=2, AVG=4000 → HAVING 만족(2>=2 AND 4000>3000). CJ: COUNT(*)=2, 배송지역수=1, AVG=3000 → HAVING 불만족(3000은 >3000 아님). 로젠: COUNT(*)=3, 배송지역수=3, AVG=4333 → HAVING 만족(3>=2 AND 4333>3000). 총 2건 출력: 한진, 로젠.',
    options: [
      '1건 (로젠)',
      '2건 (한진, 로젠)',
      '3건 (전체)',
      '0건',
    ],
    points: 10,
  },
  {
    id: 'exam10_p39',
    title: '39. ROLLUP과 소계/합계 행',
    description:
      '다음 SQL의 실행 결과에서 출력되는 총 행 수는?\n\n[매장매출] 테이블\n매장   | 카테고리 | 매출액\n강남점 | 의류     | 100\n강남점 | 식품     | 200\n홍대점 | 의류     | 150\n홍대점 | 식품     | 250\n홍대점 | 가전     | 300\n\nSELECT 매장, 카테고리, SUM(매출액) AS 합계\nFROM 매장매출\nGROUP BY ROLLUP(매장, 카테고리);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'GROUP BY',
    correctRate: 45,
    answer: '3',
    explanation:
      'ROLLUP(매장, 카테고리)는 다음 수준의 그룹을 생성합니다: 1) (매장, 카테고리) 상세: 강남-의류, 강남-식품, 홍대-의류, 홍대-식품, 홍대-가전 → 5행. 2) (매장) 소계: 강남 소계, 홍대 소계 → 2행. 3) () 전체합계: 1행. 총 5 + 2 + 1 = 8행.',
    options: [
      '5행',
      '7행',
      '8행',
      '9행',
    ],
    points: 10,
  },
  {
    id: 'exam10_p40',
    title: '40. CUBE와 GROUPING 함수',
    description:
      '다음 SQL의 실행 결과에서 GROUPING(지역)=1 AND GROUPING(제품)=0인 행의 의미는?\n\nSELECT 지역, 제품, SUM(수량) AS 합계,\n       GROUPING(지역) AS G1,\n       GROUPING(제품) AS G2\nFROM 판매실적\nGROUP BY CUBE(지역, 제품);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'GROUP BY',
    correctRate: 30,
    answer: '2',
    explanation:
      'GROUPING 함수는 해당 컬럼이 소계/합계를 위해 NULL로 표시된 경우 1을 반환합니다. GROUPING(지역)=1은 지역이 집계되어 NULL인 상태(지역 전체), GROUPING(제품)=0은 제품이 실제 그룹핑 기준으로 사용된 상태입니다. 따라서 이 행은 "전체 지역에 대한 제품별 소계"를 의미합니다. 즉, 지역을 무시하고 제품별로만 합산한 결과입니다.',
    options: [
      '지역별 소계 행 (전체 제품 합산)',
      '제품별 소계 행 (전체 지역 합산)',
      '전체 합계 행',
      '상세 데이터 행 (지역+제품 조합)',
    ],
    points: 10,
  },
  {
    id: 'exam10_p41',
    title: '41. GROUP BY에서 표현식 사용',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\n[주문] 테이블\n주문번호 | 주문금액 | 주문일시\n1001     | 15000    | 2025-03-01 09:30\n1002     | 8000     | 2025-03-01 14:20\n1003     | 22000    | 2025-03-02 11:00\n1004     | 5000     | 2025-03-02 16:45\n1005     | 35000    | 2025-03-01 20:10\n\nSELECT TO_CHAR(주문일시, \'YYYY-MM-DD\') AS 주문일,\n       COUNT(*) AS 건수,\n       SUM(CASE WHEN 주문금액 >= 10000 THEN 1 ELSE 0 END) AS 만원이상건수\nFROM 주문\nGROUP BY TO_CHAR(주문일시, \'YYYY-MM-DD\')\nHAVING SUM(주문금액) > 20000;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'GROUP BY',
    correctRate: 55,
    answer: '1',
    explanation:
      '일별 그룹핑: 2025-03-01: 주문 3건(15000, 8000, 35000), SUM=58000, 만원이상=2건(15000, 35000). 2025-03-02: 주문 2건(22000, 5000), SUM=27000, 만원이상=1건(22000). HAVING SUM > 20000: 양쪽 모두 만족. 결과: (2025-03-01, 3, 2), (2025-03-02, 2, 1) → 2행 출력.',
    options: [
      '(2025-03-01, 3, 2)와 (2025-03-02, 2, 1)',
      '(2025-03-01, 3, 2)만 출력',
      '(2025-03-02, 2, 1)만 출력',
      '결과 없음',
    ],
    points: 10,
  },
  // --- 윈도우함수 (42~45) ---
  {
    id: 'exam10_p42',
    title: '42. LAG/LEAD 함수와 NULL 기본값',
    description:
      '다음 SQL의 실행 결과에서 센서ID \'TMP01\'의 첫 번째 행의 이전온도 값은?\n\n[센서측정] 테이블\n센서ID | 측정시각         | 온도\nTMP01  | 2025-01-01 00:00 | 22.5\nTMP01  | 2025-01-01 01:00 | 23.1\nTMP01  | 2025-01-01 02:00 | 21.8\nTMP02  | 2025-01-01 00:00 | 18.0\nTMP02  | 2025-01-01 01:00 | 17.5\n\nSELECT 센서ID, 측정시각, 온도,\n       LAG(온도, 1, 0) OVER (\n         PARTITION BY 센서ID ORDER BY 측정시각\n       ) AS 이전온도\nFROM 센서측정;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 58,
    answer: '3',
    explanation:
      'LAG(온도, 1, 0)는 파티션 내에서 이전 1행의 온도 값을 반환하며, 이전 행이 없을 때 기본값 0을 반환합니다. TMP01 파티션에서 첫 번째 행(00:00)은 이전 행이 없으므로 기본값 0이 반환됩니다. 세 번째 인자를 지정하지 않으면 NULL이 반환되지만, 여기서는 0을 명시했으므로 0이 됩니다.',
    options: [
      'NULL',
      '22.5',
      '0',
      '23.1',
    ],
    points: 10,
  },
  {
    id: 'exam10_p43',
    title: '43. 윈도우 프레임 절 ROWS vs RANGE',
    description:
      '다음 두 SQL의 결과가 달라지는 경우는?\n\n[점수] 테이블\n학번 | 점수\nA    | 80\nB    | 85\nC    | 85\nD    | 90\nE    | 95\n\n-- SQL1\nSELECT 학번, 점수,\n       SUM(점수) OVER (ORDER BY 점수 ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS R합계\nFROM 점수;\n\n-- SQL2\nSELECT 학번, 점수,\n       SUM(점수) OVER (ORDER BY 점수 RANGE BETWEEN 0 PRECEDING AND CURRENT ROW) AS G합계\nFROM 점수;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 20,
    answer: '4',
    explanation:
      'ROWS는 물리적 행 수를 기준으로 프레임을 정의하고, RANGE는 논리적 값 범위를 기준으로 합니다. SQL1(ROWS 1 PRECEDING): A=80(첫 행이므로 80), B=80+85=165, C=85+85=170, D=85+90=175, E=90+95=185. SQL2(RANGE 0 PRECEDING = 같은 값): 점수가 같은 행을 같은 그룹으로 처리합니다. A=80, B와C는 점수85로 동일하므로 RANGE CURRENT ROW는 둘 다 포함 → B=85+85=170, C=85+85=170. D=90, E=95. B행에서 SQL1은 165, SQL2는 170으로 결과가 다릅니다. 핵심 차이는 동일 값(ties)이 있을 때 RANGE는 모든 동일 값을 프레임에 포함한다는 점입니다.',
    options: [
      '두 SQL은 항상 같은 결과를 반환한다.',
      '점수가 모두 다른 경우에만 결과가 달라진다.',
      'ROWS는 NULL을 포함하지 않지만 RANGE는 포함하여 달라진다.',
      '점수가 동일한 행(B, C)에서 RANGE는 같은 값을 모두 포함하여 결과가 달라진다.',
    ],
    points: 10,
  },
  {
    id: 'exam10_p44',
    title: '44. NTILE 함수의 분배 논리',
    description:
      '다음 SQL의 실행 결과에서 직원 G의 등급 값은?\n\n[직원평가] 테이블 (총 7명, 점수 내림차순 정렬)\n직원 | 평가점수\nA    | 98\nB    | 95\nC    | 90\nD    | 87\nE    | 82\nF    | 78\nG    | 70\n\nSELECT 직원, 평가점수,\n       NTILE(3) OVER (ORDER BY 평가점수 DESC) AS 등급\nFROM 직원평가;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 48,
    answer: '3',
    explanation:
      'NTILE(3)은 7명을 3개 그룹으로 나눕니다. 7 ÷ 3 = 2 나머지 1이므로, 첫 번째 그룹에 3명, 나머지 두 그룹에 2명씩 배분됩니다. 점수 내림차순: 등급1(A=98, B=95, C=90), 등급2(D=87, E=82), 등급3(F=78, G=70). 직원 G는 등급 3입니다.',
    options: [
      '1',
      '2',
      '3',
      'NULL',
    ],
    points: 10,
  },
  {
    id: 'exam10_p45',
    title: '45. 윈도우 함수 중첩 불가와 대안',
    description:
      '다음 SQL이 오류가 발생하는 이유와 올바른 대안은?\n\nSELECT 부서, 사원명, 급여,\n       RANK() OVER (ORDER BY SUM(급여) OVER (PARTITION BY 부서) DESC) AS 부서급여순위\nFROM 급여정보;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 26,
    answer: '1',
    explanation:
      '윈도우 함수 내에 다른 윈도우 함수를 중첩하여 사용할 수 없습니다. RANK() OVER (...) 안에 SUM() OVER (...)를 넣으면 문법 오류가 발생합니다. 이를 해결하려면 서브쿼리나 CTE를 사용하여 먼저 부서별 급여합계를 계산한 후, 외부 쿼리에서 RANK()를 적용해야 합니다.',
    options: [
      '윈도우 함수를 중첩할 수 없으므로, CTE나 인라인 뷰에서 먼저 SUM을 계산한 후 RANK를 적용한다.',
      '윈도우 함수는 GROUP BY와 함께 사용할 수 없어 오류가 발생한다.',
      'RANK() 함수가 SUM()과 호환되지 않아 오류가 발생한다.',
      'PARTITION BY와 ORDER BY를 동시에 사용할 수 없어 오류가 발생한다.',
    ],
    points: 10,
  },
  // --- ORDER BY (46~47) ---
  {
    id: 'exam10_p46',
    title: '46. ORDER BY에서 NULL의 정렬 위치',
    description:
      '다음 SQL의 실행 결과로 첫 번째로 출력되는 행은? (Oracle 기준)\n\n[입찰] 테이블\n입찰ID | 업체명   | 입찰가격\nB01    | 가나건설 | 5000\nB02    | 다라건설 | NULL\nB03    | 마바건설 | 3000\nB04    | 사아건설 | NULL\nB05    | 자차건설 | 7000\n\nSELECT 입찰ID, 업체명, 입찰가격\nFROM 입찰\nORDER BY 입찰가격 ASC;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'ORDER BY',
    correctRate: 65,
    answer: '2',
    explanation:
      'Oracle에서 ORDER BY ASC 시 NULL은 마지막에 위치합니다(NULLS LAST가 기본). 따라서 정렬 순서: 마바건설(3000), 가나건설(5000), 자차건설(7000), 다라건설(NULL), 사아건설(NULL). 첫 번째 행은 B03(마바건설, 3000)입니다. 참고로 ORDER BY DESC에서는 NULL이 처음에 위치합니다(NULLS FIRST가 기본).',
    options: [
      'B02 (다라건설, NULL)',
      'B03 (마바건설, 3000)',
      'B01 (가나건설, 5000)',
      'B05 (자차건설, 7000)',
    ],
    points: 10,
  },
  {
    id: 'exam10_p47',
    title: '47. ORDER BY와 SELECT 컬럼의 관계',
    description:
      '다음 중 Oracle에서 오류가 발생하는 SQL은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'ORDER BY',
    correctRate: 33,
    answer: '3',
    explanation:
      'Oracle에서 SELECT DISTINCT를 사용하면 ORDER BY 절에는 SELECT 목록에 포함된 컬럼만 사용할 수 있습니다. 보기 3에서 SELECT DISTINCT 부서로 부서만 선택했는데 ORDER BY 급여로 정렬하면 오류가 발생합니다. 급여가 SELECT 목록에 없으므로 DISTINCT 결과에서 어떤 급여 값으로 정렬할지 결정할 수 없기 때문입니다. 보기 1은 별칭으로 정렬하므로 가능하고, 보기 2는 ORDER BY에 표현식을 사용하지만 SELECT에 없어도 DISTINCT가 아니면 가능하며, 보기 4는 컬럼 위치 번호를 사용하므로 유효합니다.',
    options: [
      'SELECT 사원명, 급여*12 AS 연봉 FROM 사원 ORDER BY 연봉 DESC',
      'SELECT 사원명 FROM 사원 ORDER BY 급여 DESC',
      'SELECT DISTINCT 부서 FROM 사원 ORDER BY 급여',
      'SELECT 부서, COUNT(*) FROM 사원 GROUP BY 부서 ORDER BY 2 DESC',
    ],
    points: 10,
  },
  // --- 집합연산 (48~49) ---
  {
    id: 'exam10_p48',
    title: '48. UNION ALL과 중복 행 처리',
    description:
      '다음 SQL의 실행 결과로 출력되는 행의 수는?\n\n[상반기매출] 테이블\n고객ID | 매출액\nC01    | 1000\nC02    | 2000\nC03    | 1500\n\n[하반기매출] 테이블\n고객ID | 매출액\nC02    | 2000\nC03    | 3000\nC04    | 1000\n\nSELECT 고객ID, 매출액 FROM 상반기매출\nUNION ALL\nSELECT 고객ID, 매출액 FROM 하반기매출\nORDER BY 고객ID;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 80,
    answer: '4',
    explanation:
      'UNION ALL은 중복을 제거하지 않고 모든 행을 결합합니다. 상반기 3건 + 하반기 3건 = 총 6건. C02(2000)이 양쪽에 존재하지만 UNION ALL이므로 중복 제거 없이 2건 모두 출력됩니다. UNION(중복 제거)을 사용했다면 C02-2000이 동일하므로 5건이 출력됩니다.',
    options: [
      '3행',
      '4행',
      '5행',
      '6행',
    ],
    points: 10,
  },
  {
    id: 'exam10_p49',
    title: '49. INTERSECT와 MINUS의 조합',
    description:
      '다음 SQL의 실행 결과로 올바른 것은?\n\n[프리미엄회원] 테이블: 회원ID\nM01, M02, M03, M04\n\n[이벤트참여] 테이블: 회원ID\nM02, M03, M05, M06\n\n[쿠폰수령] 테이블: 회원ID\nM01, M03, M05\n\nSELECT 회원ID FROM 프리미엄회원\nINTERSECT\nSELECT 회원ID FROM 이벤트참여\nMINUS\nSELECT 회원ID FROM 쿠폰수령;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 25,
    answer: '2',
    explanation:
      'SQL에서 집합 연산자는 위에서 아래로 순차적으로 처리됩니다(동일 우선순위). 1단계 INTERSECT: 프리미엄회원 ∩ 이벤트참여 = {M02, M03}. 2단계 MINUS: {M02, M03} - 쿠폰수령{M01, M03, M05} = {M02}. M03은 쿠폰수령에 포함되어 제거됩니다. 최종 결과: M02 1건.',
    options: [
      'M02, M03',
      'M02',
      'M03',
      'M02, M03, M05',
    ],
    points: 10,
  },
  // --- TCL (50) ---
  {
    id: 'exam10_p50',
    title: '50. SAVEPOINT와 부분 ROLLBACK의 동작',
    description:
      '다음 트랜잭션 실행 후 [잔액] 테이블에서 계좌 ACC01의 최종 잔액은?\n\n-- 초기 상태: ACC01 잔액 = 10000\n\nUPDATE 잔액 SET 금액 = 금액 - 3000 WHERE 계좌번호 = \'ACC01\';  -- 7000\nSAVEPOINT SP1;\n\nUPDATE 잔액 SET 금액 = 금액 - 2000 WHERE 계좌번호 = \'ACC01\';  -- 5000\nSAVEPOINT SP2;\n\nUPDATE 잔액 SET 금액 = 금액 - 4000 WHERE 계좌번호 = \'ACC01\';  -- 1000\n\nROLLBACK TO SP1;\n\nUPDATE 잔액 SET 금액 = 금액 + 1000 WHERE 계좌번호 = \'ACC01\';\n\nCOMMIT;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 35,
    answer: '3',
    explanation:
      '단계별 추적: 1) UPDATE -3000 → 잔액 7000. 2) SAVEPOINT SP1 설정. 3) UPDATE -2000 → 잔액 5000. 4) SAVEPOINT SP2 설정. 5) UPDATE -4000 → 잔액 1000. 6) ROLLBACK TO SP1 → SP1 이후의 모든 작업(SP2 포함)이 취소되어 잔액이 SP1 시점인 7000으로 복원됨. SP2도 무효화됩니다. 7) UPDATE +1000 → 잔액 8000. 8) COMMIT → 최종 잔액 8000.',
    options: [
      '5000',
      '7000',
      '8000',
      '1000',
    ],
    points: 10,
  },
];
