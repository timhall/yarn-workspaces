import _debug from 'debug';
import { join } from 'path';
import { foreach } from 'yarn-workspaces-foreach';
import { listWorkspaces, PackageInfo } from 'yarn-workspaces-list';

const debug = _debug('knit');

export interface Options {
  cwd?: string;
  jobs?: number;
  parallel?: boolean;
}

export async function dependencies(options: Options = {}) {
  const { cwd = process.cwd(), parallel = true, jobs } = options;

  // Load package and all workspaces
  const { name } = require(join(cwd, 'package.json'));
  const workspaces = await listWorkspaces({ cwd });

  // Find dependent workspaces
  const include: string[] = filterByDependencies(workspaces, name).map(info => info.name);
  if (!include.length) {
    debug(`Found no workspace dependencies for "${name}"`);
    return;
  }

  debug(`Running "yarn build" in ${JSON.stringify(include)}`);
  await foreach('yarn build', { cwd, parallel, jobs, topological: true, include });
}

export async function workspace(options: Options = {}) {
  const { cwd = process.cwd(), parallel = true, jobs } = options;
  await foreach('yarn build', { cwd, parallel, jobs, topological: true });
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
