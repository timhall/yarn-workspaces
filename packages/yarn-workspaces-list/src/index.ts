import { Name, Workspace } from './workspace';
import { list } from './yarn-berry';
import { info, isClassic } from './yarn-classic';

export { phasedSort, topologicallySort } from './sort';
export { Workspace };

export interface ListOptions {
  cwd?: string;
}

export async function listWorkspaces(options: ListOptions = {}): Promise<Workspace[]> {
  return (await isClassic(options)) ? await info(options) : await list(options);
}

export type WorkspacesByName = Record<Name, Workspace>;

export async function listWorkspacesByName(options: ListOptions = {}): Promise<WorkspacesByName> {
  const workspaces = await listWorkspaces(options);

  const byName: WorkspacesByName = {};
  for (const workspace of workspaces) {
    byName[workspace.name] = workspace;
  }

  return byName;
}
