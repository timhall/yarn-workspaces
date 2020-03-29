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

  // Skip knitting while knitting
  //
  // e.g. knit workspace -> knit dependencies in each dependency
  // not necessary since top-level knit is assumed to take care of everything
  if (process.env.KNIT_ACTIVE) {
    return;
  } else {
    process.env.KNIT_ACTIVE = 'yes';
  }

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
  try {
    await foreach('yarn build', { cwd, parallel, jobs, topological: true, include });
  } catch (error) {
    throw error;
  } finally {
    delete process.env.KNIT_ACTIVE;
  }
}

export async function workspace(options: Options = {}) {
  const { cwd = process.cwd(), parallel = true, jobs } = options;

  if (process.env.KNIT_ACTIVE) {
    return;
  } else {
    process.env.KNIT_ACTIVE = 'yes';
  }

  try {
    await foreach('yarn build', { cwd, parallel, jobs, topological: true });
  } catch (error) {
    throw error;
  } finally {
    delete process.env.KNIT_ACTIVE;
  }
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
