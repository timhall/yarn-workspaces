import { join, relative } from 'path';
import { listWorkspaces } from '../';
import { phasedSort, topologicallySort } from '../sort';
import { Workspace } from '../workspace';

jest.mock('child_process');

test('should sort workspaces topologically', async () => {
  const cwd = join(__dirname, '../../__fixtures__');
  const list = await listWorkspaces({ cwd });

  expect(topologicallySort(list).map(normalize(cwd))).toMatchSnapshot();
});

test('should sort workspaces in topological phases', async () => {
  const cwd = join(__dirname, '../../__fixtures__');
  const list = await listWorkspaces({ cwd });

  expect(phasedSort(list).map((phase) => phase.map(normalize(cwd)))).toMatchSnapshot();
});

function normalize(cwd: string) {
  return (workspace: Workspace): Workspace => ({
    ...workspace,
    path: `absolute(${relative(cwd, workspace.path)})`,
  });
}
