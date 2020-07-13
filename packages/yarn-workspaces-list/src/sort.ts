import toposort from 'toposort';
import { Name, Workspace } from './workspace';

export function topologicallySort(workspaces: Workspace[]): Workspace[] {
  const byName: Record<Name, Workspace> = {};
  const graph: Array<[Name, Name]> = [];

  for (const workspace of workspaces) {
    byName[workspace.name] = workspace;

    for (const dependency of workspace.workspaceDependencies) {
      graph.push([dependency, workspace.name]);
    }
  }

  const sorted: Name[] = toposort(graph);
  const orphans = workspaces.filter((workspace) => !sorted.includes(workspace.name));
  const sortedWorkspaces = orphans.concat(sorted.map((name) => byName[name]));

  return sortedWorkspaces;
}

export type Phase = Workspace[];

export function phasedSort(list: Workspace[]): Phase[] {
  const sorted = topologicallySort(list);

  const phases: Phase[] = [[]];
  let currentPhaseIndex = 0;
  for (const workspace of sorted) {
    const currentPhase = phases[currentPhaseIndex];
    const hasDependency = currentPhase.some((phaseWorkspace) =>
      workspace.workspaceDependencies.includes(phaseWorkspace.name)
    );

    if (!hasDependency) {
      currentPhase.push(workspace);
    } else {
      phases.push([workspace]);
      currentPhaseIndex = phases.length - 1;
    }
  }

  return phases;
}
