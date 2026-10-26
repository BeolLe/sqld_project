import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

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
    define: {
      'process.env.NODE_ENV': '"production"',
      'import.meta.env.VITE_API_BASE_URL': '"https://education.test.invalid/api"',
    },
    plugins: [
      {
        name: 'test-only-adapters',
        setup(builder) {
          builder.onResolve({ filter: /(?:contexts\/AuthContext|\/logging)$/ }, (args) => ({
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
} finally {
  await rm(temp, { recursive: true, force: true });
}
