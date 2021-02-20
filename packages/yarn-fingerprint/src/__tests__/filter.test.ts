import { test, expect } from '@jest/globals';
import { join, relative } from 'path';
import { findGitignores } from '../filter';
import findUp from 'find-up';

jest.mock('find-up', () =>
  jest.fn(async (file: string, options: { cwd: string }) => {
    const root = join(__dirname, '../__fixtures__');
    if (file === '.git') return join(root, '.git');
    if (file === '.gitignore' && options.cwd !== root) return join(options.cwd, file);

    return null;
  })
);

const root = join(__dirname, '../__fixtures__');
const cwd = join(root, 'b/c');

test('should not find .gitignore files if .git cannot be found', async () => {
  ((findUp as unknown) as jest.Mock).mockImplementationOnce(() => Promise.resolve(undefined));

  const gitignores = await findGitignores(cwd);
  expect(gitignores).toEqual([]);
});

test('should find .gitignore files', async () => {
  const gitignores = await findGitignores(cwd);
  expect(gitignores.map((path) => relative(root, path))).toEqual([
    'b/c/.gitignore',
    'b/.gitignore',
  ]);
});
