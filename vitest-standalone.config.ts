import { oxc, resolve, test } from './config';

export default {
  oxc,
  resolve,
  test: {
    ...test,
    coverage: { ...test.coverage, reportsDirectory: 'coverage/vitest' },
  },
};
