import type { Problem } from '../../types';

export const HARD_PROBLEMS: Problem[] = [
  // ═══════════════════════════════════════════════════════════════════
  // EMP 테이블셋 (7문제)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'sql_hard_01',
    title: '계층형 쿼리 - 조직도 출력',
    description:
      'EMP 테이블에서 사장(MGR IS NULL)부터 시작하여 전체 조직도를 출력하시오.\n\n' +
      '출력 컬럼: LEVEL, 들여쓰기된 사원명(ENAME), 직급(JOB)\n' +
      '- LPAD를 사용하여 LEVEL에 따라 공백 2칸씩 들여쓰기한 사원명을 ORG_CHART 컬럼으로 출력\n' +
      '- LEVEL 오름차순, 같은 레벨 내에서는 ENAME 오름차순 정렬\n\n' +
      '결과 예시:\n' +
      'LEVEL | ORG_CHART      | JOB\n' +
      '1     | KING           | PRESIDENT\n' +
      '2     |   BLAKE        | MANAGER\n' +
      '3     |     ALLEN      | SALESMAN',
    type: 'sql',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 32,
    answer:
      'SELECT LEVEL, LPAD(\' \', (LEVEL - 1) * 2) || ENAME AS ORG_CHART, JOB\n' +
      'FROM EMP\n' +
      'START WITH MGR IS NULL\n' +
      'CONNECT BY PRIOR EMPNO = MGR\n' +
      'ORDER SIBLINGS BY ENAME',
    explanation:
      '【실행 순서】\n' +
      '1. START WITH MGR IS NULL → 루트 노드(사장) 결정\n' +
      '2. CONNECT BY PRIOR EMPNO = MGR → PRIOR가 부모 쪽(EMPNO)에 붙어 순방향 탐색\n' +
      '3. SELECT → LEVEL 의사컬럼과 LPAD로 들여쓰기 생성\n' +
      '4. ORDER SIBLINGS BY → 같은 부모를 가진 형제 노드끼리만 정렬\n\n' +
      '【핵심 함정】\n' +
      '- ORDER BY를 사용하면 계층 구조가 깨짐 → ORDER SIBLINGS BY를 사용해야 함\n' +
      '- PRIOR 위치가 중요: CONNECT BY PRIOR EMPNO = MGR은 순방향(부모→자식)\n' +
      '  CONNECT BY EMPNO = PRIOR MGR은 역방향(자식→부모)\n' +
      '- LEVEL은 1부터 시작하므로 (LEVEL-1)*2로 들여쓰기 계산',
    schemaSQL:
      'CREATE TABLE DEPT (DEPTNO NUMBER(2) PRIMARY KEY, DNAME VARCHAR2(20), LOC VARCHAR2(20));\n' +
      'CREATE TABLE EMP (EMPNO NUMBER(4) PRIMARY KEY, ENAME VARCHAR2(20) NOT NULL, JOB VARCHAR2(20), MGR NUMBER(4), HIREDATE DATE, SAL NUMBER(7,2), COMM NUMBER(7,2), DEPTNO NUMBER(2));',
    sampleData:
      "INSERT INTO DEPT VALUES (10, 'ACCOUNTING', 'NEW YORK');\n" +
      "INSERT INTO DEPT VALUES (20, 'RESEARCH', 'DALLAS');\n" +
      "INSERT INTO DEPT VALUES (30, 'SALES', 'CHICAGO');\n" +
      "INSERT INTO EMP VALUES (7839, 'KING', 'PRESIDENT', NULL, TO_DATE('1981-11-17','YYYY-MM-DD'), 5000, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7566, 'JONES', 'MANAGER', 7839, TO_DATE('1981-04-02','YYYY-MM-DD'), 2975, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7698, 'BLAKE', 'MANAGER', 7839, TO_DATE('1981-05-01','YYYY-MM-DD'), 2850, NULL, 30);\n" +
      "INSERT INTO EMP VALUES (7782, 'CLARK', 'MANAGER', 7839, TO_DATE('1981-06-09','YYYY-MM-DD'), 2450, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7788, 'SCOTT', 'ANALYST', 7566, TO_DATE('1982-12-09','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7902, 'FORD', 'ANALYST', 7566, TO_DATE('1981-12-03','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7499, 'ALLEN', 'SALESMAN', 7698, TO_DATE('1981-02-20','YYYY-MM-DD'), 1600, 300, 30);\n" +
      "INSERT INTO EMP VALUES (7521, 'WARD', 'SALESMAN', 7698, TO_DATE('1981-02-22','YYYY-MM-DD'), 1250, 500, 30);\n" +
      "INSERT INTO EMP VALUES (7654, 'MARTIN', 'SALESMAN', 7698, TO_DATE('1981-09-28','YYYY-MM-DD'), 1250, 1400, 30);\n" +
      "INSERT INTO EMP VALUES (7844, 'TURNER', 'SALESMAN', 7698, TO_DATE('1981-09-08','YYYY-MM-DD'), 1500, 0, 30);\n" +
      "INSERT INTO EMP VALUES (7934, 'MILLER', 'CLERK', 7782, TO_DATE('1982-01-23','YYYY-MM-DD'), 1300, NULL, 10);",
    points: 10,
  },
  {
    id: 'sql_hard_02',
    title: '계층형 쿼리 응용 - 역방향 탐색',
    description:
      'EMP 테이블에서 ENAME이 \'ALLEN\'인 사원부터 시작하여 최상위 관리자(사장)까지 역방향으로 추적하시오.\n\n' +
      '출력 컬럼: LEVEL, EMPNO, ENAME, MGR, JOB\n' +
      '- LEVEL 오름차순 정렬\n' +
      '- 즉, ALLEN(LEVEL=1) → BLAKE(LEVEL=2) → KING(LEVEL=3) 순서로 출력',
    type: 'sql',
    difficulty: 'hard',
    category: '계층형쿼리',
    correctRate: 28,
    answer:
      'SELECT LEVEL, EMPNO, ENAME, MGR, JOB\n' +
      'FROM EMP\n' +
      "START WITH ENAME = 'ALLEN'\n" +
      'CONNECT BY PRIOR MGR = EMPNO\n' +
      'ORDER BY LEVEL',
    explanation:
      '【실행 순서】\n' +
      "1. START WITH ENAME = 'ALLEN' → 시작 노드를 ALLEN으로 지정\n" +
      '2. CONNECT BY PRIOR MGR = EMPNO → PRIOR가 자식 쪽(MGR)에 붙어 역방향 탐색\n' +
      '   현재 행의 MGR 값이 다음 행의 EMPNO와 일치하는 행을 찾아 올라감\n' +
      '3. ORDER BY LEVEL → 레벨 순서대로 정렬\n\n' +
      '【핵심 함정】\n' +
      '- 역방향 탐색의 핵심: PRIOR 위치가 MGR 쪽에 있음\n' +
      '  순방향: CONNECT BY PRIOR EMPNO = MGR (부모의 EMPNO → 자식의 MGR)\n' +
      '  역방향: CONNECT BY PRIOR MGR = EMPNO (자식의 MGR → 부모의 EMPNO)\n' +
      '- PRIOR는 "이전에 읽은 행"의 컬럼을 의미하므로 방향이 반대가 됨\n' +
      '- ORDER BY를 써도 역방향에서는 계층 관계가 선형이므로 구조가 깨지지 않음',
    schemaSQL:
      'CREATE TABLE EMP (EMPNO NUMBER(4) PRIMARY KEY, ENAME VARCHAR2(20) NOT NULL, JOB VARCHAR2(20), MGR NUMBER(4), HIREDATE DATE, SAL NUMBER(7,2), COMM NUMBER(7,2), DEPTNO NUMBER(2));',
    sampleData:
      "INSERT INTO EMP VALUES (7839, 'KING', 'PRESIDENT', NULL, TO_DATE('1981-11-17','YYYY-MM-DD'), 5000, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7566, 'JONES', 'MANAGER', 7839, TO_DATE('1981-04-02','YYYY-MM-DD'), 2975, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7698, 'BLAKE', 'MANAGER', 7839, TO_DATE('1981-05-01','YYYY-MM-DD'), 2850, NULL, 30);\n" +
      "INSERT INTO EMP VALUES (7782, 'CLARK', 'MANAGER', 7839, TO_DATE('1981-06-09','YYYY-MM-DD'), 2450, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7788, 'SCOTT', 'ANALYST', 7566, TO_DATE('1982-12-09','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7902, 'FORD', 'ANALYST', 7566, TO_DATE('1981-12-03','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7499, 'ALLEN', 'SALESMAN', 7698, TO_DATE('1981-02-20','YYYY-MM-DD'), 1600, 300, 30);\n" +
      "INSERT INTO EMP VALUES (7521, 'WARD', 'SALESMAN', 7698, TO_DATE('1981-02-22','YYYY-MM-DD'), 1250, 500, 30);\n" +
      "INSERT INTO EMP VALUES (7654, 'MARTIN', 'SALESMAN', 7698, TO_DATE('1981-09-28','YYYY-MM-DD'), 1250, 1400, 30);\n" +
      "INSERT INTO EMP VALUES (7844, 'TURNER', 'SALESMAN', 7698, TO_DATE('1981-09-08','YYYY-MM-DD'), 1500, 0, 30);\n" +
      "INSERT INTO EMP VALUES (7934, 'MILLER', 'CLERK', 7782, TO_DATE('1982-01-23','YYYY-MM-DD'), 1300, NULL, 10);",
    points: 10,
  },
  {
    id: 'sql_hard_03',
    title: 'ROLLUP - 부서별 직급별 급여 소계/총계',
    description:
      'EMP 테이블과 DEPT 테이블을 조인하여, 부서명(DNAME)별·직급(JOB)별 급여 합계를 구하고\n' +
      'ROLLUP을 사용하여 부서별 소계와 전체 총계를 함께 출력하시오.\n\n' +
      '출력 컬럼: DNAME, JOB, SAL_SUM\n' +
      '- 소계 행에서 JOB은 NULL로 표시됨\n' +
      '- 총계 행에서 DNAME과 JOB 모두 NULL로 표시됨\n' +
      '- DNAME 오름차순, JOB 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '그룹함수',
    correctRate: 35,
    answer:
      'SELECT D.DNAME, E.JOB, SUM(E.SAL) AS SAL_SUM\n' +
      'FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO\n' +
      'GROUP BY ROLLUP(D.DNAME, E.JOB)\n' +
      'ORDER BY D.DNAME, E.JOB',
    explanation:
      '【실행 순서】\n' +
      '1. FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO → 두 테이블 조인\n' +
      '2. GROUP BY ROLLUP(DNAME, JOB) → 세 가지 수준의 그룹핑 생성:\n' +
      '   (DNAME, JOB) → 부서+직급별 합계\n' +
      '   (DNAME)      → 부서별 소계 (JOB = NULL)\n' +
      '   ()           → 전체 총계 (DNAME = NULL, JOB = NULL)\n' +
      '3. SUM(SAL) → 각 그룹별 급여 합계\n' +
      '4. ORDER BY → DNAME, JOB 정렬 (NULL은 Oracle에서 마지막)\n\n' +
      '【핵심 함정】\n' +
      '- ROLLUP(A, B)는 (A,B), (A), () 세 가지 그룹만 생성 (오른쪽부터 제거)\n' +
      '- CUBE(A, B)와 달리 (B) 그룹은 생성하지 않음\n' +
      '- 소계/총계 행의 NULL과 실제 데이터 NULL을 구분하려면 GROUPING() 함수 사용\n' +
      '- GROUPING(DNAME) = 1이면 DNAME이 집계로 인한 NULL, 0이면 실제 값',
    schemaSQL:
      'CREATE TABLE DEPT (DEPTNO NUMBER(2) PRIMARY KEY, DNAME VARCHAR2(20), LOC VARCHAR2(20));\n' +
      'CREATE TABLE EMP (EMPNO NUMBER(4) PRIMARY KEY, ENAME VARCHAR2(20) NOT NULL, JOB VARCHAR2(20), MGR NUMBER(4), HIREDATE DATE, SAL NUMBER(7,2), COMM NUMBER(7,2), DEPTNO NUMBER(2));',
    sampleData:
      "INSERT INTO DEPT VALUES (10, 'ACCOUNTING', 'NEW YORK');\n" +
      "INSERT INTO DEPT VALUES (20, 'RESEARCH', 'DALLAS');\n" +
      "INSERT INTO DEPT VALUES (30, 'SALES', 'CHICAGO');\n" +
      "INSERT INTO EMP VALUES (7839, 'KING', 'PRESIDENT', NULL, TO_DATE('1981-11-17','YYYY-MM-DD'), 5000, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7566, 'JONES', 'MANAGER', 7839, TO_DATE('1981-04-02','YYYY-MM-DD'), 2975, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7698, 'BLAKE', 'MANAGER', 7839, TO_DATE('1981-05-01','YYYY-MM-DD'), 2850, NULL, 30);\n" +
      "INSERT INTO EMP VALUES (7782, 'CLARK', 'MANAGER', 7839, TO_DATE('1981-06-09','YYYY-MM-DD'), 2450, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7788, 'SCOTT', 'ANALYST', 7566, TO_DATE('1982-12-09','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7902, 'FORD', 'ANALYST', 7566, TO_DATE('1981-12-03','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7499, 'ALLEN', 'SALESMAN', 7698, TO_DATE('1981-02-20','YYYY-MM-DD'), 1600, 300, 30);\n" +
      "INSERT INTO EMP VALUES (7521, 'WARD', 'SALESMAN', 7698, TO_DATE('1981-02-22','YYYY-MM-DD'), 1250, 500, 30);\n" +
      "INSERT INTO EMP VALUES (7654, 'MARTIN', 'SALESMAN', 7698, TO_DATE('1981-09-28','YYYY-MM-DD'), 1250, 1400, 30);\n" +
      "INSERT INTO EMP VALUES (7844, 'TURNER', 'SALESMAN', 7698, TO_DATE('1981-09-08','YYYY-MM-DD'), 1500, 0, 30);\n" +
      "INSERT INTO EMP VALUES (7934, 'MILLER', 'CLERK', 7782, TO_DATE('1982-01-23','YYYY-MM-DD'), 1300, NULL, 10);",
    points: 10,
  },
  {
    id: 'sql_hard_04',
    title: '윈도우함수 - 부서별 급여 순위 (RANK vs DENSE_RANK)',
    description:
      'EMP 테이블에서 부서별로 급여가 높은 순서대로 순위를 매기시오.\n\n' +
      '출력 컬럼: DEPTNO, ENAME, SAL, RANK_VAL, DENSE_RANK_VAL\n' +
      '- RANK_VAL: RANK() 함수를 사용한 순위 (동일 급여 시 같은 순위, 다음 순위 건너뜀)\n' +
      '- DENSE_RANK_VAL: DENSE_RANK() 함수를 사용한 순위 (동일 급여 시 같은 순위, 다음 순위 건너뛰지 않음)\n' +
      '- 부서번호 오름차순, 급여 내림차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 38,
    answer:
      'SELECT DEPTNO, ENAME, SAL,\n' +
      '       RANK() OVER (PARTITION BY DEPTNO ORDER BY SAL DESC) AS RANK_VAL,\n' +
      '       DENSE_RANK() OVER (PARTITION BY DEPTNO ORDER BY SAL DESC) AS DENSE_RANK_VAL\n' +
      'FROM EMP\n' +
      'ORDER BY DEPTNO, SAL DESC',
    explanation:
      '【실행 순서】\n' +
      '1. FROM EMP → 전체 사원 데이터 조회\n' +
      '2. SELECT → 윈도우함수 계산:\n' +
      '   PARTITION BY DEPTNO → 부서별로 그룹 분할\n' +
      '   ORDER BY SAL DESC → 각 파티션 내에서 급여 내림차순 정렬 후 순위 부여\n' +
      '3. ORDER BY DEPTNO, SAL DESC → 최종 결과 정렬\n\n' +
      '【핵심 함정】\n' +
      '- 부서 20에 SCOTT과 FORD의 급여가 동일(3000):\n' +
      '  RANK: 1, 1, 3 (2를 건너뜀)\n' +
      '  DENSE_RANK: 1, 1, 2 (건너뛰지 않음)\n' +
      '- ROW_NUMBER는 동일 값이어도 고유 번호 부여 (1, 2, 3)\n' +
      '- 윈도우함수는 WHERE 절 이후에 실행됨 → WHERE에서 윈도우함수 별칭 사용 불가\n' +
      '- 윈도우함수를 조건으로 쓰려면 인라인 뷰(서브쿼리)로 감싸야 함',
    schemaSQL:
      'CREATE TABLE EMP (EMPNO NUMBER(4) PRIMARY KEY, ENAME VARCHAR2(20) NOT NULL, JOB VARCHAR2(20), MGR NUMBER(4), HIREDATE DATE, SAL NUMBER(7,2), COMM NUMBER(7,2), DEPTNO NUMBER(2));',
    sampleData:
      "INSERT INTO EMP VALUES (7839, 'KING', 'PRESIDENT', NULL, TO_DATE('1981-11-17','YYYY-MM-DD'), 5000, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7782, 'CLARK', 'MANAGER', 7839, TO_DATE('1981-06-09','YYYY-MM-DD'), 2450, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7934, 'MILLER', 'CLERK', 7782, TO_DATE('1982-01-23','YYYY-MM-DD'), 1300, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7566, 'JONES', 'MANAGER', 7839, TO_DATE('1981-04-02','YYYY-MM-DD'), 2975, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7788, 'SCOTT', 'ANALYST', 7566, TO_DATE('1982-12-09','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7902, 'FORD', 'ANALYST', 7566, TO_DATE('1981-12-03','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7369, 'SMITH', 'CLERK', 7902, TO_DATE('1980-12-17','YYYY-MM-DD'), 800, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7698, 'BLAKE', 'MANAGER', 7839, TO_DATE('1981-05-01','YYYY-MM-DD'), 2850, NULL, 30);\n" +
      "INSERT INTO EMP VALUES (7499, 'ALLEN', 'SALESMAN', 7698, TO_DATE('1981-02-20','YYYY-MM-DD'), 1600, 300, 30);\n" +
      "INSERT INTO EMP VALUES (7521, 'WARD', 'SALESMAN', 7698, TO_DATE('1981-02-22','YYYY-MM-DD'), 1250, 500, 30);\n" +
      "INSERT INTO EMP VALUES (7654, 'MARTIN', 'SALESMAN', 7698, TO_DATE('1981-09-28','YYYY-MM-DD'), 1250, 1400, 30);\n" +
      "INSERT INTO EMP VALUES (7844, 'TURNER', 'SALESMAN', 7698, TO_DATE('1981-09-08','YYYY-MM-DD'), 1500, 0, 30);",
    points: 10,
  },
  {
    id: 'sql_hard_05',
    title: 'LAG/LEAD - 이전/다음 사원과의 급여 차이',
    description:
      'EMP 테이블에서 전체 사원을 급여 오름차순으로 정렬한 뒤,\n' +
      '이전 사원(급여가 바로 아래인 사원)과 다음 사원(급여가 바로 위인 사원)의 급여 차이를 구하시오.\n\n' +
      '출력 컬럼: ENAME, SAL, PREV_SAL, NEXT_SAL, DIFF_PREV, DIFF_NEXT\n' +
      '- PREV_SAL: 바로 이전(급여 낮은) 사원의 급여 (없으면 0)\n' +
      '- NEXT_SAL: 바로 다음(급여 높은) 사원의 급여 (없으면 0)\n' +
      '- DIFF_PREV: SAL - PREV_SAL\n' +
      '- DIFF_NEXT: NEXT_SAL - SAL\n' +
      '- 급여 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 30,
    answer:
      'SELECT ENAME, SAL,\n' +
      '       NVL(LAG(SAL) OVER (ORDER BY SAL), 0) AS PREV_SAL,\n' +
      '       NVL(LEAD(SAL) OVER (ORDER BY SAL), 0) AS NEXT_SAL,\n' +
      '       SAL - NVL(LAG(SAL) OVER (ORDER BY SAL), 0) AS DIFF_PREV,\n' +
      '       NVL(LEAD(SAL) OVER (ORDER BY SAL), 0) - SAL AS DIFF_NEXT\n' +
      'FROM EMP\n' +
      'ORDER BY SAL',
    explanation:
      '【실행 순서】\n' +
      '1. FROM EMP → 전체 사원 데이터\n' +
      '2. SELECT → 윈도우함수 계산:\n' +
      '   LAG(SAL) OVER (ORDER BY SAL) → 급여순으로 정렬 후 바로 이전 행의 SAL\n' +
      '   LEAD(SAL) OVER (ORDER BY SAL) → 급여순으로 정렬 후 바로 다음 행의 SAL\n' +
      '3. ORDER BY SAL → 최종 정렬\n\n' +
      '【핵심 함정】\n' +
      '- LAG/LEAD의 기본값: 이전/다음 행이 없으면 NULL 반환\n' +
      '  → NVL로 기본값 0 처리하지 않으면 차이 계산이 NULL이 됨\n' +
      '- LAG(SAL, 1, 0)처럼 세 번째 인수로 기본값을 지정할 수도 있음\n' +
      '- 같은 급여의 사원이 여러 명이면 정렬 순서가 비결정적\n' +
      '  → ENAME 등 추가 정렬 기준을 넣어야 결과가 확정적',
    schemaSQL:
      'CREATE TABLE EMP (EMPNO NUMBER(4) PRIMARY KEY, ENAME VARCHAR2(20) NOT NULL, JOB VARCHAR2(20), MGR NUMBER(4), HIREDATE DATE, SAL NUMBER(7,2), COMM NUMBER(7,2), DEPTNO NUMBER(2));',
    sampleData:
      "INSERT INTO EMP VALUES (7369, 'SMITH', 'CLERK', 7902, TO_DATE('1980-12-17','YYYY-MM-DD'), 800, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7499, 'ALLEN', 'SALESMAN', 7698, TO_DATE('1981-02-20','YYYY-MM-DD'), 1600, 300, 30);\n" +
      "INSERT INTO EMP VALUES (7521, 'WARD', 'SALESMAN', 7698, TO_DATE('1981-02-22','YYYY-MM-DD'), 1250, 500, 30);\n" +
      "INSERT INTO EMP VALUES (7566, 'JONES', 'MANAGER', 7839, TO_DATE('1981-04-02','YYYY-MM-DD'), 2975, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7654, 'MARTIN', 'SALESMAN', 7698, TO_DATE('1981-09-28','YYYY-MM-DD'), 1250, 1400, 30);\n" +
      "INSERT INTO EMP VALUES (7698, 'BLAKE', 'MANAGER', 7839, TO_DATE('1981-05-01','YYYY-MM-DD'), 2850, NULL, 30);\n" +
      "INSERT INTO EMP VALUES (7782, 'CLARK', 'MANAGER', 7839, TO_DATE('1981-06-09','YYYY-MM-DD'), 2450, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7788, 'SCOTT', 'ANALYST', 7566, TO_DATE('1982-12-09','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7839, 'KING', 'PRESIDENT', NULL, TO_DATE('1981-11-17','YYYY-MM-DD'), 5000, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7844, 'TURNER', 'SALESMAN', 7698, TO_DATE('1981-09-08','YYYY-MM-DD'), 1500, 0, 30);\n" +
      "INSERT INTO EMP VALUES (7902, 'FORD', 'ANALYST', 7566, TO_DATE('1981-12-03','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7934, 'MILLER', 'CLERK', 7782, TO_DATE('1982-01-23','YYYY-MM-DD'), 1300, NULL, 10);",
    points: 10,
  },
  {
    id: 'sql_hard_06',
    title: 'NOT IN with NULL 함정 - 관리자가 아닌 사원 조회',
    description:
      'EMP 테이블에서 "다른 사원의 관리자가 아닌 사원"을 조회하시오.\n' +
      '즉, 자신의 EMPNO가 어떤 사원의 MGR 값에도 나타나지 않는 사원을 찾으시오.\n\n' +
      '출력 컬럼: EMPNO, ENAME, JOB\n' +
      '- ENAME 오름차순 정렬\n\n' +
      '⚠ 주의: 아래 쿼리를 실행하면 결과가 0건입니다. 이유를 파악하고 올바른 쿼리를 작성하시오.\n' +
      "SELECT EMPNO, ENAME, JOB FROM EMP WHERE EMPNO NOT IN (SELECT MGR FROM EMP);",
    type: 'sql',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 22,
    answer:
      'SELECT EMPNO, ENAME, JOB\n' +
      'FROM EMP E\n' +
      'WHERE NOT EXISTS (\n' +
      '    SELECT 1 FROM EMP M WHERE M.MGR = E.EMPNO\n' +
      ')\n' +
      'ORDER BY ENAME',
    explanation:
      '【실행 순서】\n' +
      '1. FROM EMP E → 외부 쿼리에서 각 사원을 하나씩 가져옴\n' +
      '2. WHERE NOT EXISTS → 내부 쿼리에서 해당 사원의 EMPNO를 MGR로 가진 행이 있는지 확인\n' +
      '   EXISTS는 행이 존재하면 TRUE → NOT EXISTS는 행이 없으면 TRUE\n' +
      '3. ORDER BY ENAME → 최종 정렬\n\n' +
      '【핵심 함정 — NOT IN과 NULL】\n' +
      '- KING의 MGR은 NULL → SELECT MGR FROM EMP의 결과에 NULL이 포함됨\n' +
      '- NOT IN은 내부적으로 <> ALL로 변환:\n' +
      '  EMPNO <> 7839 AND EMPNO <> 7566 AND ... AND EMPNO <> NULL\n' +
      '- 어떤 값이든 NULL과 비교하면 UNKNOWN → AND 연산에서 UNKNOWN 전파\n' +
      '- 결과적으로 모든 행이 UNKNOWN → 0건 반환\n\n' +
      '【해결법 3가지】\n' +
      '1. NOT EXISTS 사용 (권장) — NULL 영향 없음\n' +
      '2. NOT IN (SELECT MGR FROM EMP WHERE MGR IS NOT NULL) — NULL 제거\n' +
      '3. LEFT JOIN + IS NULL 패턴',
    schemaSQL:
      'CREATE TABLE EMP (EMPNO NUMBER(4) PRIMARY KEY, ENAME VARCHAR2(20) NOT NULL, JOB VARCHAR2(20), MGR NUMBER(4), HIREDATE DATE, SAL NUMBER(7,2), COMM NUMBER(7,2), DEPTNO NUMBER(2));',
    sampleData:
      "INSERT INTO EMP VALUES (7839, 'KING', 'PRESIDENT', NULL, TO_DATE('1981-11-17','YYYY-MM-DD'), 5000, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7566, 'JONES', 'MANAGER', 7839, TO_DATE('1981-04-02','YYYY-MM-DD'), 2975, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7698, 'BLAKE', 'MANAGER', 7839, TO_DATE('1981-05-01','YYYY-MM-DD'), 2850, NULL, 30);\n" +
      "INSERT INTO EMP VALUES (7782, 'CLARK', 'MANAGER', 7839, TO_DATE('1981-06-09','YYYY-MM-DD'), 2450, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7788, 'SCOTT', 'ANALYST', 7566, TO_DATE('1982-12-09','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7902, 'FORD', 'ANALYST', 7566, TO_DATE('1981-12-03','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7499, 'ALLEN', 'SALESMAN', 7698, TO_DATE('1981-02-20','YYYY-MM-DD'), 1600, 300, 30);\n" +
      "INSERT INTO EMP VALUES (7521, 'WARD', 'SALESMAN', 7698, TO_DATE('1981-02-22','YYYY-MM-DD'), 1250, 500, 30);\n" +
      "INSERT INTO EMP VALUES (7654, 'MARTIN', 'SALESMAN', 7698, TO_DATE('1981-09-28','YYYY-MM-DD'), 1250, 1400, 30);\n" +
      "INSERT INTO EMP VALUES (7844, 'TURNER', 'SALESMAN', 7698, TO_DATE('1981-09-08','YYYY-MM-DD'), 1500, 0, 30);\n" +
      "INSERT INTO EMP VALUES (7934, 'MILLER', 'CLERK', 7782, TO_DATE('1982-01-23','YYYY-MM-DD'), 1300, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7369, 'SMITH', 'CLERK', 7902, TO_DATE('1980-12-17','YYYY-MM-DD'), 800, NULL, 20);",
    points: 10,
  },
  {
    id: 'sql_hard_07',
    title: '상관 서브쿼리 - 부서 평균 이상 급여 사원',
    description:
      'EMP 테이블과 DEPT 테이블을 사용하여, 자기 부서의 평균 급여 이상을 받는 사원을 조회하시오.\n\n' +
      '출력 컬럼: DEPTNO, DNAME, ENAME, SAL, DEPT_AVG\n' +
      '- DEPT_AVG: 해당 사원이 속한 부서의 평균 급여 (소수점 2자리 반올림)\n' +
      '- 부서번호 오름차순, 급여 내림차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 33,
    answer:
      'SELECT E.DEPTNO, D.DNAME, E.ENAME, E.SAL,\n' +
      '       ROUND((SELECT AVG(SAL) FROM EMP WHERE DEPTNO = E.DEPTNO), 2) AS DEPT_AVG\n' +
      'FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO\n' +
      'WHERE E.SAL >= (SELECT AVG(SAL) FROM EMP WHERE DEPTNO = E.DEPTNO)\n' +
      'ORDER BY E.DEPTNO, E.SAL DESC',
    explanation:
      '【실행 순서】\n' +
      '1. FROM EMP E JOIN DEPT D → EMP와 DEPT 조인\n' +
      '2. WHERE E.SAL >= (상관 서브쿼리) → 외부 쿼리의 각 행에 대해:\n' +
      '   해당 사원의 DEPTNO와 같은 부서의 평균 급여를 계산하여 비교\n' +
      '3. SELECT → DEPT_AVG도 상관 서브쿼리로 부서 평균 표시\n' +
      '4. ORDER BY → 정렬\n\n' +
      '【핵심 함정】\n' +
      '- 상관 서브쿼리(Correlated Subquery): 외부 쿼리의 행마다 서브쿼리가 실행됨\n' +
      '  WHERE DEPTNO = E.DEPTNO에서 E는 외부 쿼리의 별칭\n' +
      '- 비상관 서브쿼리와 달리 독립적으로 실행 불가\n' +
      '- 대안: 인라인 뷰로 부서별 평균을 미리 구한 후 JOIN\n' +
      '  SELECT E.*, A.DEPT_AVG FROM EMP E\n' +
      '  JOIN (SELECT DEPTNO, ROUND(AVG(SAL),2) DEPT_AVG FROM EMP GROUP BY DEPTNO) A\n' +
      '  ON E.DEPTNO = A.DEPTNO WHERE E.SAL >= A.DEPT_AVG',
    schemaSQL:
      'CREATE TABLE DEPT (DEPTNO NUMBER(2) PRIMARY KEY, DNAME VARCHAR2(20), LOC VARCHAR2(20));\n' +
      'CREATE TABLE EMP (EMPNO NUMBER(4) PRIMARY KEY, ENAME VARCHAR2(20) NOT NULL, JOB VARCHAR2(20), MGR NUMBER(4), HIREDATE DATE, SAL NUMBER(7,2), COMM NUMBER(7,2), DEPTNO NUMBER(2));',
    sampleData:
      "INSERT INTO DEPT VALUES (10, 'ACCOUNTING', 'NEW YORK');\n" +
      "INSERT INTO DEPT VALUES (20, 'RESEARCH', 'DALLAS');\n" +
      "INSERT INTO DEPT VALUES (30, 'SALES', 'CHICAGO');\n" +
      "INSERT INTO EMP VALUES (7839, 'KING', 'PRESIDENT', NULL, TO_DATE('1981-11-17','YYYY-MM-DD'), 5000, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7782, 'CLARK', 'MANAGER', 7839, TO_DATE('1981-06-09','YYYY-MM-DD'), 2450, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7934, 'MILLER', 'CLERK', 7782, TO_DATE('1982-01-23','YYYY-MM-DD'), 1300, NULL, 10);\n" +
      "INSERT INTO EMP VALUES (7566, 'JONES', 'MANAGER', 7839, TO_DATE('1981-04-02','YYYY-MM-DD'), 2975, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7788, 'SCOTT', 'ANALYST', 7566, TO_DATE('1982-12-09','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7902, 'FORD', 'ANALYST', 7566, TO_DATE('1981-12-03','YYYY-MM-DD'), 3000, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7369, 'SMITH', 'CLERK', 7902, TO_DATE('1980-12-17','YYYY-MM-DD'), 800, NULL, 20);\n" +
      "INSERT INTO EMP VALUES (7698, 'BLAKE', 'MANAGER', 7839, TO_DATE('1981-05-01','YYYY-MM-DD'), 2850, NULL, 30);\n" +
      "INSERT INTO EMP VALUES (7499, 'ALLEN', 'SALESMAN', 7698, TO_DATE('1981-02-20','YYYY-MM-DD'), 1600, 300, 30);\n" +
      "INSERT INTO EMP VALUES (7521, 'WARD', 'SALESMAN', 7698, TO_DATE('1981-02-22','YYYY-MM-DD'), 1250, 500, 30);\n" +
      "INSERT INTO EMP VALUES (7844, 'TURNER', 'SALESMAN', 7698, TO_DATE('1981-09-08','YYYY-MM-DD'), 1500, 0, 30);",
    points: 10,
  },

  // ═══════════════════════════════════════════════════════════════════
  // ORDER 테이블셋 (7문제)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'sql_hard_08',
    title: 'CUBE - 다차원 집계',
    description:
      'CUSTOMER, ORDERS, ORDER_DETAIL, PRODUCT 테이블을 조인하여,\n' +
      '고객 등급(GRADE)별, 상품 카테고리(CATEGORY)별 매출 합계(QTY * UNIT_PRICE)를 구하되\n' +
      'CUBE를 사용하여 모든 차원의 조합별 소계를 함께 출력하시오.\n\n' +
      '출력 컬럼: GRADE, CATEGORY, TOTAL_SALES\n' +
      '- GRADE 오름차순, CATEGORY 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '그룹함수',
    correctRate: 29,
    answer:
      'SELECT C.GRADE, P.CATEGORY, SUM(OD.QTY * OD.UNIT_PRICE) AS TOTAL_SALES\n' +
      'FROM CUSTOMER C\n' +
      'JOIN ORDERS O ON C.CUST_ID = O.CUST_ID\n' +
      'JOIN ORDER_DETAIL OD ON O.ORDER_ID = OD.ORDER_ID\n' +
      'JOIN PRODUCT P ON OD.PROD_ID = P.PROD_ID\n' +
      'GROUP BY CUBE(C.GRADE, P.CATEGORY)\n' +
      'ORDER BY C.GRADE, P.CATEGORY',
    explanation:
      '【실행 순서】\n' +
      '1. FROM → 4개 테이블 순차 조인\n' +
      '2. GROUP BY CUBE(GRADE, CATEGORY) → 4가지 그룹 생성:\n' +
      '   (GRADE, CATEGORY) → 등급+카테고리별\n' +
      '   (GRADE)           → 등급별 소계\n' +
      '   (CATEGORY)        → 카테고리별 소계\n' +
      '   ()                → 전체 총계\n' +
      '3. SUM(QTY * UNIT_PRICE) → 각 그룹별 매출 합계\n' +
      '4. ORDER BY → 정렬\n\n' +
      '【핵심 함정 — CUBE vs ROLLUP 차이】\n' +
      '- ROLLUP(A, B): (A,B), (A), () → 3가지 (오른쪽부터 제거)\n' +
      '- CUBE(A, B): (A,B), (A), (B), () → 4가지 (모든 조합)\n' +
      '- CUBE는 2^n개의 그룹 생성 (n=컬럼수)\n' +
      '- CUBE(A,B,C)라면 8가지 그룹이 만들어짐\n' +
      '- 소계 행의 NULL 판별: GROUPING(GRADE) = 1이면 집계에 의한 NULL',
    schemaSQL:
      "CREATE TABLE CUSTOMER (CUST_ID NUMBER PRIMARY KEY, CUST_NAME VARCHAR2(30) NOT NULL, GRADE VARCHAR2(10), CITY VARCHAR2(20), REG_DATE DATE);\n" +
      "CREATE TABLE PRODUCT (PROD_ID NUMBER PRIMARY KEY, PROD_NAME VARCHAR2(50) NOT NULL, CATEGORY VARCHAR2(20), PRICE NUMBER(10,2), STOCK_QTY NUMBER);\n" +
      "CREATE TABLE ORDERS (ORDER_ID NUMBER PRIMARY KEY, CUST_ID NUMBER, ORDER_DATE DATE, TOTAL_AMT NUMBER(12,2), STATUS VARCHAR2(10));\n" +
      "CREATE TABLE ORDER_DETAIL (DETAIL_ID NUMBER PRIMARY KEY, ORDER_ID NUMBER, PROD_ID NUMBER, QTY NUMBER, UNIT_PRICE NUMBER(10,2));",
    sampleData:
      "INSERT INTO CUSTOMER VALUES (1, '김철수', 'VIP', '서울', TO_DATE('2023-01-10','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (2, '이영희', 'GOLD', '부산', TO_DATE('2023-03-15','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (3, '박민수', 'VIP', '서울', TO_DATE('2023-02-20','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (4, '최지은', 'SILVER', '대구', TO_DATE('2023-05-01','YYYY-MM-DD'));\n" +
      "INSERT INTO PRODUCT VALUES (101, '노트북A', '전자기기', 1500000, 50);\n" +
      "INSERT INTO PRODUCT VALUES (102, '마우스B', '전자기기', 35000, 200);\n" +
      "INSERT INTO PRODUCT VALUES (103, '의자C', '가구', 450000, 30);\n" +
      "INSERT INTO PRODUCT VALUES (104, '책상D', '가구', 800000, 20);\n" +
      "INSERT INTO ORDERS VALUES (1001, 1, TO_DATE('2024-01-05','YYYY-MM-DD'), 1535000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1002, 2, TO_DATE('2024-01-10','YYYY-MM-DD'), 450000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1003, 3, TO_DATE('2024-02-01','YYYY-MM-DD'), 1500000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1004, 4, TO_DATE('2024-02-15','YYYY-MM-DD'), 35000, '배송중');\n" +
      "INSERT INTO ORDER_DETAIL VALUES (1, 1001, 101, 1, 1500000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (2, 1001, 102, 1, 35000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (3, 1002, 103, 1, 450000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (4, 1003, 101, 1, 1500000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (5, 1004, 102, 1, 35000);",
    points: 10,
  },
  {
    id: 'sql_hard_09',
    title: 'GROUPING SETS - 선택적 그룹 조합',
    description:
      'CUSTOMER, ORDERS 테이블을 조인하여 다음 세 가지 집계를 한 번의 쿼리로 출력하시오.\n\n' +
      '1) 고객 등급(GRADE)별 주문건수와 총 주문금액\n' +
      '2) 주문 상태(STATUS)별 주문건수와 총 주문금액\n' +
      '3) 전체 주문건수와 총 주문금액\n\n' +
      '출력 컬럼: GRADE, STATUS, ORDER_CNT, TOTAL_AMT\n' +
      '- GROUPING SETS를 사용하시오\n' +
      '- GRADE 오름차순, STATUS 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '그룹함수',
    correctRate: 26,
    answer:
      'SELECT C.GRADE, O.STATUS, COUNT(*) AS ORDER_CNT, SUM(O.TOTAL_AMT) AS TOTAL_AMT\n' +
      'FROM CUSTOMER C JOIN ORDERS O ON C.CUST_ID = O.CUST_ID\n' +
      'GROUP BY GROUPING SETS ((C.GRADE), (O.STATUS), ())\n' +
      'ORDER BY C.GRADE, O.STATUS',
    explanation:
      '【실행 순서】\n' +
      '1. FROM CUSTOMER C JOIN ORDERS O → 두 테이블 조인\n' +
      '2. GROUP BY GROUPING SETS ((GRADE), (STATUS), ()) → 지정한 3가지 그룹만 생성:\n' +
      '   (GRADE)  → 등급별 집계 (STATUS는 NULL)\n' +
      '   (STATUS) → 상태별 집계 (GRADE는 NULL)\n' +
      '   ()       → 전체 집계 (둘 다 NULL)\n' +
      '3. COUNT(*), SUM(TOTAL_AMT) → 각 그룹별 집계\n\n' +
      '【핵심 함정 — GROUPING SETS vs ROLLUP/CUBE】\n' +
      '- ROLLUP(A, B): 반드시 오른쪽부터 제거 → (A,B), (A), ()\n' +
      '- CUBE(A, B): 모든 조합 → (A,B), (A), (B), ()\n' +
      '- GROUPING SETS: 원하는 조합만 직접 지정 → 가장 유연함\n' +
      '- 이 문제에서 (GRADE, STATUS) 조합은 필요 없으므로 CUBE/ROLLUP으로는 불필요한 행이 나옴\n' +
      '- GROUPING SETS ((A), (B), ())는 ROLLUP이나 CUBE로 정확히 표현 불가',
    schemaSQL:
      "CREATE TABLE CUSTOMER (CUST_ID NUMBER PRIMARY KEY, CUST_NAME VARCHAR2(30) NOT NULL, GRADE VARCHAR2(10), CITY VARCHAR2(20), REG_DATE DATE);\n" +
      "CREATE TABLE ORDERS (ORDER_ID NUMBER PRIMARY KEY, CUST_ID NUMBER, ORDER_DATE DATE, TOTAL_AMT NUMBER(12,2), STATUS VARCHAR2(10));",
    sampleData:
      "INSERT INTO CUSTOMER VALUES (1, '김철수', 'VIP', '서울', TO_DATE('2023-01-10','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (2, '이영희', 'GOLD', '부산', TO_DATE('2023-03-15','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (3, '박민수', 'VIP', '서울', TO_DATE('2023-02-20','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (4, '최지은', 'SILVER', '대구', TO_DATE('2023-05-01','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (5, '정하나', 'GOLD', '인천', TO_DATE('2023-06-11','YYYY-MM-DD'));\n" +
      "INSERT INTO ORDERS VALUES (1001, 1, TO_DATE('2024-01-05','YYYY-MM-DD'), 1535000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1002, 2, TO_DATE('2024-01-10','YYYY-MM-DD'), 450000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1003, 1, TO_DATE('2024-02-01','YYYY-MM-DD'), 800000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1004, 3, TO_DATE('2024-02-15','YYYY-MM-DD'), 1500000, '배송중');\n" +
      "INSERT INTO ORDERS VALUES (1005, 4, TO_DATE('2024-03-01','YYYY-MM-DD'), 35000, '배송중');\n" +
      "INSERT INTO ORDERS VALUES (1006, 2, TO_DATE('2024-03-10','YYYY-MM-DD'), 250000, '취소');\n" +
      "INSERT INTO ORDERS VALUES (1007, 5, TO_DATE('2024-03-15','YYYY-MM-DD'), 120000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1008, 3, TO_DATE('2024-04-01','YYYY-MM-DD'), 950000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1009, 1, TO_DATE('2024-04-10','YYYY-MM-DD'), 75000, '취소');",
    points: 10,
  },
  {
    id: 'sql_hard_10',
    title: 'DENSE_RANK + PARTITION BY - 카테고리별 매출 TOP 상품',
    description:
      'ORDER_DETAIL과 PRODUCT 테이블을 조인하여, 상품 카테고리별 총 판매수량이 가장 많은 상품을 조회하시오.\n\n' +
      '출력 컬럼: CATEGORY, PROD_NAME, TOTAL_QTY, RNK\n' +
      '- DENSE_RANK를 사용하여 카테고리별 총 판매수량 내림차순 순위(RNK) 부여\n' +
      '- RNK = 1인 행만 출력 (카테고리별 1위 상품)\n' +
      '- CATEGORY 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 34,
    answer:
      'SELECT CATEGORY, PROD_NAME, TOTAL_QTY, RNK\n' +
      'FROM (\n' +
      '    SELECT P.CATEGORY, P.PROD_NAME, SUM(OD.QTY) AS TOTAL_QTY,\n' +
      '           DENSE_RANK() OVER (PARTITION BY P.CATEGORY ORDER BY SUM(OD.QTY) DESC) AS RNK\n' +
      '    FROM ORDER_DETAIL OD JOIN PRODUCT P ON OD.PROD_ID = P.PROD_ID\n' +
      '    GROUP BY P.CATEGORY, P.PROD_NAME\n' +
      ')\n' +
      'WHERE RNK = 1\n' +
      'ORDER BY CATEGORY',
    explanation:
      '【실행 순서】\n' +
      '1. 인라인 뷰 내부:\n' +
      '   FROM ORDER_DETAIL OD JOIN PRODUCT P → 조인\n' +
      '   GROUP BY CATEGORY, PROD_NAME → 카테고리+상품별 그룹핑\n' +
      '   SUM(QTY) → 상품별 총 판매수량\n' +
      '   DENSE_RANK() OVER (PARTITION BY CATEGORY ORDER BY SUM(QTY) DESC) → 카테고리 내 순위\n' +
      '2. 외부 쿼리: WHERE RNK = 1 → 1위만 필터링\n' +
      '3. ORDER BY CATEGORY → 정렬\n\n' +
      '【핵심 함정】\n' +
      '- 윈도우함수는 WHERE에서 직접 사용 불가 → 반드시 인라인 뷰 필요\n' +
      '  잘못된 예: WHERE DENSE_RANK() OVER (...) = 1 → 오류 발생\n' +
      '- GROUP BY와 윈도우함수 함께 쓸 때: 윈도우함수의 ORDER BY에 집계함수(SUM) 사용 가능\n' +
      '  이는 윈도우함수가 GROUP BY 이후에 실행되기 때문\n' +
      '- DENSE_RANK 사용 이유: 동일 수량이면 공동 1위 → 모두 출력',
    schemaSQL:
      "CREATE TABLE PRODUCT (PROD_ID NUMBER PRIMARY KEY, PROD_NAME VARCHAR2(50) NOT NULL, CATEGORY VARCHAR2(20), PRICE NUMBER(10,2), STOCK_QTY NUMBER);\n" +
      "CREATE TABLE ORDER_DETAIL (DETAIL_ID NUMBER PRIMARY KEY, ORDER_ID NUMBER, PROD_ID NUMBER, QTY NUMBER, UNIT_PRICE NUMBER(10,2));",
    sampleData:
      "INSERT INTO PRODUCT VALUES (101, '노트북A', '전자기기', 1500000, 50);\n" +
      "INSERT INTO PRODUCT VALUES (102, '마우스B', '전자기기', 35000, 200);\n" +
      "INSERT INTO PRODUCT VALUES (103, '키보드C', '전자기기', 85000, 150);\n" +
      "INSERT INTO PRODUCT VALUES (104, '의자D', '가구', 450000, 30);\n" +
      "INSERT INTO PRODUCT VALUES (105, '책상E', '가구', 800000, 20);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (1, 1001, 101, 2, 1500000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (2, 1001, 102, 5, 35000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (3, 1002, 103, 3, 85000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (4, 1002, 104, 1, 450000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (5, 1003, 101, 1, 1500000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (6, 1003, 102, 5, 35000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (7, 1004, 105, 2, 800000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (8, 1004, 103, 3, 85000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (9, 1005, 104, 2, 450000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (10, 1005, 102, 2, 35000);",
    points: 10,
  },
  {
    id: 'sql_hard_11',
    title: 'SUM OVER (ROWS BETWEEN) - 누적 매출 합계',
    description:
      'ORDERS 테이블에서 주문일(ORDER_DATE) 순서대로 누적 매출 합계를 구하시오.\n\n' +
      '출력 컬럼: ORDER_ID, ORDER_DATE, TOTAL_AMT, CUMULATIVE_AMT\n' +
      '- CUMULATIVE_AMT: 첫 번째 주문부터 현재 주문까지의 TOTAL_AMT 누적 합계\n' +
      '- SUM OVER 윈도우함수와 ROWS BETWEEN 절을 사용하시오\n' +
      '- ORDER_DATE 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 31,
    answer:
      'SELECT ORDER_ID, ORDER_DATE, TOTAL_AMT,\n' +
      '       SUM(TOTAL_AMT) OVER (ORDER BY ORDER_DATE ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS CUMULATIVE_AMT\n' +
      'FROM ORDERS\n' +
      'ORDER BY ORDER_DATE',
    explanation:
      '【실행 순서】\n' +
      '1. FROM ORDERS → 전체 주문 데이터\n' +
      '2. SELECT → 윈도우함수 계산:\n' +
      '   SUM(TOTAL_AMT) OVER (\n' +
      '     ORDER BY ORDER_DATE\n' +
      '     ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n' +
      '   )\n' +
      '   → 정렬 후 맨 처음 행부터 현재 행까지 합계\n' +
      '3. ORDER BY ORDER_DATE → 최종 정렬\n\n' +
      '【핵심 함정 — ROWS vs RANGE】\n' +
      '- ROWS BETWEEN: 물리적 행 단위 (동일 값이어도 별도 행으로 취급)\n' +
      '- RANGE BETWEEN: 논리적 값 단위 (동일 값은 같은 그룹으로 취급)\n' +
      '- ORDER BY만 쓰고 ROWS/RANGE를 생략하면 기본값은:\n' +
      '  RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n' +
      '  → 같은 ORDER_DATE의 주문이 여러 건이면 동시에 합산됨\n' +
      '- 엄밀한 행 단위 누적합을 원하면 반드시 ROWS 명시 필요\n' +
      '- UNBOUNDED PRECEDING = 파티션 첫 행, CURRENT ROW = 현재 행',
    schemaSQL:
      "CREATE TABLE ORDERS (ORDER_ID NUMBER PRIMARY KEY, CUST_ID NUMBER, ORDER_DATE DATE, TOTAL_AMT NUMBER(12,2), STATUS VARCHAR2(10));",
    sampleData:
      "INSERT INTO ORDERS VALUES (1001, 1, TO_DATE('2024-01-05','YYYY-MM-DD'), 1535000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1002, 2, TO_DATE('2024-01-10','YYYY-MM-DD'), 450000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1003, 3, TO_DATE('2024-01-10','YYYY-MM-DD'), 800000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1004, 1, TO_DATE('2024-02-01','YYYY-MM-DD'), 1500000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1005, 4, TO_DATE('2024-02-15','YYYY-MM-DD'), 35000, '배송중');\n" +
      "INSERT INTO ORDERS VALUES (1006, 2, TO_DATE('2024-03-01','YYYY-MM-DD'), 250000, '취소');\n" +
      "INSERT INTO ORDERS VALUES (1007, 5, TO_DATE('2024-03-15','YYYY-MM-DD'), 120000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1008, 3, TO_DATE('2024-04-01','YYYY-MM-DD'), 950000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1009, 1, TO_DATE('2024-04-10','YYYY-MM-DD'), 75000, '취소');\n" +
      "INSERT INTO ORDERS VALUES (1010, 4, TO_DATE('2024-04-10','YYYY-MM-DD'), 320000, '배송중');",
    points: 10,
  },
  {
    id: 'sql_hard_12',
    title: '복합 서브쿼리 - 카테고리별 최다 판매 상품',
    description:
      'ORDER_DETAIL과 PRODUCT 테이블을 사용하여, 각 카테고리에서 총 판매수량이 가장 많은 상품의\n' +
      '카테고리명, 상품명, 총 판매수량을 조회하시오.\n\n' +
      '출력 컬럼: CATEGORY, PROD_NAME, TOTAL_QTY\n' +
      '- 인라인 뷰와 상관 서브쿼리를 결합하여 작성하시오\n' +
      '- 윈도우함수(RANK, DENSE_RANK 등)를 사용하지 않고 순수 서브쿼리만으로 해결\n' +
      '- CATEGORY 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 25,
    answer:
      'SELECT A.CATEGORY, A.PROD_NAME, A.TOTAL_QTY\n' +
      'FROM (\n' +
      '    SELECT P.CATEGORY, P.PROD_NAME, SUM(OD.QTY) AS TOTAL_QTY\n' +
      '    FROM ORDER_DETAIL OD JOIN PRODUCT P ON OD.PROD_ID = P.PROD_ID\n' +
      '    GROUP BY P.CATEGORY, P.PROD_NAME\n' +
      ') A\n' +
      'WHERE A.TOTAL_QTY = (\n' +
      '    SELECT MAX(B.TOTAL_QTY)\n' +
      '    FROM (\n' +
      '        SELECT P2.CATEGORY, SUM(OD2.QTY) AS TOTAL_QTY\n' +
      '        FROM ORDER_DETAIL OD2 JOIN PRODUCT P2 ON OD2.PROD_ID = P2.PROD_ID\n' +
      '        GROUP BY P2.CATEGORY, P2.PROD_NAME\n' +
      '    ) B\n' +
      '    WHERE B.CATEGORY = A.CATEGORY\n' +
      ')\n' +
      'ORDER BY A.CATEGORY',
    explanation:
      '【실행 순서】\n' +
      '1. 인라인 뷰 A:\n' +
      '   FROM ORDER_DETAIL OD JOIN PRODUCT P → 조인\n' +
      '   GROUP BY CATEGORY, PROD_NAME → 상품별 그룹핑\n' +
      '   SUM(QTY) AS TOTAL_QTY → 상품별 총 판매수량\n' +
      '2. WHERE 상관 서브쿼리:\n' +
      '   인라인 뷰 B에서 같은 카테고리(B.CATEGORY = A.CATEGORY)의 MAX(TOTAL_QTY) 구함\n' +
      '   A.TOTAL_QTY가 해당 카테고리 최대값과 같은 행만 선택\n' +
      '3. ORDER BY → 정렬\n\n' +
      '【핵심 함정】\n' +
      '- 인라인 뷰 안에서 GROUP BY한 결과에 대해 상관 서브쿼리 적용\n' +
      '  → 집계 결과에 다시 집계(MAX)를 적용하는 2단계 구조\n' +
      '- 서브쿼리 내에서 외부 인라인 뷰의 별칭(A.CATEGORY) 참조 → 상관 서브쿼리\n' +
      '- 동일 최대 수량이 여러 상품이면 모두 출력됨 (공동 1위 허용)',
    schemaSQL:
      "CREATE TABLE PRODUCT (PROD_ID NUMBER PRIMARY KEY, PROD_NAME VARCHAR2(50) NOT NULL, CATEGORY VARCHAR2(20), PRICE NUMBER(10,2), STOCK_QTY NUMBER);\n" +
      "CREATE TABLE ORDER_DETAIL (DETAIL_ID NUMBER PRIMARY KEY, ORDER_ID NUMBER, PROD_ID NUMBER, QTY NUMBER, UNIT_PRICE NUMBER(10,2));",
    sampleData:
      "INSERT INTO PRODUCT VALUES (101, '노트북A', '전자기기', 1500000, 50);\n" +
      "INSERT INTO PRODUCT VALUES (102, '마우스B', '전자기기', 35000, 200);\n" +
      "INSERT INTO PRODUCT VALUES (103, '키보드C', '전자기기', 85000, 150);\n" +
      "INSERT INTO PRODUCT VALUES (104, '의자D', '가구', 450000, 30);\n" +
      "INSERT INTO PRODUCT VALUES (105, '책상E', '가구', 800000, 20);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (1, 1001, 101, 2, 1500000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (2, 1001, 102, 5, 35000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (3, 1002, 103, 3, 85000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (4, 1002, 104, 1, 450000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (5, 1003, 101, 1, 1500000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (6, 1003, 102, 5, 35000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (7, 1004, 105, 2, 800000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (8, 1004, 103, 3, 85000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (9, 1005, 104, 2, 450000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (10, 1005, 102, 2, 35000);",
    points: 10,
  },
  {
    id: 'sql_hard_13',
    title: 'MINUS - 완료된 주문이 없는 고객',
    description:
      'CUSTOMER와 ORDERS 테이블을 사용하여,\n' +
      "주문한 적은 있지만 '완료' 상태의 주문은 한 건도 없는 고객을 조회하시오.\n\n" +
      '출력 컬럼: CUST_ID, CUST_NAME\n' +
      '- MINUS 집합연산자를 사용하시오\n' +
      '- CUST_ID 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '집합연산자',
    correctRate: 36,
    answer:
      'SELECT C.CUST_ID, C.CUST_NAME\n' +
      'FROM CUSTOMER C JOIN ORDERS O ON C.CUST_ID = O.CUST_ID\n' +
      'GROUP BY C.CUST_ID, C.CUST_NAME\n' +
      'MINUS\n' +
      'SELECT C.CUST_ID, C.CUST_NAME\n' +
      "FROM CUSTOMER C JOIN ORDERS O ON C.CUST_ID = O.CUST_ID\n" +
      "WHERE O.STATUS = '완료'\n" +
      'GROUP BY C.CUST_ID, C.CUST_NAME\n' +
      'ORDER BY CUST_ID',
    explanation:
      '【실행 순서】\n' +
      '1. 첫 번째 SELECT: 주문이 있는 모든 고객 (CUST_ID, CUST_NAME)\n' +
      "2. 두 번째 SELECT: '완료' 상태 주문이 있는 고객\n" +
      '3. MINUS: 첫 번째 집합에서 두 번째 집합 제거\n' +
      '   → 주문은 있지만 완료 주문이 없는 고객만 남음\n' +
      '4. ORDER BY → 정렬 (MINUS 후 마지막에 적용)\n\n' +
      '【핵심 함정 — 집합연산자 규칙】\n' +
      '- MINUS는 Oracle 전용 (표준 SQL은 EXCEPT)\n' +
      '- 집합연산자는 컬럼 수와 데이터 타입이 일치해야 함\n' +
      '- ORDER BY는 마지막 SELECT 뒤에만 작성 가능\n' +
      '- MINUS는 자동으로 중복 제거 (DISTINCT 효과)\n' +
      '- 주의: 주문 자체가 없는 고객은 첫 번째 SELECT에서도 나오지 않으므로 결과에 포함되지 않음\n' +
      '  → 주문 없는 고객까지 포함하려면 LEFT JOIN 필요',
    schemaSQL:
      "CREATE TABLE CUSTOMER (CUST_ID NUMBER PRIMARY KEY, CUST_NAME VARCHAR2(30) NOT NULL, GRADE VARCHAR2(10), CITY VARCHAR2(20), REG_DATE DATE);\n" +
      "CREATE TABLE ORDERS (ORDER_ID NUMBER PRIMARY KEY, CUST_ID NUMBER, ORDER_DATE DATE, TOTAL_AMT NUMBER(12,2), STATUS VARCHAR2(10));",
    sampleData:
      "INSERT INTO CUSTOMER VALUES (1, '김철수', 'VIP', '서울', TO_DATE('2023-01-10','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (2, '이영희', 'GOLD', '부산', TO_DATE('2023-03-15','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (3, '박민수', 'VIP', '서울', TO_DATE('2023-02-20','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (4, '최지은', 'SILVER', '대구', TO_DATE('2023-05-01','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (5, '정하나', 'GOLD', '인천', TO_DATE('2023-06-11','YYYY-MM-DD'));\n" +
      "INSERT INTO ORDERS VALUES (1001, 1, TO_DATE('2024-01-05','YYYY-MM-DD'), 1535000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1002, 2, TO_DATE('2024-01-10','YYYY-MM-DD'), 450000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1003, 3, TO_DATE('2024-02-01','YYYY-MM-DD'), 1500000, '배송중');\n" +
      "INSERT INTO ORDERS VALUES (1004, 4, TO_DATE('2024-02-15','YYYY-MM-DD'), 35000, '배송중');\n" +
      "INSERT INTO ORDERS VALUES (1005, 4, TO_DATE('2024-03-01','YYYY-MM-DD'), 120000, '취소');\n" +
      "INSERT INTO ORDERS VALUES (1006, 3, TO_DATE('2024-03-10','YYYY-MM-DD'), 250000, '취소');",
    points: 10,
  },
  {
    id: 'sql_hard_14',
    title: 'LEFT OUTER JOIN + WHERE 함정',
    description:
      'CUSTOMER와 ORDERS, ORDER_DETAIL, PRODUCT 테이블을 사용하여,\n' +
      "모든 고객의 '전자기기' 카테고리 구매 내역을 조회하시오.\n\n" +
      '출력 컬럼: CUST_NAME, PROD_NAME, QTY\n' +
      '- 전자기기를 구매하지 않은 고객도 반드시 출력 (PROD_NAME, QTY는 NULL)\n' +
      '- CUST_NAME 오름차순 정렬\n\n' +
      '⚠ 주의: 아래 쿼리를 실행하면 전자기기를 구매하지 않은 고객이 누락됩니다. 이유를 파악하고 올바른 쿼리를 작성하시오.\n' +
      'SELECT C.CUST_NAME, P.PROD_NAME, OD.QTY\n' +
      'FROM CUSTOMER C\n' +
      'LEFT JOIN ORDERS O ON C.CUST_ID = O.CUST_ID\n' +
      'LEFT JOIN ORDER_DETAIL OD ON O.ORDER_ID = OD.ORDER_ID\n' +
      'LEFT JOIN PRODUCT P ON OD.PROD_ID = P.PROD_ID\n' +
      "WHERE P.CATEGORY = '전자기기'\n" +
      'ORDER BY C.CUST_NAME;',
    type: 'sql',
    difficulty: 'hard',
    category: 'JOIN',
    correctRate: 24,
    answer:
      'SELECT C.CUST_NAME, P.PROD_NAME, OD.QTY\n' +
      'FROM CUSTOMER C\n' +
      'LEFT JOIN ORDERS O ON C.CUST_ID = O.CUST_ID\n' +
      'LEFT JOIN ORDER_DETAIL OD ON O.ORDER_ID = OD.ORDER_ID\n' +
      "LEFT JOIN PRODUCT P ON OD.PROD_ID = P.PROD_ID AND P.CATEGORY = '전자기기'\n" +
      'ORDER BY C.CUST_NAME',
    explanation:
      '【실행 순서】\n' +
      '1. FROM CUSTOMER C → 기준 테이블\n' +
      '2. LEFT JOIN ORDERS O → 주문이 없는 고객도 포함\n' +
      '3. LEFT JOIN ORDER_DETAIL OD → 주문상세 연결\n' +
      "4. LEFT JOIN PRODUCT P ON OD.PROD_ID = P.PROD_ID AND P.CATEGORY = '전자기기'\n" +
      '   → ON절에 카테고리 조건 포함! 전자기기가 아니면 P 컬럼이 NULL\n' +
      '5. ORDER BY → 정렬\n\n' +
      '【핵심 함정 — WHERE vs ON 조건 위치】\n' +
      "- 잘못된 쿼리: WHERE P.CATEGORY = '전자기기'\n" +
      '  → LEFT JOIN으로 NULL이 된 행에서 NULL = \'전자기기\'는 FALSE\n' +
      '  → 주문이 없거나 전자기기 외 상품만 구매한 고객이 모두 제거됨\n' +
      '  → 사실상 INNER JOIN과 동일한 결과\n\n' +
      "- 올바른 방법: ON절에 P.CATEGORY = '전자기기' 추가\n" +
      '  → LEFT JOIN의 매칭 조건에 포함되므로, 조건 불일치 시 NULL로 보존\n' +
      '  → 전자기기를 사지 않은 고객도 결과에 남음\n\n' +
      '- 이것은 OUTER JOIN에서 가장 빈번한 실수 유형임',
    schemaSQL:
      "CREATE TABLE CUSTOMER (CUST_ID NUMBER PRIMARY KEY, CUST_NAME VARCHAR2(30) NOT NULL, GRADE VARCHAR2(10), CITY VARCHAR2(20), REG_DATE DATE);\n" +
      "CREATE TABLE PRODUCT (PROD_ID NUMBER PRIMARY KEY, PROD_NAME VARCHAR2(50) NOT NULL, CATEGORY VARCHAR2(20), PRICE NUMBER(10,2), STOCK_QTY NUMBER);\n" +
      "CREATE TABLE ORDERS (ORDER_ID NUMBER PRIMARY KEY, CUST_ID NUMBER, ORDER_DATE DATE, TOTAL_AMT NUMBER(12,2), STATUS VARCHAR2(10));\n" +
      "CREATE TABLE ORDER_DETAIL (DETAIL_ID NUMBER PRIMARY KEY, ORDER_ID NUMBER, PROD_ID NUMBER, QTY NUMBER, UNIT_PRICE NUMBER(10,2));",
    sampleData:
      "INSERT INTO CUSTOMER VALUES (1, '김철수', 'VIP', '서울', TO_DATE('2023-01-10','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (2, '이영희', 'GOLD', '부산', TO_DATE('2023-03-15','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (3, '박민수', 'VIP', '서울', TO_DATE('2023-02-20','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (4, '최지은', 'SILVER', '대구', TO_DATE('2023-05-01','YYYY-MM-DD'));\n" +
      "INSERT INTO CUSTOMER VALUES (5, '정하나', 'GOLD', '인천', TO_DATE('2023-06-11','YYYY-MM-DD'));\n" +
      "INSERT INTO PRODUCT VALUES (101, '노트북A', '전자기기', 1500000, 50);\n" +
      "INSERT INTO PRODUCT VALUES (102, '마우스B', '전자기기', 35000, 200);\n" +
      "INSERT INTO PRODUCT VALUES (103, '의자C', '가구', 450000, 30);\n" +
      "INSERT INTO PRODUCT VALUES (104, '책상D', '가구', 800000, 20);\n" +
      "INSERT INTO ORDERS VALUES (1001, 1, TO_DATE('2024-01-05','YYYY-MM-DD'), 1535000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1002, 2, TO_DATE('2024-01-10','YYYY-MM-DD'), 450000, '완료');\n" +
      "INSERT INTO ORDERS VALUES (1003, 3, TO_DATE('2024-02-01','YYYY-MM-DD'), 800000, '완료');\n" +
      "INSERT INTO ORDER_DETAIL VALUES (1, 1001, 101, 1, 1500000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (2, 1001, 102, 1, 35000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (3, 1002, 103, 1, 450000);\n" +
      "INSERT INTO ORDER_DETAIL VALUES (4, 1003, 104, 1, 800000);",
    points: 10,
  },

  // ═══════════════════════════════════════════════════════════════════
  // STUDENT 테이블셋 (6문제)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'sql_hard_15',
    title: 'ROLLUP + GROUPING - 학과별 학기별 평균 성적',
    description:
      'ENROLLMENT 테이블과 STUDENT 테이블을 조인하여,\n' +
      '학과(DEPT_NAME)별, 학기(SEMESTER)별 평균 성적(SCORE)을 구하고\n' +
      'ROLLUP으로 학과별 소계와 전체 총계를 포함하시오.\n\n' +
      '출력 컬럼: DEPT_NAME, SEMESTER, AVG_SCORE, IS_SUBTOTAL\n' +
      '- AVG_SCORE: 소수점 1자리 반올림\n' +
      "- IS_SUBTOTAL: GROUPING(SEMESTER)의 값 (0=일반행, 1=소계/총계 행)\n" +
      '- DEPT_NAME 오름차순, SEMESTER 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '그룹함수',
    correctRate: 33,
    answer:
      'SELECT S.DEPT_NAME, E.SEMESTER, ROUND(AVG(E.SCORE), 1) AS AVG_SCORE,\n' +
      '       GROUPING(E.SEMESTER) AS IS_SUBTOTAL\n' +
      'FROM ENROLLMENT E JOIN STUDENT S ON E.STU_ID = S.STU_ID\n' +
      'GROUP BY ROLLUP(S.DEPT_NAME, E.SEMESTER)\n' +
      'ORDER BY S.DEPT_NAME, E.SEMESTER',
    explanation:
      '【실행 순서】\n' +
      '1. FROM ENROLLMENT E JOIN STUDENT S → 수강 + 학생 조인\n' +
      '2. GROUP BY ROLLUP(DEPT_NAME, SEMESTER) → 3가지 그룹:\n' +
      '   (DEPT_NAME, SEMESTER) → 학과+학기별\n' +
      '   (DEPT_NAME)          → 학과별 소계\n' +
      '   ()                   → 전체 총계\n' +
      '3. AVG(SCORE) → 평균 계산, GROUPING(SEMESTER) → 소계 여부 판별\n' +
      '4. ORDER BY → 정렬\n\n' +
      '【핵심 함정】\n' +
      '- GROUPING 함수: 해당 컬럼이 집계에 의해 NULL이면 1, 실제 값이면 0\n' +
      '- 소계 행: GROUPING(SEMESTER) = 1, GROUPING(DEPT_NAME) = 0\n' +
      '- 총계 행: GROUPING(SEMESTER) = 1, GROUPING(DEPT_NAME) = 1\n' +
      '- AVG는 NULL을 자동으로 제외하고 계산함 (이 문제에서는 SCORE가 NULL인 행 주의)\n' +
      '- ROLLUP의 괄호 순서가 중요: ROLLUP(A, B) ≠ ROLLUP(B, A)',
    schemaSQL:
      "CREATE TABLE STUDENT (STU_ID NUMBER PRIMARY KEY, STU_NAME VARCHAR2(30) NOT NULL, DEPT_NAME VARCHAR2(30), GRADE NUMBER(1), ADVISOR_ID NUMBER, ENT_DATE DATE);\n" +
      "CREATE TABLE ENROLLMENT (ENROLL_ID NUMBER PRIMARY KEY, STU_ID NUMBER, COURSE_ID VARCHAR2(10), SEMESTER VARCHAR2(10), SCORE NUMBER(3), GRADE VARCHAR2(2));",
    sampleData:
      "INSERT INTO STUDENT VALUES (1001, '홍길동', '컴퓨터공학', 3, 101, TO_DATE('2022-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1002, '김영수', '컴퓨터공학', 2, 101, TO_DATE('2023-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1003, '이수진', '경영학', 4, 102, TO_DATE('2021-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1004, '박지민', '경영학', 1, 102, TO_DATE('2024-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1005, '최유리', '수학', 3, 103, TO_DATE('2022-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO ENROLLMENT VALUES (1, 1001, 'CS101', '2024-1', 92, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (2, 1001, 'CS102', '2024-2', 85, 'B+');\n" +
      "INSERT INTO ENROLLMENT VALUES (3, 1002, 'CS101', '2024-1', 78, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (4, 1002, 'CS102', '2024-2', 88, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (5, 1003, 'BA201', '2024-1', 95, 'A+');\n" +
      "INSERT INTO ENROLLMENT VALUES (6, 1003, 'BA202', '2024-2', 80, 'B+');\n" +
      "INSERT INTO ENROLLMENT VALUES (7, 1004, 'BA201', '2024-1', 72, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (8, 1005, 'MA301', '2024-1', 90, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (9, 1005, 'MA302', '2024-2', 65, 'C+');\n" +
      "INSERT INTO ENROLLMENT VALUES (10, 1001, 'MA301', '2024-1', 88, 'A');",
    points: 10,
  },
  {
    id: 'sql_hard_16',
    title: '다중 윈도우함수 - 학과별 성적 순위와 누적 비율',
    description:
      'ENROLLMENT과 STUDENT 테이블을 조인하여,\n' +
      '학과별로 학생들의 총 평균성적을 구하고 순위와 누적 비율을 계산하시오.\n\n' +
      '출력 컬럼: DEPT_NAME, STU_NAME, AVG_SCORE, RANK_VAL, CUM_RATIO\n' +
      '- AVG_SCORE: 학생별 전과목 평균성적 (소수점 1자리 반올림)\n' +
      '- RANK_VAL: 학과 내 평균성적 내림차순 RANK\n' +
      '- CUM_RATIO: 학과 내 누적 인원 비율 (CUME_DIST 사용, 소수점 2자리 반올림)\n' +
      '- DEPT_NAME 오름차순, RANK_VAL 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '윈도우함수',
    correctRate: 27,
    answer:
      'SELECT DEPT_NAME, STU_NAME, AVG_SCORE,\n' +
      '       RANK() OVER (PARTITION BY DEPT_NAME ORDER BY AVG_SCORE DESC) AS RANK_VAL,\n' +
      '       ROUND(CUME_DIST() OVER (PARTITION BY DEPT_NAME ORDER BY AVG_SCORE DESC), 2) AS CUM_RATIO\n' +
      'FROM (\n' +
      '    SELECT S.DEPT_NAME, S.STU_NAME, ROUND(AVG(E.SCORE), 1) AS AVG_SCORE\n' +
      '    FROM ENROLLMENT E JOIN STUDENT S ON E.STU_ID = S.STU_ID\n' +
      '    GROUP BY S.DEPT_NAME, S.STU_NAME\n' +
      ')\n' +
      'ORDER BY DEPT_NAME, RANK_VAL',
    explanation:
      '【실행 순서】\n' +
      '1. 인라인 뷰:\n' +
      '   FROM ENROLLMENT E JOIN STUDENT S → 수강+학생 조인\n' +
      '   GROUP BY DEPT_NAME, STU_NAME → 학생별 그룹핑\n' +
      '   AVG(SCORE) → 학생별 평균성적\n' +
      '2. 외부 쿼리:\n' +
      '   RANK() OVER → 학과 내 순위\n' +
      '   CUME_DIST() OVER → 학과 내 누적분포\n' +
      '3. ORDER BY → 정렬\n\n' +
      '【핵심 함정 — CUME_DIST 계산 방식】\n' +
      '- CUME_DIST = 현재 행의 순위 이하 행 수 / 전체 행 수\n' +
      '  공식: (현재 행의 RANK) / (파티션 내 총 행 수)\n' +
      '- 예: 3명 중 1위 → 1/3 = 0.33, 2위 → 2/3 = 0.67, 3위 → 3/3 = 1.00\n' +
      '- PERCENT_RANK는 (순위-1)/(총행수-1)로 계산 → 1위가 0, 꼴등이 1\n' +
      '- GROUP BY 결과에 윈도우함수를 적용하려면 인라인 뷰 필수\n' +
      '  (같은 SELECT에서 GROUP BY와 윈도우함수를 함께 쓸 수 있지만,\n' +
      '   집계 결과를 기반으로 윈도우함수를 적용하는 경우 인라인 뷰가 명확)',
    schemaSQL:
      "CREATE TABLE STUDENT (STU_ID NUMBER PRIMARY KEY, STU_NAME VARCHAR2(30) NOT NULL, DEPT_NAME VARCHAR2(30), GRADE NUMBER(1), ADVISOR_ID NUMBER, ENT_DATE DATE);\n" +
      "CREATE TABLE ENROLLMENT (ENROLL_ID NUMBER PRIMARY KEY, STU_ID NUMBER, COURSE_ID VARCHAR2(10), SEMESTER VARCHAR2(10), SCORE NUMBER(3), GRADE VARCHAR2(2));",
    sampleData:
      "INSERT INTO STUDENT VALUES (1001, '홍길동', '컴퓨터공학', 3, 101, TO_DATE('2022-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1002, '김영수', '컴퓨터공학', 2, 101, TO_DATE('2023-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1003, '이수진', '컴퓨터공학', 4, 102, TO_DATE('2021-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1004, '박지민', '경영학', 1, 103, TO_DATE('2024-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1005, '최유리', '경영학', 3, 103, TO_DATE('2022-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO ENROLLMENT VALUES (1, 1001, 'CS101', '2024-1', 92, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (2, 1001, 'CS102', '2024-2', 85, 'B+');\n" +
      "INSERT INTO ENROLLMENT VALUES (3, 1002, 'CS101', '2024-1', 78, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (4, 1002, 'CS102', '2024-2', 88, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (5, 1003, 'CS201', '2024-1', 95, 'A+');\n" +
      "INSERT INTO ENROLLMENT VALUES (6, 1003, 'CS202', '2024-2', 90, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (7, 1004, 'BA201', '2024-1', 72, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (8, 1004, 'BA202', '2024-2', 68, 'C+');\n" +
      "INSERT INTO ENROLLMENT VALUES (9, 1005, 'BA201', '2024-1', 85, 'B+');\n" +
      "INSERT INTO ENROLLMENT VALUES (10, 1005, 'BA202', '2024-2', 90, 'A');",
    points: 10,
  },
  {
    id: 'sql_hard_17',
    title: 'UNION ALL - 교수 급여와 학생 성적 통합 조회',
    description:
      'PROFESSOR와 STUDENT, ENROLLMENT 테이블을 사용하여,\n' +
      '교수의 급여 정보와 학생의 평균 성적 정보를 하나의 결과로 통합 조회하시오.\n\n' +
      '출력 컬럼: PERSON_TYPE, NAME, DEPT_NAME, VALUE\n' +
      "- 교수: PERSON_TYPE = 'PROFESSOR', NAME = PROF_NAME, VALUE = SAL\n" +
      "- 학생: PERSON_TYPE = 'STUDENT', NAME = STU_NAME, VALUE = 전과목 평균성적 (소수점 1자리 반올림)\n" +
      '- UNION ALL을 사용하시오\n' +
      '- PERSON_TYPE 오름차순, NAME 오름차순 정렬',
    type: 'sql',
    difficulty: 'hard',
    category: '집합연산자',
    correctRate: 35,
    answer:
      "SELECT 'PROFESSOR' AS PERSON_TYPE, P.PROF_NAME AS NAME, P.DEPT_NAME, P.SAL AS VALUE\n" +
      'FROM PROFESSOR P\n' +
      'UNION ALL\n' +
      "SELECT 'STUDENT' AS PERSON_TYPE, S.STU_NAME AS NAME, S.DEPT_NAME, ROUND(AVG(E.SCORE), 1) AS VALUE\n" +
      'FROM STUDENT S JOIN ENROLLMENT E ON S.STU_ID = E.STU_ID\n' +
      'GROUP BY S.STU_NAME, S.DEPT_NAME\n' +
      'ORDER BY PERSON_TYPE, NAME',
    explanation:
      '【실행 순서】\n' +
      '1. 첫 번째 SELECT: PROFESSOR 테이블에서 교수 정보 조회\n' +
      '2. 두 번째 SELECT:\n' +
      '   FROM STUDENT S JOIN ENROLLMENT E → 학생+수강 조인\n' +
      '   GROUP BY STU_NAME, DEPT_NAME → 학생별 그룹핑\n' +
      '   AVG(SCORE) → 학생별 평균성적\n' +
      '3. UNION ALL → 두 결과를 단순 합침 (중복 제거 없음)\n' +
      '4. ORDER BY → 최종 정렬\n\n' +
      '【핵심 함정 — UNION vs UNION ALL】\n' +
      '- UNION: 중복 행 제거 (내부적으로 정렬 발생 → 성능 비용)\n' +
      '- UNION ALL: 중복 허용 (정렬 없음 → 빠름)\n' +
      '- 서로 다른 테이블의 데이터이므로 중복 가능성 없음 → UNION ALL이 적합\n' +
      '- 컬럼 수, 데이터 타입 일치 필수:\n' +
      '  SAL(NUMBER)과 AVG(SCORE)(NUMBER)는 타입 호환\n' +
      '- ORDER BY에서 컬럼 별칭은 첫 번째 SELECT의 별칭을 사용\n' +
      '- 두 번째 SELECT에서 GROUP BY 사용 가능 (각 SELECT는 독립적)',
    schemaSQL:
      "CREATE TABLE PROFESSOR (PROF_ID NUMBER PRIMARY KEY, PROF_NAME VARCHAR2(30) NOT NULL, DEPT_NAME VARCHAR2(30), POSITION VARCHAR2(20), HIRE_DATE DATE, SAL NUMBER(8,2));\n" +
      "CREATE TABLE STUDENT (STU_ID NUMBER PRIMARY KEY, STU_NAME VARCHAR2(30) NOT NULL, DEPT_NAME VARCHAR2(30), GRADE NUMBER(1), ADVISOR_ID NUMBER, ENT_DATE DATE);\n" +
      "CREATE TABLE ENROLLMENT (ENROLL_ID NUMBER PRIMARY KEY, STU_ID NUMBER, COURSE_ID VARCHAR2(10), SEMESTER VARCHAR2(10), SCORE NUMBER(3), GRADE VARCHAR2(2));",
    sampleData:
      "INSERT INTO PROFESSOR VALUES (101, '김교수', '컴퓨터공학', '정교수', TO_DATE('2010-03-01','YYYY-MM-DD'), 6500000);\n" +
      "INSERT INTO PROFESSOR VALUES (102, '이교수', '경영학', '부교수', TO_DATE('2015-03-01','YYYY-MM-DD'), 5500000);\n" +
      "INSERT INTO PROFESSOR VALUES (103, '박교수', '수학', '조교수', TO_DATE('2020-03-01','YYYY-MM-DD'), 4500000);\n" +
      "INSERT INTO STUDENT VALUES (1001, '홍길동', '컴퓨터공학', 3, 101, TO_DATE('2022-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1002, '김영수', '컴퓨터공학', 2, 101, TO_DATE('2023-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1003, '이수진', '경영학', 4, 102, TO_DATE('2021-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO STUDENT VALUES (1004, '박지민', '경영학', 1, 102, TO_DATE('2024-03-01','YYYY-MM-DD'));\n" +
      "INSERT INTO ENROLLMENT VALUES (1, 1001, 'CS101', '2024-1', 92, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (2, 1001, 'CS102', '2024-2', 85, 'B+');\n" +
      "INSERT INTO ENROLLMENT VALUES (3, 1002, 'CS101', '2024-1', 78, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (4, 1003, 'BA201', '2024-1', 95, 'A+');\n" +
      "INSERT INTO ENROLLMENT VALUES (5, 1004, 'BA201', '2024-1', 72, 'B');",
    points: 10,
  },
  {
    id: 'sql_hard_18',
    title: '복합 JOIN + 서브쿼리 - 3학점 과목 최고 평균 교수',
    description:
      'COURSE, ENROLLMENT, PROFESSOR 테이블을 사용하여,\n' +
      '3학점 과목 중에서 수강생 평균 성적이 가장 높은 과목을 담당하는 교수와 해당 과목을 조회하시오.\n\n' +
      '출력 컬럼: PROF_NAME, COURSE_NAME, CREDIT, AVG_SCORE\n' +
      '- AVG_SCORE: 소수점 1자리 반올림\n' +
      '- 3학점 과목만 대상\n' +
      '- 평균 성적이 가장 높은 과목 1건 출력 (동점이면 COURSE_NAME 오름차순 첫 번째)',
    type: 'sql',
    difficulty: 'hard',
    category: '서브쿼리',
    correctRate: 28,
    answer:
      'SELECT P.PROF_NAME, C.COURSE_NAME, C.CREDIT, A.AVG_SCORE\n' +
      'FROM (\n' +
      '    SELECT COURSE_ID, ROUND(AVG(SCORE), 1) AS AVG_SCORE\n' +
      '    FROM ENROLLMENT\n' +
      '    GROUP BY COURSE_ID\n' +
      ') A\n' +
      'JOIN COURSE C ON A.COURSE_ID = C.COURSE_ID\n' +
      'JOIN PROFESSOR P ON C.PROF_ID = P.PROF_ID\n' +
      'WHERE C.CREDIT = 3\n' +
      'AND A.AVG_SCORE = (\n' +
      '    SELECT MAX(ROUND(AVG(E2.SCORE), 1))\n' +
      '    FROM ENROLLMENT E2 JOIN COURSE C2 ON E2.COURSE_ID = C2.COURSE_ID\n' +
      '    WHERE C2.CREDIT = 3\n' +
      '    GROUP BY E2.COURSE_ID\n' +
      ')\n' +
      'ORDER BY C.COURSE_NAME\n' +
      'FETCH FIRST 1 ROWS ONLY',
    explanation:
      '【실행 순서】\n' +
      '1. 인라인 뷰 A: ENROLLMENT에서 과목별 평균성적 계산\n' +
      '2. JOIN COURSE C → 과목 정보 연결\n' +
      '3. JOIN PROFESSOR P → 교수 정보 연결\n' +
      '4. WHERE C.CREDIT = 3 → 3학점 과목만 필터링\n' +
      '5. AND A.AVG_SCORE = (서브쿼리) → 3학점 과목 중 최고 평균과 일치하는 행\n' +
      '   서브쿼리: 3학점 과목별 평균을 구한 뒤 MAX로 최대값 추출\n' +
      '6. ORDER BY + FETCH FIRST → 동점 시 과목명 순 첫 번째\n\n' +
      '【핵심 함정】\n' +
      '- MAX(AVG(...))는 직접 중첩 불가 → GROUP BY 결과에 MAX 적용 필요\n' +
      '  SELECT MAX(AVG(SCORE)) FROM ... GROUP BY COURSE_ID 이렇게 쓸 수 있음\n' +
      '  (Oracle은 중첩 집계함수를 허용하지만, GROUP BY가 반드시 필요)\n' +
      '- FETCH FIRST N ROWS ONLY는 Oracle 12c 이상 문법\n' +
      '  이전 버전에서는 ROWNUM <= 1 사용\n' +
      '- ROUND를 서브쿼리 안과 밖에서 동일하게 적용해야 비교가 정확함',
    schemaSQL:
      "CREATE TABLE PROFESSOR (PROF_ID NUMBER PRIMARY KEY, PROF_NAME VARCHAR2(30) NOT NULL, DEPT_NAME VARCHAR2(30), POSITION VARCHAR2(20), HIRE_DATE DATE, SAL NUMBER(8,2));\n" +
      "CREATE TABLE COURSE (COURSE_ID VARCHAR2(10) PRIMARY KEY, COURSE_NAME VARCHAR2(50) NOT NULL, CREDIT NUMBER(1), PROF_ID NUMBER, DEPT_NAME VARCHAR2(30));\n" +
      "CREATE TABLE ENROLLMENT (ENROLL_ID NUMBER PRIMARY KEY, STU_ID NUMBER, COURSE_ID VARCHAR2(10), SEMESTER VARCHAR2(10), SCORE NUMBER(3), GRADE VARCHAR2(2));",
    sampleData:
      "INSERT INTO PROFESSOR VALUES (101, '김교수', '컴퓨터공학', '정교수', TO_DATE('2010-03-01','YYYY-MM-DD'), 6500000);\n" +
      "INSERT INTO PROFESSOR VALUES (102, '이교수', '경영학', '부교수', TO_DATE('2015-03-01','YYYY-MM-DD'), 5500000);\n" +
      "INSERT INTO PROFESSOR VALUES (103, '박교수', '수학', '조교수', TO_DATE('2020-03-01','YYYY-MM-DD'), 4500000);\n" +
      "INSERT INTO COURSE VALUES ('CS101', '데이터베이스', 3, 101, '컴퓨터공학');\n" +
      "INSERT INTO COURSE VALUES ('CS102', '알고리즘', 3, 101, '컴퓨터공학');\n" +
      "INSERT INTO COURSE VALUES ('BA201', '마케팅원론', 3, 102, '경영학');\n" +
      "INSERT INTO COURSE VALUES ('BA202', '회계원리', 2, 102, '경영학');\n" +
      "INSERT INTO COURSE VALUES ('MA301', '선형대수', 3, 103, '수학');\n" +
      "INSERT INTO ENROLLMENT VALUES (1, 1001, 'CS101', '2024-1', 92, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (2, 1002, 'CS101', '2024-1', 78, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (3, 1003, 'CS102', '2024-1', 85, 'B+');\n" +
      "INSERT INTO ENROLLMENT VALUES (4, 1004, 'CS102', '2024-1', 90, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (5, 1003, 'BA201', '2024-1', 95, 'A+');\n" +
      "INSERT INTO ENROLLMENT VALUES (6, 1004, 'BA201', '2024-1', 88, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (7, 1005, 'BA202', '2024-1', 70, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (8, 1001, 'MA301', '2024-1', 92, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (9, 1005, 'MA301', '2024-1', 85, 'B+');",
    points: 10,
  },
  {
    id: 'sql_hard_19',
    title: 'COUNT(*) vs COUNT(컬럼) - NULL 포함 여부',
    description:
      'ENROLLMENT 테이블에서 과목별로 다음 세 가지 값을 구하시오.\n\n' +
      '출력 컬럼: COURSE_ID, TOTAL_CNT, SCORED_CNT, NO_SCORE_CNT\n' +
      '- TOTAL_CNT: 수강 등록 인원 (성적 입력 여부와 무관한 전체 행 수)\n' +
      '- SCORED_CNT: 성적(SCORE)이 입력된 학생 수\n' +
      '- NO_SCORE_CNT: 성적이 미입력(NULL)인 학생 수\n' +
      '- COURSE_ID 오름차순 정렬\n\n' +
      '⚠ 힌트: COUNT(*)와 COUNT(컬럼)의 차이를 활용하시오.',
    type: 'sql',
    difficulty: 'hard',
    category: '함수',
    correctRate: 30,
    answer:
      'SELECT COURSE_ID,\n' +
      '       COUNT(*) AS TOTAL_CNT,\n' +
      '       COUNT(SCORE) AS SCORED_CNT,\n' +
      '       COUNT(*) - COUNT(SCORE) AS NO_SCORE_CNT\n' +
      'FROM ENROLLMENT\n' +
      'GROUP BY COURSE_ID\n' +
      'ORDER BY COURSE_ID',
    explanation:
      '【실행 순서】\n' +
      '1. FROM ENROLLMENT → 전체 수강 데이터\n' +
      '2. GROUP BY COURSE_ID → 과목별 그룹핑\n' +
      '3. COUNT(*) → NULL 포함 전체 행 수\n' +
      '   COUNT(SCORE) → SCORE가 NULL이 아닌 행만 카운트\n' +
      '   COUNT(*) - COUNT(SCORE) → NULL인 행 수\n' +
      '4. ORDER BY → 정렬\n\n' +
      '【핵심 함정 — COUNT의 NULL 처리】\n' +
      '- COUNT(*): 행의 존재 자체를 셈 → NULL 행도 포함\n' +
      '- COUNT(컬럼): 해당 컬럼이 NULL이 아닌 행만 카운트\n' +
      '- 이 차이를 이용하면 별도의 CASE WHEN 없이 NULL 행 수 계산 가능\n' +
      '- SUM, AVG, MIN, MAX도 모두 NULL을 무시하고 계산\n' +
      '- COUNT(DISTINCT 컬럼)도 NULL을 제외함\n' +
      '- 자주 틀리는 포인트: COUNT(1)과 COUNT(*)는 동일한 결과\n' +
      '  COUNT(1)의 1은 상수이므로 NULL이 될 수 없음',
    schemaSQL:
      "CREATE TABLE ENROLLMENT (ENROLL_ID NUMBER PRIMARY KEY, STU_ID NUMBER, COURSE_ID VARCHAR2(10), SEMESTER VARCHAR2(10), SCORE NUMBER(3), GRADE VARCHAR2(2));",
    sampleData:
      "INSERT INTO ENROLLMENT VALUES (1, 1001, 'CS101', '2024-1', 92, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (2, 1002, 'CS101', '2024-1', 78, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (3, 1003, 'CS101', '2024-1', NULL, NULL);\n" +
      "INSERT INTO ENROLLMENT VALUES (4, 1001, 'CS102', '2024-1', 85, 'B+');\n" +
      "INSERT INTO ENROLLMENT VALUES (5, 1002, 'CS102', '2024-1', NULL, NULL);\n" +
      "INSERT INTO ENROLLMENT VALUES (6, 1003, 'CS102', '2024-1', 90, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (7, 1004, 'CS102', '2024-1', NULL, NULL);\n" +
      "INSERT INTO ENROLLMENT VALUES (8, 1001, 'BA201', '2024-1', 95, 'A+');\n" +
      "INSERT INTO ENROLLMENT VALUES (9, 1003, 'BA201', '2024-1', 88, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (10, 1004, 'BA201', '2024-1', 72, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (11, 1005, 'BA201', '2024-1', NULL, NULL);\n" +
      "INSERT INTO ENROLLMENT VALUES (12, 1005, 'CS101', '2024-1', 65, 'C+');",
    points: 10,
  },
  {
    id: 'sql_hard_20',
    title: 'AVG에서 NULL 자동 제외 함정 - NVL 사용 여부',
    description:
      'ENROLLMENT 테이블에서 과목별 평균 성적을 두 가지 방식으로 구하고 차이를 비교하시오.\n\n' +
      '출력 컬럼: COURSE_ID, AVG_EXCLUDE_NULL, AVG_INCLUDE_NULL, DIFF\n' +
      '- AVG_EXCLUDE_NULL: AVG(SCORE) — NULL을 제외한 평균 (소수점 1자리 반올림)\n' +
      '- AVG_INCLUDE_NULL: AVG(NVL(SCORE, 0)) — NULL을 0으로 치환 후 평균 (소수점 1자리 반올림)\n' +
      '- DIFF: AVG_EXCLUDE_NULL - AVG_INCLUDE_NULL (소수점 1자리 반올림)\n' +
      '- COURSE_ID 오름차순 정렬\n\n' +
      '⚠ 두 값이 다른 이유를 이해하시오.',
    type: 'sql',
    difficulty: 'hard',
    category: '함수',
    correctRate: 26,
    answer:
      'SELECT COURSE_ID,\n' +
      '       ROUND(AVG(SCORE), 1) AS AVG_EXCLUDE_NULL,\n' +
      '       ROUND(AVG(NVL(SCORE, 0)), 1) AS AVG_INCLUDE_NULL,\n' +
      '       ROUND(AVG(SCORE) - AVG(NVL(SCORE, 0)), 1) AS DIFF\n' +
      'FROM ENROLLMENT\n' +
      'GROUP BY COURSE_ID\n' +
      'ORDER BY COURSE_ID',
    explanation:
      '【실행 순서】\n' +
      '1. FROM ENROLLMENT → 전체 수강 데이터\n' +
      '2. GROUP BY COURSE_ID → 과목별 그룹핑\n' +
      '3. AVG(SCORE) → NULL 행 제외 후 평균 (분모: NULL 아닌 행 수)\n' +
      '   AVG(NVL(SCORE, 0)) → NULL을 0으로 바꾼 후 평균 (분모: 전체 행 수)\n' +
      '4. ORDER BY → 정렬\n\n' +
      '【핵심 함정 — AVG와 NULL】\n' +
      '- CS101의 SCORE: 92, 78, NULL, 65\n' +
      '  AVG(SCORE) = (92+78+65)/3 = 78.3 (NULL 제외, 분모=3)\n' +
      '  AVG(NVL(SCORE,0)) = (92+78+0+65)/4 = 58.8 (NULL→0, 분모=4)\n' +
      '  DIFF = 78.3 - 58.8 = 19.5\n\n' +
      '- 핵심: AVG는 NULL을 "존재하지 않는 값"으로 취급하여 분모에서도 제외\n' +
      '- NVL(SCORE, 0)으로 바꾸면 0이라는 "값"이 되어 분모에 포함됨\n' +
      '- SUM도 마찬가지: SUM(SCORE)과 SUM(NVL(SCORE,0))은 같음 (NULL 무시)\n' +
      '  하지만 AVG는 분모가 달라지므로 결과가 다름\n' +
      '- 실무에서 "미응시 학생을 0점으로 처리"할지 "제외"할지에 따라 방식이 달라짐',
    schemaSQL:
      "CREATE TABLE ENROLLMENT (ENROLL_ID NUMBER PRIMARY KEY, STU_ID NUMBER, COURSE_ID VARCHAR2(10), SEMESTER VARCHAR2(10), SCORE NUMBER(3), GRADE VARCHAR2(2));",
    sampleData:
      "INSERT INTO ENROLLMENT VALUES (1, 1001, 'CS101', '2024-1', 92, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (2, 1002, 'CS101', '2024-1', 78, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (3, 1003, 'CS101', '2024-1', NULL, NULL);\n" +
      "INSERT INTO ENROLLMENT VALUES (4, 1005, 'CS101', '2024-1', 65, 'C+');\n" +
      "INSERT INTO ENROLLMENT VALUES (5, 1001, 'CS102', '2024-1', 85, 'B+');\n" +
      "INSERT INTO ENROLLMENT VALUES (6, 1002, 'CS102', '2024-1', NULL, NULL);\n" +
      "INSERT INTO ENROLLMENT VALUES (7, 1003, 'CS102', '2024-1', 90, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (8, 1004, 'CS102', '2024-1', NULL, NULL);\n" +
      "INSERT INTO ENROLLMENT VALUES (9, 1001, 'BA201', '2024-1', 95, 'A+');\n" +
      "INSERT INTO ENROLLMENT VALUES (10, 1003, 'BA201', '2024-1', 88, 'A');\n" +
      "INSERT INTO ENROLLMENT VALUES (11, 1004, 'BA201', '2024-1', 72, 'B');\n" +
      "INSERT INTO ENROLLMENT VALUES (12, 1005, 'BA201', '2024-1', NULL, NULL);\n" +
      "INSERT INTO ENROLLMENT VALUES (13, 1002, 'BA201', '2024-1', NULL, NULL);",
    points: 10,
  },
];

export default HARD_PROBLEMS;
