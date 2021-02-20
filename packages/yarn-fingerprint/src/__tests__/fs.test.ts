import { test, expect } from '@jest/globals';
import { join } from 'path';
import { pathExists } from '../fs';

const fixtures = join(__dirname, '../__fixtures__');

test('should check if path exists', async () => {
  expect(await pathExists(fixtures)).toBe(true);
  expect(await pathExists(join(fixtures, '.unknown'))).toBe(false);
});
