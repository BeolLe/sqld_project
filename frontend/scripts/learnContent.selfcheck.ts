import type { Blank, LearnBlock } from '../src/data/learn/types.ts';
import { adDclBlocks } from '../src/data/learn/units/adDcl.ts';
import { adDdlBlocks } from '../src/data/learn/units/adDdl.ts';
import { adDmlBlocks } from '../src/data/learn/units/adDml.ts';
import { adTclBlocks } from '../src/data/learn/units/adTcl.ts';

/**
 * 개념 노트 본문 점검.
 *
 * 빈칸은 `{{bN}}` 토큰과 `blanks` 선언이 짝을 이뤄야 화면에 입력칸으로 나온다.
 * 짝이 어긋나면 타입 검사도 빌드도 통과하지만 복습 모드에서 토큰이 글자로 새어 나온다.
 * 인라인 마크업 안에 넣은 빈칸도 마찬가지라 규칙으로 함께 막는다.
 */

type NamedUnit = [name: string, blocks: LearnBlock[]];

const UNITS: NamedUnit[] = [
  ['ad-dml', adDmlBlocks],
  ['ad-tcl', adTclBlocks],
  ['ad-ddl', adDdlBlocks],
  ['ad-dcl', adDclBlocks],
];

const failures: string[] = [];

function fail(where: string, message: string) {
  failures.push(`${where}: ${message}`);
  console.log(`  ❌ ${where}: ${message}`);
}

/** 노드 안의 모든 문자열을 납작하게 모은다. 표는 칸 하나가 문자열 하나다. */
function textsOf(block: LearnBlock): string[] {
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(block.nodes);
  return out;
}

function blankIdsIn(text: string): string[] {
  return [...text.matchAll(/\{\{(b\d+)\}\}/g)].map((m) => m[1]);
}

/** 백틱으로 감싼 코드 구간. 홀수 번째 조각이 코드다. */
function codeSegments(text: string): string[] {
  return text.split('`').filter((_, index) => index % 2 === 1);
}

function boldSegments(text: string): string[] {
  return [...text.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1]);
}

console.log('learn content self-check');

for (const [unitName, blocks] of UNITS) {
  const seenBlockIds = new Set<string>();
  const seenBlankIds = new Set<string>();
  let blankCount = 0;

  for (const block of blocks) {
    const where = `${unitName}/${block.id}`;
    if (seenBlockIds.has(block.id)) fail(where, '블록 id 중복');
    seenBlockIds.add(block.id);

    const texts = textsOf(block);
    const used = new Set(texts.flatMap(blankIdsIn));
    const declared = new Set(block.blanks.map((b: Blank) => b.id));
    blankCount += block.blanks.length;

    for (const id of declared) {
      if (!used.has(id)) fail(where, `${id} 을 선언했지만 본문에 쓰지 않았다`);
      if (seenBlankIds.has(id)) fail(where, `${id} 이 단원 안에서 중복된다`);
      seenBlankIds.add(id);
    }
    for (const id of used) {
      if (!declared.has(id)) fail(where, `${id} 이 본문에 있는데 선언이 없다`);
    }

    for (const blank of block.blanks) {
      if (!blank.accepts.includes(blank.answer.toLowerCase())) {
        const normalized = blank.accepts.map((a) => a.toLowerCase().replace(/\s/g, ''));
        if (!normalized.includes(blank.answer.toLowerCase().replace(/\s/g, ''))) {
          fail(where, `${blank.id} 의 정답 '${blank.answer}' 이 accepts 에 없다`);
        }
      }
    }

    for (const text of texts) {
      if (text.includes('—')) fail(where, '긴 줄표(—)는 쓰지 않는다');
      for (const code of codeSegments(text)) {
        if (blankIdsIn(code).length > 0) fail(where, '코드(`) 안에 빈칸을 넣으면 입력칸이 되지 않는다');
      }
      for (const bold of boldSegments(text)) {
        if (blankIdsIn(bold).length > 0) fail(where, '볼드(**) 안에 빈칸을 넣으면 입력칸이 되지 않는다');
      }
    }
  }

  if (failures.length === 0 || !failures.some((f) => f.startsWith(unitName))) {
    console.log(`  ✅ ${unitName} (블록 ${blocks.length}, 빈칸 ${blankCount})`);
  }
}

if (failures.length > 0) {
  console.error(`\nlearn content self-check failed: ${failures.length}건`);
  process.exit(1);
}
console.log('\nlearn content self-check passed');
