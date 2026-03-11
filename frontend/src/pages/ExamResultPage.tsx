import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Trophy, XCircle, CheckCircle, RotateCcw } from 'lucide-react';
import type { Problem } from '../types';

interface ResultState {
  score: number;
  answers: Record<string, string>;
  problems: Problem[];
}

export default function ExamResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as { state: ResultState | null };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">결과 데이터가 없습니다.</p>
          <button onClick={() => navigate('/exams')} className="text-primary-600 hover:underline">
            모의고사 목록으로
          </button>
        </div>
      </div>
    );
  }

  const { score, answers, problems } = state;
  const isPassed = score >= 60;

  const correctList = problems.filter((p) => answers[p.id] === p.answer);
  const wrongList = problems.filter((p) => answers[p.id] !== p.answer);

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
          <h1 className="text-3xl font-extrabold mb-2">{isPassed ? '합격' : '불합격'}</h1>
          <p className="text-5xl font-black mb-2">{score}점</p>
          <p className="text-sm opacity-80">
            {isPassed ? '60점 이상 합격' : '60점 미만 불합격'} &nbsp;|&nbsp; 정답{' '}
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
                    <p className="mt-2 text-slate-600 leading-relaxed border-l-2 border-primary-300 pl-3">
                      {problem.explanation}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/exams/${id}`)}
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
    </div>
  );
}
