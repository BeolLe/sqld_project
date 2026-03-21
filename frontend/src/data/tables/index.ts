export { EMP_TABLE_SET } from './emp';
export { ORDER_TABLE_SET } from './order';
export { STUDENT_TABLE_SET } from './student';

export const TABLE_SETS = [
  { id: 'emp', name: '직원/급여 관리', path: 'emp' },
  { id: 'order', name: '주문/상품/고객 관리', path: 'order' },
  { id: 'student', name: '학생/수강/과목 관리', path: 'student' },
] as const;
