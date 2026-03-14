import { useNavigate } from 'react-router-dom';
import { BookOpen, Terminal, Trophy, ChevronRight, CheckCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: BookOpen,
    title: '실전 모의고사',
    desc: (
      <>
        실제 SQLD 시험 형식 반영 (50문항, 90분)
        <br />
      </>
    ), // 따옴표 제거
    color: 'bg-blue-500',
  },
  {
    icon: Terminal,
    title: 'SQL 실습',
    desc: (
      <>
        Oracle 환경 기반 SQL 실행 및 확인
        <br />
      </>
    ), // 따옴표 제거
    color: 'bg-emerald-500',
  },
  {
    icon: Trophy,
    title: '성과 분석',
    desc: '과목별 정답률 시각화 및 오답 노트 자동 생성',
    color: 'bg-amber-500',
  },
];

const EXAM_HIGHLIGHTS = [
  'A4 스케일 레이아웃으로 실제 시험지 재현',
  '남은 시간 카운트다운 실시간 표시',
  '사이드 메모장 입력 내용 자동 저장',
  '합격(60점 이상)/불합격 즉시 판정',
];

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sqld-navy to-slate-900">
      {/* 히어로 섹션 */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
        <span className="inline-block bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-blue-500/30">
          SQLD 합격을 위한 최적의 플랫폼
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          SQL을 실습하고
          <br />
          <span className="text-primary-400">SQLD를 정복</span>하세요
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
          Oracle 기반 실시간 SQL 실습 환경과 실제 시험장을 재현한 모의고사로
          <br></br>
          SQLD 자격증 합격을 향한 최단 경로를 제시합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/exams')}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-primary-900/40"
          >
            모의고사 풀이 <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/sql-practice')}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            SQL 실습 <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* 핵심 기능 카드 */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:border-primary-600 transition-colors"
            >
              <div
                className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 모의고사 하이라이트 */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">실제 시험장 그대로</h2>
          <ul className="space-y-3">
            {EXAM_HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
