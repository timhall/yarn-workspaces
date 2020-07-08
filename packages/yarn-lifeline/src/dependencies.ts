import findWorkspaceRoot from 'find-yarn-workspace-root';
import { pathExists } from 'fs-extra';
import { join } from 'path';
import { listWorkspaces, PackageInfo } from 'yarn-workspaces-list';

export interface DependencyInfo extends PackageInfo {
  path: string;
}

export async function listWorkspaceDependencies(cwd: string): Promise<DependencyInfo[]> {
  const pkgPath = join(cwd, 'package.json');
  if (!(await pathExists(pkgPath))) return [];

  const root = await findWorkspaceRoot(cwd);
  const { name } = require(join(cwd, 'package.json'));
  const workspaces = await listWorkspaces({ cwd });
  const dependencies = filterByDependencies(workspaces, name).map(pkg => {
    const path = join(root || '', pkg.location);
    return { path, ...pkg };
  });

  return dependencies;
}

function filterByDependencies(workspaces: PackageInfo[], name: string): PackageInfo[] {
  const byLocation: { [location: string]: PackageInfo } = {};
  for (const info of workspaces) {
    byLocation[info.location] = info;
  }

  const search = workspaces.find(info => info.name === name);
  if (!search) {
    throw new Error(`Unable to find package "${name}" in workspaces`);
  }

  const dependencies: PackageInfo[] = search.workspaceDependencies
    .map(location => {
      const info = byLocation[location];
      return [info, ...filterByDependencies(workspaces, info.name)];
    })
    .flat()
    .filter(unique());

  return dependencies;
}

function unique<TValue = any>(): (value: TValue) => boolean {
  const seen = new Set<TValue>();
  return (value: TValue) => {
    if (seen.has(value)) {
      return false;
    } else {
      seen.add(value);
      return true;
    }
  };
}
