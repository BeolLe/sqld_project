-- ============================================
-- 테이블셋 1: EMP (직원/급여)
-- SQLD 학습 목표: JOIN, 셀프조인, NULL처리, 계층형쿼리, 서브쿼리
-- ============================================

-- 부서 테이블
CREATE TABLE DEPT (
    DEPTNO    NUMBER(2)     PRIMARY KEY,
    DNAME     VARCHAR2(20),
    LOC       VARCHAR2(20)
);

-- 사원 테이블
CREATE TABLE EMP (
    EMPNO     NUMBER(4)     PRIMARY KEY,
    ENAME     VARCHAR2(20)  NOT NULL,
    JOB       VARCHAR2(20),
    MGR       NUMBER(4)     REFERENCES EMP(EMPNO),
    HIREDATE  DATE,
    SAL       NUMBER(7,2),
    COMM      NUMBER(7,2),
    DEPTNO    NUMBER(2)     REFERENCES DEPT(DEPTNO)
);

-- 급여등급 테이블
CREATE TABLE SALGRADE (
    GRADE     NUMBER        PRIMARY KEY,
    LOSAL     NUMBER,
    HISAL     NUMBER
);

-- 급여변경이력 테이블
CREATE TABLE SAL_HISTORY (
    HIST_NO       NUMBER        PRIMARY KEY,
    EMPNO         NUMBER(4)     REFERENCES EMP(EMPNO),
    OLD_SAL       NUMBER(7,2),
    NEW_SAL       NUMBER(7,2),
    CHANGE_DATE   DATE,
    CHANGE_REASON VARCHAR2(50)
);
