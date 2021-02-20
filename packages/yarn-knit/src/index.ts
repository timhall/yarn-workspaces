import _debug from 'debug';
import { foreach } from 'yarn-workspaces-foreach';
import { listWorkspaces, loadWorkspace } from 'yarn-workspaces-list';

const debug = _debug('yarn-knit');

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
  if (process.env.YARN_KNIT_ACTIVE) {
    return;
  } else {
    process.env.YARN_KNIT_ACTIVE = '1';
  }

  // Load workspace
  const workspace = await loadWorkspace(cwd);

  // Find dependent workspaces
  const include = workspace.workspaceDependencies.concat(workspace.transitiveWorkspaceDependencies);
  if (!include.length) {
    debug(`Found no workspace dependencies for "${cwd}"`);
    return;
  }

  debug(`Running "yarn build" in ${JSON.stringify(include)}`);
  try {
    await foreach('yarn build', { cwd, parallel, jobs, topological: true, include });
  } catch (error) {
    throw error;
  } finally {
    delete process.env.YARN_KNIT_ACTIVE;
  }
}

export async function workspace(options: Options = {}) {
  const { cwd = process.cwd(), parallel = true, jobs } = options;

  if (process.env.YARN_KNIT_ACTIVE) {
    return;
  } else {
    process.env.YARN_KNIT_ACTIVE = '1';
  }

  // For `knit workspace` build all workspace packages that are dependencies
  // of any other workspace packages
  //
  // Find dependencies for each workspace package, combine, and unique
  const workspaces = await listWorkspaces({ cwd });
  const include = workspaces
    .map((workspace) =>
      workspace.workspaceDependencies.concat(workspace.transitiveWorkspaceDependencies)
    )
    .flat()
    .filter(unique());

  if (!include.length) {
    debug(`Found no workspace dependencies`);
    return;
  }

  debug(`Running "yarn build" in ${JSON.stringify(include)}`);
  try {
    await foreach('yarn build', { cwd, parallel, jobs, topological: true, include });
  } catch (error) {
    throw error;
  } finally {
    delete process.env.YARN_KNIT_ACTIVE;
  }
}

function unique(): (value: unknown) => boolean {
  const seen = new Set();

  return (value: unknown) => {
    if (seen.has(value)) return false;

    seen.add(value);
    return true;
  };
}
