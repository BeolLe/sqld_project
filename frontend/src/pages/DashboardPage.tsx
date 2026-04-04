import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import { Trophy, Target, Clock, BookOpen, ChevronRight } from 'lucide-react';
import type { DashboardSummary } from '../types';

// ─── 학습 시간 포맷 ─────────────────────────────────────────────────────────

function formatLearningTime(seconds: number): string {
  if (seconds <= 0) return '0분';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

// ─── 학습 캘린더 (잔디) ──────────────────────────────────────────────────────

interface CalendarDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

function buildCalendarGrid(
  learningDays: { date: string; eventCount: number }[],
): CalendarDay[] {
  const today = new Date();
  const grid: CalendarDay[] = [];
  const countMap = new Map(learningDays.map((d) => [d.date, d.eventCount]));

  // 최근 12주 (84일)
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = countMap.get(key) ?? 0;
    const level: 0 | 1 | 2 | 3 | 4 =
      count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
    grid.push({ date: key, count, level });
  }
  return grid;
}

const LEVEL_COLORS = [
  'bg-slate-100',
  'bg-emerald-200',
  'bg-emerald-400',
  'bg-emerald-500',
  'bg-emerald-700',
] as const;

function LearningCalendar({
  learningDays,
}: {
  learningDays: { date: string; eventCount: number }[];
}) {
  const grid = useMemo(() => buildCalendarGrid(learningDays), [learningDays]);

  // 12주 × 7일 그리드 (열 = 주, 행 = 요일)
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-base font-bold text-sqld-navy mb-4">학습 캘린더</h2>
      {learningDays.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400 mb-1">학습 기록이 쌓이면 캘린더가 채워집니다.</p>
          <p className="text-xs text-slate-300">데이터 준비 중</p>
        </div>
      ) : (
        <>
          <div className="flex gap-1 overflow-x-auto">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.count}건`}
                    className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[day.level]}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
            <span>적음</span>
            {LEVEL_COLORS.map((color, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
            ))}
            <span>많음</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── 빈 상태 컴포넌트 ────────────────────────────────────────────────────────

function EmptyState({ message, ctaLabel, ctaTo }: { message: string; ctaLabel: string; ctaTo: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-slate-400 mb-3">{message}</p>
      <Link
        to={ctaTo}
        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline font-medium"
      >
        {ctaLabel}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoggedIn, isInitializing } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn || isInitializing) return;

    let cancelled = false;
    setLoading(true);
    setError('');

    apiFetch<DashboardSummary>('/dashboard/summary')
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError('학습현황 API가 아직 준비되지 않았습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, isInitializing]);

  // ─── 인증 상태 분기 ──────────────────────────────────────────────────────

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">인증 상태를 확인하는 중입니다.</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">로그인 후 이용 가능합니다.</p>
          <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ─── 로딩 스켈레톤 ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 w-60 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mt-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="h-6 w-6 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse mb-1" />
                <div className="h-7 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 h-72 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── 데이터 추출 (API 실패 시 기본값) ──────────────────────────────────────

  const stats = data?.stats ?? {
    totalPoints: user?.points ?? 0,
    totalMockExamAttemptCount: 0,
    totalLearningSeconds: 0,
    totalSolvedQuestionCount: 0,
  };

  const subjectStats = data?.subjectStats ?? [];
  const recentExams = data?.recentExamResults ?? [];
  const recentSql = data?.recentSqlAttempts ?? [];
  const learningCalendar = data?.learningCalendar ?? [];

  const hasAnyData =
    stats.totalMockExamAttemptCount > 0 || stats.totalSolvedQuestionCount > 0;

  // ─── 렌더링 ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 인삿말 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-sqld-navy">
            안녕하세요, <span className="text-primary-600">{user?.nickname}</span>님!
          </h1>
          <p className="text-slate-500 mt-1">오늘도 SQL 실력을 키워보세요.</p>
        </div>

        {/* API 에러 배너 */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg mb-6">
            학습 데이터를 불러오지 못했습니다. 일부 정보가 표시되지 않을 수 있습니다.
          </div>
        )}

        {/* 요약 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Trophy,
              label: '보유 포인트',
              value: `${stats.totalPoints}pt`,
              color: 'text-amber-500',
            },
            {
              icon: Target,
              label: '모의고사 응시',
              value: `${stats.totalMockExamAttemptCount}회`,
              color: 'text-emerald-500',
            },
            {
              icon: Clock,
              label: '총 학습 시간',
              value: formatLearningTime(stats.totalLearningSeconds),
              color: 'text-blue-500',
            },
            {
              icon: BookOpen,
              label: '푼 문제 수',
              value: `${stats.totalSolvedQuestionCount}문제`,
              color: 'text-purple-500',
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <Icon className={`w-6 h-6 ${color} mb-2`} />
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-sqld-navy">{value}</p>
            </div>
          ))}
        </div>

        {/* 데이터 없을 때 전체 빈 상태 */}
        {!hasAnyData && !error && (
          <div className="bg-white rounded-xl p-10 shadow-sm border border-slate-100 text-center mb-8">
            <p className="text-slate-500 mb-4">아직 학습 기록이 없습니다. 모의고사를 시작해보세요!</p>
            <div className="flex justify-center gap-4">
              <Link
                to="/exams"
                className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm px-5 py-2.5 rounded-lg transition-colors"
              >
                모의고사 풀기
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/sql-practice"
                className="inline-flex items-center gap-1.5 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm px-5 py-2.5 rounded-lg transition-colors"
              >
                SQL 실습하기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* 차트 영역 — 데이터 있을 때만 */}
        {hasAnyData && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* 과목별 정답률 레이더 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-sqld-navy mb-4">과목별 정답률</h2>
              {subjectStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart
                    data={subjectStats.map((s) => ({
                      subject: s.subjectName,
                      rate: Math.round(s.accuracyRate),
                    }))}
                  >
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Radar
                      name="정답률"
                      dataKey="rate"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  message="모의고사를 응시하면 과목별 분석을 볼 수 있습니다."
                  ctaLabel="모의고사 목록"
                  ctaTo="/exams"
                />
              )}
            </div>

            {/* 모의고사 점수 추이 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-sqld-navy mb-4">모의고사 점수 추이</h2>
              {recentExams.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={[...recentExams].reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="examTitle"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v: string) => v.replace('SQLD 모의고사 ', '')}
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(v: number) => [`${v}점`]}
                        labelFormatter={(label: string) => label}
                      />
                      <ReferenceLine y={60} stroke="#10b981" strokeDasharray="4 4" label="" />
                      <Bar dataKey="scorePercent" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    합격 기준: 60점
                  </div>
                </>
              ) : (
                <EmptyState
                  message="아직 모의고사 응시 기록이 없습니다."
                  ctaLabel="모의고사 목록"
                  ctaTo="/exams"
                />
              )}
            </div>
          </div>
        )}

        {/* 학습 캘린더 (잔디) — Amplitude ETL 데이터 대비 */}
        <div className="mb-6">
          <LearningCalendar learningDays={learningCalendar} />
        </div>

        {/* 최근 활동 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 최근 모의고사 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-sqld-navy mb-4">최근 모의고사</h2>
            {recentExams.length > 0 ? (
              <ul className="space-y-3">
                {recentExams.slice(0, 5).map((exam, idx) => (
                  <li key={`${exam.examId}-${exam.attemptNo}-${idx}`}>
                    <Link
                      to={`/exams/${exam.examId}/result`}
                      className="flex items-center justify-between text-sm hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-700">{exam.examTitle}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(exam.submittedAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sqld-navy">{exam.scorePercent}점</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            exam.passed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {exam.passed ? '합격' : '불합격'}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                message="아직 모의고사 기록이 없습니다."
                ctaLabel="모의고사 풀러가기"
                ctaTo="/exams"
              />
            )}
          </div>

          {/* 최근 SQL 실습 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-sqld-navy mb-4">최근 SQL 실습</h2>
            {recentSql.length > 0 ? (
              <ul className="space-y-3">
                {recentSql.slice(0, 5).map((item, idx) => (
                  <li key={`${item.practiceId}-${idx}`}>
                    <Link
                      to={`/sql-practice/${item.practiceId}`}
                      className="flex items-center justify-between text-sm hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-700">{item.title}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(item.submittedAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          item.isCorrect
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {item.isCorrect ? '정답' : '오답'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                message="아직 SQL 실습 기록이 없습니다."
                ctaLabel="SQL 실습하러 가기"
                ctaTo="/sql-practice"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
