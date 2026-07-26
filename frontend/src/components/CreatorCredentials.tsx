import { useEffect, useRef, useState } from 'react';
import { Award, Maximize2, X } from 'lucide-react';
import cert01 from '../assets/certs/cert-01.webp';
import cert01Thumb from '../assets/certs/cert-01-thumb.webp';
import cert02 from '../assets/certs/cert-02.webp';
import cert02Thumb from '../assets/certs/cert-02-thumb.webp';

const KDATA_NOTICE =
  '※ 운영진 개인의 자격 취득 증빙이며, 한국데이터산업진흥원(KDATA)과 제휴·후원 관계가 없습니다. 본 서비스는 KDATA가 인증하거나 공인한 서비스가 아닙니다.';

interface Credential {
  id: string;
  role: string;
  /** 직함. 비워두면 표시하지 않는다. */
  job?: string;
  passedAt: string;
  /** 자격번호 뒤 6자리는 마스킹된 상태로만 노출한다. */
  licenseNo: string;
  full: string;
  thumb: string;
}

const CREDENTIALS: Credential[] = [
  {
    id: 'cert-01',
    role: '운영진 A',
    job: '現 유니콘 스타트업 재직 중',
    passedAt: '2025.12.12',
    licenseNo: 'SQLD-059******',
    full: cert01,
    thumb: cert01Thumb,
  },
  {
    id: 'cert-02',
    role: '운영진 B',
    passedAt: '2025.06.27',
    licenseNo: 'SQLD-057******',
    full: cert02,
    thumb: cert02Thumb,
  },
];

export default function CreatorCredentials() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const isOpen = activeId !== null;

  const open = (id: string) => {
    lastFocused.current = document.activeElement as HTMLElement;
    setActiveId(id);
  };

  const close = () => {
    setActiveId(null);
    lastFocused.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <section className="max-w-5xl mx-auto px-4 pb-16">
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-sqld-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white">합격자가 직접 만들었습니다</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {CREDENTIALS.map((cred) => (
            <button
              key={cred.id}
              type="button"
              onClick={() => open(cred.id)}
              aria-haspopup="dialog"
              aria-label={`${cred.role} 합격증 크게 보기`}
              className="group flex items-center gap-4 text-left bg-sqld-navy/55 border border-slate-700 rounded-xl p-3.5 transition-colors hover:border-primary-500 hover:bg-sqld-navy/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            >
              <span className="relative shrink-0">
                <img
                  src={cred.thumb}
                  alt=""
                  aria-hidden="true"
                  className="w-[5.25rem] rounded-md border border-slate-600 bg-white transition-transform group-hover:scale-[1.03]"
                />
                <span className="absolute -right-1 -bottom-1 w-[1.4rem] h-[1.4rem] rounded-full bg-slate-800 border border-slate-600 text-slate-300 flex items-center justify-center transition-colors group-hover:bg-primary-600 group-hover:border-primary-500 group-hover:text-white">
                  <Maximize2 className="w-2.5 h-2.5" />
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[0.9375rem] font-bold text-white mb-0.5">
                  {cred.role}
                </span>
                {cred.job && (
                  <span className="block text-[0.8125rem] text-primary-400 mb-1.5 leading-snug">
                    {cred.job}
                  </span>
                )}
                <span className="block text-xs text-slate-400 tabular-nums">
                  {cred.passedAt} 합격
                </span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-6 pt-5 border-t border-slate-700 text-xs text-slate-500 leading-relaxed">
          {KDATA_NOTICE}
        </p>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="creator-credentials-title"
        >
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-[3px]"
            onClick={close}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-sqld-navy border border-slate-700 rounded-2xl shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-slate-800">
              <div>
                <h3 id="creator-credentials-title" className="text-lg font-bold text-white">
                  운영진 SQLD 합격증
                </h3>
                <p className="mt-1.5 text-[0.8125rem] text-slate-400">
                  개인정보 보호를 위해 성명 · 생년월일 · 자격번호 일부를 가렸습니다.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="닫기"
                className="shrink-0 w-8 h-8 rounded-lg border border-slate-700 text-slate-300 flex items-center justify-center transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 p-6">
              {CREDENTIALS.map((cred) => (
                <figure
                  key={cred.id}
                  className={`bg-slate-800 border rounded-xl overflow-hidden transition-colors ${
                    cred.id === activeId ? 'border-primary-500' : 'border-slate-700'
                  }`}
                >
                  <img
                    src={cred.full}
                    alt={`국가공인 SQL 개발자 자격증. 성명·생년월일·자격번호 일부가 가려진 상태. 합격일자 ${cred.passedAt}.`}
                    className="w-full block bg-white"
                  />
                  <figcaption className="px-3.5 py-3 text-[0.8125rem] leading-relaxed">
                    <div className="font-bold text-white">{cred.role}</div>
                    {cred.job && (
                      <div className="text-[0.78125rem] text-primary-400 mt-0.5">{cred.job}</div>
                    )}
                    <div className="mt-1 text-xs text-slate-400 tabular-nums">
                      {cred.passedAt} 합격 · {cred.licenseNo}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="px-6 pb-6">
              <p className="bg-slate-800/60 border border-slate-700 rounded-lg px-3.5 py-3 text-xs text-slate-400 leading-relaxed">
                {KDATA_NOTICE}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
