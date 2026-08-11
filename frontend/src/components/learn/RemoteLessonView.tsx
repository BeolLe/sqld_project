import { CheckCircle2 } from 'lucide-react';
import type { LessonProgress, RemoteLesson } from '../../api/education';
import type { LearnUnit } from '../../data/learn/types';
import { useAuth } from '../../contexts/AuthContext';
import LessonMarkdown from './LessonMarkdown';
import type { LessonSection } from './lessonSections';

const SUMMARY_SECTION_TITLE = '핵심 정리';

const metaPillClass =
  'rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold text-primary-100';

interface RemoteLessonViewProps {
  unit: LearnUnit;
  lesson: RemoteLesson;
  sections: LessonSection[];
  progress: LessonProgress | null;
  onMarkComplete: () => void;
  completing: boolean;
}

export default function RemoteLessonView({
  unit,
  lesson,
  sections,
  progress,
  onMarkComplete,
  completing,
}: RemoteLessonViewProps) {
  const { isLoggedIn } = useAuth();
  const isCompleted = progress?.status === 'COMPLETED';

  return (
    <>
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-sqld-navy via-slate-900 to-sqld-blue px-8 py-9 text-white shadow-lg shadow-slate-900/10">
        <p className="mb-2 text-[0.72rem] font-extrabold tracking-[0.12em] text-primary-300">
          SQLD CONCEPT NOTE
        </p>
        <h1 className="text-[1.85rem] font-extrabold leading-tight tracking-tight">
          {lesson.title}
        </h1>
        {lesson.summary && (
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-slate-300">
            {lesson.summary}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {lesson.estimatedMinutes != null && (
            <span className={metaPillClass}>예상 {lesson.estimatedMinutes}분</span>
          )}
          <span className={metaPillClass}>{unit.subject}과목</span>
          {isCompleted && (
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-[0.72rem] font-bold text-emerald-200">
              학습 완료
            </span>
          )}
        </div>
      </div>

      {sections.map((section, index) => {
        const isSummary = section.title === SUMMARY_SECTION_TITLE;
        return (
          <section
            key={section.id}
            id={section.id}
            className={
              isSummary
                ? 'mb-6 scroll-mt-24 rounded-2xl bg-gradient-to-br from-primary-700 to-sqld-navy px-7 py-7 text-white shadow-md'
                : 'mb-6 scroll-mt-24 rounded-2xl border border-slate-200 bg-white px-7 py-7 shadow-sm'
            }
          >
            <h2
              className={
                isSummary
                  ? 'mb-4 flex items-center gap-2.5 text-[1.2rem] font-bold text-white'
                  : 'mb-4 flex items-center gap-2.5 text-[1.2rem] font-bold text-slate-900'
              }
            >
              {!isSummary && (
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-[0.8rem] font-extrabold text-white">
                  {index + 1}
                </span>
              )}
              {section.title}
            </h2>
            <div
              className={
                isSummary
                  ? '[&_code]:bg-white/15 [&_code]:text-white [&_code]:ring-white/20 [&_em]:text-slate-100 [&_li]:text-slate-100 [&_ol]:text-slate-100 [&_p]:text-slate-100 [&_strong]:text-white [&_ul]:text-slate-100'
                  : undefined
              }
            >
              <LessonMarkdown markdown={section.body} />
            </div>
          </section>
        );
      })}

      {isLoggedIn && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
          {isCompleted ? (
            <p className="inline-flex items-center gap-1.5 text-[0.9rem] font-bold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              학습을 완료했습니다.
            </p>
          ) : (
            <>
              <p className="text-[0.9rem] text-slate-500">다 읽으셨다면 학습 완료로 표시해 보세요.</p>
              <button
                type="button"
                onClick={onMarkComplete}
                disabled={completing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {completing ? '저장 중...' : '학습 완료로 표시'}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
