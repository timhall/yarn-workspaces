import execa from 'execa';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { join } from 'path';
import { loadTransitiveDependencies } from './dependencies';
import { readJson } from './utils/fs';
import { RelativePath, Workspace } from './workspace';

interface CliOptions {
  cwd?: string;
}

export async function isClassic(options: CliOptions = {}): Promise<boolean> {
  const { cwd = process.cwd() } = options;
  const { stdout } = await execa('yarn', ['--version'], { cwd });

  return /1\./.test(stdout);
}

interface JsonLine {
  type: 'log' | 'verbose';
  data: string;
}

interface Info {
  [name: string]: {
    location: RelativePath;
    workspaceDependencies: string[];
    mismatchedWorkspaceDependencies: string[];
  };
}

export async function info(options: CliOptions = {}): Promise<Workspace[]> {
  const { cwd = process.cwd() } = options;
  const { stdout } = await execa('yarn', ['--json', 'workspaces', 'info'], { cwd });

  const lines = stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as JsonLine);
  const byName = JSON.parse(lines[lines.length - 1].data) as Info;

  // `yarn workspaces list` includes workspace root as first item,
  // find the root package.json from one of the found packages
  const workspaceRootPath = findWorkspaceRoot(cwd);
  if (!workspaceRootPath) {
    throw new Error(`Could not find workspace root for ${cwd}`);
  }

  const workspaceRoot = await readJson(join(workspaceRootPath, 'package.json'));
  const workspaceDependencies = Object.keys(workspaceRoot.dependencies || {})
    .concat(Object.keys(workspaceRoot.devDependencies || {}))
    .filter((name) => byName.hasOwnProperty(name));

  // TODO Clarify difference between two types of workspace dependencies
  //
  // From example yarn v2 spike:
  // "a": "*" -> { ... "mismatchedWorkspaceDependencies": ["a@*"] }
  // "a": "workspace:*" -> { ... "workspaceDependencies": ["packages/a"] }
  const mismatchedWorkspaceDependencies: string[] = [];

  const workspaces: Workspace[] = [
    {
      name: workspaceRoot.name,
      path: workspaceRootPath,
      location: '.',
      workspaceDependencies,
      mismatchedWorkspaceDependencies,
      transitiveWorkspaceDependencies: [],
    },
  ];

  for (const [name, info] of Object.entries(byName)) {
    const { location, workspaceDependencies, mismatchedWorkspaceDependencies } = info;

    workspaces.push({
      name,
      path: join(workspaceRootPath, location),
      location,
      workspaceDependencies: workspaceDependencies,
      mismatchedWorkspaceDependencies: mismatchedWorkspaceDependencies,
      transitiveWorkspaceDependencies: [],
    });
  }

  loadTransitiveDependencies(workspaces);

  return workspaces;
}
