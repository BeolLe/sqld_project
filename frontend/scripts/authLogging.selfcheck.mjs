import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { build } from 'esbuild';

// Exercise the real logger with browser/SDK failures; never send telemetry.
const result = await build({
  entryPoints: [fileURLToPath(new URL('../src/utils/eventLogger.ts', import.meta.url))],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
  define: { 'import.meta.env.VITE_AMPLITUDE_API_KEY': '"test-only"' },
  plugins: [
    {
      name: 'amplitude-test-adapter',
      setup(builder) {
        builder.onResolve({ filter: /^@amplitude\/unified$/ }, () => ({
          path: 'sdk',
          namespace: 'test',
        }));
        builder.onLoad({ filter: /.*/, namespace: 'test' }, () => ({
          contents: ['initAll', 'track', 'setUserId', 'reset']
            .map((name) => `export const ${name} = (...args) => globalThis.sdk.${name}(...args);`)
            .join('\n'),
          loader: 'js',
        }));
      },
    },
  ],
});
const code = result.outputFiles[0].text;
const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const failure = () => {
  throw new Error('simulated telemetry failure');
};
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

function load(crypto, overrides = {}, globals = {}) {
  const module = { exports: {} };
  const sdk = {
    initAll: () => Promise.resolve(),
    track: () => ({ promise: Promise.resolve() }),
    setUserId() {},
    reset() {},
    ...overrides,
  };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    crypto,
    sdk,
    console: { debug() {}, warn() {} },
    ...globals,
  });
  return module.exports;
}

for (const [name, crypto] of [
  ['secure context', webcrypto],
  ['HTTP: no randomUUID', { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) }],
  ['no crypto', undefined],
  ['crypto methods throw', { randomUUID: failure, getRandomValues: failure }],
  [
    'randomUUID throws, getRandomValues works',
    { randomUUID: failure, getRandomValues: webcrypto.getRandomValues.bind(webcrypto) },
  ],
]) {
  const logger = load(crypto);
  for (let i = 0; i < 100; i += 1) {
    assert.doesNotThrow(() => logger.logEvent('common_auth_modal_viewed', { mode: 'login' }));
  }
  const logs = logger.getLogs();
  assert.equal(logs.length, 100, name);
  assert.equal(new Set(logs.map((log) => log.id)).size, 100, name);
  logs.forEach((log) => assert.match(log.id, uuidV4, name));
  console.log(`PASS ${name}: 100 unique UUID v4 events`);
}

let nativeCalls = 0;
let randomValuesCalls = 0;
let fallbackCalls = 0;
const testMath = Object.create(Math);
testMath.random = () => {
  fallbackCalls += 1;
  return 0.5;
};
const nativeId = '12345678-1234-4234-8234-123456789abc';
const nativeLogger = load(
  {
    randomUUID() {
      nativeCalls += 1;
      return nativeId;
    },
    getRandomValues: failure,
  },
  {},
  { Math: testMath }
);
nativeLogger.logEvent('common_auth_modal_viewed', { mode: 'login' });
assert.equal(nativeLogger.getLogs()[0].id, nativeId);
assert.equal(nativeCalls, 1);
assert.equal(fallbackCalls, 0);

const httpLogger = load(
  {
    getRandomValues(bytes) {
      randomValuesCalls += 1;
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = i;
      return bytes;
    },
  },
  {},
  { Math: testMath }
);
httpLogger.logEvent('common_auth_modal_viewed', { mode: 'login' });
assert.equal(httpLogger.getLogs()[0].id, '00010203-0405-4607-8809-0a0b0c0d0e0f');
assert.equal(randomValuesCalls, 1);
assert.equal(fallbackCalls, 0);

const legacyLogger = load(undefined, {}, { Math: testMath });
legacyLogger.logEvent('common_auth_modal_viewed', { mode: 'login' });
assert.equal(legacyLogger.getLogs()[0].id, '80808080-8080-4080-8080-808080808080');
assert.equal(fallbackCalls, 16);
console.log('PASS deterministic RNG selection: native → WebCrypto → last-resort fallback');

for (const [name, overrides] of [
  ['SDK throws synchronously', { track: failure, setUserId: failure, reset: failure }],
  [
    'SDK track promise rejects',
    { track: () => ({ promise: Promise.reject(new Error('offline')) }) },
  ],
  ['SDK initialization throws', { initAll: failure }],
  ['SDK initialization rejects', { initAll: () => Promise.reject(new Error('blocked')) }],
]) {
  const logger = load(webcrypto, overrides);
  assert.doesNotThrow(() => logger.initAmplitude());
  await flushPromises();
  assert.doesNotThrow(() => logger.setAmplitudeUserId('test-user'));
  assert.doesNotThrow(() => logger.logEvent('common_auth_modal_viewed', { mode: 'login' }));
  assert.doesNotThrow(() => logger.resetAmplitudeUserId());
  await flushPromises();
  assert.equal(logger.getLogs().length, 1, name);
  console.log(`PASS ${name}: UI calls succeed and local event survives`);
}

console.log('Auth logging regression checks passed.');
