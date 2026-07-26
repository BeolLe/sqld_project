import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { ALL_UNITS, CURRICULUM } from '../data/learn/curriculum';
import type { LearnUnit } from '../data/learn/types';

function UnitCard({ unit }: { unit: LearnUnit }) {
  const ready = unit.blocks.length > 0;

  return (
    <Link
      to={`/learn/${unit.id}`}
      className="group flex gap-3.5 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-px hover:border-primary-500 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
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
          {unit.priority1 && (
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-600">
              1차
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}

export default function LearnIndexPage() {
  const readyCount = ALL_UNITS.filter((unit) => unit.blocks.length > 0).length;
  const totalMinutes = ALL_UNITS.reduce((sum, unit) => sum + unit.estimatedMin, 0);
  const priorityCount = ALL_UNITS.filter((unit) => unit.priority1).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-5">
        <header className="border-b border-slate-200 pb-9 pt-12">
          <h1 className="mb-2.5 text-[2.1rem] font-extrabold tracking-tight text-slate-900">
            SQLD 교육
          </h1>
          <p className="mb-6 max-w-[44rem] text-slate-500">
            한국데이터산업진흥원 공식 출제범위의 세부항목을 그대로 따라 구성했습니다. 각 항목을 짧은
            개념 노트로 읽고, 다 읽으면 같은 내용을 빈칸으로 채우며 확인합니다.
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
                    <UnitCard key={unit.id} unit={unit} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        <p className="flex items-center gap-1.5 py-6 pb-20 text-[0.78rem] text-slate-500">
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-600">1차</span>
          표시는 출제 빈도 기준 우선 제작 대상 {priorityCount}개 항목입니다.
        </p>
      </div>
    </div>
  );
}
