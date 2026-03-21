/**
 * 테이블셋 1: EMP (직원/급여)
 *
 * SQLD 학습 목표:
 * - JOIN (EMP ↔ DEPT, EMP ↔ SALGRADE)
 * - 셀프조인 (EMP.MGR → EMP.EMPNO)
 * - NULL 처리 (COMM, MGR, DEPTNO에 NULL 포함)
 * - 계층형 쿼리 (사장→임원→부장→과장→사원 조직도)
 * - 서브쿼리 (급여 비교, 부서별 통계)
 * - 그룹함수 (부서별/직급별 급여 집계)
 *
 * 함정 요소:
 * - COMM: 대부분 NULL, 일부 0 (NULL과 0의 차이)
 * - MGR: 사장은 NULL (계층형 쿼리 루트)
 * - DEPTNO: 일부 사원 NULL (부서 미배정 → OUTER JOIN 필수)
 * - 동명이인: '김민준' 3명, '이서연' 2명 (DISTINCT, GROUP BY 주의)
 * - SAL_HISTORY.CHANGE_REASON: 일부 NULL
 */

export const EMP_TABLE_SET = {
  id: 'emp',
  name: '직원/급여 관리',
  description: 'EMP, DEPT, SALGRADE, SAL_HISTORY 테이블을 활용한 SQL 실습',
  tables: [
    {
      name: 'DEPT',
      description: '부서 정보',
      rowCount: 10,
      columns: [
        { name: 'DEPTNO', type: 'NUMBER(2)', constraint: 'PK', description: '부서번호' },
        { name: 'DNAME', type: 'VARCHAR2(20)', constraint: '', description: '부서명' },
        { name: 'LOC', type: 'VARCHAR2(20)', constraint: '', description: '위치' },
      ],
    },
    {
      name: 'EMP',
      description: '사원 정보',
      rowCount: 201,
      columns: [
        { name: 'EMPNO', type: 'NUMBER(4)', constraint: 'PK', description: '사원번호' },
        { name: 'ENAME', type: 'VARCHAR2(20)', constraint: 'NOT NULL', description: '사원명' },
        { name: 'JOB', type: 'VARCHAR2(20)', constraint: '', description: '직급' },
        { name: 'MGR', type: 'NUMBER(4)', constraint: 'FK→EMP', description: '상위관리자 사번' },
        { name: 'HIREDATE', type: 'DATE', constraint: '', description: '입사일' },
        { name: 'SAL', type: 'NUMBER(7,2)', constraint: '', description: '급여' },
        { name: 'COMM', type: 'NUMBER(7,2)', constraint: '', description: '커미션 (대부분 NULL)' },
        { name: 'DEPTNO', type: 'NUMBER(2)', constraint: 'FK→DEPT', description: '부서번호 (일부 NULL)' },
      ],
    },
    {
      name: 'SALGRADE',
      description: '급여등급 기준',
      rowCount: 5,
      columns: [
        { name: 'GRADE', type: 'NUMBER', constraint: 'PK', description: '등급' },
        { name: 'LOSAL', type: 'NUMBER', constraint: '', description: '최저급여' },
        { name: 'HISAL', type: 'NUMBER', constraint: '', description: '최고급여' },
      ],
    },
    {
      name: 'SAL_HISTORY',
      description: '급여 변경 이력',
      rowCount: 785,
      columns: [
        { name: 'HIST_NO', type: 'NUMBER', constraint: 'PK', description: '이력번호' },
        { name: 'EMPNO', type: 'NUMBER(4)', constraint: 'FK→EMP', description: '사원번호' },
        { name: 'OLD_SAL', type: 'NUMBER(7,2)', constraint: '', description: '변경 전 급여' },
        { name: 'NEW_SAL', type: 'NUMBER(7,2)', constraint: '', description: '변경 후 급여' },
        { name: 'CHANGE_DATE', type: 'DATE', constraint: '', description: '변경일' },
        { name: 'CHANGE_REASON', type: 'VARCHAR2(50)', constraint: '', description: '변경사유 (일부 NULL)' },
      ],
    },
  ],
  totalRows: 1001,
  sqldTopics: ['JOIN', '셀프조인', 'NULL처리', '계층형쿼리', '서브쿼리', '그룹함수', 'NVL/NVL2/COALESCE'],
} as const;
