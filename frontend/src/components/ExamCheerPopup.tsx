import { X, Sparkles } from 'lucide-react';

const CHEER_SHOWN_KEY = 'exam_cheer_61_shown';

export function shouldShowCheerPopup(): boolean {
  const now = new Date();
  const isExamDay =
    now.getFullYear() === 2026 && now.getMonth() === 4 && now.getDate() === 31;
  if (!isExamDay) return false;
  return localStorage.getItem(CHEER_SHOWN_KEY) !== 'true';
}

function markShown() {
  localStorage.setItem(CHEER_SHOWN_KEY, 'true');
}

interface ExamCheerPopupProps {
  onClose: () => void;
}

export default function ExamCheerPopup({ onClose }: ExamCheerPopupProps) {
  function handleClose() {
    markShown();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-8 py-10 text-white text-center relative overflow-hidden">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute -left-6 -top-6 opacity-10">
            <Sparkles className="w-28 h-28" strokeWidth={1} />
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <Sparkles className="w-28 h-28" strokeWidth={1} />
          </div>

          <div className="relative">
            <p className="text-5xl mb-4">🍀</p>
            <h2 className="text-xl font-bold leading-snug mb-2">
              제61회 SQLD 시험
              <br />
              합격을 진심으로 응원합니다!
            </h2>
            <p className="text-sm text-white/90 mt-3">
              그동안의 노력이 빛나는 하루가 되길 바랍니다
            </p>
          </div>
        </div>

        <div className="px-8 py-5 text-center">
          <button
            onClick={handleClose}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            시험 보러 가기 💪
          </button>
        </div>
      </div>
    </div>
  );
}
