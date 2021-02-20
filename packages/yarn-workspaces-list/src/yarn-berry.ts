import execa from 'execa';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { join } from 'path';
import { loadTransitiveDependencies } from './dependencies';
import { Name, RelativePath, Workspace } from './workspace';

interface CliOptions {
  cwd?: string;
}

interface ListInfo {
  name: string;
  location: RelativePath;
  workspaceDependencies: RelativePath[];
  mismatchedWorkspaceDependencies: RelativePath[];
}

const NEWLINE = /\r|\n/;

export async function isBerry(options: CliOptions = {}): Promise<boolean> {
  const { cwd = process.cwd() } = options;
  const { stdout } = await execa('yarn', ['--version'], { cwd });

  return /2\./.test(stdout);
}

export async function list(options: CliOptions = {}): Promise<Workspace[]> {
  const { cwd = process.cwd() } = options;

  const workspaceRootPath = findWorkspaceRoot(cwd);
  if (!workspaceRootPath) {
    throw new Error(`Could not find workspace root for ${cwd}`);
  }

  const { stdout } = await execa('yarn', ['workspaces', 'list', '--verbose', '--json'], { cwd });
  const list = stdout
    .split(NEWLINE)
    .map(trim)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as ListInfo);

  const byLocation: Record<RelativePath, Name> = {};
  for (const info of list) {
    byLocation[info.location] = info.name;
  }
  const locationToName = (location: RelativePath) => byLocation[location];

  const workspaces: Workspace[] = list.map((info) => ({
    name: info.name,
    location: info.location,
    path: join(workspaceRootPath, info.location),
    workspaceDependencies: info.workspaceDependencies.map(locationToName),
    mismatchedWorkspaceDependencies: info.mismatchedWorkspaceDependencies.map(locationToName),
    transitiveWorkspaceDependencies: [],
  }));

  loadTransitiveDependencies(workspaces);

  return workspaces;
}

function trim(value: string): string {
  return value.trim();
}
