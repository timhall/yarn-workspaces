import { join, relative } from 'path';
import { loadWorkspace } from '../load-workspace';
import { Workspace } from '../workspace';

jest.mock('child_process');

test('should load workspace', async () => {
  const fixtures = join(__dirname, '../../__fixtures__');
  const cwd = join(fixtures, 'packages/c');

  const workspace = await loadWorkspace(cwd);

  expect(normalize(cwd)(workspace)).toMatchSnapshot();
});

function normalize(cwd: string) {
  return (workspace: Workspace): Workspace => ({
    ...workspace,
    path: `absolute(${relative(cwd, workspace.path)})`,
  });
}
