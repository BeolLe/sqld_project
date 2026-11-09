import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { build } from 'esbuild';

// Run the actual page and reply-history handlers without browser/network dependencies.
const fixtures = {
  react: `
    export const useState = initial => {
      const frame = harness.frame, i = frame.cursor++;
      if (!(i in frame.values)) frame.values[i] = initial;
      return [frame.values[i], value => frame.values[i] = typeof value === 'function' ? value(frame.values[i]) : value];
    };
    export const useCallback = (fn, deps) => {
      const frame = harness.frame, i = frame.cursor++, old = frame.values[i];
      if (!old || deps.some((v, n) => !Object.is(v, old.deps[n]))) frame.values[i] = {fn, deps};
      return frame.values[i].fn;
    };
    export const useEffect = (fn, deps) => {
      const frame = harness.frame, i = frame.cursor++, old = frame.values[i];
      if (!old || deps.some((v, n) => !Object.is(v, old.deps[n]))) {
        old?.cleanup?.();
        frame.effects.push(() => frame.values[i] = {deps, cleanup: fn()});
      }
    };`,
  'react/jsx-runtime': 'export const jsx = (type, props, key) => ({type, props, key}); export const jsxs = jsx;',
  'lucide-react': "export const MessageSquare = 'icon', ChevronDown = 'icon', Send = 'icon', Loader2 = 'icon';",
  '../utils/api': 'export const apiFetch = (...args) => harness.request(...args);',
};
const built = await build({
  entryPoints: [fileURLToPath(new URL('../src/pages/AdminFeedbackPage.tsx', import.meta.url))],
  bundle: true, platform: 'node', format: 'cjs', write: false, jsx: 'automatic',
  plugins: [{name: 'feedback-fixtures', setup(builder) {
    builder.onResolve({filter: /.*/}, ({path}) => path in fixtures ? {path, namespace: 'fixture'} : undefined);
    builder.onLoad({filter: /.*/, namespace: 'fixture'}, ({path}) => ({contents: fixtures[path], loader: 'js'}));
  }}],
});
const stamp = '2026-11-08T05:30:00+00:00';
const latest = {reply_id: '3', admin_user_id: 'admin-b', admin_nickname: '관리자 B', admin_reply: '확인 후 수정했습니다.\n감사합니다.', replied_at: stamp};
const history = {
  current_reply: latest,
  items: [{...latest, content_available: true}, {...latest, reply_id: '2', admin_nickname: '관리자 A', admin_reply: null, content_available: false}],
  next_cursor: '2',
};
const h = {calls: [], alerts: [], historyFails: false, hold: null};
h.request = async (path, init = {}) => {
  h.calls.push({path, init});
  if (path.includes('/replies')) {
    if (h.hold) await h.hold;
    if (h.historyFails) throw new Error('history offline');
    if (path.includes('&before=')) return {...history, items: [{...latest, reply_id: '1', admin_nickname: null, admin_user_id: null, admin_reply: '최초 답변', content_available: true}], next_cursor: null};
    return history;
  }
  if (init.method === 'PATCH') return {ticket_id: 'ticket', admin_reply: '서버에 저장된 답변', replied_at: stamp, status: 'reviewing'};
  return {total: 1, items: [{ticket_id: 'ticket', title: '문의 제목', content: '문의 내용', type: 'bug', status: 'pending', created_at: stamp, admin_reply: '기존 답변', replied_at: '2026-11-07T00:00:00Z'}]};
};
const module = {exports: {}};
vm.runInNewContext(built.outputFiles[0].text, {module, exports: module.exports, harness: h, AbortController, Date, window: {alert: message => h.alerts.push(message)}});
const frame = () => ({values: [], cursor: 0, effects: []});
function render(component, state, props = {}) {
  h.frame = state; state.cursor = 0; state.effects = [];
  const tree = component(props);
  state.effects.forEach(fn => fn());
  return tree;
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
}
function text(tree) {
  if (tree == null || typeof tree === 'boolean') return '';
  if (typeof tree !== 'object') return String(tree);
  return [tree.props?.children].flat(Infinity).map(text).join(' ');
}
const button = (tree, label) => nodes(tree).find(n => n.type === 'button' && text(n).includes(label));
const child = tree => nodes(tree).find(n => typeof n.type === 'function');
const flush = () => new Promise(resolve => setImmediate(resolve));
const page = frame();
render(module.exports.default, page); await flush();
let tree = render(module.exports.default, page);
button(tree, '문의 제목').props.onClick();
tree = render(module.exports.default, page);
const initialChild = child(tree);
const replies = frame();
render(initialChild.type, replies, initialChild.props); await flush();
let replyTree = render(initialChild.type, replies, initialChild.props);
assert.match(text(replyTree), /관리자 B/);
assert.match(text(replyTree), /관리자 A/);
assert.match(text(replyTree), /이전 답변 내용은 기록되지 않았습니다/);
assert.match(text(replyTree), /확인 후 수정했습니다/);
assert.match(text(replyTree), /한국시간/);
assert.equal(text(replyTree).split('확인 후 수정했습니다').length - 1, 1, 'current reply must not be duplicated in history');

button(replyTree, '이전 답변 더 보기').props.onClick();
render(initialChild.type, replies, initialChild.props); await flush();
replyTree = render(initialChild.type, replies, initialChild.props);
assert.match(text(replyTree), /최초 답변/);
assert.match(text(replyTree), /관리자 정보 없음/);
assert.equal(button(replyTree, '이전 답변 더 보기'), undefined);
assert.ok(h.calls.some(c => c.path.endsWith('&before=2')));

nodes(tree).find(n => n.type === 'textarea').props.onChange({target: {value: '수정 요청'}});
tree = render(module.exports.default, page);
await button(tree, '저장').props.onClick();
tree = render(module.exports.default, page);
assert.equal(nodes(tree).find(n => n.type === 'select').props.value, 'reviewing');
assert.equal(nodes(tree).find(n => n.type === 'textarea').props.value, '서버에 저장된 답변');
assert.notEqual(child(tree).key, initialChild.key, 'server replied_at must refresh reply history');
assert.match(child(tree).key, /2026-11-08T05:30:00/);

h.historyFails = true;
const savedChild = child(tree), refreshed = frame();
render(savedChild.type, refreshed, savedChild.props); await flush();
replyTree = render(savedChild.type, refreshed, savedChild.props);
assert.match(text(replyTree), /답변 내역을 불러오지 못했습니다/);
assert.match(text(render(module.exports.default, page)), /답변이 저장되었습니다/);
assert.equal(h.alerts.length, 0, 'history load error must not misreport a successful write');
h.historyFails = false;
button(replyTree, '다시 시도').props.onClick();
render(savedChild.type, refreshed, savedChild.props); await flush();
assert.match(text(render(savedChild.type, refreshed, savedChild.props)), /관리자 B/);

let release;
h.hold = new Promise(resolve => {release = resolve;});
const abandoned = frame();
render(savedChild.type, abandoned, savedChild.props);
abandoned.values.forEach(value => value?.cleanup?.());
const before = JSON.stringify(abandoned.values);
release(); await flush();
assert.equal(JSON.stringify(abandoned.values), before, 'late request after closing a ticket must be ignored');
assert.equal(h.calls.at(-1).init.signal.aborted, true);
console.log('PASS reply author/time/body, legacy missing content, pagination, server save response, history refresh/retry and stale-request cancellation');
