import * as assert from 'assert';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { cpus } from 'os';
import pLimit from 'p-limit';
import { join } from 'path';
import { listWorkspaces, phasedSort, topologicallySort } from 'yarn-workspaces-list';

interface ForeachOptions {
  cwd?: string;
  parallel?: boolean;
  jobs?: number;
  topological?: boolean;
  include?: string[];
  exclude?: string[];
}

export async function foreach(command: string, options: ForeachOptions = {}): Promise<void> {
  const {
    cwd = process.cwd(),
    parallel = false,
    jobs = Math.max(1, cpus().length / 2),
    topological = false,
    include = [],
    exclude = []
  } = options;

  assert.ok(!parallel || jobs > 1, 'parallel jobs must be greater than 1');

  const list = await listWorkspaces({ cwd });
  const root = findWorkspaceRoot(cwd);

  assert.ok(root, `could not find root workspace for cwd "${cwd}"`);

  // Exclude root package from run and handle include/exclude filters
  const packages = list.filter(info => {
    const rootWorkspace = info.location === '.';
    const included = !include.length || include.includes(info.name);
    const excluded = exclude.length && exclude.includes(info.name);

    return !rootWorkspace && included && !excluded;
  });

  // parallel + topological requires phases so that all dependencies
  // are correctly handled before dependents
  //
  // for all other cases treat sorted values as single phase for consistency
  const phases =
    parallel && topological
      ? phasedSort(packages)
      : topological
      ? [topologicallySort(packages)]
      : [packages];

  const concurrency = parallel ? jobs : 1;
  const limit = pLimit(concurrency);

  for (const phase of phases) {
    await Promise.all(
      phase.map(async pkg => {
        const location = join(root!, pkg.location);
        return limit(() => runCommand(location, command));
      })
    );
  }
}

async function runCommand(location: string, command: string): Promise<void> {
  // TODO
  console.log('run', location, command);

  await new Promise(resolve => setTimeout(resolve, 1000));
}
