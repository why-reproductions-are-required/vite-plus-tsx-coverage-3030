import { expect, test } from 'vite-plus/test';
import { label } from '../src/label';

test('executes the TSX component and the TS helper', () => {
  const element = label('world');
  expect(element.tagName).toBe('SPAN');
  expect(element.textContent).toBe('Hello, world');
});
