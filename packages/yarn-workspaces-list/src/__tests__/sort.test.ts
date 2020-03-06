import { join } from 'path';
import { listWorkspaces } from '../';
import { phasedSort, topologicallySort } from '../sort';

jest.mock('child_process');

test('should sort workspaces topologically', async () => {
  const cwd = join(__dirname, '../../__fixtures__');
  const list = await listWorkspaces({ cwd });

  expect(topologicallySort(list)).toMatchSnapshot();
});

test('should sort workspaces in topological phases', async () => {
  const cwd = join(__dirname, '../../__fixtures__');
  const list = await listWorkspaces({ cwd });

  expect(phasedSort(list)).toMatchSnapshot();
});
