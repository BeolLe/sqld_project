/**
 * 테이블셋 3: STUDENT (학생/수강/과목)
 *
 * SQLD 학습 목표:
 * - ROLLUP / CUBE / GROUPING SETS (학과별/학년별 성적 집계)
 * - 윈도우함수 (성적 순위, 석차, 누적 학점)
 * - 집합연산자 (학과 간 수강 비교)
 * - 서브쿼리 (최고 성적 학생, 미수강 과목 등)
 * - 다중 테이블 JOIN
 *
 * 함정 요소:
 * - STUDENT.ADVISOR_ID: 일부 NULL (지도교수 미배정)
 * - PROFESSOR.SAL: 일부 NULL (급여 미확정)
 * - ENROLLMENT.SCORE: 일부 NULL (성적 미입력 → AVG 계산 시 주의)
 * - ENROLLMENT.GRADE: SCORE가 NULL이면 GRADE도 NULL
 * - 미수강 학생 20명 (OUTER JOIN 필수)
 * - 동명이인: '박지민' 3명, '김서준' 2명
 * - 타과 수강 데이터 존재 (학과≠과목 학과)
 */

export const STUDENT_TABLE_SET = {
  id: 'student',
  name: '학생/수강/과목 관리',
  description: 'PROFESSOR, STUDENT, COURSE, ENROLLMENT 테이블을 활용한 SQL 실습',
  tables: [
    {
      name: 'PROFESSOR',
      description: '교수 정보',
      rowCount: 30,
      columns: [
        { name: 'PROF_ID', type: 'NUMBER', constraint: 'PK', description: '교수번호' },
        { name: 'PROF_NAME', type: 'VARCHAR2(30)', constraint: 'NOT NULL', description: '교수명' },
        { name: 'DEPT_NAME', type: 'VARCHAR2(30)', constraint: '', description: '소속학과' },
        { name: 'POSITION', type: 'VARCHAR2(20)', constraint: '', description: '직위 (교수/부교수/조교수/초빙교수)' },
        { name: 'HIRE_DATE', type: 'DATE', constraint: '', description: '임용일' },
        { name: 'SAL', type: 'NUMBER(8,2)', constraint: '', description: '급여 (일부 NULL)' },
      ],
    },
    {
      name: 'STUDENT',
      description: '학생 정보',
      rowCount: 200,
      columns: [
        { name: 'STU_ID', type: 'NUMBER', constraint: 'PK', description: '학번' },
        { name: 'STU_NAME', type: 'VARCHAR2(30)', constraint: 'NOT NULL', description: '학생명' },
        { name: 'DEPT_NAME', type: 'VARCHAR2(30)', constraint: '', description: '소속학과' },
        { name: 'GRADE', type: 'NUMBER(1)', constraint: '', description: '학년 (1~4)' },
        { name: 'ADVISOR_ID', type: 'NUMBER', constraint: 'FK→PROFESSOR', description: '지도교수번호 (일부 NULL)' },
        { name: 'ENT_DATE', type: 'DATE', constraint: '', description: '입학일' },
      ],
    },
    {
      name: 'COURSE',
      description: '과목 정보',
      rowCount: 40,
      columns: [
        { name: 'COURSE_ID', type: 'VARCHAR2(10)', constraint: 'PK', description: '과목코드 (예: CS001)' },
        { name: 'COURSE_NAME', type: 'VARCHAR2(50)', constraint: 'NOT NULL', description: '과목명' },
        { name: 'CREDIT', type: 'NUMBER(1)', constraint: '', description: '학점 (2~3)' },
        { name: 'PROF_ID', type: 'NUMBER', constraint: 'FK→PROFESSOR', description: '담당교수번호' },
        { name: 'DEPT_NAME', type: 'VARCHAR2(30)', constraint: '', description: '개설학과' },
      ],
    },
    {
      name: 'ENROLLMENT',
      description: '수강 정보',
      rowCount: 697,
      columns: [
        { name: 'ENROLL_ID', type: 'NUMBER', constraint: 'PK', description: '수강번호' },
        { name: 'STU_ID', type: 'NUMBER', constraint: 'FK→STUDENT', description: '학번' },
        { name: 'COURSE_ID', type: 'VARCHAR2(10)', constraint: 'FK→COURSE', description: '과목코드' },
        { name: 'SEMESTER', type: 'VARCHAR2(10)', constraint: '', description: '학기 (예: 2024-1)' },
        { name: 'SCORE', type: 'NUMBER(3)', constraint: '', description: '점수 (일부 NULL)' },
        { name: 'GRADE', type: 'VARCHAR2(2)', constraint: '', description: '학점등급 (A+~F, 일부 NULL)' },
      ],
    },
  ],
  totalRows: 967,
  sqldTopics: ['ROLLUP/CUBE/GROUPING SETS', '윈도우함수', '집합연산자', '서브쿼리', 'JOIN', 'HAVING'],
} as const;
