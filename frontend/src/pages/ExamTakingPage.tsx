import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import Notepad from '../components/Notepad';
import { logEvent } from '../utils/eventLogger';
import { useAuth } from '../contexts/AuthContext';
import DescriptionRenderer from '../components/DescriptionRenderer';
import type { Problem } from '../types';
import { fetchExamProblems } from '../api/content';
import {
  fetchExamSession,
  saveExamAnswer,
  saveExamMemo,
  submitExam,
  syncExamSession,
} from '../api/exams';

const PROBLEMS_PER_PAGE = 5;

function ChoiceProblem({
  problem,
  index,
  selected,
  onSelect,
}: {
  problem: Problem;
  index: number;
  selected?: string;
  onSelect: (val: string) => void;
}) {
  return (
    <div className="mb-8 break-inside-avoid">
      <div className="font-semibold text-slate-800 mb-3 leading-relaxed">
        <span className="text-primary-600 mr-1">{index + 1}.</span>
        <DescriptionRenderer text={problem.description} />
      </div>
      <div className="space-y-2 ml-4">
        {problem.options?.map((opt, oi) => {
          const val = String(oi + 1);
          return (
            <label key={val} className="flex items-start gap-2 cursor-pointer group">
              <input
                type="radio"
                name={problem.id}
                value={val}
                checked={selected === val}
                onChange={() => onSelect(val)}
                className="mt-0.5 w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
              />
              <span
                className={`text-sm leading-relaxed ${selected === val ? 'text-primary-700 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}
              >
                {oi + 1}) {opt}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function ExamTakingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [memoContent, setMemoContent] = useState('');
  const syncStateRef = useRef({ currentPageNo: 1, remainingSeconds: 0 });

  useEffect(() => {
    if (!id || !user) return;

    let mounted = true;

    Promise.all([fetchExamProblems(id), fetchExamSession(id)])
      .then(([problemData, session]) => {
        if (!mounted) return;
        setProblems(problemData);
        setAttemptId(session.attemptId);
        setAnswers(session.answers);
        setMemoContent(session.memoContent);
        setRemainingSeconds(session.remainingSeconds);
        setCurrentPage(Math.max(0, session.currentPageNo - 1));
        syncStateRef.current = {
          currentPageNo: session.currentPageNo,
          remainingSeconds: session.remainingSeconds,
        };
      })
      .catch((caughtError) => {
        if (!mounted) return;
        setError(caughtError instanceof Error ? caughtError.message : '문제를 불러오지 못했습니다.');
      });

    return () => {
      mounted = false;
    };
  }, [id, user]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [started] = useState(() => {
    logEvent('exam_session_started', { examId: id }, user?.id);
    return true;
  });
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [exitTarget, setExitTarget] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(problems.length / PROBLEMS_PER_PAGE);
  const pageProblems = useMemo(
    () => problems.slice(currentPage * PROBLEMS_PER_PAGE, (currentPage + 1) * PROBLEMS_PER_PAGE),
    [problems, currentPage]
  );
  const pageStartIndex = currentPage * PROBLEMS_PER_PAGE;

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
      syncStateRef.current.currentPageNo = Math.max(1, Math.min(page + 1, totalPages));
      if (id && user) {
        void syncExamSession(id, {
          currentPageNo: Math.max(1, Math.min(page + 1, totalPages)),
          remainingSeconds: syncStateRef.current.remainingSeconds,
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [id, totalPages, user]
  );

  const handleSelect = useCallback(
    (problemId: string, val: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [problemId]: val };
        logEvent('exam_answer_selected', { problemId, selected: val, examId: id }, user?.id);
        return next;
      });
      if (id && user) {
        void saveExamAnswer(id, {
          problemId,
          selectedAnswer: val,
          currentPageNo: currentPage + 1,
          remainingSeconds: syncStateRef.current.remainingSeconds,
        });
      }
    },
    [currentPage, id, user, user?.id]
  );

  const handleSubmit = useCallback(() => {
    if (!id || !user) return;

    void submitExam(id, {
      currentPageNo: currentPage + 1,
      remainingSeconds: syncStateRef.current.remainingSeconds,
    }).then((result) => {
      logEvent('exam_submit_confirmed', { examId: id, attemptId, answers: result.answers, score: result.score }, user.id);
      logEvent('exam_result_viewed', { examId: id, userId: user.id, score: result.score }, user.id);

      navigate(`/exams/${id}/result`, {
        state: { score: result.score, answers: result.answers, problems: result.problems },
      });
    }).catch((caughtError) => {
      setError(caughtError instanceof Error ? caughtError.message : '시험 제출 중 오류가 발생했습니다.');
    });
  }, [attemptId, currentPage, id, navigate, user]);

  const handleMemoSave = useCallback(
    async (content: string) => {
      setMemoContent(content);
      if (id && user) {
        await saveExamMemo(id, content);
      }
    },
    [id, user]
  );

  useEffect(() => {
    if (!id || !user || !attemptId) return;

    const intervalId = window.setInterval(() => {
      void syncExamSession(id, {
        currentPageNo: syncStateRef.current.currentPageNo,
        remainingSeconds: syncStateRef.current.remainingSeconds,
      });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [attemptId, id, user]);

  const answeredCount = Object.keys(answers).length;
  const unanswered = problems.length - answeredCount;

  useEffect(() => {
    if (remainingSeconds === null) return;
    syncStateRef.current.remainingSeconds = remainingSeconds;
  }, [remainingSeconds]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/exams')}
            className="text-primary-600 hover:underline"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">모의고사는 로그인 후 이용할 수 있습니다.</p>
          <button
            onClick={() => navigate('/exams')}
            className="text-primary-600 hover:underline"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  if (!problems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">문제를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (!started) return null;

  return (
    <div className="min-h-screen bg-slate-200">
      {/* 글로벌 네비게이션 바 */}
      <div className="sticky top-0 z-40 bg-sqld-navy border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => setExitTarget('/')}
            className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <Database className="w-5 h-5 text-primary-500" />
            <span>
              Sol<span className="text-primary-500">SQLD</span>
            </span>
          </button>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <button
              onClick={() => setExitTarget('/exams')}
              className="hover:text-white transition-colors"
            >
              모의고사
            </button>
            <button
              onClick={() => setExitTarget('/sql-practice')}
              className="hover:text-white transition-colors"
            >
              SQL 실습
            </button>
          </nav>
        </div>
      </div>

      {/* 시험 정보 바 */}
      <div className="sticky top-12 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="text-sm font-semibold text-sqld-navy">
            SQLD 모의고사 {id}회 &nbsp;
            <span className="text-slate-400 font-normal">
              {answeredCount}/{problems.length}문제 답변
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CountdownTimer
              totalSeconds={remainingSeconds ?? 0}
              onExpire={handleSubmit}
              onChangeRemaining={setRemainingSeconds}
            />
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
            >
              최종 제출
            </button>
          </div>
        </div>
      </div>

      {/* A4 스케일 레이아웃 + 사이드 메모장 */}
      <div className="max-w-6xl mx-auto px-4 mt-6 flex gap-5">
        {/* A4 영역 + 좌우 네비게이션 */}
        <div className="flex-1 min-w-0 relative">
          {/* 왼쪽 페이지 넘기기 버튼 */}
          {currentPage > 0 && (
            <button
              onClick={() => goToPage(currentPage - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-16 flex items-center justify-center bg-sqld-navy/20 hover:bg-sqld-navy/40 text-sqld-navy/60 hover:text-sqld-navy shadow-sm hover:shadow-md rounded-r-lg transition-all duration-200"
              aria-label="이전 페이지"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* 오른쪽 페이지 넘기기 버튼 */}
          {currentPage < totalPages - 1 && (
            <button
              onClick={() => goToPage(currentPage + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-16 flex items-center justify-center bg-sqld-navy/20 hover:bg-sqld-navy/40 text-sqld-navy/60 hover:text-sqld-navy shadow-sm hover:shadow-md rounded-l-lg transition-all duration-200"
              aria-label="다음 페이지"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div className="w-a4 min-h-a4 bg-white shadow-xl mx-auto p-12 rounded-sm border border-slate-300">
            {/* 헤더는 첫 페이지에만 */}
            {currentPage === 0 && (
              <div className="text-center mb-8 pb-4 border-b-2 border-sqld-navy">
                <h1 className="text-xl font-bold text-sqld-navy">SQLD 모의고사 {id}회</h1>
                <p className="text-sm text-slate-500 mt-1">
                  총 {problems.length}문항 · 제한시간 90분 · 60점 이상 합격
                </p>
              </div>
            )}

            {/* 페이지 상단 번호 표시 (2페이지부터) */}
            {currentPage > 0 && (
              <div className="text-right text-xs text-slate-400 mb-6">
                {pageStartIndex + 1}~{Math.min(pageStartIndex + PROBLEMS_PER_PAGE, problems.length)}
                번 문제
              </div>
            )}

            {pageProblems.map((problem, index) => (
              <ChoiceProblem
                key={problem.id}
                problem={problem}
                index={pageStartIndex + index}
                selected={answers[problem.id]}
                onSelect={(val) => handleSelect(problem.id, val)}
              />
            ))}

            {/* 페이지 하단 인디케이터 */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {currentPage + 1} / {totalPages} 페이지
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                      i === currentPage
                        ? 'bg-sqld-navy text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 사이드 메모장 */}
        <div className="w-64 shrink-0 sticky top-32 self-start h-[600px]">
          <Notepad examId={id} initialContent={memoContent} userId={user?.id} onSave={handleMemoSave} />
        </div>
      </div>

      {/* 제출 확인 모달 */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
            {unanswered > 0 && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-4 py-3 mb-4">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{unanswered}문제가 미답변 상태입니다.</p>
              </div>
            )}
            <h3 className="text-lg font-bold text-sqld-navy mb-2">최종 제출하시겠습니까?</h3>
            <p className="text-sm text-slate-500 mb-6">제출 후에는 답안을 변경할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                계속 풀기
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                제출
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이탈 확인 모달 */}
      {exitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-sqld-navy mb-2">시험을 나가시겠습니까?</h3>
            <p className="text-sm text-slate-500 mb-1">현재까지 선택한 답안과 메모는 저장되며,</p>
            <p className="text-sm text-slate-500 mb-6">시험 시간은 계속 진행됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setExitTarget(null)}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                계속 풀기
              </button>
              <button
                onClick={() => navigate(exitTarget)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
