import { defineConfig } from 'vite-plus';
import { oxc, resolve, test } from './config';

export default defineConfig({
  oxc,
  resolve,
  test: {
    ...test,
    coverage: { ...test.coverage, reportsDirectory: 'coverage/vp' },
  },
});
