import { join, relative } from 'path';
import { test, jest } from '@jest/globals';
import execa from 'execa';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { findWorkspaceChanges } from '../';

jest.mock('execa', () =>
  jest.fn(async (command: string, args: string[], options: unknown) => {
    return { stdout: '' };
  })
);

jest.mock('find-yarn-workspace-root', () => jest.fn(() => join(__dirname, '../__fixtures__')));

const root = join(__dirname, '../__fixtures__');
const cwd = join(root, 'b');
const workspaces = `
  {"location":".","name":"@fixtures/root","workspaceDependencies":[],"mismatchedWorkspaceDependencies":[]}
  {"location":"a","name":"@fixtures/a","workspaceDependencies":["transitive"],"mismatchedWorkspaceDependencies":[]}
  {"location":"b","name":"@fixtures/b","workspaceDependencies":["a"],"mismatchedWorkspaceDependencies":[]}
  {"location":"transitive","name":"@fixtures/transitive","workspaceDependencies":[],"mismatchedWorkspaceDependencies":[]}
`;

afterEach(() => ((execa as unknown) as jest.Mock).mockClear());

test('should find changes in directory', async () => {
  ((execa as unknown) as jest.Mock).mockImplementation(async (command, [subcommand]) => {
    if (command === 'git' && subcommand === 'diff') {
      return {
        stdout: `
          a/file.js 
          b/file.js
        `,
      };
    }
    if (command === 'git' && subcommand === 'ls-files') return { stdout: '' };
    if (command === 'yarn' && subcommand === '--version') return { stdout: '2.4.0' };
    if (command === 'yarn' && subcommand === 'workspaces') return { stdout: workspaces };
  });
  const changes = await findWorkspaceChanges('HEAD', { cwd });

  expect(changes.map((path) => relative(root, path))).toEqual(['b/file.js']);
});

test('should find unstaged changes in directory', async () => {
  ((execa as unknown) as jest.Mock).mockImplementation(async (command, [subcommand]) => {
    if (command === 'git' && subcommand === 'diff') return { stdout: '' };
    if (command === 'git' && subcommand === 'ls-files') return { stdout: 'b/new.js' };
    if (command === 'yarn' && subcommand === '--version') return { stdout: '2.4.0' };
    if (command === 'yarn' && subcommand === 'workspaces') return { stdout: workspaces };
  });
  const changes = await findWorkspaceChanges('HEAD', { cwd });

  expect(changes.map((path) => relative(root, path))).toEqual(['b/new.js']);
});

test('should find change in yarn.lock', async () => {
  ((execa as unknown) as jest.Mock).mockImplementation(async (command, [subcommand]) => {
    if (command === 'git' && subcommand === 'diff') return { stdout: 'yarn.lock' };
    if (command === 'git' && subcommand === 'ls-files') return { stdout: '' };
    if (command === 'yarn' && subcommand === '--version') return { stdout: '2.4.0' };
    if (command === 'yarn' && subcommand === 'workspaces') return { stdout: workspaces };
  });
  const changes = await findWorkspaceChanges('HEAD', { cwd });

  expect(changes.map((path) => relative(root, path))).toEqual(['yarn.lock']);
});

test('should find change in dependencies', async () => {
  ((execa as unknown) as jest.Mock).mockImplementation(async (command, [subcommand]) => {
    if (command === 'git' && subcommand === 'diff') return { stdout: 'a/file.js' };
    if (command === 'git' && subcommand === 'ls-files') return { stdout: '' };
    if (command === 'yarn' && subcommand === '--version') return { stdout: '2.4.0' };
    if (command === 'yarn' && subcommand === 'workspaces') return { stdout: workspaces };
  });
  const changes = await findWorkspaceChanges('HEAD', { cwd, includeDependencies: true });

  expect(changes.map((path) => relative(root, path))).toEqual(['a/file.js']);
});

test('should ignore change in dependencies for includeDependencies = false', async () => {
  ((execa as unknown) as jest.Mock).mockImplementation(async (command, [subcommand]) => {
    if (command === 'git' && subcommand === 'diff') return { stdout: 'a/file.js' };
    if (command === 'git' && subcommand === 'ls-files') return { stdout: '' };
    if (command === 'yarn' && subcommand === '--version') return { stdout: '2.4.0' };
    if (command === 'yarn' && subcommand === 'workspaces') return { stdout: workspaces };
  });
  const changes = await findWorkspaceChanges('HEAD', { cwd, includeDependencies: false });

  expect(changes.map((path) => relative(root, path))).toEqual([]);
});

test('should default to HEAD and process.cwd()', async () => {
  ((execa as unknown) as jest.Mock).mockImplementation(async (command, [subcommand]) => {
    if (command === 'git' && subcommand === 'diff') return { stdout: '' };
    if (command === 'git' && subcommand === 'ls-files') return { stdout: '' };
    if (command === 'yarn' && subcommand === '--version') return { stdout: '2.4.0' };
    if (command === 'yarn' && subcommand === 'workspaces') return { stdout: workspaces };
  });
  jest.spyOn(process, 'cwd').mockImplementation(() => cwd);

  const changes = await findWorkspaceChanges();
  expect(changes).toEqual([]);

  const calls = ((execa as unknown) as jest.Mock).mock.calls;
  const reference = calls[0][1][2];
  expect(reference).toBe('HEAD');
});

test('should de-duplicate changed files', async () => {
  ((execa as unknown) as jest.Mock).mockImplementation(async (command, [subcommand]) => {
    if (command === 'git' && subcommand === 'diff') return { stdout: 'yarn.lock' };
    if (command === 'git' && subcommand === 'ls-files') return { stdout: '' };
    if (command === 'yarn' && subcommand === '--version') return { stdout: '2.4.0' };
    if (command === 'yarn' && subcommand === 'workspaces') return { stdout: workspaces };
  });
  const changes = await findWorkspaceChanges('HEAD', { cwd, includeDependencies: true });

  expect(changes.map((path) => relative(root, path))).toEqual(['yarn.lock']);
});

test('should throw if workspace root is not found', async () => {
  ((findWorkspaceRoot as unknown) as jest.Mock).mockImplementation(() => null);

  await expect(findWorkspaceChanges('HEAD', { cwd })).rejects.toThrow(
    'Could not find yarn workspace root from current directory'
  );
});
