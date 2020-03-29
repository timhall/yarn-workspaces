import * as assert from 'assert';
import execa, { ExecaChildProcess } from 'execa';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { cpus } from 'os';
import pLimit from 'p-limit';
import { join } from 'path';
import { Transform } from 'stream';
import { listWorkspaces, phasedSort, topologicallySort } from 'yarn-workspaces-list';

interface ForeachOptions {
  cwd?: string;
  parallel?: boolean;
  jobs?: number;
  topological?: boolean;
  include?: string[];
  exclude?: string[];
}

interface ForeachResult {
  exitCode: 0 | 1;
  // TODO stdout: string | Buffer;
  // TODO stderr: string | Buffer;
}

export async function foreach(
  command: string,
  options: ForeachOptions = {}
): Promise<ForeachResult> {
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
  let nonZeroExitCode = false;

  for (const phase of phases) {
    await Promise.all(
      phase.map(async pkg => {
        const location = join(root!, pkg.location);
        return limit(async () => {
          // TODO if command = 'run <script>'
          // check for script in "scripts" and run if defined

          const subprocess = runCommand(location, command);

          // TODO interleaved option that buffers stdout/stderr until finished
          subprocess.stdout?.pipe(prefixStream(pkg.name)).pipe(process.stdout);
          subprocess.stderr?.pipe(prefixStream(pkg.name)).pipe(process.stderr);

          const { exitCode } = await subprocess;
          if (exitCode !== 0) nonZeroExitCode = true;
        });
      })
    );
  }

  return { exitCode: nonZeroExitCode ? 1 : 0 };
}

function runCommand(location: string, command: string): ExecaChildProcess {
  return execa.command(command, { cwd: location, preferLocal: true });
}

function prefixStream(name: string): Transform {
  const prefix = Buffer.from(`[${name}] `);

  return new Transform({
    transform(chunk, encoding, callback) {
      const value = Buffer.from(chunk, encoding as BufferEncoding);
      callback(null, Buffer.concat([prefix, value]));
    }
  });
}
