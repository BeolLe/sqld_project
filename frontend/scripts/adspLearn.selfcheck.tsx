import assert from 'node:assert/strict';
import fs from 'node:fs';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { countBlanks, findUnit, getCurriculum } from '../src/data/learn/curriculum';
import LearnIndexPage from '../src/pages/LearnIndexPage';
import LearnUnitPage from '../src/pages/LearnUnitPage';
import BlockRenderer from '../src/components/learn/BlockRenderer';
import { getLearnSubjectStats, recordBlankResult } from '../src/utils/learnProgress';
import { fetchLessonByCode, fetchLessonProgress, saveLessonProgress } from '../src/api/education';
import { fetchExamResult, fetchExamSession, saveExamAnswer, saveExamMemo, submitExam, syncExamSession } from '../src/api/exams';
import { fetchExamProblems } from '../src/api/content';
import { shouldSendRequestId, submitEndlessAnswer } from '../src/api/endless';
import { getExamProblems } from '../src/data/exams';
import { ExamCapabilitiesContext, FALLBACK_AVAILABLE } from '../src/hooks/useExamCapabilities';
import type { ExamCapabilitiesState } from '../src/hooks/useExamCapabilities';
import ContentPreparing from '../src/components/ContentPreparing';
import PortalPage from '../src/pages/PortalPage';
import ExamTakingPage from '../src/pages/ExamTakingPage';
import ExamResultPage from '../src/pages/ExamResultPage';
import { isSolvingPath } from '../src/utils/examPath';

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
  const fetchCalls: string[] = [];
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
  // 시험 계약: 같은 회차 번호('1')라도 SQLD 와 ADsP 는 exam_type 으로 구분된다.
  assert.notEqual((await getExamProblems('1', 'sqld'))[0].id, (await getExamProblems('1', 'adsp'))[0].id);
  assert.equal((await getExamProblems('1', 'adsp')).length, 50);
  assert.equal((await getExamProblems('adsp-1', 'adsp')).length, 0);
  calls.length = 0;
  const record = (url: string, init?: RequestInit) => calls.push({ url, init });
  globalThis.fetch = async (url, init) => {
    record(String(url), init);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  const uuid = '00000000-0000-0000-0000-000000000700';
  await fetchExamProblems('1', 'adsp');
  await fetchExamSession('1', 'adsp');
  await saveExamAnswer('1', { examType: 'adsp', attemptUuid: uuid }, { problemId: 'p1', selectedAnswer: '2' });
  await saveExamMemo('1', { examType: 'adsp', attemptUuid: uuid }, '메모');
  await syncExamSession('1', { examType: 'adsp', attemptUuid: uuid }, { currentPageNo: 2 });
  await submitExam('1', { examType: 'adsp', attemptUuid: uuid }, {});
  await fetchExamResult('1', 'adsp', 700);
  assert(calls.every((c) => c.url.includes('exam_type=adsp')));
  assert(calls.slice(2, 6).every((c) => JSON.parse(String(c.init?.body)).attemptUuid === uuid));
  assert(calls[6].url.endsWith('/exams/1/result?exam_type=adsp&attempt_id=700'));
  // SQLD 도 exam_type=sqld 를 명시하고, 응시 UUID 를 함께 보낸다(구 스키마 DB 에서도 resolve_attempt 가 안전하게 처리).
  calls.length = 0;
  await fetchExamSession('1', 'sqld');
  await saveExamAnswer('1', { examType: 'sqld', attemptUuid: uuid }, { problemId: 'p1', selectedAnswer: '2' });
  assert(calls[0].url.endsWith('/exams/1/session?exam_type=sqld'));
  assert(calls[1].url.endsWith('/exams/1/answers?exam_type=sqld'));
  // 무한풀이 requestId: ADsP 이거나 schemaState 가 ready 일 때만 보낸다.
  assert(shouldSendRequestId('adsp', 'legacy'));
  assert(shouldSendRequestId('adsp', null));
  assert(shouldSendRequestId('sqld', 'ready'));
  assert(!shouldSendRequestId('sqld', 'legacy'));
  assert(!shouldSendRequestId('sqld', 'partial'));
  assert(!shouldSendRequestId('sqld', null));
  calls.length = 0;
  await submitEndlessAnswer({ examType: 'sqld', problemId: 'q', selectedAnswer: '1' });
  await submitEndlessAnswer({ examType: 'adsp', problemId: 'q', selectedAnswer: '1', requestId: uuid });
  assert(calls[0].url.endsWith('/endless/answer?exam_type=sqld'));
  assert(!('requestId' in JSON.parse(String(calls[0].init?.body))));
  assert(calls[1].url.endsWith('/endless/answer?exam_type=adsp'));
  assert.equal(JSON.parse(String(calls[1].init?.body)).requestId, uuid);

  // ─── 공개 경계·응시 게이트·capabilities 실패 구분 (PR #44 검증 지적 회귀 방지) ───
  const caps = (patch: Partial<ExamCapabilitiesState>): ExamCapabilitiesState => ({
    checking: false,
    schemaState: null,
    available: FALLBACK_AVAILABLE,
    failed: false,
    refresh: () => undefined,
    ...patch,
  });
  const withCaps = (state: ExamCapabilitiesState, path: string, route: string, element: ReactElement) =>
    renderToStaticMarkup(
      <ExamCapabilitiesContext.Provider value={state}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={route} element={element} />
          </Routes>
        </MemoryRouter>
      </ExamCapabilitiesContext.Provider>
    );
  globalThis.fetch = async (url) => {
    fetchCalls.push(String(url));
    return new Response('{}', { status: 200 });
  };
  const takingRoute = '/:examType/exams/:id/taking';
  const resultRoute = '/:examType/exams/:id/result';
  // 1) 응시·결과 게이트: 확인 중에는 로딩, 미공개에서는 '준비 중'. 문제·세션·결과 API 는 호출하지 않는다.
  for (const [path, route, el] of [
    ['/adsp/exams/1/taking', takingRoute, <ExamTakingPage />],
    ['/adsp/exams/1/result', resultRoute, <ExamResultPage />],
  ] as const) {
    const checkingHtml = withCaps(caps({ checking: true }), path, route, el);
    assert(checkingHtml.includes('불러오는 중'));
    assert(!checkingHtml.includes('준비하고 있습니다'));
    const preparingHtml = withCaps(caps({}), path, route, el);
    assert(preparingHtml.includes('ADsP 모의고사를 준비하고 있습니다'));
    const failedHtml = withCaps(caps({ failed: true }), path, route, el);
    assert(failedHtml.includes('상태를 확인하지 못했습니다'));
    assert(failedHtml.includes('다시 시도'));
    assert(!failedHtml.includes('준비하고 있습니다'));
    // SQLD 는 capabilities 를 기다리지 않는다: 확인 중이어도 준비 중·확인 실패 화면이 아니다.
    const sqldHtml = withCaps(caps({ checking: true, failed: true }), path.replace('/adsp/', '/sqld/'), route, el);
    assert(!sqldHtml.includes('준비하고 있습니다') && !sqldHtml.includes('상태를 확인하지 못했습니다'));
  }
  assert.equal(fetchCalls.length, 0);
  const takingSource = fs.readFileSync('src/pages/ExamTakingPage.tsx', 'utf8');
  const resultSource = fs.readFileSync('src/pages/ExamResultPage.tsx', 'utf8');
  assert(takingSource.includes('!id || !user || checkingReady || !contentReady'));
  assert(resultSource.includes('navigationState || !id || checkingReady || !contentReady'));

  // 5) 준비 중과 확인 실패는 다른 화면이다. 실패 화면에는 다시 시도 버튼이 있다.
  const preparing = withCaps(caps({}), '/adsp/exams', '/:examType/exams', <ContentPreparing feature="모의고사" />);
  assert(preparing.includes('준비하고 있습니다') && !preparing.includes('다시 시도'));
  const failedView = withCaps(caps({ failed: true }), '/adsp/exams', '/:examType/exams', <ContentPreparing feature="모의고사" />);
  assert(failedView.includes('상태를 확인하지 못했습니다') && failedView.includes('다시 시도'));
  assert(!failedView.includes('준비하고 있습니다'));
  const providerSource = fs.readFileSync('src/contexts/ExamCapabilitiesContext.tsx', 'utf8');
  assert(providerSource.includes('RETRY_DELAYS_MS = [1000, 3000, 3000]'));
  assert(providerSource.includes('setFailed(true)') && providerSource.includes('refresh'));
  const dashboardSource = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
  assert(dashboardSource.includes('if (capabilitiesFailed)'));
  // 실패 시 기본값: SQLD 사용 가능, ADsP 차단
  assert.deepEqual(FALLBACK_AVAILABLE, { sqld: true, adsp: false });

  // 3) 공개 경계: ADsP 미공개면 포털 카드는 모의고사·무한풀이를 약속하지 않고 개념 학습으로만 들어간다.
  const portal = (state: ExamCapabilitiesState) => withCaps(state, '/', '/', <PortalPage />);
  const closed = portal(caps({ available: { sqld: true, adsp: false } }));
  assert(closed.includes('준비 중'));
  assert(closed.includes('ADsP 개념 학습 시작하기'));
  assert(closed.includes('개념 학습 29항목'));
  assert(!closed.includes('모의고사 · 개념 학습 29항목'));
  assert(closed.includes('SQLD 시작하기'));
  assert(portal(caps({ failed: true })).includes('다시 시도'));
  const opened = portal(caps({ available: { sqld: true, adsp: true } }));
  assert(opened.includes('ADsP 시작하기') && opened.includes('모의고사 · 개념 학습 29항목 · 무한풀이'));
  const appSource = fs.readFileSync('src/App.tsx', 'utf8');
  assert(appSource.includes('available.adsp && !isSolvingPath(pathname) && <ExamInterestModal />'));
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  assert(!/\/adsp\/(exams|endless|dashboard|sql-practice)/.test(sitemap));
  assert(sitemap.includes('/adsp/learn'));

  // 4) 모달: 응시와 SQL 풀이 화면에서는 띄우지 않는다.
  for (const path of ['/sqld/exams/1/taking', '/adsp/exams/3/taking', '/sqld/sql-practice/5', '/sql-practice/5', '/exams/1/taking']) {
    assert(isSolvingPath(path), path);
  }
  for (const path of ['/', '/sqld', '/adsp/exams', '/adsp/exams/1', '/adsp/exams/1/result', '/sqld/sql-practice', '/adsp/learn', '/mypage']) {
    assert(!isSolvingPath(path), path);
  }

  // 2) 번들 분리: 목업 데이터는 VITE_AI_MOCK 분기 안의 동적 import 로만 불러온다.
  for (const file of ['src/api/content.ts', 'src/api/exams.ts', 'src/api/endless.ts', 'src/data/exams/index.ts']) {
    const source = fs.readFileSync(file, 'utf8');
    assert(!/^import [^\n]*from '[^']*data\/(adsp|exams|practice)[^']*';/m.test(source), file + ': 목업 데이터 정적 import');
    assert(!/^import [^\n]*from '\.\.\/adsp\/exams';/m.test(source), file + ': 목업 데이터 정적 import');
  }
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
