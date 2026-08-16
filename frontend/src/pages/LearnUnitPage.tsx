/**
 * 개념 학습 — 세부항목 상세 페이지.
 *
 * TODO(백엔드 DB 연동 필요): 현재 콘텐츠는 `data/learn/units/*.ts` 하드코딩이다.
 * 학습 진도·빈칸 채점 결과도 화면 로컬 state 에만 남고 서버에 저장되지 않는다.
 * DB 연동 시 `REMOTE_LESSON_ENABLED` 를 켜서 `useRemoteLesson` 경로로 전환한다.
 */
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { countBlanks, findUnit } from '../data/learn/curriculum';
import BlockRenderer from '../components/learn/BlockRenderer';
import RemoteLessonView from '../components/learn/RemoteLessonView';
import { splitLessonSections } from '../components/learn/lessonSections';
import { useRemoteLesson } from '../hooks/useRemoteLesson';
import { useAuth } from '../contexts/AuthContext';

/**
 * 백엔드 개념교육 레슨 연동 스위치.
 * DB 연동 전까지는 로컬 콘텐츠가 있는 항목만 노출하고, 나머지는 '준비 중'으로 안내한다.
 * 연동이 끝나면 true 로 바꾸면 기존 RemoteLessonView 경로가 그대로 살아난다.
 */
const REMOTE_LESSON_ENABLED = false;

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
  const ready = unit ? unit.blocks.length > 0 : false;
  const { user, isLoggedIn, isInitializing } = useAuth();
  const navigate = useNavigate();

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

  // 로컬 콘텐츠(빈칸 복습 포함)가 없는 항목만 백엔드 개념교육 레슨을 조회한다.
  const remote = useRemoteLesson(
    REMOTE_LESSON_ENABLED && !ready && unit ? unit.id : undefined,
  );
  const remoteSections = useMemo(
    () => (remote.lesson ? splitLessonSections(remote.lesson.bodyMarkdown) : []),
    [remote.lesson],
  );

  const enterQuiz = () => {
    setCorrectIds(new Set());
    setQuizMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitQuiz = () => {
    setQuizMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          <p className="text-slate-500 mb-4">
            개념 학습은 회원 전용입니다.
            <br />
            로그인하시면 30개 세부항목의 개념 노트와 빈칸 복습을 이용할 수 있습니다.
          </p>
          <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!unit) return <NotFound />;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-start gap-11 py-8 pb-20 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav className="top-20 hidden text-[0.8125rem] lg:sticky lg:block print:hidden">
            <Link
              to="/learn"
              className="mb-4 inline-flex items-center gap-1 text-slate-500 hover:text-primary-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              목차로
            </Link>
            {(ready || remoteSections.length > 0) && (
              <>
                <h2 className="mb-2.5 text-[0.72rem] font-bold tracking-wide text-slate-400">
                  이 항목의 목차
                </h2>
                <ol className="border-l-2 border-slate-200">
                  {(ready ? unit.blocks : remoteSections).map((block, index) => (
                    <li key={block.id}>
                      <a
                        href={`#${block.id}`}
                        className="-ml-0.5 block border-l-2 border-transparent py-1.5 pl-3 leading-snug text-slate-500 hover:text-slate-900"
                      >
                        {index + 1}. {'heading' in block ? block.heading : block.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </nav>

          <article className="max-w-[44rem]">
            <p className="mb-2 text-[0.78rem] text-slate-400">
              개념 학습 › {unit.subject}과목 › {unit.group}
            </p>
            {!(!ready && remote.status === 'ready' && remote.lesson) && (
              <>
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
                </div>
              </>
            )}

            {!ready && remote.status === 'loading' && (
              <div className="animate-pulse space-y-3">
                <div className="h-32 rounded-2xl bg-slate-100" />
                <div className="h-24 rounded-2xl bg-slate-100" />
                <div className="h-24 rounded-2xl bg-slate-100" />
              </div>
            )}

            {!ready && remote.status === 'error' && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
                <p className="text-[0.9rem] leading-relaxed text-red-900">
                  콘텐츠를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
                </p>
              </div>
            )}

            {!ready && remote.status === 'not-found' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                <p className="text-[0.9rem] leading-relaxed text-amber-900">
                  콘텐츠 준비 중입니다.
                  <br />
                  빠른 시일 내에 업데이트할 수 있도록 하겠습니다.
                </p>
                <Link
                  to="/learn"
                  className="mt-3 inline-block text-[0.9rem] font-semibold text-amber-900 underline"
                >
                  목차로 돌아가기
                </Link>
              </div>
            )}

            {!ready && remote.status === 'ready' && remote.lesson && (
              <RemoteLessonView
                unit={unit}
                lesson={remote.lesson}
                sections={remoteSections}
                progress={remote.progress}
                onMarkComplete={remote.markComplete}
                completing={remote.completing}
              />
            )}

            {ready && quizMode && (
              <p className="mb-4 inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-[0.72rem] font-bold text-primary-600 print:hidden">
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
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 print:hidden">
                <p className="text-[0.9rem] text-slate-500">
                  <b className="block font-bold text-slate-900">다 읽으셨나요?</b>
                  같은 내용을 빈칸으로 채우며 확인해 보세요.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    인쇄 · PDF 저장
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
              <div className="mt-10 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 print:hidden">
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

            <p className="mt-6 hidden border-t border-slate-200 pt-3 text-[0.7rem] text-slate-400 print:block">
              SolSQLD · 개념 학습 노트 — {unit.subject}과목 {unit.group} · {unit.title}
            </p>
          </article>
        </div>
      </div>
      {user?.nickname && (
        <div aria-hidden="true" className="hidden print:block print-watermark">
          SolSQLD · 무단 복제 및 배포를 금지합니다 · {user.nickname} ·{' '}
          {new Date().toLocaleDateString('ko-KR')}
        </div>
      )}
    </div>
  );
}
