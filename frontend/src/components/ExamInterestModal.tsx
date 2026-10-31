import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { EXAM_CONFIG, EXAM_TYPES } from '../constants/examTypes';
import { getInterestExam, saveInterestExam, saveLastExamType } from '../utils/examPath';
import type { InterestExam } from '../utils/examPath';
import { ClickLog, PageviewLog } from '../logging';

type Choice = Exclude<InterestExam, 'skipped'>;

const CHOICES: { value: Choice; title: string; sub: string }[] = [
  ...EXAM_TYPES.map((type) => ({ value: type, title: EXAM_CONFIG[type].name, sub: EXAM_CONFIG[type].fullName })),
  { value: 'both', title: '둘 다', sub: 'SQLD부터 시작' },
];

/**
 * 관심 시험 선택 (가입 직후 · 통합 후 기존 회원 첫 방문 때 한 번).
 * 고른 시험으로 이동하고, 다음부터는 띄우지 않는다.
 * TODO(백엔드): 지금은 브라우저에만 저장한다. 계정에 저장하는 API 가 생기면 함께 보낸다.
 */
export default function ExamInterestModal() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(() => getInterestExam() === null);
  const [selected, setSelected] = useState<Choice | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pageview = useMemo(() => new PageviewLog({ page_id: 'exam_interest_modal', url: window.location.pathname }), []);
  const click = useMemo(() => new ClickLog({ page_id: 'exam_interest_modal', url: window.location.pathname }), []);

  useEffect(() => {
    if (!open) return;
    pageview.send();
    dialogRef.current?.focus();
  }, [open, pageview]);

  if (!open) return null;

  function close(value: InterestExam) {
    saveInterestExam(value);
    setOpen(false);
  }

  function handleSkip() {
    click.send({ object_section_id: 'exam_interest', object_type: 'button', object_idx: 0, object_id: 'skip' });
    close('skipped');
  }

  function handleStart() {
    if (!selected) return;
    const target = selected === 'both' ? 'sqld' : selected;
    click.send({
      object_section_id: 'exam_interest', object_type: 'button', object_idx: 1, object_id: 'start',
      object_url: `/${target}`, data: { interest_exam: selected },
    });
    saveLastExamType(target);
    close(selected);
    navigate(`/${target}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-interest-title"
        onKeyDown={(e) => { if (e.key === 'Escape') handleSkip(); }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 outline-none"
      >
        <button
          type="button"
          onClick={handleSkip}
          aria-label="닫기"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 id="exam-interest-title" className="text-xl font-bold text-sqld-navy mb-2">
          어떤 시험을 준비하세요?
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          선택한 시험 화면이 먼저 열립니다. 헤더의 시험 전환 버튼으로 언제든 바꿀 수 있어요.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-6" role="radiogroup" aria-label="관심 시험">
          {CHOICES.map(({ value, title, sub }) => {
            const active = selected === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(value)}
                className={`rounded-xl border px-3 py-4 text-center transition-all ${
                  active
                    ? 'border-primary-400 bg-primary-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-md'
                }`}
              >
                <span className="block text-base font-bold text-sqld-navy">{title}</span>
                <span className="block text-xs text-slate-500 mt-1">{sub}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            나중에
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={!selected}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
