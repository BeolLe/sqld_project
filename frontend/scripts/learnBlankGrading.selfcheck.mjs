import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await mkdtemp(path.join(tmpdir(), 'learn-blank-grading-check-'));
try {
  await build({
    entryPoints: [path.join(root, 'scripts/learnBlankGrading.selfcheck.ts')],
    outfile: path.join(temp, 'check.cjs'),
    bundle: true,
    platform: 'node',
    format: 'cjs',
  });
  execFileSync(process.execPath, [path.join(temp, 'check.cjs')], { cwd: root, stdio: 'inherit' });
} finally {
  await rm(temp, { recursive: true, force: true });
}
