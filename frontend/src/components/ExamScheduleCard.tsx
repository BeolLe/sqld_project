import { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import type { ExamSchedule } from '../types';
import { fetchExamSchedules } from '../api/exams';
import {
  mapScheduleItem,
  getNextExamDate,
  getDday,
  formatDate,
  formatExamDate,
} from '../data/examSchedule';

function ScheduleStatus({ schedule }: { schedule: ExamSchedule }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!schedule.registrationStart || !schedule.registrationEnd || !schedule.examDate || !schedule.resultDate) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
        미정
      </span>
    );
  }

  const regStart = new Date(schedule.registrationStart);
  const regEnd = new Date(schedule.registrationEnd);
  regEnd.setHours(23, 59, 59);
  const examDate = new Date(schedule.examDate);
  const resultDate = new Date(schedule.resultDate);

  if (today >= regStart && today <= regEnd) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        접수중
      </span>
    );
  }
  if (today < regStart) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
        접수 예정
      </span>
    );
  }
  if (today < examDate) {
    const dday = getDday(schedule.examDate!);
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
        D-{dday}
      </span>
    );
  }
  if (today < resultDate) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
        발표 대기
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-600/20 text-slate-500 border border-slate-600/30">
      종료
    </span>
  );
}

export default function ExamScheduleCard() {
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
        if (!cancelled) {
          setSchedules(res.items.map(mapScheduleItem));
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [year]);

  const nextExam = getNextExamDate(schedules);
  const dday = nextExam?.examDate ? getDday(nextExam.examDate) : null;

  return (
    <section className="max-w-5xl mx-auto px-4 pb-12">
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 md:p-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 w-10 h-10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{year}년 SQLD 시험 일정</h2>
              {schedules.length > 0 && (
                <p className="text-xs text-slate-400">
                  SQL 개발자 (제{schedules[0].round}회 ~ 제{schedules[schedules.length - 1].round}회)
                </p>
              )}
            </div>
          </div>
          {nextExam && dday !== null && dday >= 0 && (
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2">
              <span className="text-2xl font-extrabold text-blue-400">D-{dday}</span>
              <span className="text-xs text-slate-400">
                다음 시험 | {nextExam.roundLabel} {formatExamDate(nextExam.examDate)}
              </span>
            </div>
          )}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            <span className="ml-2 text-sm text-slate-400">일정을 불러오는 중...</span>
          </div>
        )}

        {/* 에러 */}
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && !error && schedules.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">{year}년 시험 일정이 등록되지 않았습니다.</p>
          </div>
        )}

        {/* 테이블 - 데스크톱 */}
        {!loading && !error && schedules.length > 0 && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 font-medium py-3 px-3">회차</th>
                    <th className="text-left text-slate-400 font-medium py-3 px-3">원서접수</th>
                    <th className="text-left text-slate-400 font-medium py-3 px-3">시험일</th>
                    <th className="text-left text-slate-400 font-medium py-3 px-3">합격자 발표</th>
                    <th className="text-right text-slate-400 font-medium py-3 px-3">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => {
                    const isNext = nextExam?.round === s.round;
                    return (
                      <tr
                        key={s.round}
                        className={`border-b border-slate-700/50 transition-colors ${
                          isNext
                            ? 'bg-blue-500/5'
                            : 'hover:bg-slate-700/30'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className={`font-semibold ${isNext ? 'text-blue-400' : 'text-white'}`}>
                            {s.roundLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {formatDate(s.registrationStart)} ~ {formatDate(s.registrationEnd)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-medium ${isNext ? 'text-blue-300' : 'text-slate-200'}`}>
                            {formatExamDate(s.examDate)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {formatDate(s.resultDate)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <ScheduleStatus schedule={s} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 카드 - 모바일 */}
            <div className="md:hidden space-y-3">
              {schedules.map((s) => {
                const isNext = nextExam?.round === s.round;
                return (
                  <div
                    key={s.round}
                    className={`rounded-xl p-4 border ${
                      isNext
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-slate-700/30 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${isNext ? 'text-blue-400' : 'text-white'}`}>
                        {s.roundLabel}
                      </span>
                      <ScheduleStatus schedule={s} />
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">원서접수</span>
                        <span className="text-slate-300">
                          {formatDate(s.registrationStart)} ~ {formatDate(s.registrationEnd)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">시험일</span>
                        <span className={isNext ? 'text-blue-300 font-medium' : 'text-slate-200'}>
                          {formatExamDate(s.examDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">합격자 발표</span>
                        <span className="text-slate-300">{formatDate(s.resultDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
