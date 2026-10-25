import { BookOpen, ChevronRight, BarChart3, Shuffle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SECTIONS = [
  { path: '/adsp/exams', title: '모의고사', icon: BookOpen },
  { path: '/adsp/learn', title: '개념 학습', icon: BookOpen },
  { path: '/adsp/endless', title: '무한풀이', icon: Shuffle },
  { path: '/adsp/dashboard', title: '학습현황', icon: BarChart3 },
];

export default function ADsPPreviewPage() {
  const { pathname } = useLocation();
  const section = SECTIONS.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <div className="min-h-screen bg-gradient-to-b from-sqld-navy to-slate-900 text-white">
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 sm:pt-24">
        <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
          ADsP · 테스트 미리보기
        </span>
        <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold leading-tight">
          {section ? `ADsP ${section.title}` : <>데이터 분석을 이해하고<br /><span className="text-emerald-400">ADsP를 준비</span>하세요</>}
        </h1>
        <p className="mt-5 text-slate-400 leading-relaxed">
          데이터분석 준전문가 · 3과목 · 50문항 · 90분
        </p>
        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          <h2 className="font-bold text-lg">{section ? `${section.title} 준비 중` : 'ADsP 학습 콘텐츠 준비 중'}</h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            현재는 시험 전환과 메뉴를 확인하는 미리보기입니다. ADsP 문제 풀이와 학습 기록은 아직 연결되지 않았습니다.
          </p>
        </div>
        <nav aria-label="ADsP 학습 메뉴" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map(({ path, title, icon: Icon }) => (
            <Link key={path} to={path} aria-current={section?.path === path ? 'page' : undefined}
              className={`rounded-2xl border p-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${section?.path === path ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/60 hover:border-emerald-500'}`}>
              <Icon className="w-6 h-6 text-emerald-400 mb-4" />
              <span className="flex items-center justify-between font-semibold">{title}<ChevronRight className="w-4 h-4" /></span>
              <span className="mt-2 block text-xs text-slate-400">준비 중</span>
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
