import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { countBlanks, findUnit, getCurriculum } from '../src/data/learn/curriculum';
import LearnIndexPage from '../src/pages/LearnIndexPage';
import LearnUnitPage from '../src/pages/LearnUnitPage';
import BlockRenderer from '../src/components/learn/BlockRenderer';
import { getLearnSubjectStats, recordBlankResult } from '../src/utils/learnProgress';
import { fetchLessonByCode, fetchLessonProgress, saveLessonProgress } from '../src/api/education';

async function main() {
  const auth = { user: { nickname: 'test' }, isLoggedIn: true, isInitializing: false };
  const values = new Map<string, string>();
  Object.assign(globalThis, {
    __learnTestAuth: auth,
    window: {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    },
    document: { cookie: '' },
  });
  const adspAll = getCurriculum('adsp');
  const sqld = getCurriculum('sqld');
  const total = adspAll.units.length;
  // 전체 목차는 유지하고, 본문이 있는 8개 항목만 학습 가능이다.
  const adsp = { units: adspAll.units.filter((unit) => unit.blocks.length > 0) };
  assert.equal(total, 29);
  assert.equal(adsp.units.length, 8);
  assert.equal(adspAll.curriculum.length, 3);
  assert.equal(sqld.units.length, 30);
  assert.deepEqual(adsp.units.map((unit) => unit.id), ['adsp-1-1', 'adsp-1-2', 'adsp-1-3', 'adsp-1-4', 'adsp-1-5', 'adsp-1-6', 'adsp-1-7', 'adsp-1-8']);
  // 같은 주제가 목차에 중복되면 안 된다.
  assert.equal(new Set(adspAll.units.map((unit) => unit.id)).size, total);
  assert.equal(new Set(adspAll.units.map((unit) => unit.title)).size, total);
  assert.equal(findUnit('adsp-1-1'), undefined);
  assert.equal(findUnit('dm-model', 'adsp'), undefined);
  assert.equal(findUnit('missing', 'adsp'), undefined);
  assert(findUnit('adsp-1-1', 'adsp'));
  const used = new Set<string>();
  let cases = 0,
    blocks = 0,
    blanks = 0;
  for (const unit of adsp.units) {
    assert.equal(unit.subject, 1);
    assert(unit.blocks.length > 0);
    for (const block of unit.blocks) {
      blocks++;
      assert(!used.has(block.id));
      used.add(block.id);
      const tokens = JSON.stringify(block.nodes).match(/\{\{\w+\}\}/g) ?? [];
      assert.equal(tokens.length, block.blanks.length);
      for (const blank of block.blanks) {
        assert(!used.has(blank.id));
        used.add(blank.id);
        assert.equal(tokens.filter((t) => t === '{{' + blank.id + '}}').length, 1);
        assert(blank.accepts.includes(blank.answer));
        assert(!['성과', '검증'].includes(blank.answer));
      }
      for (const node of block.nodes) {
        if (node.kind === 'table')
          for (const row of node.rows) assert.equal(row.length, node.head.length);
        if (node.kind === 'subheading' && /^사례 [123]$/.test(node.text)) cases++;
      }
      const render = (quizMode: boolean) =>
        renderToStaticMarkup(
          <MemoryRouter>
            <BlockRenderer
              nodes={block.nodes}
              blanks={block.blanks}
              blockId={block.id}
              quizMode={quizMode}
              onGrade={() => {}}
            />
          </MemoryRouter>
        );
      const note = render(false),
        quiz = render(true);
      assert.equal((note.match(/<input/g) ?? []).length, 0);
      assert.equal((quiz.match(/<input/g) ?? []).length, block.blanks.length);
      assert(!note.includes('{{'));
    }
    blanks += countBlanks(unit);
    const page = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/adsp/learn/' + unit.id]}>
        <Routes>
          <Route path="/adsp/learn/:unitId" element={<LearnUnitPage />} />
        </Routes>
      </MemoryRouter>
    );
    assert(page.includes(unit.title));
    assert(page.includes('href="/adsp/learn"'));
    assert(page.includes(unit.order + ' / ' + total));
  }
  assert.deepEqual({ blocks, blanks, cases }, { blocks: 41, blanks: 51, cases: 24 });
  const index = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/adsp/learn']}>
      <LearnIndexPage />
    </MemoryRouter>
  );
  for (const unit of adsp.units) assert(index.includes('href="/adsp/learn/' + unit.id + '"'));
  // 본문이 없는 항목은 링크 없이 '준비 중'으로 남는다.
  for (const unit of adspAll.units.filter((u) => u.blocks.length === 0)) {
    assert(index.includes(unit.title));
    assert(!index.includes('href="/adsp/learn/' + unit.id + '"'));
  }
  const legacyIndex = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/sqld/learn']}>
      <LearnIndexPage />
    </MemoryRouter>
  );
  assert(legacyIndex.includes('href="/sqld/learn/dm-model"'));
  assert(!legacyIndex.includes('href="/adsp/learn/'));
  const invalid = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/adsp/learn/dm-model']}>
      <Routes>
        <Route path="/adsp/learn/:unitId" element={<LearnUnitPage />} />
      </Routes>
    </MemoryRouter>
  );
  assert(invalid.includes('존재하지 않는 학습 항목'));
  assert(invalid.includes('href="/adsp/learn"'));
  auth.isLoggedIn = false;
  const login = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/adsp/learn']}>
      <LearnIndexPage />
    </MemoryRouter>
  );
  assert(login.includes('회원 전용'));
  assert(login.includes(total + '개 세부항목'));
  assert(!login.includes('href="/adsp/learn/adsp-1-1"'));
  auth.isLoggedIn = true;
  recordBlankResult('dm-model', 'b1', true);
  const original = values.get('solsqld_learn_blank_results_v1');
  recordBlankResult('adsp-1-1', 'u1_b1', false, 'adsp');
  assert.equal(values.get('solsqld_learn_blank_results_v1'), original);
  assert(values.has('soladsp_learn_blank_results_v1'));
  assert.equal(getLearnSubjectStats()[0].correctCount, 1);
  assert.equal(getLearnSubjectStats('adsp')[0].correctCount, 0);
  recordBlankResult('adsp-1-1', 'u1_b1', true, 'adsp');
  assert.equal(getLearnSubjectStats('adsp')[0].solvedCount, 1);
  assert.equal(getLearnSubjectStats('adsp')[0].correctCount, 1);
  const calls: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({ progress: null }), { status: 200 });
  };
  await fetchLessonByCode('adsp-1-1', 'adsp');
  await fetchLessonProgress(101, 'adsp');
  await saveLessonProgress(101, { lessonVersionId: 201, completed: true }, 'adsp');
  await fetchLessonByCode('dm-model');
  assert(calls.slice(0, 3).every((c) => c.url.endsWith('?exam_type=adsp')));
  assert(calls[3].url.endsWith('?exam_type=sqld'));
  assert.equal(calls[2].init?.method, 'PUT');
  assert.equal(JSON.parse(String(calls[2].init?.body)).lessonVersionId, 201);
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ detail: 'lesson not found' }), { status: 404 });
  await assert.rejects(() => fetchLessonByCode('missing', 'adsp'), /lesson not found/);
  const app = fs.readFileSync('src/App.tsx', 'utf8');
  assert(app.includes('<Route path="/:examType" element={<ExamTypeGuard />}>'));
  assert(app.includes('<Route path="learn/:unitId" element={<LearnUnitPage />} />'));
  assert(!/examPreview|ADsPPreview/.test(app));
  assert(
    fs
      .readFileSync('src/pages/LearnUnitPage.tsx', 'utf8')
      .includes('const REMOTE_LESSON_ENABLED = false')
  );
  console.log(
    'ADsP learn passed: 8 units, 41 blocks, 51 blanks, 24 cases; notes/quiz SSR, auth, invalid routes, SQLD regression, local progress isolation, mocked scoped API and 404. No browser or DB connection.'
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
