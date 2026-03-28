-- ============================================
-- 테이블셋 2: ORDER (주문/상품/고객)
-- SQLD 학습 목표: 그룹함수, HAVING, 윈도우함수, 서브쿼리, JOIN
-- ============================================

-- 고객 테이블
CREATE TABLE CUSTOMER (
    CUST_ID     NUMBER        PRIMARY KEY,
    CUST_NAME   VARCHAR2(30)  NOT NULL,
    GRADE       VARCHAR2(10),
    CITY        VARCHAR2(20),
    REG_DATE    DATE
);

-- 상품 테이블
CREATE TABLE PRODUCT (
    PROD_ID     NUMBER        PRIMARY KEY,
    PROD_NAME   VARCHAR2(50)  NOT NULL,
    CATEGORY    VARCHAR2(20),
    PRICE       NUMBER(10,2),
    STOCK_QTY   NUMBER
);

-- 주문 테이블
CREATE TABLE ORDERS (
    ORDER_ID    NUMBER        PRIMARY KEY,
    CUST_ID     NUMBER        REFERENCES CUSTOMER(CUST_ID),
    ORDER_DATE  DATE,
    TOTAL_AMT   NUMBER(12,2),
    STATUS      VARCHAR2(10)
);

-- 주문상세 테이블
CREATE TABLE ORDER_DETAIL (
    DETAIL_ID   NUMBER        PRIMARY KEY,
    ORDER_ID    NUMBER        REFERENCES ORDERS(ORDER_ID),
    PROD_ID     NUMBER        REFERENCES PRODUCT(PROD_ID),
    QTY         NUMBER,
    UNIT_PRICE  NUMBER(10,2)
);
