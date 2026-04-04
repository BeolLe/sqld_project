/**
 * 테이블 컬럼 한글 설명 딕셔너리
 * key: "테이블명.컬럼명" (대문자)
 * value: 한글 설명
 *
 * 의미가 직관적인 컬럼은 한글명만, 유추하기 어려운 컬럼은 부가 설명 포함
 */

const COLUMN_DESCRIPTIONS: Record<string, string> = {
  // ─── EMP (사원) ─────────────────────────────────────────
  'EMP.EMPNO': '사원번호',
  'EMP.ENAME': '사원명',
  'EMP.JOB': '직급',
  'EMP.MGR': '직속 상사의 사원번호',
  'EMP.HIREDATE': '입사일',
  'EMP.SAL': '급여 (월급)',
  'EMP.COMM': '커미션 (영업 수당, 영업직만 해당)',
  'EMP.DEPTNO': '소속 부서번호',

  // ─── DEPT (부서) ────────────────────────────────────────
  'DEPT.DEPTNO': '부서번호',
  'DEPT.DNAME': '부서명',
  'DEPT.LOC': '부서 소재지',

  // ─── CUSTOMER (고객) ────────────────────────────────────
  'CUSTOMER.CUST_ID': '고객번호',
  'CUSTOMER.CUST_NAME': '고객명',
  'CUSTOMER.GRADE': '고객 등급 (VIP, GOLD, SILVER 등)',
  'CUSTOMER.CITY': '거주 도시',
  'CUSTOMER.REG_DATE': '가입일',

  // ─── ORDERS (주문) ──────────────────────────────────────
  'ORDERS.ORDER_ID': '주문번호',
  'ORDERS.CUST_ID': '주문 고객번호',
  'ORDERS.ORDER_DATE': '주문일',
  'ORDERS.TOTAL_AMT': '주문 총액',
  'ORDERS.STATUS': '주문 상태 (COMPLETE, PENDING 등)',

  // ─── ORDER_DETAIL (주문 상세) ───────────────────────────
  'ORDER_DETAIL.DETAIL_ID': '상세번호',
  'ORDER_DETAIL.ORDER_ID': '주문번호',
  'ORDER_DETAIL.PROD_ID': '상품번호',
  'ORDER_DETAIL.QTY': '주문 수량',
  'ORDER_DETAIL.UNIT_PRICE': '단가',

  // ─── PRODUCT (상품) ─────────────────────────────────────
  'PRODUCT.PROD_ID': '상품번호',
  'PRODUCT.PROD_NAME': '상품명',
  'PRODUCT.CATEGORY': '상품 카테고리',
  'PRODUCT.PRICE': '판매 가격',
  'PRODUCT.STOCK_QTY': '재고 수량',

  // ─── STUDENT (학생) ─────────────────────────────────────
  'STUDENT.STU_ID': '학번',
  'STUDENT.STU_NAME': '학생명',
  'STUDENT.DEPT_NAME': '소속 학과',
  'STUDENT.GRADE': '학년 (1~4)',
  'STUDENT.ADVISOR_ID': '지도교수 번호',
  'STUDENT.ENT_DATE': '입학일',

  // ─── PROFESSOR (교수) ───────────────────────────────────
  'PROFESSOR.PROF_ID': '교수번호',
  'PROFESSOR.PROF_NAME': '교수명',
  'PROFESSOR.DEPT_NAME': '소속 학과',
  'PROFESSOR.POSITION': '직위 (정교수, 부교수, 조교수 등)',
  'PROFESSOR.HIRE_DATE': '임용일',
  'PROFESSOR.SAL': '급여 (월급)',

  // ─── COURSE (과목) ──────────────────────────────────────
  'COURSE.COURSE_ID': '과목 코드',
  'COURSE.COURSE_NAME': '과목명',
  'COURSE.CREDIT': '학점 수',
  'COURSE.PROF_ID': '담당 교수번호',
  'COURSE.DEPT_NAME': '개설 학과',

  // ─── ENROLLMENT (수강) ──────────────────────────────────
  'ENROLLMENT.ENROLL_ID': '수강번호',
  'ENROLLMENT.STU_ID': '학번',
  'ENROLLMENT.COURSE_ID': '과목 코드',
  'ENROLLMENT.SEMESTER': '수강 학기 (예: 2024-1)',
  'ENROLLMENT.SCORE': '취득 점수 (0~100)',
  'ENROLLMENT.GRADE': '학점 등급 (A+, A, B+ 등)',
};

/** 테이블명과 컬럼명으로 한글 설명을 조회 */
export function getColumnDescription(tableName: string, columnName: string): string | undefined {
  return COLUMN_DESCRIPTIONS[`${tableName.toUpperCase()}.${columnName.toUpperCase()}`];
}
