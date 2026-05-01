import type { ExamSchedule } from '../types';

export const SQLD_SCHEDULES: ExamSchedule[] = [
  {
    round: 60,
    registrationStart: '2026-02-02',
    registrationEnd: '2026-02-06',
    examDate: '2026-03-07',
    resultDate: '2026-03-27',
  },
  {
    round: 61,
    registrationStart: '2026-04-27',
    registrationEnd: '2026-05-01',
    examDate: '2026-05-31',
    resultDate: '2026-06-19',
  },
  {
    round: 62,
    registrationStart: '2026-07-20',
    registrationEnd: '2026-07-24',
    examDate: '2026-08-22',
    resultDate: '2026-09-11',
  },
  {
    round: 63,
    registrationStart: '2026-10-12',
    registrationEnd: '2026-10-16',
    examDate: '2026-11-14',
    resultDate: '2026-12-04',
  },
];

export function getNextExamDate(schedules: ExamSchedule[]): ExamSchedule | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    schedules.find((s) => new Date(s.examDate) >= today) ?? null
  );
}

export function getDday(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function formatExamDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}.${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
}
