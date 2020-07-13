import { join } from 'path';
import { listWorkspacesByName } from './list';
import { pathExists, readJson } from './utils/fs';
import { Workspace } from './workspace';

export async function loadWorkspace(cwd: string): Promise<Workspace> {
  const pkgPath = join(cwd, 'package.json');
  if (!(await pathExists(pkgPath))) {
    throw new Error(`Could not find workspace at "${cwd}"`);
  }

  const { name } = await readJson(pkgPath);
  const byName = await listWorkspacesByName({ cwd });
  if (!byName[name]) {
    throw new Error(`"${name}" is not a workspace in the current project`);
  }

  return byName[name];
}
