import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen, ArrowRight } from 'lucide-react';

interface ExamDayPopupProps {
  onClose: (dismissForToday: boolean) => void;
}

export default function ExamDayPopup({ onClose }: ExamDayPopupProps) {
  const navigate = useNavigate();
  const [dismissChecked, setDismissChecked] = useState(false);

  function handleClose() {
    onClose(dismissChecked);
  }

  function handleExamClick() {
    onClose(dismissChecked);
    navigate('/exams');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-900 px-8 py-6 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <BookOpen className="w-32 h-32" strokeWidth={1} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wide uppercase">SOLSQLD</span>
            </div>
            <h2 className="text-xl font-bold leading-snug">SQLD 시험, 잘 보고 오십시오</h2>
          </div>
        </div>

        <div className="px-8 py-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <p className="text-slate-700 text-sm leading-relaxed mb-5">
            드디어 시험 당일입니다.
            <br />
            형님들의 준비가 좋은 결과로 이어지길 바랍니다.
            <br />
            차분하게 끝까지 보시면 충분히 좋은 결과 있으실 겁니다.
          </p>

          <div className="bg-primary-50 border border-primary-100 rounded-xl px-5 py-4 mb-6">
            <p className="text-xs font-semibold text-primary-700 mb-3">응원 한마디</p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>시험 잘 보시고, 꼭 합격하시길 바랍니다.</li>
              <li>마지막까지 침착하게 문제 읽고 풀어보십시오.</li>
              <li>SolSQLD가 끝까지 함께 응원하겠습니다.</li>
            </ul>
          </div>

          <button
            onClick={handleExamClick}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors mb-4"
          >
            모의고사 보러 가기
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dismissChecked}
                onChange={(e) => setDismissChecked(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-slate-400">오늘 하루 안 보기</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
