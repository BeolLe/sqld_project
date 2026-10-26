import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getLearnCatalog, findLearnUnit } from '../src/data/learn/catalog';
import { countBlanks } from '../src/data/learn/curriculum';
import LearnIndexPage from '../src/pages/LearnIndexPage';
import LearnUnitPage from '../src/pages/LearnUnitPage';
import BlockRenderer from '../src/components/learn/BlockRenderer';
import { getLearnSubjectStats, recordBlankResult } from '../src/utils/learnProgress';
import { fetchLessonByCode, fetchLessonProgress, saveLessonProgress } from '../src/api/education';
import { examPreviewPath, isExamPreviewHost } from '../src/utils/examPreview';

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
  const adsp = getLearnCatalog('adsp');
  const sqld = getLearnCatalog();
  assert.equal(adsp.units.length, 8);
  assert.equal(adsp.subjects[0].groups.length, 2);
  assert.equal(sqld.units.length, 30);
  assert.equal(findLearnUnit('adsp-1-1'), undefined);
  assert.equal(findLearnUnit('dm-model', 'adsp'), undefined);
  assert.equal(findLearnUnit('missing', 'adsp'), undefined);
  const used = new Set<string>();
  let cases = 0,
    blocks = 0,
    blanks = 0;
  for (const unit of adsp.units) {
    assert.equal(unit.subject, 1);
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
          <Route path="/adsp/learn/:unitId" element={<LearnUnitPage examType="adsp" />} />
        </Routes>
      </MemoryRouter>
    );
    assert(page.includes(unit.title));
    assert(page.includes('href="/adsp/learn"'));
    assert(page.includes(unit.order + ' / 8'));
  }
  assert.deepEqual({ blocks, blanks, cases }, { blocks: 41, blanks: 51, cases: 24 });
  const index = renderToStaticMarkup(
    <MemoryRouter>
      <LearnIndexPage examType="adsp" />
    </MemoryRouter>
  );
  for (const unit of adsp.units) assert(index.includes('href="/adsp/learn/' + unit.id + '"'));
  const legacyIndex = renderToStaticMarkup(
    <MemoryRouter>
      <LearnIndexPage />
    </MemoryRouter>
  );
  assert(legacyIndex.includes('href="/learn/dm-model"'));
  assert(!legacyIndex.includes('href="/adsp/learn/'));
  const invalid = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/adsp/learn/dm-model']}>
      <Routes>
        <Route path="/adsp/learn/:unitId" element={<LearnUnitPage examType="adsp" />} />
      </Routes>
    </MemoryRouter>
  );
  assert(invalid.includes('존재하지 않는 학습 항목'));
  assert(invalid.includes('href="/adsp/learn"'));
  auth.isLoggedIn = false;
  const login = renderToStaticMarkup(
    <MemoryRouter>
      <LearnIndexPage examType="adsp" />
    </MemoryRouter>
  );
  assert(login.includes('회원 전용'));
  assert(login.includes('8개 세부항목'));
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
  assert.equal(examPreviewPath('/learn/dm-model', 'adsp'), '/adsp/learn');
  assert.equal(examPreviewPath('/adsp/learn/adsp-1-1', 'sqld'), '/learn');
  assert(isExamPreviewHost('test_dummies.selfronny.com'));
  assert(!isExamPreviewHost('solsqld.com'));
  const app = fs.readFileSync('src/App.tsx', 'utf8');
  assert(
    app.includes(
      'path="/adsp/learn/:unitId" element={<LearnUnitPage key={pathname} examType="adsp"'
    )
  );
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
