import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const vpPackagePath = require.resolve('vite-plus/package.json');
const requireFromVp = createRequire(vpPackagePath);
const vpCli = join(dirname(vpPackagePath), 'bin/vp');
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

console.log(`Node ${process.version}; ${process.platform} ${process.arch}`);
console.log(`vite-plus ${readJson(vpPackagePath).version}`);
console.log(`vitest ${readJson(requireFromVp.resolve('vitest/package.json')).version}`);

const cases = [
  ['vp', [vpCli, 'test', 'run', '--config', 'vite.config.ts']],
  ['vp-threads', [vpCli, 'test', 'run', '--config', 'vite.config.ts', '--pool=threads']],
  ['vp-vmThreads', [vpCli, 'test', 'run', '--config', 'vite.config.ts', '--pool=vmThreads']],
  ['vitest', ['scripts/run-vitest.mjs', 'run', '--config', 'vitest-standalone.config.ts']],
];

const summary = [];
for (const [name, args] of cases) {
  const reportDir = join(root, 'coverage', name);
  const testReport = join(root, 'coverage', `${name}-tests.json`);
  rmSync(reportDir, { recursive: true, force: true });
  rmSync(testReport, { force: true });
  mkdirSync(reportDir, { recursive: true });

  const result = spawnSync(process.execPath, [
    ...args,
    '--coverage',
    '--coverage.reportsDirectory', reportDir,
    '--reporter=default',
    '--reporter=json',
    '--outputFile', testReport,
  ], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;

  const tests = readJson(testReport);
  assert.equal(tests.numPassedTests, 1, `${name}: the component test must execute`);
  assert.equal(tests.numFailedTests, 0, `${name}: no test failures`);
  assert.equal(tests.numFailedTestSuites, 0, `${name}: no suite failures`);

  const report = readJson(join(reportDir, 'coverage-final.json'));
  const files = Object.fromEntries(Object.entries(report).map(([path, coverage]) => [
    relative(root, path).replaceAll('\\', '/'), coverage,
  ]));
  assert.deepEqual(Object.keys(files).sort(), [
    'src/label.tsx', 'src/message.ts', 'src/unused.tsx',
  ], `${name}: all TS and TSX source files must appear in coverage`);

  const labelHits = Object.values(files['src/label.tsx'].s);
  assert(labelHits.some((hits) => hits > 0), `${name}: executed JSX must have coverage`);
  assert(labelHits.some((hits) => hits === 0), `${name}: untested JSX must stay uncovered`);
  const unusedHits = Object.values(files['src/unused.tsx'].s);
  assert(unusedHits.length > 0 && unusedHits.every((hits) => hits === 0));
  assert.equal(result.status, 1, `${name}: untested JSX must fail the 100% thresholds`);

  summary.push({
    runner: name,
    ts: Object.keys(files).filter((path) => path.endsWith('.ts')).length,
    tsx: Object.keys(files).filter((path) => path.endsWith('.tsx')).length,
    testsPassed: tests.numPassedTests,
    exitCode: result.status,
  });
}

writeFileSync(join(root, 'coverage/comparison.json'), JSON.stringify({
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  results: summary,
}, null, 2) + '\n');
console.table(summary);
console.log('Issue #3030 was not reproduced: every runner collected both TSX files and rejected incomplete coverage.');
