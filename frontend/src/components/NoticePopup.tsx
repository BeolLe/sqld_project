import { useState } from 'react';
import { CalendarDays, Clock3, Megaphone, Server, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface NoticePopupSchema {
  eyebrow?: string;
  periodLabel?: string;
  period?: string;
  message?: string;
  detail?: string;
  icon?: 'calendar' | 'megaphone' | 'server';
  primaryAction?: {
    label?: string;
    href?: string;
  };
}

interface NoticePopupProps {
  title: string;
  schema?: NoticePopupSchema;
  onClose: (dismissForToday: boolean) => void;
}

const ICONS = {
  calendar: CalendarDays,
  megaphone: Megaphone,
  server: Server,
};

function getSafeInternalPath(rawPath?: string) {
  if (!rawPath || !rawPath.startsWith('/') || rawPath.startsWith('//')) {
    return null;
  }
  return rawPath;
}

export default function NoticePopup({ title, schema, onClose }: NoticePopupProps) {
  const navigate = useNavigate();
  const [dismissChecked, setDismissChecked] = useState(false);
  const HeaderIcon = ICONS[schema?.icon ?? 'megaphone'];
  const actionPath = getSafeInternalPath(schema?.primaryAction?.href);

  function handleClose() {
    onClose(dismissChecked);
  }

  function handlePrimaryAction() {
    onClose(dismissChecked);
    if (actionPath) {
      navigate(actionPath);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <section
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-popup-title"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-900 px-8 py-6 text-white">
          <HeaderIcon className="absolute -right-4 -top-4 h-32 w-32 opacity-10" strokeWidth={1} />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                {schema?.eyebrow ?? 'Notice'}
              </span>
            </div>
            <h2 id="notice-popup-title" className="text-xl font-bold leading-snug">
              {title}
            </h2>
          </div>
        </div>

        <div className="px-8 py-6">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 text-white/80 transition-colors hover:text-white"
            aria-label="공지 팝업 닫기"
          >
            <X className="h-5 w-5" />
          </button>

          {schema?.message && (
            <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {schema.message}
            </p>
          )}

          {schema?.period && (
            <div className="mb-5 rounded-xl border border-primary-100 bg-primary-50 px-5 py-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary-700">
                <Clock3 className="h-4 w-4" />
                <span>{schema.periodLabel ?? '안내 기간'}</span>
              </div>
              <p className="text-base font-bold text-sqld-navy">{schema.period}</p>
            </div>
          )}

          {schema?.detail && (
            <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-slate-500">
              {schema.detail}
            </p>
          )}

          <button
            type="button"
            onClick={handlePrimaryAction}
            className="mb-4 w-full rounded-lg bg-primary-600 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
          >
            {schema?.primaryAction?.label ?? '확인'}
          </button>

          <div className="flex items-center justify-center">
            <label className="flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={dismissChecked}
                onChange={(event) => setDismissChecked(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-slate-400">오늘 하루 안 보기</span>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
