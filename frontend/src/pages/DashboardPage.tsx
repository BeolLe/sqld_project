import { useNavigate } from 'react-router-dom';
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
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Target, Clock, BookOpen } from 'lucide-react';

// 임시 목업 데이터 (실제 서비스에서는 API 연동)
const CATEGORY_STATS = [
  { subject: 'DML', rate: 80 },
  { subject: 'DDL', rate: 65 },
  { subject: 'JOIN', rate: 72 },
  { subject: '서브쿼리', rate: 58 },
  { subject: '함수', rate: 90 },
  { subject: '집합연산', rate: 45 },
];

const RECENT_EXAMS = [
  { id: '1', title: 'SQLD 모의고사 1회', score: 78, date: '2026-02-20', passed: true },
  { id: '2', title: 'SQLD 모의고사 2회', score: 54, date: '2026-02-18', passed: false },
  { id: '3', title: 'SQLD 모의고사 3회', score: 82, date: '2026-02-15', passed: true },
];

const RECENT_SQL = [
  { id: '1', title: 'GROUP BY와 HAVING 절', isCorrect: true, date: '2026-02-22' },
  { id: '2', title: 'INNER JOIN 기본', isCorrect: true, date: '2026-02-22' },
  { id: '3', title: 'ROLLUP 함수 활용', isCorrect: false, date: '2026-02-21' },
];

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

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

        {/* 요약 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Trophy,
              label: '보유 포인트',
              value: `${user?.points ?? 0}pt`,
              color: 'text-amber-500',
            },
            { icon: Target, label: '모의고사 합격', value: '2회', color: 'text-emerald-500' },
            { icon: Clock, label: '총 학습 시간', value: '4h 32m', color: 'text-blue-500' },
            { icon: BookOpen, label: '푼 문제 수', value: '127문제', color: 'text-purple-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <Icon className={`w-6 h-6 ${color} mb-2`} />
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-sqld-navy">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 과목별 정답률 레이더 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-sqld-navy mb-4">과목별 정답률</h2>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={CATEGORY_STATS}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
                <Radar
                  name="정답률"
                  dataKey="rate"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 모의고사 점수 추이 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-sqld-navy mb-4">모의고사 점수 추이</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={RECENT_EXAMS.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v.replace('SQLD 모의고사 ', '')}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}점`]} />
                <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              합격 기준: 60점
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-sqld-navy mb-4">최근 모의고사</h2>
            <ul className="space-y-3">
              {RECENT_EXAMS.map((exam) => (
                <li key={exam.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-700">{exam.title}</p>
                    <p className="text-xs text-slate-400">{exam.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sqld-navy">{exam.score}점</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${exam.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}
                    >
                      {exam.passed ? '합격' : '불합격'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-sqld-navy mb-4">최근 SQL 실습</h2>
            <ul className="space-y-3">
              {RECENT_SQL.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.date}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}
                  >
                    {item.isCorrect ? '정답' : '오답'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
