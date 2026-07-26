import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { countBlanks, findUnit } from '../data/learn/curriculum';
import BlockRenderer from '../components/learn/BlockRenderer';

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 text-center">
      <h1 className="mb-3 text-xl font-bold text-slate-900">존재하지 않는 학습 항목입니다.</h1>
      <Link to="/learn" className="text-primary-600 hover:underline">
        교육 목차로 돌아가기
      </Link>
    </div>
  );
}

export default function LearnUnitPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const unit = unitId ? findUnit(unitId) : undefined;

  const [quizMode, setQuizMode] = useState(false);
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());

  const handleGrade = useCallback((blankId: string, correct: boolean) => {
    setCorrectIds((prev) => {
      const next = new Set(prev);
      if (correct) next.add(blankId);
      else next.delete(blankId);
      return next;
    });
  }, []);

  const totalBlanks = useMemo(() => (unit ? countBlanks(unit) : 0), [unit]);

  const enterQuiz = () => {
    setCorrectIds(new Set());
    setQuizMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitQuiz = () => {
    setQuizMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!unit) return <NotFound />;

  const ready = unit.blocks.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-start gap-11 py-8 pb-20 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav className="top-20 hidden text-[0.8125rem] lg:sticky lg:block">
            <Link
              to="/learn"
              className="mb-4 inline-flex items-center gap-1 text-slate-500 hover:text-primary-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              목차로
            </Link>
            {ready && (
              <>
                <h2 className="mb-2.5 text-[0.72rem] font-bold tracking-wide text-slate-400">
                  이 항목의 목차
                </h2>
                <ol className="border-l-2 border-slate-200">
                  {unit.blocks.map((block, index) => (
                    <li key={block.id}>
                      <a
                        href={`#${block.id}`}
                        className="-ml-0.5 block border-l-2 border-transparent py-1.5 pl-3 leading-snug text-slate-500 hover:text-slate-900"
                      >
                        {index + 1}. {block.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </nav>

          <article className="max-w-[44rem]">
            <p className="mb-2 text-[0.78rem] text-slate-400">
              SQLD 교육 › {unit.subject}과목 › {unit.group}
            </p>
            <h1 className="mb-2 text-[1.85rem] font-extrabold leading-tight tracking-tight text-slate-900">
              {unit.title}
            </h1>
            <div className="mb-8 flex flex-wrap gap-4 border-b border-slate-200 pb-5 text-[0.8125rem] text-slate-500">
              <span>
                예상 <b className="font-semibold text-slate-700">{unit.estimatedMin}분</b>
              </span>
              <span>
                세부항목{' '}
                <b className="font-semibold text-slate-700">{unit.order} / 30</b>
              </span>
              {ready && (
                <span>
                  빈칸 <b className="font-semibold text-slate-700">{totalBlanks}개</b>
                </span>
              )}
              {unit.priority1 && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-600">
                  1차 제작 대상
                </span>
              )}
            </div>

            {!ready && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                <p className="text-[0.9rem] leading-relaxed text-amber-900">
                  이 항목은 아직 콘텐츠가 준비되지 않았습니다. 학습 가능한 항목은{' '}
                  <Link to="/learn/sa-window" className="font-semibold underline">
                    윈도우 함수
                  </Link>
                  ,{' '}
                  <Link to="/learn/ad-ddl" className="font-semibold underline">
                    DDL
                  </Link>{' '}
                  입니다.
                </p>
              </div>
            )}

            {ready && quizMode && (
              <p className="mb-4 inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-[0.72rem] font-bold text-primary-600">
                빈칸 복습 모드
              </p>
            )}

            {unit.blocks.map((block, index) => (
              <section key={block.id} id={block.id} className="mb-11 scroll-mt-24">
                <h2 className="mb-3.5 text-[1.22rem] font-bold leading-snug text-slate-900">
                  {index + 1}. {block.heading}
                </h2>
                <BlockRenderer
                  nodes={block.nodes}
                  blanks={block.blanks}
                  quizMode={quizMode}
                  onGrade={handleGrade}
                />
              </section>
            ))}

            {ready && !quizMode && (
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-[0.9rem] text-slate-500">
                  <b className="block font-bold text-slate-900">다 읽으셨나요?</b>
                  같은 내용을 빈칸으로 채우며 확인해 보세요.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled
                    title="준비 중입니다"
                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-400"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    노트 다운로드
                  </button>
                  <button
                    type="button"
                    onClick={enterQuiz}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-700"
                  >
                    빈칸으로 복습하기
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {ready && quizMode && (
              <div className="mt-10 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                <span className="text-2xl font-extrabold tabular-nums text-primary-600">
                  {correctIds.size} / {totalBlanks}
                </span>
                <span className="flex-1 text-sm text-slate-500">
                  빈칸에 입력하고 Enter 또는 다른 곳을 클릭하면 즉시 채점됩니다.
                </span>
                <button
                  type="button"
                  onClick={exitQuiz}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  개념 노트로 돌아가기
                </button>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
