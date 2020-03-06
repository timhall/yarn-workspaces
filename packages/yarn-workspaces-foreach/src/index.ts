import findWorkspaceRoot from 'find-yarn-workspace-root';
import { cpus } from 'os';
import { listWorkspaces } from 'yarn-workspaces-list';

interface ForeachOptions {
  cwd?: string;
  parallel?: boolean;
  jobs?: number;
  topological?: boolean;
  include?: string[];
  exclude?: string[];
}

export async function foreach(options: ForeachOptions = {}): Promise<void> {
  const {
    cwd = process.cwd(),
    parallel = false,
    jobs = Math.max(1, cpus().length / 2),
    topological = false,
    include = [],
    exclude = []
  } = options;

  const list = await listWorkspaces({ cwd });
  const root = findWorkspaceRoot(cwd);

  // TODO
}
