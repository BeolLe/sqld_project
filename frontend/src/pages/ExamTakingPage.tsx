import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import Notepad from '../components/Notepad';
import { logEvent } from '../utils/eventLogger';
import { useAuth } from '../contexts/AuthContext';
import { getExamProblems } from '../data/exams';
import DescriptionRenderer from '../components/DescriptionRenderer';
import type { Problem } from '../types';

const EXAM_TIME_SECONDS = 90 * 60; // 90분

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

  const problems = getExamProblems(id ?? '1');

  const [sessionId] = useState(crypto.randomUUID());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [started] = useState(() => {
    logEvent('exam_start', { examId: id, sessionId }, user?.id);
    return true;
  });
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const handleSelect = useCallback(
    (problemId: string, val: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [problemId]: val };
        logEvent('choice_select', { problemId, selected: val, examId: id }, user?.id);
        return next;
      });
    },
    [id, user?.id]
  );

  const handleSubmit = useCallback(() => {
    const score = problems.reduce((acc, p) => {
      return answers[p.id] === p.answer ? acc + 2 : acc;
    }, 0); // 50문항 × 2점 = 100점 만점

    logEvent('exam_submit', { examId: id, sessionId, answers, score }, user?.id);
    logEvent('stats_update', { examId: id, userId: user?.id, score }, user?.id);

    navigate(`/exams/${id}/result`, {
      state: { score, answers, sessionId, problems },
    });
  }, [answers, id, sessionId, user, navigate, problems]);

  const answeredCount = Object.keys(answers).length;
  const unanswered = problems.length - answeredCount;

  if (!started) return null;

  return (
    <div className="min-h-screen bg-slate-200 py-6">
      {/* 상단 고정 바 */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="text-sm font-semibold text-sqld-navy">
            SQLD 모의고사 {id}회 &nbsp;
            <span className="text-slate-400 font-normal">
              {answeredCount}/{problems.length}문제 답변
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CountdownTimer totalSeconds={EXAM_TIME_SECONDS} onExpire={handleSubmit} />
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
        {/* A4 영역 */}
        <div className="flex-1 min-w-0">
          <div className="w-a4 min-h-a4 bg-white shadow-xl mx-auto p-12 rounded-sm border border-slate-300">
            <div className="text-center mb-8 pb-4 border-b-2 border-sqld-navy">
              <h1 className="text-xl font-bold text-sqld-navy">SQLD 모의고사 {id}회</h1>
              <p className="text-sm text-slate-500 mt-1">
                총 {problems.length}문항 · 제한시간 90분 · 60점 이상 합격
              </p>
            </div>

            {problems.map((problem, index) => (
              <ChoiceProblem
                key={problem.id}
                problem={problem}
                index={index}
                selected={answers[problem.id]}
                onSelect={(val) => handleSelect(problem.id, val)}
              />
            ))}
          </div>
        </div>

        {/* 사이드 메모장 */}
        <div className="w-64 shrink-0 sticky top-20 self-start h-[600px]">
          <Notepad examSessionId={sessionId} userId={user?.id} />
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
    </div>
  );
}
