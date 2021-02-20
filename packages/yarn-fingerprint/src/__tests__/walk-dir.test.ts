import { jest, test, expect } from '@jest/globals';
import { join, relative } from 'path';
import { walkDir } from '../walk-dir';

jest.mock('../fs', () => ({
  lstat: async () => {},
  readdir: async () => ['a.js', 'c.js', 'b.js', 'b.js', 'd.js'],
}));

const dir = join(__dirname, '../__fixtures__');

test('should sort paths for stability', async () => {
  const paths = [];
  for await (const { path } of walkDir(dir)) {
    paths.push(path);
  }

  expect(paths.map((path) => relative(dir, path))).toEqual([
    'a.js',
    'b.js',
    'b.js',
    'c.js',
    'd.js',
  ]);
});

test('should filter paths', async () => {
  const paths = [];
  const filter = (path: string) => relative(dir, path) !== 'b.js';
  for await (const { path } of walkDir(dir, { filter })) {
    paths.push(path);
  }

  expect(paths.map((path) => relative(dir, path))).toEqual(['a.js', 'c.js', 'd.js']);
});
