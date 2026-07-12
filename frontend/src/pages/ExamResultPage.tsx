import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Trophy, XCircle, CheckCircle, RotateCcw, Flag, Sparkles } from 'lucide-react';
import type { Problem, AIExplainRequest } from '../types';
import { fetchExamResult, type ExamResultResponse } from '../api/exams';
import ReportErrorModal from '../components/ReportErrorModal';
import AIStreamPanel from '../components/AIStreamPanel';
import { useAIStream } from '../hooks/useAIStream';
import { useAIUsage } from '../contexts/AIUsageContext';
import { logEvent } from '../utils/eventLogger';

interface ResultState {
  attemptId?: number;
  score: number;
  answers: Record<string, string>;
  problems: Problem[];
  passed?: boolean;
  failedBySubjectCutoff?: boolean;
  aiExplanations?: Record<string, string>;
}

function WrongItemAI({
  problem,
  userAnswer,
  attemptId,
  cachedExplanation,
}: {
  problem: Problem;
  userAnswer: string;
  attemptId?: number;
  cachedExplanation?: string;
}) {
  const { status, text, usage: streamUsage, error, start, retry } = useAIStream();
  const { usage, refreshUsage } = useAIUsage();
  const [showCached, setShowCached] = useState(!!cachedExplanation);

  const remaining = usage?.explain.remaining;
  const limit = usage?.explain.limit;
  const unlimited = usage?.explain.unlimited === true;
  const isExhausted = !unlimited && remaining === 0;

  const buttonLabel =
    usage != null
      ? unlimited
        ? 'AI 맞춤 해설 보기 (관리자 무제한)'
        : `AI 맞춤 해설 보기 (${remaining}/${limit})`
      : 'AI 맞춤 해설 보기';

  const handleClick = () => {
    if (isExhausted || status === 'streaming') return;
    setShowCached(false);
    const body: AIExplainRequest = {
      attempt_id: attemptId == null ? null : String(attemptId),
      problem_id: problem.id,
      user_answer: userAnswer || '미답변',
      correct_answer: problem.answer,
      problem_title: problem.title,
      options: problem.options ?? [],
      explanation: problem.explanation,
      source: 'exam',
    };
    start(body);
    logEvent('ai_explain_requested', {
      problem_id: problem.id,
      source: 'exam',
      remaining: usage?.explain.remaining ?? null,
    });
  };

  // 완료/실패 시 이벤트 로깅 및 낙관적 사용량 적용 (전환 1회만 감지)
  const prevStatusRef = useRef<typeof status>('idle');
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;
    if (status === 'done' && prevStatus !== 'done') {
      if (streamUsage) {
        logEvent('ai_explain_completed', {
          problem_id: problem.id,
          source: 'exam',
          input: streamUsage.input,
          output: streamUsage.output,
        });
        void refreshUsage();
      }
    }
    if (status === 'error' && prevStatus !== 'error') {
      logEvent('ai_explain_failed', {
        problem_id: problem.id,
        source: 'exam',
        error_message: error,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (showCached && cachedExplanation) {
    return (
      <div className="mt-2">
        <AIStreamPanel status="done" text={cachedExplanation} error={null} onRetry={() => {}} />
        <button
          onClick={handleClick}
          disabled={isExhausted}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 font-medium mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          새로 요청하기
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleClick}
        disabled={isExhausted || status === 'streaming'}
        title={isExhausted ? '일일 한도 초과' : undefined}
        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {buttonLabel}
      </button>
      {status !== 'idle' && (
        <AIStreamPanel status={status} text={text} error={error} onRetry={retry} />
      )}
    </div>
  );
}

export default function ExamResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as { state: ResultState | null };

  const [resultData, setResultData] = useState<ResultState | null>(state);
  const [loading, setLoading] = useState(!state);
  const [fetchError, setFetchError] = useState('');
  const [reportTarget, setReportTarget] = useState<Problem | null>(null);

  useEffect(() => {
    if (state || !id) return;
    let cancelled = false;
    setLoading(true);
    fetchExamResult(id)
      .then((res: ExamResultResponse) => {
        if (cancelled) return;
        setResultData({
          attemptId: res.attemptId,
          score: res.scorePercent,
          answers: res.answers,
          problems: res.problems,
          passed: res.passed,
          failedBySubjectCutoff: res.failedBySubjectCutoff,
          aiExplanations: res.aiExplanations,
        });
      })
      .catch(() => {
        if (!cancelled) setFetchError('제출된 시험 결과가 없습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">시험 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!resultData || fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-700 font-semibold mb-2">{fetchError || '표시할 시험 결과를 찾지 못했습니다.'}</p>
          <p className="text-sm text-slate-500 mb-4">
            시험을 제출한 이력이 없거나, 데이터를 불러올 수 없습니다.
          </p>
          <button onClick={() => navigate('/exams')} className="text-primary-600 hover:underline">
            모의고사 목록으로
          </button>
        </div>
      </div>
    );
  }

  const { score, answers, problems, passed, failedBySubjectCutoff, aiExplanations } = resultData;
  const isPassed = passed === true;
  const isSubjectCutoffFailure = failedBySubjectCutoff === true || (!isPassed && score >= 60);

  const correctList = problems.filter((p) => answers[p.id] === p.answer);
  const wrongList = problems.filter((p) => answers[p.id] !== p.answer);
  const resultTitle = isPassed ? '합격' : '불합격';
  const resultSummary = isSubjectCutoffFailure
    ? '총점이 합격 기준을 넘었더라도, 과목별 40점 미만이 있으면 불합격입니다.'
    : isPassed
      ? '총점 60점 이상으로 합격 기준을 충족했습니다.'
      : '총점이 60점 미만으로 불합격입니다.';
  const resultMetaLabel = isSubjectCutoffFailure
    ? '과목별 과락 적용'
    : isPassed
      ? '60점 이상 합격'
      : '60점 미만 불합격';

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* 결과 헤더 */}
        <div
          className={`rounded-2xl p-8 text-center mb-8 ${isPassed ? 'bg-emerald-600' : 'bg-red-500'} text-white shadow-lg`}
        >
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <Trophy className="w-16 h-16 text-yellow-300" />
            ) : (
              <XCircle className="w-16 h-16 text-white/80" />
            )}
          </div>
          <h1 className="text-3xl font-extrabold mb-2">{resultTitle}</h1>
          <p className="text-5xl font-black mb-2">{score}점</p>
          <p className="text-sm font-medium opacity-90 mb-2">{resultSummary}</p>
          <p className="text-sm opacity-80">
            {resultMetaLabel}{' '}
            &nbsp;|&nbsp; 정답{' '}
            {correctList.length}문제 / 오답 {wrongList.length}문제
          </p>
        </div>

        {/* 오답 해설 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-sqld-navy">오답 및 해설 ({wrongList.length}문제)</h2>
          </div>
          {wrongList.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              오답이 없습니다. 완벽합니다!
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {wrongList.map((problem) => (
                <li key={problem.id} className="px-6 py-5">
                  <div className="flex items-start gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {problem.title}
                    </p>
                  </div>
                  <div className="ml-6 space-y-1 text-xs text-slate-500">
                    <p>
                      <span className="text-red-500 font-semibold">내 답:</span>{' '}
                      {answers[problem.id]
                        ? `${answers[problem.id]}번) ${problem.options?.[Number(answers[problem.id]) - 1]}`
                        : '미답변'}
                    </p>
                    <p>
                      <span className="text-emerald-600 font-semibold">정답:</span> {problem.answer}
                      번) {problem.options?.[Number(problem.answer) - 1]}
                    </p>
                    <button
                      onClick={() => setReportTarget(problem)}
                      className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium mt-2"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      오류 제보
                    </button>
                    <p className="mt-2 text-slate-600 leading-relaxed border-l-2 border-primary-300 pl-3">
                      {problem.explanation}
                    </p>
                    <WrongItemAI
                      problem={problem}
                      userAnswer={answers[problem.id]}
                      attemptId={resultData.attemptId}
                      cachedExplanation={aiExplanations?.[problem.id]}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/exams/${id}/taking`)}
            className="flex items-center gap-2 flex-1 justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            다시 풀기
          </button>
          <button
            onClick={() => navigate('/exams')}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            모의고사 목록
          </button>
        </div>
      </div>

      {reportTarget && (
        <ReportErrorModal
          type="exam_error"
          examId={id}
          problemId={reportTarget.id}
          problemTitle={reportTarget.title}
          currentProblemNo={problems.findIndex((problem) => problem.id === reportTarget.id) + 1}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
