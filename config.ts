import { fileURLToPath } from 'node:url';

export const resolve = {
  alias: {
    '@ui-jsx': fileURLToPath(new URL('./runtime', import.meta.url)),
  },
};

export const oxc = {
  jsx: { runtime: 'automatic' as const, importSource: '@ui-jsx' },
};

export const test = {
  include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  environment: 'jsdom',
  coverage: {
    provider: 'v8' as const,
    include: ['src/**/*.ts', 'src/**/*.tsx'],
    reporter: ['text', 'json'] as const,
    thresholds: {
      perFile: true,
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
