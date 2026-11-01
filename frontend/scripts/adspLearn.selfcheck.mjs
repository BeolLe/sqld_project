import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await mkdtemp(path.join(tmpdir(), 'adsp-learn-check-'));
try {
  await build({
    entryPoints: [path.join(root, 'scripts/adspLearn.selfcheck.tsx')],
    outfile: path.join(temp, 'check.cjs'),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    loader: { '.webp': 'dataurl' },
    define: {
      'process.env.NODE_ENV': '"production"',
      'import.meta.env.VITE_API_BASE_URL': '"https://education.test.invalid/api"',
      'import.meta.env.VITE_AI_MOCK': '"0"',
      'import.meta.env.VITE_AMPLITUDE_API_KEY': '""',
    },
    plugins: [
      {
        name: 'test-only-adapters',
        setup(builder) {
          builder.onResolve({ filter: /(?:\/AuthContext|\/logging)$/ }, (args) => ({
            path: args.path,
            namespace: 'test-adapter',
          }));
          builder.onLoad({ filter: /.*/, namespace: 'test-adapter' }, (args) => ({
            contents: args.path.includes('AuthContext')
              ? 'export function useAuth(){return globalThis.__learnTestAuth;}'
              : 'export class ClickLog {constructor(){} send(){}} export class PageviewLog extends ClickLog {}',
            loader: 'js',
          }));
        },
      },
    ],
  });
  execFileSync(process.execPath, [path.join(temp, 'check.cjs')], { cwd: root, stdio: 'inherit' });

  // 운영 빌드(VITE_AI_MOCK=0) 번들에 ADsP 모의고사·무한풀이 문항과 목업 전용 데이터가 없어야 한다.
  const dist = path.join(temp, 'dist');
  execFileSync(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', dist, '--emptyOutDir'], {
    cwd: root,
    env: { ...process.env, VITE_AI_MOCK: '0' },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  const assets = path.join(dist, 'assets');
  const bundle = (await Promise.all((await readdir(assets)).filter((f) => f.endsWith('.js')).map((f) => readFile(path.join(assets, f), 'utf8')))).join('\n');
  const leaked = ['콜센터 상담 녹음 파일', '고객 설문의 서술형 응답', '맨-휘트니', 'adsp_endless_', 'exam1_p1'].filter((needle) => bundle.includes(needle));
  if (leaked.length > 0) throw new Error('운영 번들에 목업 문항 문자열이 들어 있다: ' + leaked.join(', '));
  console.log('Production bundle check passed: no ADsP exam/endless or mock-only problem strings.');
} finally {
  await rm(temp, { recursive: true, force: true });
}
