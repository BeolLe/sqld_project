/**
 * ADsP 모의고사·무한풀이 문항(src/data/adsp)을 DB 시드 SQL 로 만든다.
 *
 *   node scripts/generate-adsp-seed.mjs            → ../docs/adsp_content_seed.sql
 *
 * 문항을 고치면 이 스크립트를 다시 돌려 프론트 데이터와 DB 시드를 맞춘다.
 * 대상 테이블 컬럼은 analytics dbt 소스 모델(brz/exam_*, brz/endless_*) 기준이다.
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(resolve(root, 'package.json'));
const { build } = require('esbuild');

const entry = `
export { ADSP_EXAM_LIST, getAdspExamProblems } from './src/data/adsp/exams/index.ts';
export { ADSP_ENDLESS_PROBLEMS } from './src/data/adsp/endless.ts';
export { EXAM_CONFIG } from './src/constants/examTypes.ts';
`;
const bundled = await build({
  stdin: { contents: entry, resolveDir: root, loader: 'ts' },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  define: { 'import.meta.env.VITE_AI_MOCK': '"0"' },
});
const mod = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const { ADSP_EXAM_LIST, getAdspExamProblems, ADSP_ENDLESS_PROBLEMS, EXAM_CONFIG } = mod;

const q = (value) => `'${String(value).replace(/'/g, "''")}'`;
const json = (value) => `${q(JSON.stringify(value))}::jsonb`;
const PROBLEMS_PER_PAGE = 5;

const CATEGORY_CODES = {
  '데이터의 이해': 'adsp_data_understanding',
  '데이터의 가치와 미래': 'adsp_data_value_future',
  '데이터 사이언스와 전략 인사이트': 'adsp_data_science_insight',
  '데이터 분석 기획의 이해': 'adsp_analysis_planning',
  '분석 마스터 플랜': 'adsp_master_plan',
  'R기초와 데이터 마트': 'adsp_r_data_mart',
  '통계분석': 'adsp_statistics',
  '정형 데이터 마이닝': 'adsp_data_mining',
};

const subjects = EXAM_CONFIG.adsp.subjects;
const lines = [];
const out = (s = '') => lines.push(s);

out('-- ADsP 모의고사·무한풀이 콘텐츠 시드');
out('-- 생성: frontend/scripts/generate-adsp-seed.mjs (직접 수정하지 말고 스크립트를 다시 실행)');
out('--');
out('-- 모의고사: exam.exams.exam_code = adsp_mock_N, 프론트 id = adsp-N');
out(`--   ${ADSP_EXAM_LIST.length}회 × 50문항 (1과목 1~10 · 2과목 11~20 · 3과목 21~50), 과목별 과락 기준 40%`);
out(`-- 무한풀이: endless.problems.source_problem_id = adsp_endless_N, ${ADSP_ENDLESS_PROBLEMS.length}문항, 카테고리 8개`);
out('--');
out('-- 같은 키가 이미 있으면 건너뛰므로 여러 번 실행해도 중복되지 않는다.');
out('-- 실행 전 확인: 실제 DDL 에서 NOT NULL 컬럼(question_version, topic_category_id 등)과');
out('--   correct_answer 타입(모의고사는 text, 무한풀이는 정수로 가정)을 확인한다.');
out('--');
out('-- 백엔드 반영 필요: content/router.py 는 exam_code 를 sqld_mock_ 으로 고정하고 있다.');
out('--   exam_type=adsp 요청이면 adsp_mock_ 접두어를 쓰고, id 는 adsp-N 으로 내려주도록 바꿔야 한다.');
out('');
out('BEGIN;');
out('');

// ── 모의고사 ──
for (const exam of ADSP_EXAM_LIST) {
  const code = `adsp_mock_${exam.round}`;
  const problems = getAdspExamProblems(exam.id);
  out(`-- ===== ${exam.title} (${code}) =====`);
  out(`INSERT INTO exam.exams (exam_code, title, total_question_count, total_page_count, duration_seconds, is_active)`);
  out(`SELECT ${q(code)}, ${q(exam.title)}, ${problems.length}, ${Math.ceil(problems.length / PROBLEMS_PER_PAGE)}, ${exam.timeLimit * 60}, TRUE`);
  out(`WHERE NOT EXISTS (SELECT 1 FROM exam.exams WHERE exam_code = ${q(code)});`);
  out('');
  subjects.forEach((subject, index) => {
    out(`INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)`);
    out(`SELECT e.id, ${q(subject.description)}, 40, ${index + 1} FROM exam.exams e`);
    out(`WHERE e.exam_code = ${q(code)} AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = ${index + 1});`);
  });
  out('');
  problems.forEach((problem, index) => {
    const no = index + 1;
    const subjectOrder = subjects.findIndex((s) => no >= s.range[0] && no <= s.range[1]) + 1;
    const payload = { source_id: problem.id, category: problem.category, points: 2, round: exam.round, avg_difficulty: exam.avgDifficulty };
    out(`INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)`);
    out(`SELECT e.id, ${no}, ${Math.ceil(no / PROBLEMS_PER_PAGE)}, s.id, 'multiple_choice', ${q(problem.description)}, ${json(payload)}, ${json(problem.options)}, ${q(problem.difficulty)}, 1, TRUE, ${q(problem.title)}, ${problem.correctRate}`);
    out(`FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = ${subjectOrder}`);
    out(`WHERE e.exam_code = ${q(code)} AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = ${no});`);
    out(`INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)`);
    out(`SELECT x.id, ${q(problem.answer)}, ${q(problem.explanation)} FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id`);
    out(`WHERE e.exam_code = ${q(code)} AND x.question_no = ${no} AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);`);
  });
  out('');
}

// ── 무한풀이 ──
out('-- ===== 무한풀이 카테고리 =====');
Object.entries(CATEGORY_CODES).forEach(([name, code], index) => {
  out(`INSERT INTO endless.problem_categories (category_code, category_name, display_order, is_active)`);
  out(`SELECT ${q(code)}, ${q(name)}, ${100 + index + 1}, TRUE WHERE NOT EXISTS (SELECT 1 FROM endless.problem_categories WHERE category_code = ${q(code)});`);
});
out('');
out('-- ===== 무한풀이 문항 =====');
for (const problem of ADSP_ENDLESS_PROBLEMS) {
  const code = CATEGORY_CODES[problem.category];
  if (!code) throw new Error(`카테고리 코드 없음: ${problem.category}`);
  out(`INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)`);
  out(`SELECT ${q(problem.id)}, ${q(problem.title)}, ${q(problem.description)}, ${q(problem.difficulty)}, c.category_id, ${q(problem.explanation)}, ${problem.correctRate}, ${problem.points}, TRUE`);
  out(`FROM endless.problem_categories c WHERE c.category_code = ${q(code)} AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = ${q(problem.id)});`);
  out(`INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)`);
  out(`SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES ${problem.options.map((o, i) => `(${i + 1}, ${q(o)})`).join(', ')}) AS v(no, txt)`);
  out(`WHERE p.source_problem_id = ${q(problem.id)} AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);`);
  out(`INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)`);
  out(`SELECT p.problem_id, ${Number(problem.answer)}, ${q(problem.explanation)} FROM endless.problems p`);
  out(`WHERE p.source_problem_id = ${q(problem.id)} AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);`);
}
out('');
out('COMMIT;');
out('');

const target = resolve(root, '..', 'docs', 'adsp_content_seed.sql');
writeFileSync(target, lines.join('\n'));
console.log(`wrote ${target}`);
console.log(`exams=${ADSP_EXAM_LIST.length} exam_questions=${ADSP_EXAM_LIST.length * 50} endless=${ADSP_ENDLESS_PROBLEMS.length}`);
