import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Bypass node_modules/.bin/vitest and execute Vite+'s exact Vitest dependency.
const require = createRequire(import.meta.url);
const requireFromVp = createRequire(require.resolve('vite-plus/package.json'));
const vitestRoot = dirname(requireFromVp.resolve('vitest/package.json'));
const result = spawnSync(process.execPath, [join(vitestRoot, 'dist/cli.js'), ...process.argv.slice(2)], {
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
