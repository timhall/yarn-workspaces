import { listWorkspacesByName, loadWorkspace, Workspace } from 'yarn-workspaces-list';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import execa from 'execa';
import { join } from 'path';

interface ChangedOptions {
  includeDependencies?: boolean;
  cwd?: string;
}

const NEWLINE = /\r|\n/;
const YARN_LOCK = /yarn\.lock$/;

export async function findWorkspaceChanges(
  reference: string = 'HEAD',
  options: ChangedOptions = {}
): Promise<string[]> {
  const { cwd = process.cwd(), includeDependencies = false } = options;
  const rootDir = findWorkspaceRoot(cwd);

  if (rootDir === null) {
    throw new Error('Could not find yarn workspace root from current directory');
  }

  // Find any changes compared to reference
  const { stdout: rawDiff } = await execa('git', ['diff', '--name-only', reference], {
    cwd: rootDir,
  });
  const diff = rawDiff.split(NEWLINE).map(trim).filter(Boolean);

  // Find untracked changes
  const { stdout: rawUntracked } = await execa(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    {
      cwd: rootDir,
    }
  );
  const untracked = rawUntracked.split(NEWLINE).map(trim).filter(Boolean);

  const files = [...diff, ...untracked].map((relative) => join(rootDir, relative));

  // Find changed files for workspace
  const workspace = await loadWorkspace(cwd);
  const changed = files.filter(isRelevantChange(workspace));

  let changedDependencies: string[] = [];
  if (includeDependencies) {
    // Find all workspace and transient dependencies
    const workspaces = await listWorkspacesByName({ cwd });
    const dependentWorkspaces = [
      ...workspace.workspaceDependencies.map((id) => workspaces[id]),
      ...workspace.transitiveWorkspaceDependencies.map((id) => workspaces[id]),
    ];

    // Find all changed files for dependencies
    changedDependencies = dependentWorkspaces.flatMap((workspace) =>
      files.filter(isRelevantChange(workspace))
    );
  }

  return [...changed, ...changedDependencies].filter(unique()).sort();
}

function isRelevantChange(workspace: Workspace): (path: string) => boolean {
  return (path: string) => YARN_LOCK.test(path) || path.startsWith(workspace.path);
}

function unique() {
  const seen = new Set();

  return (value: unknown) => {
    if (seen.has(value)) return false;

    seen.add(value);
    return true;
  };
}

function trim(value: string): string {
  return value.trim();
}
