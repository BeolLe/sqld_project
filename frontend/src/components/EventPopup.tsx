import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Gift, BookOpen, ArrowRight } from 'lucide-react';

interface EventPopupProps {
  onClose: (dismissForToday: boolean) => void;
}

export default function EventPopup({ onClose }: EventPopupProps) {
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
        {/* 상단 배너 */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-900 px-8 py-6 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <BookOpen className="w-32 h-32" strokeWidth={1} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wide uppercase">Event</span>
            </div>
            <h2 className="text-xl font-bold leading-snug">
              SQLD 응시자 대상 설문조사 이벤트 안내
            </h2>
          </div>
        </div>

        {/* 본문 */}
        <div className="px-8 py-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <p className="text-slate-700 text-sm leading-relaxed mb-5">
            SolSQLD를 이용해 주셔서 감사합니다.
            <br />
            SQLD 시험 응시 후{' '}
            <span className="font-semibold text-sqld-navy">6월 1일 ~ 6월 30일</span>에
            설문조사에 참여해 주시면,
            <br />
            추첨을 통해{' '}
            <span className="font-semibold text-primary-600">10명</span>에게{' '}
            <span className="font-semibold text-primary-600">커피 기프티콘</span>을
            드립니다.
          </p>

          {/* 추첨 조건 */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl px-5 py-4 mb-6">
            <p className="text-xs font-semibold text-primary-700 mb-3">추첨 조건</p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 font-bold mt-0.5">1</span>
                <span>SQLD 시험 응시 완료</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 font-bold mt-0.5">2</span>
                <span>6/1 ~ 6/30 기간 내 SolSQLD 설문조사 참여</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 font-bold mt-0.5">3</span>
                <span>추첨 후 당첨자에게 개별 연락</span>
              </li>
            </ul>
          </div>

          {/* 모의고사 풀기 버튼 */}
          <button
            onClick={handleExamClick}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors mb-4"
          >
            모의고사 풀기
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* 하단: 오늘 하루 안 보기 */}
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
