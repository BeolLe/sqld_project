import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Play } from 'lucide-react';
import type { VizSpec } from '../../data/learn/types';

interface Props {
  spec: VizSpec;
}

type RowTone = 'idle' | 'scan' | 'pick' | 'drop' | 'ref';

const STEP_MS = 1000;

const INITIAL_NOTE = '실행 버튼을 눌러 쿼리가 행 단위로 어떻게 동작하는지 확인하세요.';

/** row-filter 통과 여부. row-reference 등 필터가 없는 kind 는 항상 통과. */
function passes(spec: VizSpec, rowIndex: number): boolean {
  if (spec.kind !== 'row-filter' || !spec.filter) return true;
  return Number(spec.rows[rowIndex][spec.filter.columnIndex]) >= spec.filter.min;
}

/** cursor 시점에 rowIndex 행이 어떤 상태로 표시돼야 하는지. */
function toneOf(spec: VizSpec, rowIndex: number, cursor: number): RowTone {
  if (cursor < 0) return 'idle';
  if (rowIndex === cursor) return 'scan';
  if (rowIndex > cursor) return 'idle';
  if (spec.kind === 'row-filter') return passes(spec, rowIndex) ? 'pick' : 'drop';
  if (spec.kind === 'row-reference' && rowIndex === cursor - 1) return 'ref';
  return 'idle';
}

/** cursor 시점의 캡션 문구. cursor < 0 이면 안내 문구, 끝까지 진행됐으면 spec.doneNote. */
function noteAt(spec: VizSpec, cursor: number): string {
  const total = spec.rows.length;
  if (cursor < 0) return INITIAL_NOTE;
  if (cursor >= total) return spec.doneNote;

  const row = spec.rows[cursor];
  if (spec.kind === 'row-filter' && spec.filter) {
    const cell = Number(row[spec.filter.columnIndex]);
    const pass = cell >= spec.filter.min;
    return `${row[0]} — ${cell} >= ${spec.filter.min} → ${pass ? '통과' : '제외'}`;
  }
  if (spec.kind === 'row-reference' && spec.reference) {
    return cursor === 0
      ? `${row[0]} — 앞 행이 없으므로 NULL`
      : `${row[0]} — 앞 행 ${spec.rows[cursor - 1][0]} 의 값을 가져옵니다`;
  }
  return '';
}

/** cursor 시점까지 진행된 결과 테이블(컬럼 + 행). */
function outputAt(
  spec: VizSpec,
  cursor: number,
): { columns: string[]; rows: Array<Array<string | number>> } {
  const baseRows = spec.rows.slice(0, Math.max(0, cursor)).filter((_, i) => passes(spec, i));
  const columns =
    spec.kind === 'row-reference' && spec.reference
      ? [...spec.columns, spec.reference.outputColumn]
      : spec.columns;
  const rows = baseRows.map((row, i) => {
    if (spec.kind !== 'row-reference' || !spec.reference) return row;
    const prev = i > 0 ? spec.rows[i - 1][spec.reference.sourceColumnIndex] : 'NULL';
    return [...row, prev];
  });
  return { columns, rows };
}

interface VizFrameProps {
  spec: VizSpec;
  cursor: number;
  caption: string;
  /** 인쇄 프레임에서는 숨긴다 */
  runButton?: ReactNode;
  /** drop 행 표현: 화면은 opacity, 인쇄는 취소선 */
  forPrint?: boolean;
}

const SCREEN_TONE_CLASS: Record<RowTone, string> = {
  idle: '',
  scan: 'bg-amber-100',
  pick: 'bg-emerald-50 text-emerald-700',
  drop: 'opacity-30',
  ref: 'bg-primary-50 text-primary-600 font-semibold',
};

const PRINT_TONE_CLASS: Record<RowTone, string> = {
  idle: '',
  scan: 'bg-amber-100',
  pick: 'bg-emerald-50 text-emerald-700',
  drop: 'line-through text-slate-400',
  ref: 'bg-primary-50 text-primary-600 font-semibold',
};

/** 쿼리 바 + 원본 테이블 + 화살표 + 결과 테이블 + 캡션. 화면·인쇄 모두 이 컴포넌트를 정지 화면으로 그린다. */
function VizFrame({ spec, cursor, caption, runButton, forPrint = false }: VizFrameProps) {
  const toneClass = forPrint ? PRINT_TONE_CLASS : SCREEN_TONE_CLASS;
  const { columns: outputColumns, rows: outputRows } = outputAt(spec, cursor);

  return (
    <figure className="my-1 overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-3.5 py-2.5">
        <code className="overflow-x-auto whitespace-nowrap font-mono text-[0.82rem] text-slate-800">
          {spec.query}
        </code>
        {runButton}
      </div>

      <div className="grid items-start gap-3 p-3.5 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <h4 className="mb-1.5 text-[0.7rem] font-bold text-slate-400">{spec.sourceLabel}</h4>
          <VizTable
            columns={spec.columns}
            rows={spec.rows}
            rowClass={(i) => toneClass[toneOf(spec, i, cursor)]}
          />
        </div>
        <div className="hidden self-center text-slate-300 sm:block" aria-hidden="true">
          →
        </div>
        <div>
          <h4 className="mb-1.5 text-[0.7rem] font-bold text-slate-400">결과</h4>
          <VizTable columns={outputColumns} rows={outputRows} rowClass={() => ''} />
        </div>
      </div>

      <figcaption
        className="min-h-[2.2rem] border-t border-slate-200 bg-slate-50 px-3.5 py-2 text-[0.78rem] leading-relaxed text-slate-500"
        aria-live="polite"
      >
        {caption}
      </figcaption>
    </figure>
  );
}

/**
 * 쿼리가 행 단위로 동작하는 과정을 재생한다.
 * 단원마다 새로 만들지 않고 VizSpec 데이터만 갈아끼워 재사용한다.
 */
export default function QueryViz({ spec }: Props) {
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [note, setNote] = useState(INITIAL_NOTE);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const total = spec.rows.length;

  useEffect(() => {
    if (!playing) return;

    if (cursor >= total) {
      setPlaying(false);
      setNote(spec.doneNote);
      return;
    }

    setNote(noteAt(spec, cursor));

    timer.current = window.setTimeout(() => setCursor((c) => c + 1), STEP_MS);
    return () => window.clearTimeout(timer.current);
  }, [playing, cursor, spec, total]);

  const start = () => {
    setCursor(0);
    setNote('');
    setPlaying(true);
  };

  return (
    <VizFrame
      spec={spec}
      cursor={cursor}
      caption={note}
      runButton={
        <button
          type="button"
          onClick={start}
          disabled={playing}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Play className="h-3 w-3" aria-hidden="true" />
          {playing ? '실행 중' : '실행'}
        </button>
      }
    />
  );
}

const STEP_LABELS = ['①', '②', '③'];

/**
 * 인쇄용: 재생 애니메이션을 cursor 값이 다른 정지 프레임 여러 장으로 필름스트립처럼 나열한다.
 * 화면 상태 전체가 cursor 의 순수 함수라는 점을 이용해 같은 VizFrame 마크업을 재사용한다.
 */
export function QueryVizPrintFrames({ spec }: Props) {
  const total = spec.rows.length;
  const keyframes = Array.from(new Set([0, Math.floor(total / 2), total]));

  return (
    <div className="space-y-4">
      <p className="mb-1 text-[0.78rem] font-semibold text-slate-500">
        쿼리가 행 단위로 처리되는 과정
      </p>
      {keyframes.map((cursor, index) => (
        <div key={cursor} className="break-inside-avoid">
          <p className="mb-1 text-[0.72rem] font-bold text-slate-400">
            {STEP_LABELS[index] ?? index + 1} 단계
          </p>
          <VizFrame spec={spec} cursor={cursor} caption={noteAt(spec, cursor)} forPrint />
        </div>
      ))}
    </div>
  );
}

interface TableProps {
  columns: string[];
  rows: Array<Array<string | number>>;
  rowClass: (index: number) => string;
}

function VizTable({ columns, rows, rowClass }: TableProps) {
  return (
    <table className="w-full border-collapse font-mono text-[0.8rem]">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column}
              className="border border-slate-200 bg-slate-100 px-2 py-1 text-left text-[0.72rem] font-semibold text-slate-500"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={String(row[0])} className={`transition-colors ${rowClass(index)}`}>
            {row.map((cell, cellIndex) => (
              <td
                key={`${row[0]}-${cellIndex}`}
                className="border border-slate-200 px-2 py-1 text-slate-700"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td
              colSpan={columns.length}
              className="border border-slate-200 px-2 py-3 text-center text-slate-300"
            >
              —
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
