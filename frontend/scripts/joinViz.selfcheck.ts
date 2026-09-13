import assert from 'node:assert/strict';

import type { LearnBlock, VizCell, VizSpec } from '../src/data/learn/types.ts';
import { sbJoinBlocks } from '../src/data/learn/units/sbJoin.ts';
import { sbSjoinBlocks } from '../src/data/learn/units/sbSjoin.ts';

/**
 * 조인·표준 조인 단원의 staged 애니메이션은 장면을 사람이 직접 적는다.
 * 원본 테이블로 조인을 직접 계산해, 적힌 장면 값이 SQL 규칙과 맞는지 대조한다.
 */

type StagedSpec = Extract<VizSpec, { kind: 'staged' }>;
type Row = VizCell[];
type JoinKind = 'inner' | 'left' | 'right' | 'full' | 'cross';
type Match = (left: Row, right: Row) => boolean;
type Pair = [Row | null, Row | null];
type Column = [0 | 1, number];

const isNull = (value: VizCell) => value === 'NULL';

const equal =
  (leftColumn: number, rightColumn: number): Match =>
  (left, right) =>
    !isNull(left[leftColumn]) && !isNull(right[rightColumn]) && left[leftColumn] === right[rightColumn];

const between =
  (leftColumn: number, minColumn: number, maxColumn: number): Match =>
  (left, right) =>
    !isNull(left[leftColumn]) &&
    Number(left[leftColumn]) >= Number(right[minColumn]) &&
    Number(left[leftColumn]) <= Number(right[maxColumn]);

const always: Match = () => true;

/** 왼쪽 행 순서대로 짝을 찾는다. RIGHT·FULL 에서 짝이 없던 오른쪽 행은 끝에 붙인다. */
function join(left: Row[], right: Row[], kind: JoinKind, match: Match): Pair[] {
  const pairs: Pair[] = [];
  const usedRight = new Set<number>();

  for (const leftRow of left) {
    let found = false;
    right.forEach((rightRow, rightIndex) => {
      if (kind === 'cross' || match(leftRow, rightRow)) {
        pairs.push([leftRow, rightRow]);
        usedRight.add(rightIndex);
        found = true;
      }
    });
    if (!found && (kind === 'left' || kind === 'full')) pairs.push([leftRow, null]);
  }

  if (kind === 'right' || kind === 'full') {
    right.forEach((rightRow, rightIndex) => {
      if (!usedRight.has(rightIndex)) pairs.push([null, rightRow]);
    });
  }
  return pairs;
}

function project(pairs: Pair[], columns: Column[]): Row[] {
  return pairs.map((pair) => columns.map(([side, column]) => pair[side]?.[column] ?? 'NULL'));
}

function findStaged(blocks: LearnBlock[], marker: string): StagedSpec {
  for (const block of blocks) {
    for (const node of block.nodes) {
      if (node.kind === 'viz' && node.spec.kind === 'staged' && node.spec.query.includes(marker)) {
        return node.spec;
      }
    }
  }
  throw new Error(`staged 애니메이션을 찾지 못함 (${marker})`);
}

const failures: string[] = [];

function check(name: string, run: () => void) {
  try {
    run();
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  ❌ ${name}: ${(error as Error).message}`);
  }
}

interface CumulativeCase {
  name: string;
  blocks: LearnBlock[];
  marker: string;
  kind: JoinKind;
  match: Match;
  columns: Column[];
  expectedRows: number;
}

/** 장면이 진행될수록 결과가 쌓이는 애니메이션. 각 장면은 최종 결과의 앞부분이어야 한다. */
const cumulativeCases: CumulativeCase[] = [
  {
    name: 'EQUI JOIN',
    blocks: sbJoinBlocks,
    marker: 'WHERE 사원.부서번호 = 부서.부서번호',
    kind: 'inner',
    match: equal(1, 0),
    columns: [
      [0, 0],
      [1, 1],
    ],
    expectedRows: 3,
  },
  {
    name: 'Non EQUI JOIN',
    blocks: sbJoinBlocks,
    marker: 'BETWEEN G.최저급여',
    kind: 'inner',
    match: between(1, 1, 2),
    columns: [
      [0, 0],
      [0, 1],
      [1, 0],
    ],
    expectedRows: 3,
  },
  {
    name: 'CROSS JOIN',
    blocks: sbSjoinBlocks,
    marker: 'CROSS JOIN',
    kind: 'cross',
    match: always,
    columns: [
      [0, 0],
      [1, 0],
    ],
    expectedRows: 9,
  },
];

console.log('join viz self-check');

for (const testCase of cumulativeCases) {
  check(testCase.name, () => {
    const spec = findStaged(testCase.blocks, testCase.marker);
    assert.equal(spec.sources.length, 2, '원본 테이블은 2개');
    assert.ok(spec.steps.length >= 2 && spec.steps.length <= 4, '장면은 2~4개');

    const expected = project(
      join(spec.sources[0].rows, spec.sources[1].rows, testCase.kind, testCase.match),
      testCase.columns
    );
    assert.equal(expected.length, testCase.expectedRows, `SQL 규칙상 ${testCase.expectedRows}행`);

    spec.steps.forEach((step, index) => {
      const isLast = index === spec.steps.length - 1;
      assert.equal(step.resultLabel, isLast ? '최종 결과' : '현재 결과', `${index + 1}번째 장면 라벨`);
      assert.deepEqual(
        step.rows,
        expected.slice(0, step.rows.length),
        `${index + 1}번째 장면은 최종 결과의 앞부분`
      );
      if (index > 0) {
        assert.ok(step.rows.length >= spec.steps[index - 1].rows.length, '결과 행은 줄지 않는다');
      }
    });
    assert.deepEqual(spec.steps[spec.steps.length - 1].rows, expected, '최종 결과 행');
  });
}

check('OUTER JOIN', () => {
  const spec = findStaged(sbSjoinBlocks, '[조인 종류]');
  const kinds: Array<[JoinKind, string, number]> = [
    ['inner', 'INNER', 2],
    ['left', 'LEFT', 3],
    ['right', 'RIGHT', 3],
    ['full', 'FULL', 4],
  ];
  assert.equal(spec.steps.length, kinds.length, '장면은 조인 종류 4개');

  kinds.forEach(([kind, keyword, count], index) => {
    const step = spec.steps[index];
    assert.ok(step.resultLabel.includes(keyword), `${index + 1}번째 장면 라벨에 ${keyword}`);
    const expected = project(join(spec.sources[0].rows, spec.sources[1].rows, kind, equal(1, 0)), [
      [0, 0],
      [1, 1],
    ]);
    assert.equal(expected.length, count, `${keyword}는 SQL 규칙상 ${count}행`);
    assert.deepEqual(step.rows, expected, `${keyword} 결과 행`);
  });
});

check('NATURAL·USING 참조', () => {
  assert.ok(
    JSON.stringify(sbSjoinBlocks).includes('EQUI JOIN의 실행 과정과 같다'),
    '표준 조인 3절에 EQUI 실행 과정 참조 한 줄'
  );
});

if (failures.length > 0) {
  console.error(`\njoin viz self-check failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\njoin viz self-check passed');
