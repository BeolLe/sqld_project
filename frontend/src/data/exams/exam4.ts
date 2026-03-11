import type { Problem } from '../../types';

// SQLD 모의고사 4회 (중급 난이도 - 목표 합격률 ~45%)
// 1과목: 데이터 모델링의 이해 (10문항, 20점)
// 2과목: SQL 기본 및 활용 (40문항, 80점)
// 난이도 배분: easy 12 / medium 23 / hard 15

export const EXAM_4_PROBLEMS: Problem[] = [
  // ===== 1과목: 데이터 모델링의 이해 (1~10번) =====
  // --- 데이터모델링 (1~5) ---
  {
    id: 'exam4_p1',
    title: '1. 데이터 독립성의 유형',
    description:
      '데이터 독립성(Data Independence)에서 논리적 독립성과 물리적 독립성에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 55,
    answer: '2',
    explanation:
      '논리적 독립성은 개념 스키마가 변경되어도 외부 스키마(사용자 뷰)에 영향을 주지 않는 것이고, 물리적 독립성은 내부 스키마(물리적 저장 구조)가 변경되어도 개념 스키마에 영향을 주지 않는 것입니다. 즉, 논리적 독립성은 외부-개념 사이, 물리적 독립성은 개념-내부 사이의 독립성입니다.',
    options: [
      '논리적 독립성은 내부 스키마 변경 시 개념 스키마에 영향을 주지 않는 것이다.',
      '논리적 독립성은 개념 스키마 변경 시 외부 스키마에 영향을 주지 않는 것이다.',
      '물리적 독립성은 개념 스키마 변경 시 외부 스키마에 영향을 주지 않는 것이다.',
      '논리적 독립성과 물리적 독립성은 동일한 개념이다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p2',
    title: '2. ERD 구성요소',
    description:
      'ERD(Entity Relationship Diagram)의 구성요소와 표기 방법에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 52,
    answer: '4',
    explanation:
      'ERD의 3요소는 엔터티(Entity), 속성(Attribute), 관계(Relationship)입니다. 엔터티는 사각형, 속성은 타원(IE 표기법에서는 엔터티 내부에 표시), 관계는 마름모(또는 선)로 표기합니다. 인덱스(Index)는 ERD 구성요소가 아니라 물리적 설계 요소입니다.',
    options: [
      '엔터티는 사각형으로 표기한다.',
      '관계는 마름모 또는 선으로 표기한다.',
      '속성은 타원 또는 엔터티 내부에 표시한다.',
      '인덱스(Index)는 ERD의 4번째 구성요소이다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p3',
    title: '3. 식별자 관계와 비식별자 관계',
    description:
      '식별자 관계(Identifying Relationship)와 비식별자 관계(Non-Identifying Relationship)의 차이로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 40,
    answer: '1',
    explanation:
      '식별자 관계는 부모 엔터티의 주식별자가 자식 엔터티의 주식별자에 포함되는 관계입니다. 반면 비식별자 관계는 부모의 주식별자가 자식의 일반 속성(외래키)으로만 포함되어 자식의 주식별자에는 포함되지 않습니다. 식별자 관계에서 자식의 존재는 부모에 종속됩니다.',
    options: [
      '식별자 관계에서 부모의 주식별자가 자식의 주식별자에 포함된다.',
      '비식별자 관계에서 부모의 주식별자가 자식의 주식별자에 포함된다.',
      '식별자 관계에서 자식 엔터티는 독립적으로 존재할 수 있다.',
      '비식별자 관계는 ERD에서 실선으로 표기한다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p4',
    title: '4. 반정규화의 정의와 목적',
    description:
      '반정규화(Denormalization)에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '데이터모델링',
    correctRate: 58,
    answer: '3',
    explanation:
      '반정규화는 정규화된 데이터 모델에서 성능 향상을 위해 의도적으로 중복을 허용하거나 테이블을 합치는 과정입니다. 반정규화를 수행하면 데이터 무결성 문제가 발생할 수 있으며, 조회 성능은 향상되지만 입력/수정/삭제 성능이 저하될 수 있습니다. 반정규화가 데이터 이상현상을 제거하는 것은 정규화의 목적입니다.',
    options: [
      '반정규화는 조회 성능 향상을 위해 의도적으로 중복을 허용한다.',
      '반정규화를 과도하게 적용하면 데이터 무결성 문제가 발생할 수 있다.',
      '반정규화는 데이터 이상현상(Anomaly)을 제거하는 것이 주목적이다.',
      '반정규화는 정규화 이후에 수행한다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p5',
    title: '5. 슈퍼타입과 서브타입',
    description:
      '슈퍼타입(Supertype)과 서브타입(Subtype)을 물리 모델로 변환하는 방법 중, 서브타입별로 개별 테이블을 생성하는 방식의 특징으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '데이터모델링',
    correctRate: 38,
    answer: '2',
    explanation:
      '서브타입별 개별 테이블을 생성하는 방식(One-Table-Per-Subtype)은 각 서브타입의 고유 속성을 독립적으로 관리할 수 있어 NULL이 발생하지 않습니다. 그러나 공통 속성 조회 시 UNION이 필요하고, 서브타입 간 조회 시 JOIN이 복잡해지는 단점이 있습니다.',
    options: [
      '슈퍼타입과 서브타입의 공통 속성 조회가 단순해진다.',
      '각 서브타입의 고유 속성 관리가 용이하고 NULL 발생이 없다.',
      '테이블 수가 적어 관리가 단순하다.',
      '서브타입 간의 관계 조회에 UNION이 필요하지 않다.',
    ],
    points: 10,
  },

  // --- 정규화 (6~10) ---
  {
    id: 'exam4_p6',
    title: '6. 함수적 종속성',
    description:
      '다음 릴레이션 R(학번, 과목코드, 교수명, 성적)에서 교수명이 과목코드에 의해 결정될 때, 이 릴레이션이 위반하는 정규형은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 35,
    answer: '2',
    explanation:
      '기본키가 (학번, 과목코드)인 복합키일 때, 교수명이 과목코드만으로 결정된다면 이는 부분 함수적 종속(Partial Functional Dependency)입니다. 부분 종속이 존재하면 제2정규형(2NF)을 위반합니다. 이를 해소하기 위해 (과목코드, 교수명) 테이블을 분리해야 합니다.',
    options: [
      '제1정규형(1NF)',
      '제2정규형(2NF)',
      '제3정규형(3NF)',
      'BCNF',
    ],
    points: 10,
  },
  {
    id: 'exam4_p7',
    title: '7. 제3정규형 위반 사례',
    description:
      '릴레이션 R(사원번호, 부서코드, 부서명)에서 사원번호 → 부서코드, 부서코드 → 부서명의 종속 관계가 존재할 때 나타나는 이상현상이 아닌 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 52,
    answer: '4',
    explanation:
      '이행적 종속(Transitive Dependency)이 존재하면 삽입 이상(부서코드 없이 부서명 등록 불가), 삭제 이상(마지막 사원 삭제 시 부서 정보도 삭제), 갱신 이상(부서명 변경 시 모든 관련 행 수정 필요)이 발생합니다. 조인 이상은 제3정규형 위반과 직접적인 관계가 없습니다.',
    options: [
      '삽입 이상 - 부서 정보만 별도로 입력하기 어렵다.',
      '삭제 이상 - 특정 부서의 마지막 사원을 삭제하면 부서 정보도 사라진다.',
      '갱신 이상 - 부서명 변경 시 해당 부서의 모든 행을 수정해야 한다.',
      '조인 이상 - 두 테이블을 조인할 때 데이터가 손실된다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p8',
    title: '8. BCNF와 제3정규형의 차이',
    description:
      'BCNF(Boyce-Codd Normal Form)가 제3정규형(3NF)과 다른 점으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '정규화',
    correctRate: 32,
    answer: '3',
    explanation:
      '제3정규형은 기본키가 아닌 속성이 다른 비키 속성에 이행적으로 종속되지 않는 조건입니다. BCNF는 여기서 더 나아가, 모든 결정자(Determinant)가 후보키(Candidate Key)여야 한다는 더 강한 조건입니다. 3NF를 만족하더라도 BCNF를 위반하는 경우가 있습니다.',
    options: [
      'BCNF는 3NF보다 약한 조건이다.',
      'BCNF는 다중값 종속(MVD)을 제거한다.',
      'BCNF에서는 모든 결정자가 후보키여야 하며, 3NF보다 강한 조건이다.',
      'BCNF와 3NF는 항상 동일한 결과를 만든다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p9',
    title: '9. 정규화 단계별 핵심 조건',
    description:
      '다음 중 정규화 단계와 해소하는 종속성의 연결이 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 55,
    answer: '2',
    explanation:
      '1NF는 원자값(Atomic Value) 보장, 2NF는 부분 함수 종속 제거, 3NF는 이행적 종속 제거, 4NF는 다중값 종속 제거, 5NF는 조인 종속 제거입니다.',
    options: [
      '2NF: 이행적 종속 제거, 3NF: 부분 함수 종속 제거',
      '2NF: 부분 함수 종속 제거, 3NF: 이행적 종속 제거',
      '1NF: 부분 함수 종속 제거, 2NF: 이행적 종속 제거',
      '3NF: 다중값 종속 제거, 4NF: 이행적 종속 제거',
    ],
    points: 10,
  },
  {
    id: 'exam4_p10',
    title: '10. 정규화와 성능',
    description:
      '정규화와 성능의 트레이드오프에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '정규화',
    correctRate: 60,
    answer: '3',
    explanation:
      '정규화를 높은 수준으로 수행할수록 데이터 중복이 제거되어 입력/수정/삭제 성능은 향상되고 데이터 무결성도 높아집니다. 그러나 테이블이 분리되어 복잡한 조회 시 JOIN이 많아지므로 조회(SELECT) 성능이 저하될 수 있습니다. 이 때 반정규화를 고려합니다.',
    options: [
      '정규화를 많이 할수록 모든 SQL 성능이 향상된다.',
      '정규화는 조회 성능 향상이 주목적이다.',
      '정규화는 DML 성능을 향상시키지만, 복잡한 조회 시 JOIN 증가로 SELECT 성능이 저하될 수 있다.',
      '정규화와 SQL 성능은 무관하다.',
    ],
    points: 10,
  },

  // ===== 2과목: SQL 기본 및 활용 (11~50번) =====

  // --- DML (11~15) ---
  {
    id: 'exam4_p11',
    title: '11. INSERT와 DEFAULT',
    description:
      "다음 DDL과 INSERT를 실행했을 때 결과로 올바른 것은?\n\nCREATE TABLE ORDERS (\n  ORDER_ID NUMBER PRIMARY KEY,\n  STATUS   VARCHAR2(20) DEFAULT 'PENDING',\n  AMT      NUMBER DEFAULT 0 NOT NULL\n);\nINSERT INTO ORDERS (ORDER_ID, STATUS) VALUES (1, NULL);",
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DML',
    correctRate: 38,
    answer: '1',
    explanation:
      "NULL을 명시적으로 지정하면 DEFAULT가 적용되지 않고 실제로 NULL이 저장됩니다. STATUS는 NULL이 허용되므로 NULL이 입력됩니다. AMT는 명시하지 않았으므로 DEFAULT인 0이 입력됩니다. DEFAULT는 열을 INSERT 대상에서 제외할 때만 적용되며, 명시적으로 NULL을 넣으면 NULL이 입력됩니다.",
    options: [
      'ORDER_ID=1, STATUS=NULL, AMT=0',
      "ORDER_ID=1, STATUS='PENDING', AMT=0",
      'ORDER_ID=1, STATUS=NULL, AMT=NULL',
      '오류 발생 (AMT NOT NULL 위반)',
    ],
    points: 10,
  },
  {
    id: 'exam4_p12',
    title: '12. UPDATE와 서브쿼리',
    description:
      '다음 SQL의 실행 결과에 대한 설명으로 올바른 것은?\n\nUPDATE EMP\nSET SAL = SAL * 1.1\nWHERE DEPTNO IN (\n  SELECT DEPTNO FROM DEPT\n  WHERE LOC = \'DALLAS\'\n);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 62,
    answer: '2',
    explanation:
      '서브쿼리에서 LOC가 DALLAS인 부서의 DEPTNO를 가져오고, 그 부서에 속한 사원들의 급여를 10% 인상합니다. DALLAS에 해당하는 부서가 없으면 업데이트되는 행이 없지만 오류는 발생하지 않습니다.',
    options: [
      'DALLAS 부서가 없으면 오류가 발생한다.',
      'DALLAS 부서에 속한 사원들의 급여를 10% 인상한다.',
      '모든 사원의 급여를 10% 인상한다.',
      'DEPT 테이블의 급여를 업데이트한다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p13',
    title: '13. DELETE와 TRUNCATE 차이',
    description:
      '다음 중 DELETE와 TRUNCATE에 대한 비교 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 58,
    answer: '4',
    explanation:
      'DELETE는 DML로 ROLLBACK이 가능하고, WHERE 절로 조건 삭제가 가능하며, 삭제된 행만큼 로그를 남깁니다. TRUNCATE는 DDL로 ROLLBACK이 불가능하고, WHERE 조건 없이 전체 행을 삭제하며 로그를 최소화합니다. 두 명령 모두 테이블 구조(스키마)는 유지됩니다.',
    options: [
      'DELETE는 DML이고 ROLLBACK이 가능하다.',
      'TRUNCATE는 DDL이고 일반적으로 ROLLBACK이 불가능하다.',
      'TRUNCATE는 WHERE 절을 사용할 수 없다.',
      'TRUNCATE는 DROP과 달리 테이블 구조를 제거한다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p14',
    title: '14. MERGE 문의 동작',
    description:
      '다음 MERGE 문에 대한 설명으로 올바른 것은?\n\nMERGE INTO TARGET T\nUSING SOURCE S ON (T.ID = S.ID)\nWHEN MATCHED THEN\n  UPDATE SET T.VAL = S.VAL\nWHEN NOT MATCHED THEN\n  INSERT (ID, VAL) VALUES (S.ID, S.VAL);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DML',
    correctRate: 55,
    answer: '3',
    explanation:
      'MERGE 문은 SOURCE와 TARGET을 조인하여, 매칭되는 행이 있으면 UPDATE, 없으면 INSERT를 수행하는 UPSERT 기능을 합니다. 단일 SQL로 조건에 따른 INSERT/UPDATE를 처리할 수 있습니다.',
    options: [
      'SOURCE에만 있는 데이터를 TARGET에서 삭제한다.',
      '두 테이블의 데이터를 항상 INSERT한다.',
      'TARGET에 일치하는 행이 있으면 UPDATE, 없으면 INSERT한다.',
      'MERGE는 항상 두 SQL을 순차적으로 실행한다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p15',
    title: '15. SELECT 결과의 중복 제거',
    description:
      'EMP 테이블에서 DEPTNO가 10, 20, 10, 30, 20인 5개 행이 있을 때, 다음 SQL의 결과 행 수는?\n\nSELECT DISTINCT DEPTNO FROM EMP;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DML',
    correctRate: 85,
    answer: '2',
    explanation:
      'DISTINCT는 중복된 값을 제거한 고유한 값만 반환합니다. DEPTNO의 고유값은 10, 20, 30이므로 3개 행이 반환됩니다.',
    options: [
      '5행',
      '3행',
      '2행',
      '1행',
    ],
    points: 10,
  },

  // --- JOIN (16~22) ---
  {
    id: 'exam4_p16',
    title: '16. LEFT OUTER JOIN과 NULL',
    description:
      '다음 SQL에서 DEPT 테이블에만 존재하고 EMP가 없는 부서의 경우, E.ENAME과 E.SAL에 저장되는 값은?\n\nSELECT D.DNAME, E.ENAME, E.SAL\nFROM DEPT D\nLEFT OUTER JOIN EMP E ON D.DEPTNO = E.DEPTNO;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 78,
    answer: '3',
    explanation:
      'LEFT OUTER JOIN에서 LEFT 테이블(DEPT)의 행은 RIGHT 테이블(EMP)에 매칭되는 행이 없어도 결과에 포함됩니다. 이때 RIGHT 테이블의 컬럼(E.ENAME, E.SAL)은 NULL로 채워집니다.',
    options: [
      '0',
      '빈 문자열',
      'NULL',
      '행이 결과에서 제외됨',
    ],
    points: 10,
  },
  {
    id: 'exam4_p17',
    title: '17. CROSS JOIN의 결과 행 수',
    description:
      'A 테이블에 5개 행, B 테이블에 3개 행이 있을 때, CROSS JOIN의 결과 행 수는?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 82,
    answer: '2',
    explanation:
      'CROSS JOIN(카르테시안 곱)은 두 테이블의 모든 행 조합을 반환합니다. A(5행) × B(3행) = 15개 행이 반환됩니다.',
    options: [
      '8행',
      '15행',
      '2행',
      '25행',
    ],
    points: 10,
  },
  {
    id: 'exam4_p18',
    title: '18. INNER JOIN vs OUTER JOIN 결과 수',
    description:
      '다음 중 LEFT OUTER JOIN의 결과 행 수에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 72,
    answer: '1',
    explanation:
      'LEFT OUTER JOIN은 LEFT 테이블의 모든 행을 포함하므로 결과 행 수는 항상 LEFT 테이블의 행 수 이상입니다. RIGHT 테이블과 1:N 관계라면 LEFT 테이블보다 결과가 많아질 수 있습니다.',
    options: [
      'LEFT 테이블의 행 수 이상이다.',
      'INNER JOIN과 결과 행 수가 항상 같다.',
      'LEFT와 RIGHT 테이블 행 수의 합이다.',
      'LEFT 테이블의 행 수보다 항상 많다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p19',
    title: '19. NATURAL JOIN의 위험성',
    description:
      'NATURAL JOIN에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 48,
    answer: '4',
    explanation:
      'NATURAL JOIN은 두 테이블에서 동일한 이름의 컬럼을 자동으로 찾아 조인합니다. 의도하지 않은 컬럼으로 조인될 수 있어 위험합니다. 또한 조인에 사용된 컬럼은 결과에 한 번만 나타납니다. NATURAL JOIN에서는 ON 절이나 USING 절을 함께 사용할 수 없습니다.',
    options: [
      '동일한 이름의 컬럼을 자동으로 조인에 사용한다.',
      '조인에 사용된 컬럼이 결과에 중복되지 않는다.',
      '의도치 않은 컬럼으로 조인될 위험이 있다.',
      'ON 절과 함께 사용하여 조건을 추가할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p20',
    title: '20. FULL OUTER JOIN',
    description:
      '다음 SQL의 결과에 대한 설명으로 올바른 것은?\n\nSELECT D.DEPTNO, E.EMPNO\nFROM DEPT D\nFULL OUTER JOIN EMP E ON D.DEPTNO = E.DEPTNO;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'JOIN',
    correctRate: 70,
    answer: '2',
    explanation:
      'FULL OUTER JOIN은 LEFT OUTER JOIN과 RIGHT OUTER JOIN의 합집합으로, 양쪽 테이블의 모든 행을 포함합니다. 한쪽에만 존재하는 행은 반대쪽 컬럼이 NULL로 채워집니다.',
    options: [
      '양쪽 테이블에 모두 존재하는 행만 반환한다.',
      '양쪽 테이블의 모든 행을 반환하며, 매칭되지 않는 쪽은 NULL이 된다.',
      'DEPT에만 있는 행은 제외된다.',
      'CROSS JOIN과 동일한 결과를 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p21',
    title: '21. 조인 순서와 성능',
    description:
      '옵티마이저가 조인 순서를 결정할 때 일반적으로 선호하는 방식으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 38,
    answer: '3',
    explanation:
      '옵티마이저는 일반적으로 WHERE 조건으로 행을 많이 줄이는 테이블(선택도가 낮은 테이블)을 먼저 조인하여 중간 결과를 최소화합니다. 또한 인덱스가 있는 컬럼을 조인 조건으로 사용할 때 드라이빙 테이블이 결정됩니다.',
    options: [
      '항상 FROM 절에 나온 순서대로 조인한다.',
      '행 수가 많은 테이블을 먼저 조인한다.',
      '선택도가 낮아 행 수를 많이 줄이는 테이블을 먼저 처리하는 경향이 있다.',
      '항상 마지막에 쓴 테이블을 드라이빙 테이블로 선택한다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p22',
    title: '22. USING 절과 ON 절의 차이',
    description:
      'JOIN에서 USING 절과 ON 절의 차이에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'JOIN',
    correctRate: 50,
    answer: '1',
    explanation:
      'USING 절은 동일한 이름의 컬럼을 기준으로 조인하며, 해당 컬럼은 결과에 한 번만 표시됩니다. ON 절은 조인 조건을 명시적으로 작성하며, 컬럼 이름이 달라도 사용할 수 있고, 결과에 각각 표시됩니다. USING 절에서는 테이블 별칭을 붙일 수 없습니다.',
    options: [
      'USING은 동일 이름 컬럼 조인 시 해당 컬럼을 결과에 한 번만 표시한다.',
      'USING과 ON은 결과 컬럼 구성이 동일하다.',
      'ON 절은 동일한 이름의 컬럼에만 사용할 수 있다.',
      'USING 절에서는 조인 컬럼에 테이블 별칭을 붙여야 한다.',
    ],
    points: 10,
  },

  // --- 함수 (23~28) ---
  {
    id: 'exam4_p23',
    title: '23. DECODE와 CASE의 NULL 처리',
    description:
      "다음 SQL의 결과로 올바른 것은?\n\nSELECT DECODE(NULL, NULL, 'MATCH', 'NO MATCH') FROM DUAL;",
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 50,
    answer: '1',
    explanation:
      "DECODE 함수는 유일하게 NULL = NULL을 TRUE로 처리합니다. DECODE(expr, search, result) 구조에서 expr과 search가 모두 NULL이면 일치로 판단하여 'MATCH'를 반환합니다. 이는 일반적인 SQL에서 NULL = NULL이 UNKNOWN인 것과 다릅니다.",
    options: [
      'MATCH',
      'NO MATCH',
      'NULL',
      '오류 발생',
    ],
    points: 10,
  },
  {
    id: 'exam4_p24',
    title: '24. TRUNC와 ROUND의 차이',
    description:
      '다음 두 SQL의 실행 결과를 올바르게 비교한 것은?\n\n① SELECT ROUND(4.567, 2) FROM DUAL;\n② SELECT TRUNC(4.567, 2) FROM DUAL;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 75,
    answer: '3',
    explanation:
      'ROUND(4.567, 2)는 소수점 2자리에서 반올림하여 4.57이 됩니다. TRUNC(4.567, 2)는 소수점 2자리 이하를 버려서(절삭) 4.56이 됩니다.',
    options: [
      '① 4.56, ② 4.57',
      '① 4.57, ② 4.57',
      '① 4.57, ② 4.56',
      '① 4.56, ② 4.56',
    ],
    points: 10,
  },
  {
    id: 'exam4_p25',
    title: '25. 날짜 함수 ADD_MONTHS',
    description:
      "다음 SQL에서 HIREDATE가 '2024-01-31'일 때 ADD_MONTHS(HIREDATE, 1)의 결과는?\n\nSELECT ADD_MONTHS(HIREDATE, 1) FROM EMP;",
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 58,
    answer: '2',
    explanation:
      "ADD_MONTHS는 월을 더할 때 결과 월의 마지막 날을 초과하면 자동으로 해당 월의 마지막 날로 조정합니다. 2024-01-31에서 1달을 더하면 2024-02-31이 없으므로 2024-02-29(윤년)가 됩니다.",
    options: [
      '2024-02-28',
      '2024-02-29',
      '2024-03-02',
      '오류 발생',
    ],
    points: 10,
  },
  {
    id: 'exam4_p26',
    title: '26. NULL과 집계 함수',
    description:
      '다음 테이블에서 SQL 결과로 올바른 것은?\n\n[SCORE 테이블]\nNAME | POINT\n가     | 80\n나     | NULL\n다     | 60\n라     | NULL\n\nSELECT COUNT(*), COUNT(POINT), AVG(POINT) FROM SCORE;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 48,
    answer: '3',
    explanation:
      'COUNT(*)는 NULL 포함 전체 행 수인 4, COUNT(POINT)는 NULL을 제외한 2, AVG(POINT)는 NULL을 제외한 합계/COUNT(POINT) = (80+60)/2 = 70을 반환합니다. AVG는 분모에 COUNT(*)가 아닌 NULL이 아닌 값의 개수를 사용합니다.',
    options: [
      'COUNT(*) = 4, COUNT(POINT) = 4, AVG(POINT) = 35',
      'COUNT(*) = 2, COUNT(POINT) = 2, AVG(POINT) = 70',
      'COUNT(*) = 4, COUNT(POINT) = 2, AVG(POINT) = 70',
      'COUNT(*) = 4, COUNT(POINT) = 2, AVG(POINT) = 35',
    ],
    points: 10,
  },
  {
    id: 'exam4_p27',
    title: '27. COALESCE 함수',
    description:
      "다음 SQL의 결과로 올바른 것은?\n\nSELECT COALESCE(NULL, NULL, 'C', 'D') FROM DUAL;",
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '함수',
    correctRate: 75,
    answer: '2',
    explanation:
      "COALESCE(v1, v2, ..., vn)는 인수를 순서대로 평가하여 NULL이 아닌 첫 번째 값을 반환합니다. NULL, NULL, 'C', 'D' 순서이므로 첫 번째 NULL이 아닌 값인 'C'를 반환합니다.",
    options: [
      'NULL',
      'C',
      'D',
      'C, D',
    ],
    points: 10,
  },
  {
    id: 'exam4_p28',
    title: '28. TO_CHAR와 TO_DATE',
    description:
      "다음 중 Oracle에서 날짜를 '2024/12/25' 형식의 문자열로 변환하는 올바른 SQL은?",
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '함수',
    correctRate: 62,
    answer: '2',
    explanation:
      "TO_CHAR(날짜, '형식')은 날짜를 지정한 형식의 문자열로 변환합니다. TO_CHAR(SYSDATE, 'YYYY/MM/DD')가 올바른 형식입니다. TO_DATE는 문자열을 날짜로 변환하는 함수이므로 반대입니다.",
    options: [
      "TO_DATE(SYSDATE, 'YYYY/MM/DD')",
      "TO_CHAR(SYSDATE, 'YYYY/MM/DD')",
      "CONVERT(SYSDATE, 'YYYY/MM/DD')",
      "FORMAT(SYSDATE, 'YYYY/MM/DD')",
    ],
    points: 10,
  },

  // --- 서브쿼리 (29~33) ---
  {
    id: 'exam4_p29',
    title: '29. 스칼라 서브쿼리의 NULL 처리',
    description:
      '다음 SQL에서 부서번호 40에 사원이 없을 때 결과로 올바른 것은?\n\nSELECT DNAME,\n  (SELECT COUNT(*) FROM EMP WHERE DEPTNO = D.DEPTNO) AS CNT\nFROM DEPT D\nWHERE DEPTNO = 40;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 52,
    answer: '3',
    explanation:
      '스칼라 서브쿼리에서 COUNT(*)는 조건에 맞는 행이 없어도 0을 반환합니다. NULL을 반환하는 것이 아닙니다. 따라서 부서 40에 사원이 없으면 CNT는 0이 됩니다. DEPT의 행 자체는 존재하므로 결과 행이 반환됩니다.',
    options: [
      '결과 행 없음',
      'DNAME=해당값, CNT=NULL',
      'DNAME=해당값, CNT=0',
      '오류 발생',
    ],
    points: 10,
  },
  {
    id: 'exam4_p30',
    title: '30. IN과 EXISTS 성능 차이',
    description:
      'IN과 EXISTS의 성능 차이에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 35,
    answer: '2',
    explanation:
      'IN은 서브쿼리 결과를 모두 가져온 후 비교합니다. EXISTS는 매칭되는 행이 하나라도 있으면 즉시 TRUE를 반환하고 중단합니다(Short-circuit). 메인 쿼리 결과 수가 적고 서브쿼리 테이블이 클 때는 EXISTS가 유리하고, 반대로 서브쿼리 결과가 적을 때는 IN이 유리할 수 있습니다.',
    options: [
      'IN과 EXISTS는 항상 동일한 성능을 보인다.',
      'EXISTS는 매칭 시 즉시 TRUE를 반환하여 불필요한 탐색을 줄인다.',
      'IN이 항상 EXISTS보다 빠르다.',
      'EXISTS는 인덱스를 사용할 수 없다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p31',
    title: '31. 인라인 뷰와 ORDER BY',
    description:
      '다음 SQL에서 인라인 뷰 내부의 ORDER BY가 외부 쿼리에 영향을 주는가?\n\nSELECT ENAME, SAL\nFROM (\n  SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC\n)\nWHERE ROWNUM <= 3;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 50,
    answer: '1',
    explanation:
      'Oracle에서 인라인 뷰(FROM 절 서브쿼리) 내부의 ORDER BY는 ROWNUM과 함께 사용할 때 정렬 순서를 보장합니다. 이 패턴은 Oracle에서 상위 N건을 가져오는 전통적인 방법입니다. ROWNUM은 ORDER BY 이전에 부여되므로, ORDER BY가 인라인 뷰 안에 있어야 정확한 결과를 얻을 수 있습니다.',
    options: [
      '인라인 뷰 안의 ORDER BY는 ROWNUM 필터링 전에 적용되어 영향을 준다.',
      '인라인 뷰 안의 ORDER BY는 완전히 무시된다.',
      '외부 ORDER BY가 없으면 인라인 뷰 ORDER BY는 보장되지 않는다.',
      '이 SQL은 오류가 발생한다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p32',
    title: '32. 다중 행 서브쿼리 연산자',
    description:
      '다음 SQL의 의미로 올바른 것은?\n\nSELECT ENAME, SAL FROM EMP\nWHERE SAL > ALL (\n  SELECT AVG(SAL) FROM EMP GROUP BY DEPTNO\n);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '서브쿼리',
    correctRate: 55,
    answer: '4',
    explanation:
      'ALL 연산자는 서브쿼리가 반환하는 모든 값보다 크다는 조건입니다. 즉, 모든 부서의 평균 급여보다 높은 급여를 받는 사원을 조회합니다. MAX(AVG_SAL)보다 높다는 의미와 같습니다.',
    options: [
      '어느 한 부서의 평균보다 높은 급여를 받는 사원',
      '자신이 속한 부서 평균보다 높은 급여를 받는 사원',
      '급여가 NULL이 아닌 모든 사원',
      '모든 부서의 평균 급여보다 높은 급여를 받는 사원',
    ],
    points: 10,
  },
  {
    id: 'exam4_p33',
    title: '33. 서브쿼리의 위치',
    description:
      '서브쿼리가 위치할 수 없는 절은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '서브쿼리',
    correctRate: 75,
    answer: '3',
    explanation:
      '서브쿼리는 SELECT 절(스칼라), FROM 절(인라인 뷰), WHERE 절, HAVING 절 등에 사용할 수 있습니다. GROUP BY 절에는 서브쿼리를 사용할 수 없습니다.',
    options: [
      'SELECT 절',
      'WHERE 절',
      'GROUP BY 절',
      'HAVING 절',
    ],
    points: 10,
  },

  // --- 윈도우함수 (34~37) ---
  {
    id: 'exam4_p34',
    title: '34. RANK vs DENSE_RANK 차이',
    description:
      '다음 데이터에서 SAL 기준 RANK()와 DENSE_RANK()의 차이를 올바르게 설명한 것은?\n\n[EMP 일부]\nSAL: 5000, 3000, 3000, 2000',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '윈도우함수',
    correctRate: 72,
    answer: '2',
    explanation:
      'RANK()는 동순위가 있으면 다음 순위를 건너뜁니다. 5000→1, 3000→2, 3000→2, 2000→4. DENSE_RANK()는 건너뛰지 않고 연속된 순위를 부여합니다. 5000→1, 3000→2, 3000→2, 2000→3.',
    options: [
      'RANK와 DENSE_RANK는 항상 동일한 결과를 반환한다.',
      'RANK는 동순위 다음 번호를 건너뛰지만, DENSE_RANK는 건너뛰지 않는다.',
      'DENSE_RANK는 동순위 다음 번호를 건너뛰지만, RANK는 건너뛰지 않는다.',
      'RANK는 NULL을 무시하지만 DENSE_RANK는 포함한다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p35',
    title: '35. LAG / LEAD 함수',
    description:
      '다음 SQL에서 LAG(SAL, 1, 0) OVER (ORDER BY EMPNO)의 의미로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '윈도우함수',
    correctRate: 55,
    answer: '3',
    explanation:
      'LAG(컬럼, offset, default) OVER (ORDER BY ...)는 현재 행보다 offset만큼 이전 행의 값을 반환합니다. LAG(SAL, 1, 0)은 이전 행의 SAL을 반환하되, 이전 행이 없으면 (첫 번째 행인 경우) 0을 반환합니다.',
    options: [
      '다음 행의 SAL을 반환하며, 없으면 0을 반환한다.',
      '현재 행의 SAL에서 0을 뺀 값을 반환한다.',
      '이전 행의 SAL을 반환하며, 없으면 0을 반환한다.',
      '가장 작은 SAL을 반환한다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p36',
    title: '36. SUM OVER와 누적 합계',
    description:
      '다음 SQL에서 SUM(SAL) OVER (ORDER BY EMPNO ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)의 의미는?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 38,
    answer: '1',
    explanation:
      'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW는 파티션의 첫 번째 행부터 현재 행까지를 윈도우 범위로 지정합니다. 따라서 이 SUM은 EMPNO 순으로 정렬된 SAL의 누적 합계를 계산합니다.',
    options: [
      'EMPNO 순으로 정렬한 SAL의 누적 합계',
      '전체 SAL의 합계를 모든 행에 반복 출력',
      '현재 행의 SAL만 반환',
      '이전 행까지의 SAL 합계 (현재 행 미포함)',
    ],
    points: 10,
  },
  {
    id: 'exam4_p37',
    title: '37. NTILE 함수',
    description:
      '10개 행에 대해 NTILE(4) OVER (ORDER BY SAL)을 적용할 때, 각 버킷에 배정되는 행의 수로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 35,
    answer: '3',
    explanation:
      'NTILE(4)은 전체를 4개 그룹으로 나눕니다. 10행을 4로 나누면 2개 그룹은 3행, 2개 그룹은 2행입니다. 나머지(10 mod 4 = 2)만큼의 앞쪽 버킷에 1행씩 추가됩니다. 따라서 1,2번 버킷에 3행, 3,4번 버킷에 2행이 배정됩니다.',
    options: [
      '모든 버킷에 2.5행씩 (소수점 반올림)',
      '버킷 1~4에 각각 3, 3, 2, 2행',
      '버킷 1, 2에 3행씩, 버킷 3, 4에 2행씩',
      '모든 버킷에 동일하게 2행씩 (2행 무시)',
    ],
    points: 10,
  },

  // --- 집합연산 (38~41) ---
  {
    id: 'exam4_p38',
    title: '38. UNION과 UNION ALL 차이',
    description:
      '다음 중 UNION과 UNION ALL의 차이에 대한 설명으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 80,
    answer: '2',
    explanation:
      'UNION은 두 쿼리 결과를 합치고 중복을 제거하여 DISTINCT 처리를 합니다. 내부적으로 정렬이 발생하므로 UNION ALL보다 느립니다. UNION ALL은 중복을 제거하지 않고 모든 행을 그대로 합칩니다. 중복이 없거나 중복을 포함해도 되는 경우 UNION ALL이 성능상 유리합니다.',
    options: [
      'UNION은 중복을 허용하고 UNION ALL은 중복을 제거한다.',
      'UNION은 중복을 제거하고 UNION ALL은 모든 행을 포함한다.',
      'UNION ALL은 정렬이 발생하여 UNION보다 느리다.',
      'UNION과 UNION ALL은 결과가 항상 동일하다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p39',
    title: '39. 집합 연산자의 컬럼 수 조건',
    description:
      '다음 SQL이 오류가 발생하는 이유로 올바른 것은?\n\nSELECT EMPNO, ENAME FROM EMP\nUNION\nSELECT DEPTNO FROM DEPT;',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: '집합연산',
    correctRate: 82,
    answer: '1',
    explanation:
      '집합 연산자(UNION, UNION ALL, INTERSECT, MINUS)를 사용하려면 각 SELECT 문의 컬럼 수가 동일해야 합니다. 첫 번째 쿼리는 2개 컬럼(EMPNO, ENAME), 두 번째 쿼리는 1개 컬럼(DEPTNO)이므로 오류가 발생합니다.',
    options: [
      '두 SELECT 문의 컬럼 수가 다르기 때문이다.',
      '데이터 타입이 호환되지 않기 때문이다.',
      'UNION은 서브쿼리에서만 사용할 수 있기 때문이다.',
      'EMP와 DEPT를 UNION할 수 없기 때문이다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p40',
    title: '40. GROUPING SETS',
    description:
      '다음 GROUPING SETS 쿼리가 반환하는 그룹 조합으로 올바른 것은?\n\nSELECT DEPTNO, JOB, SUM(SAL)\nFROM EMP\nGROUP BY GROUPING SETS ((DEPTNO, JOB), (DEPTNO), ());',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 35,
    answer: '2',
    explanation:
      'GROUPING SETS((DEPTNO, JOB), (DEPTNO), ())는 세 가지 그룹핑 조합을 지정합니다: (1) DEPTNO와 JOB의 조합, (2) DEPTNO만, (3) 전체 합계(빈 괄호). 이는 ROLLUP(DEPTNO, JOB)과 유사하지만 JOB만의 소계는 포함하지 않습니다.',
    options: [
      '(DEPTNO), (JOB), () 세 가지 조합',
      '(DEPTNO, JOB), (DEPTNO), () 세 가지 조합',
      '(DEPTNO, JOB)과 ()만 두 가지 조합',
      '(DEPTNO), (JOB), (DEPTNO, JOB), () 네 가지 조합',
    ],
    points: 10,
  },
  {
    id: 'exam4_p41',
    title: '41. MINUS와 NOT IN',
    description:
      '다음 두 SQL이 동일한 결과를 반환하는가?\n\n① SELECT DEPTNO FROM DEPT\n   MINUS\n   SELECT DEPTNO FROM EMP;\n\n② SELECT DEPTNO FROM DEPT\n   WHERE DEPTNO NOT IN (SELECT DEPTNO FROM EMP);',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '집합연산',
    correctRate: 32,
    answer: '4',
    explanation:
      'EMP.DEPTNO에 NULL이 포함된 경우 결과가 다릅니다. NOT IN은 NULL이 포함된 서브쿼리에서 UNKNOWN이 발생하여 빈 결과를 반환할 수 있습니다. 반면 MINUS는 NULL 비교에서도 NULL = NULL을 같은 것으로 처리하여 정상 동작합니다. EMP.DEPTNO에 NULL이 없다면 동일한 결과를 반환합니다.',
    options: [
      '항상 동일한 결과를 반환한다.',
      'DEPT.DEPTNO에 NULL이 있을 때만 결과가 다르다.',
      'MINUS는 중복을 제거하지 않아 결과가 다르다.',
      'EMP.DEPTNO에 NULL이 포함되면 결과가 달라질 수 있다.',
    ],
    points: 10,
  },

  // --- DDL (42~45) ---
  {
    id: 'exam4_p42',
    title: '42. ALTER TABLE 컬럼 수정 제약',
    description:
      '다음 중 ALTER TABLE로 컬럼을 수정할 때의 제약 사항으로 올바른 것은?',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 55,
    answer: '2',
    explanation:
      '데이터가 있는 컬럼의 데이터 타입은 호환 가능한 타입으로만 변경할 수 있습니다. 컬럼의 크기는 늘릴 수 있지만, 데이터가 있는 경우 기존 데이터보다 작게 줄일 수 없습니다. NOT NULL이 설정된 컬럼에 NULL 값이 있으면 NOT NULL 제약을 해제하거나 데이터를 먼저 수정해야 합니다.',
    options: [
      '데이터가 있어도 컬럼 크기를 자유롭게 줄일 수 있다.',
      '데이터가 있는 경우 컬럼 크기를 현재보다 작게 줄이기 어렵다.',
      '컬럼의 NOT NULL 제약은 변경할 수 없다.',
      'ALTER TABLE로는 컬럼의 데이터 타입을 변경할 수 없다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p43',
    title: '43. CREATE TABLE AS SELECT',
    description:
      '다음 SQL로 생성된 테이블 EMP_COPY에 대한 설명으로 올바른 것은?\n\nCREATE TABLE EMP_COPY AS\nSELECT * FROM EMP WHERE DEPTNO = 10;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 60,
    answer: '3',
    explanation:
      'CTAS(Create Table As Select)는 SELECT 결과를 바탕으로 테이블을 생성하고 데이터를 복사합니다. 컬럼 구조와 데이터는 복사되지만, NOT NULL을 제외한 원본 테이블의 제약조건(PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK 등)은 복사되지 않습니다.',
    options: [
      '원본 EMP의 모든 제약조건과 인덱스가 복사된다.',
      'DEPTNO=10인 데이터와 함께 PRIMARY KEY 제약만 복사된다.',
      'DEPTNO=10인 데이터가 복사되지만 NOT NULL 외의 제약조건은 복사되지 않는다.',
      'SELECT 구조만 복사되고 데이터는 복사되지 않는다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p44',
    title: '44. DROP과 TRUNCATE의 차이',
    description:
      'DROP TABLE과 TRUNCATE TABLE에 대한 설명으로 올바르지 않은 것은?',
    type: 'multiple_choice',
    difficulty: 'easy',
    category: 'DDL',
    correctRate: 75,
    answer: '4',
    explanation:
      'DROP TABLE은 테이블 구조와 데이터를 모두 삭제하며, 관련 인덱스, 제약조건도 함께 제거됩니다. TRUNCATE TABLE은 테이블의 모든 행을 빠르게 삭제하지만 테이블 구조는 유지됩니다. 두 명령 모두 DDL이므로 Auto-Commit이 발생하여 일반적으로 ROLLBACK이 불가합니다. 단, TRUNCATE 후에도 테이블 자체는 유지됩니다.',
    options: [
      'DROP은 테이블 구조와 데이터를 모두 제거한다.',
      'TRUNCATE는 테이블 구조를 유지하고 데이터만 제거한다.',
      'DROP과 TRUNCATE 모두 DDL이므로 Auto-Commit이 발생한다.',
      'TRUNCATE 후에는 ROLLBACK으로 데이터를 복구할 수 있다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p45',
    title: '45. CHECK 제약조건',
    description:
      '다음 DDL에서 CHECK 제약조건에 위반되는 INSERT는?\n\nCREATE TABLE PRODUCT (\n  PROD_ID NUMBER PRIMARY KEY,\n  PRICE   NUMBER CHECK (PRICE > 0),\n  QTY     NUMBER CHECK (QTY >= 0)\n);',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DDL',
    correctRate: 65,
    answer: '3',
    explanation:
      'PRICE > 0 조건에 의해 PRICE에 0이나 음수를 입력할 수 없습니다. QTY >= 0 조건에 의해 QTY는 0 이상이어야 합니다. NULL 값은 CHECK 제약조건에서 UNKNOWN으로 처리되어 허용됩니다.',
    options: [
      'INSERT INTO PRODUCT VALUES (1, 100, NULL);',
      'INSERT INTO PRODUCT VALUES (2, 0.1, 0);',
      'INSERT INTO PRODUCT VALUES (3, 0, 10);',
      'INSERT INTO PRODUCT VALUES (4, 1, NULL);',
    ],
    points: 10,
  },

  // --- TCL (46~48) ---
  {
    id: 'exam4_p46',
    title: '46. SAVEPOINT와 부분 ROLLBACK',
    description:
      '다음 SQL 실행 순서에서 ROLLBACK TO SP1 이후 COMMIT을 실행하면 최종적으로 테이블에 남는 데이터는?\n\nINSERT INTO T VALUES (1);  -- A\nSAVEPOINT SP1;\nINSERT INTO T VALUES (2);  -- B\nINSERT INTO T VALUES (3);  -- C\nROLLBACK TO SP1;\nINSERT INTO T VALUES (4);  -- D\nCOMMIT;',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'TCL',
    correctRate: 52,
    answer: '2',
    explanation:
      'SAVEPOINT SP1은 A(값 1) INSERT 이후에 설정됩니다. ROLLBACK TO SP1은 SP1 이후의 B(2), C(3)를 취소하고 SP1 지점으로 되돌립니다. 이후 D(4) INSERT 후 COMMIT하면 A(1)와 D(4)만 영구 저장됩니다.',
    options: [
      '값 1, 2, 3, 4',
      '값 1, 4',
      '값 4만',
      '아무 데이터도 없음',
    ],
    points: 10,
  },
  {
    id: 'exam4_p47',
    title: '47. DDL 이후 자동 COMMIT',
    description:
      '다음 SQL 실행 시 트랜잭션 처리에 대한 설명으로 올바른 것은?\n\nINSERT INTO EMP (EMPNO, ENAME) VALUES (9999, \'TEST\');\nCREATE TABLE TEMP (ID NUMBER);\nROLLBACK;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 38,
    answer: '1',
    explanation:
      'Oracle에서 DDL(CREATE, DROP, ALTER 등) 명령은 실행 전에 이전 트랜잭션을 자동으로 COMMIT하고, 실행 후에도 자동 COMMIT합니다. 따라서 INSERT 후 CREATE TABLE이 실행되면 INSERT가 자동 COMMIT되어 이후 ROLLBACK을 해도 INSERT 결과는 취소되지 않습니다.',
    options: [
      'CREATE TABLE 실행 시 이전 INSERT가 자동 COMMIT되어 ROLLBACK 대상에서 제외된다.',
      'ROLLBACK으로 INSERT와 CREATE TABLE 모두 취소된다.',
      'CREATE TABLE은 ROLLBACK 가능하다.',
      'INSERT만 ROLLBACK되고 CREATE TABLE은 유지된다.',
    ],
    points: 10,
  },
  {
    id: 'exam4_p48',
    title: '48. LOCK과 트랜잭션 격리',
    description:
      '트랜잭션 격리 수준 중 Dirty Read가 발생하는 격리 수준은?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'TCL',
    correctRate: 42,
    answer: '1',
    explanation:
      'READ UNCOMMITTED는 가장 낮은 격리 수준으로, COMMIT되지 않은 다른 트랜잭션의 변경 내용도 읽을 수 있어 Dirty Read가 발생합니다. READ COMMITTED(Oracle 기본)는 Dirty Read를 방지하고, REPEATABLE READ는 Non-Repeatable Read도 방지합니다. SERIALIZABLE은 가장 높은 격리 수준입니다.',
    options: [
      'READ UNCOMMITTED',
      'READ COMMITTED',
      'REPEATABLE READ',
      'SERIALIZABLE',
    ],
    points: 10,
  },

  // --- DCL (49) ---
  {
    id: 'exam4_p49',
    title: '49. GRANT WITH GRANT OPTION',
    description:
      'GRANT SELECT ON EMP TO USER_A WITH GRANT OPTION;을 실행한 후 USER_A가 USER_B에게 같은 권한을 부여했다. 이후 USER_A의 권한을 REVOKE하면 USER_B의 권한은 어떻게 되는가?',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: 'DCL',
    correctRate: 32,
    answer: '2',
    explanation:
      'WITH GRANT OPTION으로 부여된 권한은 연쇄(Cascade) 취소가 발생합니다. USER_A의 권한을 REVOKE하면 USER_A가 WITH GRANT OPTION으로 다른 사용자에게 부여한 권한도 함께 자동으로 취소됩니다. 따라서 USER_B의 권한도 자동 취소됩니다.',
    options: [
      'USER_B의 권한은 유지된다.',
      'USER_B의 권한도 연쇄적으로 취소된다.',
      'USER_B가 별도로 REVOKE해야 취소된다.',
      'USER_B의 권한이 DBA에게 이전된다.',
    ],
    points: 10,
  },

  // --- 계층형쿼리 (50) ---
  {
    id: 'exam4_p50',
    title: '50. 계층형 쿼리 CONNECT BY',
    description:
      '다음 계층형 쿼리에서 LEVEL과 SYS_CONNECT_BY_PATH에 대한 설명으로 올바른 것은?\n\nSELECT LEVEL, EMPNO, ENAME,\n  SYS_CONNECT_BY_PATH(ENAME, \'/\') AS PATH\nFROM EMP\nSTART WITH MGR IS NULL\nCONNECT BY PRIOR EMPNO = MGR;',
    type: 'multiple_choice',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 35,
    answer: '3',
    explanation:
      "LEVEL은 계층의 깊이를 나타내며 루트(최상위)가 LEVEL 1입니다. SYS_CONNECT_BY_PATH(컬럼, 구분자)는 루트에서 현재 행까지의 경로를 구분자로 연결하여 반환합니다. START WITH MGR IS NULL은 관리자가 없는 최상위 사원(루트)에서 시작하고, PRIOR EMPNO = MGR은 부모→자식 방향으로 탐색합니다.",
    options: [
      'LEVEL은 전체 행 수를 의미한다.',
      'START WITH MGR IS NULL은 부하직원이 없는 말단 사원부터 시작한다.',
      'LEVEL은 계층 깊이이며 루트가 1, SYS_CONNECT_BY_PATH는 루트에서 현재까지 경로를 반환한다.',
      'PRIOR EMPNO = MGR은 자식에서 부모 방향으로 탐색한다.',
    ],
    points: 10,
  },
];
