import type { VizSpec, VizTableSpec } from '../../data/learn/types';

export type RowTone = 'idle' | 'scan' | 'pick' | 'drop' | 'ref';

export const INITIAL_NOTE = '실행 버튼을 눌러 쿼리가 어떻게 동작하는지 확인하세요.';

function passes(spec: VizSpec, rowIndex: number): boolean {
  if (spec.kind !== 'row-filter') return true;
  return Number(spec.rows[rowIndex][spec.filter.columnIndex]) >= spec.filter.min;
}

export function totalSteps(spec: VizSpec): number {
  return spec.kind === 'staged' ? spec.steps.length : spec.rows.length;
}

export function sourceTables(spec: VizSpec): VizTableSpec[] {
  if (spec.kind === 'staged') return spec.sources;
  return [{ label: spec.sourceLabel, columns: spec.columns, rows: spec.rows }];
}

export function toneOf(spec: VizSpec, rowIndex: number, cursor: number): RowTone {
  if (spec.kind === 'staged' || cursor < 0) return 'idle';
  if (rowIndex === cursor) return 'scan';
  if (rowIndex > cursor) return 'idle';
  if (spec.kind === 'row-filter') return passes(spec, rowIndex) ? 'pick' : 'drop';
  if (rowIndex === cursor - 1) return 'ref';
  return 'idle';
}

/** 직전 단계와 비교해 이번 단계에서 새로 생기거나 값이 바뀐 결과 행을 강조한다. */
export function outputToneOf(spec: VizSpec, rowIndex: number, cursor: number): RowTone {
  const total = totalSteps(spec);
  if (cursor < 0 || cursor >= total) return 'idle';

  const current = outputAt(spec, cursor).rows[rowIndex];
  const previous = outputAt(spec, cursor - 1).rows[rowIndex];
  if (!current) return 'idle';

  return previous &&
    current.length === previous.length &&
    current.every((cell, index) => cell === previous[index])
    ? 'idle'
    : 'scan';
}

export function noteAt(spec: VizSpec, cursor: number): string {
  const total = totalSteps(spec);
  if (cursor < 0) return INITIAL_NOTE;
  if (cursor >= total) return spec.doneNote;

  if (spec.kind === 'staged') return spec.steps[cursor].note;

  const row = spec.rows[cursor];
  if (spec.kind === 'row-filter') {
    const cell = Number(row[spec.filter.columnIndex]);
    const pass = cell >= spec.filter.min;
    return `${row[0]} — ${cell} >= ${spec.filter.min} → ${pass ? '통과' : '제외'}`;
  }
  return cursor === 0
    ? `${row[0]} — 앞 행이 없으므로 NULL`
    : `${row[0]} — 앞 행 ${spec.rows[cursor - 1][0]} 의 값을 가져옵니다`;
}

export function outputAt(
  spec: VizSpec,
  cursor: number
): { label: string; columns: string[]; rows: Array<Array<string | number>> } {
  if (spec.kind === 'staged') {
    const first = spec.steps[0];
    if (cursor < 0 || !first) {
      return { label: first?.resultLabel ?? '결과', columns: first?.columns ?? [], rows: [] };
    }
    const step = spec.steps[Math.min(cursor, spec.steps.length - 1)];
    return { label: step.resultLabel, columns: step.columns, rows: step.rows };
  }

  const baseRows = spec.rows
    .slice(0, Math.max(0, cursor))
    .filter((_, index) => passes(spec, index));
  const columns =
    spec.kind === 'row-reference' ? [...spec.columns, spec.reference.outputColumn] : spec.columns;
  const rows = baseRows.map((row, index) => {
    if (spec.kind !== 'row-reference') return row;
    const previous = index > 0 ? spec.rows[index - 1][spec.reference.sourceColumnIndex] : 'NULL';
    return [...row, previous];
  });
  return { label: '결과', columns, rows };
}
