import { Name, Workspace } from './workspace';

type WorkspacesByName = Record<Name, Workspace>;

export function loadTransitiveDependencies(workspaces: Workspace[]) {
  const workspacesByName: WorkspacesByName = {};
  for (const workspace of workspaces) {
    workspacesByName[workspace.name] = workspace;
  }

  for (const workspace of workspaces) {
    const transitiveWorkspaceDependencies = findDependencies(
      workspacesByName,
      workspace.name
    ).filter((dependency) => !workspace.workspaceDependencies.includes(dependency));

    workspace.transitiveWorkspaceDependencies = transitiveWorkspaceDependencies;
  }
}

function findDependencies(byName: WorkspacesByName, name: string): Name[] {
  const workspace = byName[name];
  if (!workspace) {
    throw new Error(`Unable to find package "${name}" for project`);
  }

  const dependencies = workspace.workspaceDependencies
    .map((dependency) => {
      return [dependency, ...findDependencies(byName, dependency)];
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
