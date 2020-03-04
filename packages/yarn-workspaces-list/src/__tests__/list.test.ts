import { join } from 'path';
import { listWorkspaces } from '../';

jest.mock('child_process');

test('should list workspaces', async () => {
  const cwd = join(__dirname, '../../__fixtures__');

  const list = await listWorkspaces({ cwd });

  expect(list).toMatchSnapshot();
});
