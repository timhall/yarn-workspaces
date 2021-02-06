import { listWorkspaces, Workspace } from 'yarn-workspaces-list';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import execa from 'execa';

interface ChangesOptions {
  cwd?: string;
}

export async function findChangedWorkspaces(
  reference: string = 'HEAD',
  options: ChangesOptions = {}
): Promise<Workspace[]> {
  const { cwd = process.cwd() } = options;
  const rootDir = findWorkspaceRoot(cwd);

  if (rootDir === null) {
    throw new Error('Could not find yarn workspace root from current directory');
  }

  const { stdout: diff } = await execa('git', ['diff', '--name-only', reference], {
    cwd: rootDir,
  });
  const workspaces = await listWorkspaces({ cwd });

  // TODO

  return [];
}
