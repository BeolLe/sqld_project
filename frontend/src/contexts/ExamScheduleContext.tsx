import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ExamSchedule } from '../types';
import { fetchExamSchedules } from '../api/exams';
import { mapScheduleItem } from '../data/examSchedule';

interface ExamScheduleState {
  schedules: ExamSchedule[];
  year: number;
  loading: boolean;
  error: string | null;
}

const ExamScheduleContext = createContext<ExamScheduleState>({
  schedules: [],
  year: new Date().getFullYear(),
  loading: true,
  error: null,
});

export function ExamScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year] = useState(() => new Date().getFullYear());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchExamSchedules(year)
      .then((res) => {
        if (!cancelled) setSchedules(res.items.map(mapScheduleItem));
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [year]);

  return (
    <ExamScheduleContext.Provider value={{ schedules, year, loading, error }}>
      {children}
    </ExamScheduleContext.Provider>
  );
}

export function useExamSchedules() {
  return useContext(ExamScheduleContext);
}
