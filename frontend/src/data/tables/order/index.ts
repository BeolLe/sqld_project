/**
 * 테이블셋 2: ORDER (주문/상품/고객)
 *
 * SQLD 학습 목표:
 * - 그룹함수 & HAVING (고객별/상품별/월별 매출 집계)
 * - 윈도우함수 (매출 순위, 누적합, 이동평균)
 * - 서브쿼리 (최대 구매 고객, 미주문 상품 등)
 * - JOIN (4개 테이블 조인)
 * - 집합연산자 (UNION, INTERSECT, MINUS)
 *
 * 함정 요소:
 * - CUSTOMER.GRADE: 일부 NULL (등급 미분류 고객)
 * - CUSTOMER.CITY: 일부 NULL
 * - PRODUCT.PRICE: 일부 NULL (가격 미정 상품)
 * - PRODUCT.STOCK_QTY: 일부 0 (재고 소진)
 * - ORDERS.TOTAL_AMT: 일부 NULL
 * - 주문 없는 고객 15명 (LEFT OUTER JOIN 필수)
 * - 한번도 주문되지 않은 상품 8개 (NOT IN / NOT EXISTS 연습)
 */

export const ORDER_TABLE_SET = {
  id: 'order',
  name: '주문/상품/고객 관리',
  description: 'CUSTOMER, PRODUCT, ORDERS, ORDER_DETAIL 테이블을 활용한 SQL 실습',
  tables: [
    {
      name: 'CUSTOMER',
      description: '고객 정보',
      rowCount: 100,
      columns: [
        { name: 'CUST_ID', type: 'NUMBER', constraint: 'PK', description: '고객번호' },
        { name: 'CUST_NAME', type: 'VARCHAR2(30)', constraint: 'NOT NULL', description: '고객명' },
        { name: 'GRADE', type: 'VARCHAR2(10)', constraint: '', description: '등급 (VIP/GOLD/SILVER/BRONZE/NULL)' },
        { name: 'CITY', type: 'VARCHAR2(20)', constraint: '', description: '거주도시 (일부 NULL)' },
        { name: 'REG_DATE', type: 'DATE', constraint: '', description: '가입일' },
      ],
    },
    {
      name: 'PRODUCT',
      description: '상품 정보',
      rowCount: 50,
      columns: [
        { name: 'PROD_ID', type: 'NUMBER', constraint: 'PK', description: '상품번호' },
        { name: 'PROD_NAME', type: 'VARCHAR2(50)', constraint: 'NOT NULL', description: '상품명' },
        { name: 'CATEGORY', type: 'VARCHAR2(20)', constraint: '', description: '카테고리 (일부 NULL)' },
        { name: 'PRICE', type: 'NUMBER(10,2)', constraint: '', description: '가격 (일부 NULL)' },
        { name: 'STOCK_QTY', type: 'NUMBER', constraint: '', description: '재고수량 (0 포함)' },
      ],
    },
    {
      name: 'ORDERS',
      description: '주문 정보',
      rowCount: 400,
      columns: [
        { name: 'ORDER_ID', type: 'NUMBER', constraint: 'PK', description: '주문번호' },
        { name: 'CUST_ID', type: 'NUMBER', constraint: 'FK→CUSTOMER', description: '고객번호' },
        { name: 'ORDER_DATE', type: 'DATE', constraint: '', description: '주문일' },
        { name: 'TOTAL_AMT', type: 'NUMBER(12,2)', constraint: '', description: '총 주문금액 (일부 NULL)' },
        { name: 'STATUS', type: 'VARCHAR2(10)', constraint: '', description: '상태 (완료/배송중/준비중/취소/반품)' },
      ],
    },
    {
      name: 'ORDER_DETAIL',
      description: '주문 상세',
      rowCount: 450,
      columns: [
        { name: 'DETAIL_ID', type: 'NUMBER', constraint: 'PK', description: '상세번호' },
        { name: 'ORDER_ID', type: 'NUMBER', constraint: 'FK→ORDERS', description: '주문번호' },
        { name: 'PROD_ID', type: 'NUMBER', constraint: 'FK→PRODUCT', description: '상품번호' },
        { name: 'QTY', type: 'NUMBER', constraint: '', description: '수량' },
        { name: 'UNIT_PRICE', type: 'NUMBER(10,2)', constraint: '', description: '단가' },
      ],
    },
  ],
  totalRows: 1000,
  sqldTopics: ['그룹함수', 'HAVING', '윈도우함수', '서브쿼리', 'JOIN', '집합연산자', 'ROLLUP/CUBE'],
} as const;
