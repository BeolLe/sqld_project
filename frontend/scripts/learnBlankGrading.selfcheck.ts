import assert from 'node:assert/strict';
import { getCurriculum } from '../src/data/learn/curriculum';
import { adsp1Unit } from '../src/data/learn/units/adsp1';
import type { Blank } from '../src/data/learn/types';
import { isBlankAnswerCorrect } from '../src/utils/learnBlankGrading';

const sourceBefore = JSON.stringify(adsp1Unit);
const adsp = getCurriculum('adsp');
const sqld = getCurriculum('sqld');
const adspBlanks = adsp.units.flatMap((unit) => unit.blocks.flatMap((block) => block.blanks));
assert.equal(adsp.units.length, 29);
assert.equal(adsp.units.filter((unit) => unit.blocks.length > 0).length, 8);
assert.equal(sqld.units.length, 30);
assert(adspBlanks.every((blank) => blank.matchMode === 'term'));
// Catalog assembly must not mutate source units or leak the policy into SQLD.
assert.equal(JSON.stringify(adsp1Unit), sourceBefore);
// Module initialization also must clone, not mutate: these frozen original source blanks
// intentionally omit matchMode, while newly authored source blanks may set it explicitly.
assert(
  adsp1Unit.blocks
    .flatMap((block) => block.blanks)
    .filter((blank) => /^u1_b(?:[1-9]|1[0-2])$/.test(blank.id))
    .every((blank) => blank.matchMode === undefined)
);
const sqldBlanks = sqld.units.flatMap((unit) => unit.blocks.flatMap((block) => block.blanks));
assert(sqldBlanks.every((blank) => blank.matchMode === undefined));

const examples = [
  ['ERP', '전사적 자원 관리', 'CRM'],
  ['정량', '정량데이터', '정성데이터'],
  ['연관규칙', '연관규칙분석', '회귀분석'],
  ['소셜네트워크분석', '소셜네트워크 분석', '군집분석'],
  ['책임 원칙 훼손', '책임원칙의 훼손', '사생활 침해'],
  ['모니터링', '지속적점검', '예측'],
];
for (const [answer, accepted, rejected] of examples) {
  const blank = adspBlanks.find((candidate) => candidate.answer === answer);
  assert(blank, `Missing ADsP answer: ${answer}`);
  assert(isBlankAnswerCorrect(blank, accepted), `${answer}: ${accepted}`);
  assert(isBlankAnswerCorrect(blank, `  ${accepted}\t`));
  assert(!isBlankAnswerCorrect(blank, rejected), `${answer} must reject ${rejected}`);
  assert(!isBlankAnswerCorrect(blank, ' \n\t'));
  assert(!isBlankAnswerCorrect(blank, `${accepted}아님`));
}

// Every declared term alias, including enrichment additions, must grade consistently.
let adspAliasChecks = 0;
for (const blank of adspBlanks) {
  for (const alias of [blank.answer, ...blank.accepts]) {
    for (const input of [alias, alias.replace(/\s+/g, ''), `  ${alias.toUpperCase()}\t`]) {
      assert(isBlankAnswerCorrect(blank, input), `${blank.id}: rejected alias ${input}`);
      adspAliasChecks++;
    }
    assert(!isBlankAnswerCorrect(blank, `${alias}아님`), `${blank.id}: accepted suffix`);
  }
  assert(!isBlankAnswerCorrect(blank, ' \n\t'));
}
for (const [id, accepted, rejected] of [
  ['u2_b6', '동시 공용', '내용에 따른 참조'],
  ['u6_b5', '유형분석', '회귀분석'],
]) {
  const blank = adspBlanks.find((candidate) => candidate.id === id);
  assert(blank, `Missing regression blank: ${id}`);
  assert(isBlankAnswerCorrect(blank, accepted), `${id}: ${accepted}`);
  assert(!isBlankAnswerCorrect(blank, rejected), `${id}: must reject ${rejected}`);
}

// Exercise the same helper against every SQLD answer/alias using the old algorithm.
const legacy = (blank: Blank, value: string) => {
  const normalize = (text: string) => text.trim().toLowerCase().replace(/\s+/g, ' ');
  const input = normalize(value);
  return input !== '' && [blank.answer, ...blank.accepts].some((text) => normalize(text) === input);
};
let comparisons = 0;
for (const blank of sqldBlanks) {
  for (const answer of [blank.answer, ...blank.accepts]) {
    for (const input of [
      answer,
      `  ${answer.toUpperCase()}  `,
      answer.replace(/\s+/g, '\t  '),
      answer.replace(/\s+/g, ''),
      '',
    ]) {
      assert.equal(
        isBlankAnswerCorrect(blank, input),
        legacy(blank, input),
        `${blank.id}: ${input}`
      );
      comparisons++;
    }
  }
}
const sql: Blank = { id: 'sql-boundaries', answer: 'ORDER BY', accepts: [] };
assert(isBlankAnswerCorrect(sql, ' order\tby '));
assert(!isBlankAnswerCorrect(sql, 'ORDERBY'));
const literal: Blank = { id: 'sql-literal', answer: "'a b'", accepts: [] };
assert(!isBlankAnswerCorrect(literal, "'ab'"));
assert(!isBlankAnswerCorrect({ id: 'empty', answer: '', accepts: [''] }, ' '));
console.log(
  `Blank grading checks passed: ${adspAliasChecks} exhaustive ADsP alias variants + explicit regression/wrong concepts; ${comparisons} SQLD legacy comparisons.`
);
