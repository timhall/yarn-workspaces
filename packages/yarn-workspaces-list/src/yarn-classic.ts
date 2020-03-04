import { exec as _exec } from 'child_process';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { readFile as _readFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { PackageInfo } from './package-info';

interface CliOptions {
  cwd?: string;
}

const exec = promisify(_exec);
const readFile = promisify(_readFile);

export async function isClassic(options: CliOptions = {}): Promise<boolean> {
  const { cwd = process.cwd() } = options;
  const { stdout } = await exec(`yarn --version`, { cwd });

  return /1\./.test(stdout);
}

interface JsonLine {
  type: 'log' | 'verbose';
  data: string;
}

interface Info {
  [name: string]: {
    location: string;
    workspaceDependencies: string[];
    mismatchedWorkspaceDependencies: string[];
  };
}

export async function info(options: CliOptions = {}): Promise<PackageInfo[]> {
  const { cwd = process.cwd() } = options;
  const { stdout } = await exec(`yarn --json workspaces info`, { cwd });

  const lines = stdout
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line)) as JsonLine[];
  const byName = JSON.parse(lines[lines.length - 1].data) as Info;
  const nameToLocation = (name: string) => byName[name].location;

  if (!Object.keys(byName).length) {
    return [];
  }

  const packages: PackageInfo[] = [];
  for (const [name, info] of Object.entries(byName)) {
    const { location, workspaceDependencies, mismatchedWorkspaceDependencies } = info;

    packages.push({
      name,
      location,
      workspaceDependencies: workspaceDependencies.map(nameToLocation),
      mismatchedWorkspaceDependencies: mismatchedWorkspaceDependencies.map(nameToLocation)
    });
  }

  // `yarn workspaces list` includes workspace root as first item,
  // find the root package.json from one of the found packages
  const workspaceRootPath = findWorkspaceRoot(cwd);
  if (workspaceRootPath) {
    const workspaceRoot = await readJson(join(workspaceRootPath, 'package.json'));
    const workspaceDependencies = Object.keys(workspaceRoot.dependencies || {})
      .concat(Object.keys(workspaceRoot.devDependencies || {}))
      .filter(name => byName.hasOwnProperty(name))
      .map(nameToLocation);

    // TODO Clarify difference between two types of workspace dependencies
    //
    // From example yarn v2 spike:
    // "a": "*" -> { ... "mismatchedWorkspaceDependencies": ["a@*"] }
    // "a": "workspace:*" -> { ... "workspaceDependencies": ["packages/a"] }
    const mismatchedWorkspaceDependencies: string[] = [];

    packages.unshift({
      name: workspaceRoot.name,
      location: '.',
      workspaceDependencies,
      mismatchedWorkspaceDependencies
    });
  }

  return packages;
}

async function readJson<TValue = any>(path: string): Promise<TValue> {
  const data = await readFile(path, 'utf8');
  return JSON.parse(data);
}
