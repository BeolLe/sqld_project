import { useState } from 'react';
import { X } from 'lucide-react';
import { apiFetch } from '../utils/api';
import type { FeedbackType, ErrorSubtype } from '../types';

const ERROR_SUBTYPES: { value: ErrorSubtype; label: string }[] = [
  { value: 'wrong_answer', label: '정답이 틀림' },
  { value: 'typo', label: '문제 오타/표현 오류' },
  { value: 'explanation_error', label: '해설 오류' },
  { value: 'other', label: '기타' },
];

interface ReportErrorModalProps {
  type: FeedbackType;
  examId?: string;
  practiceId?: string;
  problemId?: string;
  problemTitle?: string;
  totalProblems?: number;
  currentProblemNo?: number;
  examProblems?: Array<{ no: number; id: string; title: string }>;
  onClose: () => void;
}

export default function ReportErrorModal({
  type,
  examId,
  practiceId,
  problemId,
  problemTitle,
  totalProblems,
  currentProblemNo,
  examProblems,
  onClose,
}: ReportErrorModalProps) {
  const isExam = type === 'exam_error';
  const [problemNo, setProblemNo] = useState(currentProblemNo ?? 1);
  const [subtype, setSubtype] = useState<ErrorSubtype>('wrong_answer');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const selectedExamProblem = isExam
    ? examProblems?.find((problem) => problem.no === problemNo)
    : null;
  const resolvedProblemTitle = isExam
    ? selectedExamProblem?.title ?? problemTitle
    : problemTitle;
  const resolvedProblemId = isExam
    ? selectedExamProblem?.id ?? problemId
    : practiceId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError('상세 설명을 입력해주세요.');
      return;
    }

    const title = isExam
      ? `모의고사 ${examId}회 ${problemNo}번 - ${ERROR_SUBTYPES.find((s) => s.value === subtype)?.label}`
      : `${problemTitle ?? 'SQL 실습'} - ${ERROR_SUBTYPES.find((s) => s.value === subtype)?.label}`;

    try {
      setLoading(true);
      setError('');
      await apiFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          type,
          title,
          content: content.trim(),
          related_exam_id: examId ?? null,
          related_problem_id: resolvedProblemId ?? null,
          related_problem_no: isExam ? problemNo : null,
          error_subtype: subtype,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '제보에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <>
            <h2 className="text-xl font-bold text-sqld-navy mb-2">제보가 접수되었습니다</h2>
            <p className="text-sm text-slate-500 mb-6">
              피드백 페이지에서 처리 상태를 확인할 수 있습니다.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              닫기
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-sqld-navy mb-1">문제 오류 제보</h2>
            {isExam && examId && (
              <div className="text-sm text-slate-500 mb-4 space-y-1">
                <p>모의고사 {examId}회 {problemNo}번 문항</p>
                {resolvedProblemTitle && <p className="text-slate-600">"{resolvedProblemTitle}"</p>}
              </div>
            )}
            {!isExam && problemTitle && (
              <p className="text-sm text-slate-500 mb-4">{problemTitle}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 문항 번호 드롭다운 (모의고사만) */}
              {isExam && totalProblems && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">문항 번호</label>
                  <select
                    value={problemNo}
                    onChange={(e) => setProblemNo(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {Array.from({ length: totalProblems }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}번
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 오류 유형 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">오류 유형</label>
                <div className="space-y-2">
                  {ERROR_SUBTYPES.map((st) => (
                    <label key={st.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="subtype"
                        value={st.value}
                        checked={subtype === st.value}
                        onChange={() => setSubtype(st.value)}
                        className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">{st.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 상세 설명 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">상세 설명</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="어떤 오류인지 구체적으로 설명해주세요."
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? '제출 중...' : '제보하기'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
