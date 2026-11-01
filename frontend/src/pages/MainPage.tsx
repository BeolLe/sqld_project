import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Terminal, Trophy, Layers, ChevronRight, CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useExamType } from '../hooks/useExamType';
import type { ExamFeatureConfig } from '../constants/examTypes';
import ExamScheduleCard from '../components/ExamScheduleCard';
import CreatorCredentials from '../components/CreatorCredentials';
import { PageviewLog, ClickLog } from '../logging';

const FEATURE_ICONS: Record<ExamFeatureConfig['icon'], LucideIcon> = {
  'book-open': BookOpen,
  terminal: Terminal,
  layers: Layers,
  trophy: Trophy,
};

export default function MainPage() {
  const navigate = useNavigate();
  const { examType, config, examPath } = useExamType();
  const homeUrl = examPath('/');
  const pageview = useMemo(() => new PageviewLog({ page_id: 'main', url: homeUrl }), [homeUrl]);
  const click = useMemo(() => new ClickLog({ page_id: 'main', url: homeUrl }), [homeUrl]);
  const pvSent = useRef<string | null>(null);

  // 시험을 바꾸면 같은 컴포넌트가 재사용되므로 시험마다 한 번씩 보낸다.
  useEffect(() => {
    if (pvSent.current === examType) return;
    pvSent.current = examType;
    pageview.send();
  }, [pageview, examType]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sqld-navy to-slate-900">
      {/* 히어로 섹션 */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
        <span className="inline-block bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-blue-500/30">
          {config.hero.badge}
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          {config.hero.titleLine}
          <br />
          <span className="text-primary-400">{config.hero.titleHighlight}</span>하세요
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
          {config.hero.descriptionLines.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              click.send({ object_section_id: 'hero', object_section_idx: 1, object_type: 'button', object_idx: 0, object_id: 'exam_list', object_url: examPath('/exams') });
              navigate(examPath('/exams'));
            }}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-primary-900/40"
          >
            모의고사 풀이 <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const to = examPath(config.hero.secondary.path);
              click.send({ object_section_id: 'hero', object_section_idx: 1, object_type: 'button', object_idx: 1, object_id: config.hasSqlPractice ? 'sql_practice' : 'learn_index', object_url: to });
              navigate(to);
            }}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            {config.hero.secondary.label} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* 시험 일정 */}
      <ExamScheduleCard />

      {/* 합격자 신뢰 섹션 */}
      <CreatorCredentials />

      {/* 핵심 기능 카드 */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {config.features.map(({ icon, title, description, color }) => {
            const Icon = FEATURE_ICONS[icon];
            return (
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
              <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
            );
          })}
        </div>
      </section>

      {/* 모의고사 하이라이트 */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">실제 시험장 그대로</h2>
          <ul className="space-y-3">
            {config.highlights.map((item) => (
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
