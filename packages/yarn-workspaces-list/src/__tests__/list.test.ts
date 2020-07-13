import { join, relative } from 'path';
import { listWorkspaces } from '../list';
import { Workspace } from '../workspace';

jest.mock('child_process');

test('should list workspaces', async () => {
  const cwd = join(__dirname, '../../__fixtures__');

  const list = await listWorkspaces({ cwd });

  expect(list.map(normalize(cwd))).toMatchSnapshot();
});

function normalize(cwd: string) {
  return (workspace: Workspace): Workspace => ({
    ...workspace,
    path: `absolute(${relative(cwd, workspace.path)})`,
  });
}
