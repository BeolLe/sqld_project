import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { build } from 'esbuild';

// Exercise the actual page handlers, buttons and keyboard bindings without a browser/network.
const entry = fileURLToPath(new URL('../src/pages/SQLPracticePage.tsx', import.meta.url));
const source = await readFile(entry, 'utf8');
const fixtures = {
  react: `
    export const useCallback = fn => fn;
    export const useMemo = fn => fn();
    export const useEffect = fn => harness.effects.push(fn);
    export const useState = initial => {
      const i = harness.cursor++;
      if (!(i in harness.states)) harness.states[i] = typeof initial === 'function' ? initial() : initial;
      return [harness.states[i], value => harness.states[i] = typeof value === 'function' ? value(harness.states[i]) : value];
    };
    export const useRef = initial => useState(() => ({current: initial}))[0];`,
  'react/jsx-runtime': 'export const jsx = (type, props) => ({type, props}); export const jsxs = jsx; export const Fragment = "fragment";',
  'react-router-dom': `export const useParams = () => ({id: harness.problemId}); export const useNavigate = () => () => {}; export const useSearchParams = () => [new URLSearchParams()];`,
  '../contexts/AuthContext': 'export const useAuth = () => ({user: {id: "user"}, updatePoints() {}});',
  '../logging': 'export class PageviewLog {send() {}} export class ClickLog {send() {}}',
  '../hooks/useExamType': `export const useExamType = () => ({examType: 'sqld', examPath: path => '/sqld' + path});`,
  '../api/content': `export const fetchSQLPractice = async id => ({id, title: 'test', description: '', schemaSQL: '', sampleData: '', difficulty: 'easy', category: 'test', correctRate: 0});`,
  '../utils/api': 'export const apiRequest = (...args) => harness.request(...args);',
  '../utils/sqlParser': 'export const parseDDL = () => []; export const parseInserts = () => [];',
  '@codemirror/view': 'export const keymap = {of: bindings => ({bindings})};',
};
// Unused UI/telemetry imports are stubs; the page's execution logic is bundled unchanged.
for (const match of source.matchAll(/import\s+(?!type\b)([\s\S]*?)\s+from\s+'([^']+)';/g)) {
  const [, symbols, path] = match;
  if (path in fixtures) continue;
  fixtures[path] = symbols.startsWith('{')
    ? symbols.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean).map(name => `export const ${name} = () => null;`).join('\n')
    : `export default '${symbols}';`;
}
const built = await build({
  entryPoints: [entry], bundle: true, platform: 'node', format: 'cjs', write: false, jsx: 'automatic',
  plugins: [{name: 'isolated-sql-page', setup(builder) {
    builder.onResolve({filter: /.*/}, ({path}) => path in fixtures ? {path, namespace: 'fixture'} : undefined);
    builder.onLoad({filter: /.*/, namespace: 'fixture'}, ({path}) => ({contents: fixtures[path], loader: 'js'}));
  }}],
});
const h = {states: [], cursor: 0, effects: [], cleanups: [], listeners: new Map(), timers: new Set(), calls: [], problemId: 'one', now: 10000, responseStatus: 200, hold: null};
h.request = async (path, init) => {
  if (path !== '/sql/execute') return new Response(JSON.stringify({submittedSql: 'SELECT * FROM EMP'}));
  h.calls.push(JSON.parse(init.body));
  if (h.hold) await h.hold;
  return new Response(JSON.stringify(h.responseStatus === 200 ? {success: true, columns: [], rows: [], isCorrect: false} : {detail: 'wait'}), {status: h.responseStatus, headers: {'Retry-After': '3'}});
};
const module = {exports: {}};
vm.runInNewContext(built.outputFiles[0].text, {
  module, exports: module.exports, harness: h, URLSearchParams, Response,
  Date: class extends Date {static now() {return h.now;}}, navigator: {platform: 'Linux'},
  window: {location: {pathname: '/sql/one'},
    addEventListener: (name, fn) => h.listeners.set(name, fn), removeEventListener: name => h.listeners.delete(name),
    setInterval: fn => (h.timers.add(fn), fn), clearInterval: fn => h.timers.delete(fn)},
});
const flush = () => new Promise(resolve => setImmediate(resolve));
function render() {
  h.cleanups.forEach(fn => fn?.()); h.cleanups = []; h.effects = []; h.cursor = 0;
  const tree = module.exports.default();
  h.cleanups = h.effects.map(fn => fn());
  return tree;
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
}
function controls(tree) {
  const all = nodes(tree);
  const buttons = all.filter(n => n.type === 'button');
  return {
    run: buttons.find(n => JSON.stringify(n.props.children)?.includes('실행')),
    submit: buttons.find(n => JSON.stringify(n.props.children)?.includes('제출')),
    editor: all.find(n => n.type === 'CodeMirror'),
  };
}
function advance(ms) {h.now += ms; [...h.timers].forEach(fn => fn());}
render(); await flush();
let ui = controls(render());
ui.run.props.onClick(); ui.submit.props.onClick();
h.listeners.get('keydown')({key: 'Enter', ctrlKey: true, preventDefault() {}});
ui.editor.props.extensions.find(e => e?.bindings).bindings[0].run();
await flush();
assert.equal(h.calls.length, 1, 'button/submit/both keyboard shortcuts must share one guard');
ui = controls(render());
assert.ok(ui.run.props.disabled && ui.submit.props.disabled);
advance(2999); ui.submit.props.onClick(); await flush(); assert.equal(h.calls.length, 1);
advance(1); ui = controls(render()); assert.equal(ui.submit.props.disabled, false);
ui.submit.props.onClick(); await flush(); assert.equal(h.calls[1].action, 'submit');
console.log('PASS shared 3-second execute/submit/button/keyboard gate, including 2999/3000ms boundary');

advance(3000); h.responseStatus = 429; ui = controls(render()); ui.run.props.onClick(); await flush();
ui = controls(render()); assert.ok(ui.run.props.disabled);
advance(2999); ui.run.props.onClick(); await flush(); assert.equal(h.calls.length, 3);
advance(1); h.responseStatus = 200; ui = controls(render());
let release; h.hold = new Promise(resolve => {release = resolve;});
ui.run.props.onClick(); advance(5000); ui.submit.props.onClick(); await flush();
assert.equal(h.calls.length, 4, 'in-flight request stays blocked beyond cooldown');
release(); h.hold = null; await flush();
console.log('PASS Retry-After countdown and in-flight request guard');

ui = controls(render()); ui.run.props.onClick(); await flush();
h.problemId = 'two'; render(); await flush(); ui = controls(render());
ui.submit.props.onClick(); await flush(); assert.equal(h.calls.length, 6);
assert.equal(h.calls[5].practice_id, 'two');
h.problemId = 'one'; render(); await flush(); ui = controls(render()); ui.run.props.onClick(); await flush();
assert.equal(h.calls.length, 6, 'returning to same problem preserves cooldown');
console.log('PASS cooldown per problem, including navigation back');
