/**
 * 개념 학습 — 세부항목 목차 페이지.
 *
 * TODO(백엔드 DB 연동 필요): 항목 구성과 학습 가능 여부를 `data/learn/curriculum.ts`
 * 하드코딩으로 판단한다. 사용자별 학습 진도·완료 표시도 아직 없다.
 * DB 연동 시 커리큘럼과 진도를 서버에서 받아 카드 상태를 계산하도록 바꾼다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { ALL_UNITS, CURRICULUM } from '../data/learn/curriculum';
import type { LearnUnit } from '../data/learn/types';

const CARD_CLASS =
  'group flex gap-3.5 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-px hover:border-primary-500 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

/** 준비 중 항목은 이동시키지 않고 안내 팝업만 띄운다. */
function PreparingDialog({ title, onClose }: { title: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preparing-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="mb-2 inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[0.72rem] font-semibold text-slate-500">
          준비 중
        </span>
        <h2 id="preparing-title" className="mb-2 text-lg font-bold text-slate-900">
          {title}
        </h2>
        <p className="mb-5 text-[0.9rem] leading-relaxed text-slate-500">
          콘텐츠 준비 중입니다.
          <br />
          빠른 시일 내에 업데이트할 수 있도록 하겠습니다.
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-700"
        >
          확인
        </button>
      </div>
    </div>
  );
}

function UnitCard({ unit, onPreparing }: { unit: LearnUnit; onPreparing: () => void }) {
  const ready = unit.blocks.length > 0;

  const body = (
    <>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[0.8125rem] font-bold ${
          ready ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-400'
        }`}
      >
        {unit.order}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-bold leading-snug text-slate-900">{unit.title}</span>
        <span className="flex flex-wrap items-center gap-2 text-[0.72rem] text-slate-400">
          <span
            className={`rounded px-1.5 py-0.5 font-semibold ${
              ready ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {ready ? '학습 가능' : '준비 중'}
          </span>
          <span>{unit.estimatedMin}분</span>
        </span>
      </span>
    </>
  );

  if (!ready) {
    return (
      <button type="button" onClick={onPreparing} className={CARD_CLASS}>
        {body}
      </button>
    );
  }

  return (
    <Link to={`/learn/${unit.id}`} className={CARD_CLASS}>
      {body}
    </Link>
  );
}

export default function LearnIndexPage() {
  const readyCount = ALL_UNITS.filter((unit) => unit.blocks.length > 0).length;
  const totalMinutes = ALL_UNITS.reduce((sum, unit) => sum + unit.estimatedMin, 0);
  const [preparingTitle, setPreparingTitle] = useState<string | null>(null);
  const closeDialog = useCallback(() => setPreparingTitle(null), []);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-5">
        <header className="border-b border-slate-200 pb-9 pt-12">
          <h1 className="mb-2.5 text-[2.1rem] font-extrabold tracking-tight text-slate-900">
            개념 학습
          </h1>
          <p className="mb-6 max-w-[44rem] text-slate-500">
            한국데이터산업진흥원 공식 출제범위의 세부항목을 그대로 따라 구성했습니다.
            <br />각 항목을 짧은 개념 노트로 읽고, 다 읽으면 같은 내용을 빈칸으로 채우며 확인합니다.
          </p>
          <dl className="flex flex-wrap gap-9">
            <div>
              <dt className="order-2 text-[0.8125rem] text-slate-500">학습 가능한 항목</dt>
              <dd className="text-2xl font-extrabold tabular-nums text-slate-900">
                {readyCount} / {ALL_UNITS.length}
              </dd>
            </div>
            <div>
              <dt className="order-2 text-[0.8125rem] text-slate-500">주요항목</dt>
              <dd className="text-2xl font-extrabold text-slate-900">
                {CURRICULUM.reduce((sum, s) => sum + s.groups.length, 0)}개
              </dd>
            </div>
            <div>
              <dt className="order-2 text-[0.8125rem] text-slate-500">전체 예상 시간</dt>
              <dd className="text-2xl font-extrabold tabular-nums text-slate-900">
                {Math.round((totalMinutes / 60) * 10) / 10}시간
              </dd>
            </div>
          </dl>
        </header>

        {CURRICULUM.map((subject) => (
          <section key={subject.subject} className="pt-9">
            <div className="mb-4 flex flex-wrap items-baseline gap-2.5">
              <h2 className="text-lg font-bold text-slate-900">
                {subject.subject}과목 · {subject.title}
              </h2>
              <span className="text-[0.8125rem] text-slate-500">{subject.exam}</span>
              {subject.showFailWarning && (
                <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[0.72rem] font-semibold text-amber-700">
                  <TriangleAlert className="h-3 w-3" aria-hidden="true" />
                  과목 40% 미만 시 과락
                </span>
              )}
            </div>

            {subject.groups.map((group) => (
              <div key={group.name} className="mb-6">
                <div className="mb-2.5 flex items-baseline gap-2">
                  <h3 className="text-[0.9375rem] font-bold text-slate-900">{group.name}</h3>
                  <span className="text-[0.72rem] text-slate-400">
                    세부항목 {group.units.length}개
                  </span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.units.map((unit) => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      onPreparing={() => setPreparingTitle(unit.title)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        <div className="pb-20" />
      </div>

      {preparingTitle && <PreparingDialog title={preparingTitle} onClose={closeDialog} />}
    </div>
  );
}
