import type { ExamSchedule, ExamScheduleItem } from '../types';

export function mapScheduleItem(item: ExamScheduleItem): ExamSchedule {
  return {
    round: item.displayOrder,
    roundLabel: item.roundLabel,
    registrationStart: item.applicationStartAt,
    registrationEnd: item.applicationEndAt,
    examDate: item.examStartAt,
    resultDate: item.passAnnouncementStartAt,
  };
}

export function getNextExamDate(schedules: ExamSchedule[]): ExamSchedule | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    schedules.find((s) => s.examDate && new Date(s.examDate) >= today) ?? null
  );
}

export function getDday(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

export function formatDateFull(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function formatExamDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}.${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
}
