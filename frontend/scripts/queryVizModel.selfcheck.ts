import assert from 'node:assert/strict';

import {
  noteAt,
  outputAt,
  outputToneOf,
  totalSteps,
} from '../src/components/learn/queryVizModel.ts';
import type { VizSpec } from '../src/data/learn/types.ts';

const staged: VizSpec = {
  kind: 'staged',
  query: 'SELECT ...',
  sources: [{ label: '원본', columns: ['N'], rows: [[1], [2]] }],
  steps: [
    { note: '첫 단계', resultLabel: '중간 결과', columns: ['N'], rows: [[1]] },
    { note: '둘째 단계', resultLabel: '최종 결과', columns: ['N'], rows: [[1], [2]] },
  ],
  doneNote: '완료',
};

assert.equal(totalSteps(staged), 2);
assert.equal(noteAt(staged, 0), '첫 단계');
assert.deepEqual(outputAt(staged, 1), {
  label: '최종 결과',
  columns: ['N'],
  rows: [[1], [2]],
});
assert.equal(noteAt(staged, 2), '완료');
assert.equal(outputToneOf(staged, 0, 0), 'scan');
assert.equal(outputToneOf(staged, 0, 1), 'idle');
assert.equal(outputToneOf(staged, 1, 1), 'scan');
assert.equal(outputToneOf(staged, 1, 2), 'idle');

const filtered: VizSpec = {
  kind: 'row-filter',
  query: 'SELECT N FROM T WHERE N >= 2',
  sourceLabel: 'T',
  columns: ['N'],
  rows: [[1], [2], [3]],
  filter: { columnIndex: 0, min: 2 },
  doneNote: '완료',
};

assert.deepEqual(outputAt(filtered, 3).rows, [[2], [3]]);
assert.equal(outputToneOf(filtered, 0, 2), 'scan');
assert.equal(outputToneOf(filtered, 0, 3), 'idle');
console.log('queryVizModel self-check passed');
