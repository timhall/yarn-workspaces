import toposort from 'toposort';
import { PackageInfo } from './package-info';

export function topologicallySort(list: PackageInfo[]): PackageInfo[] {
  const byLocation: { [location: string]: PackageInfo } = {};
  const graph: Array<[string, string]> = [];

  for (const pkg of list) {
    byLocation[pkg.location] = pkg;

    for (const dependency of pkg.workspaceDependencies) {
      graph.push([dependency, pkg.location]);
    }
  }

  const sorted = toposort(graph);
  const orphans = list.filter(pkg => !sorted.includes(pkg.location));
  const sortedPkgs = orphans.concat(sorted.map(location => byLocation[location]));

  return sortedPkgs;
}

export type Phase = PackageInfo[];

export function phasedSort(list: PackageInfo[]): Phase[] {
  const sorted = topologicallySort(list);

  const phases: Phase[] = [[]];
  let currentPhaseIndex = 0;
  for (const pkg of sorted) {
    const currentPhase = phases[currentPhaseIndex];
    const hasDependency = currentPhase.some(phasePkg =>
      pkg.workspaceDependencies.includes(phasePkg.location)
    );

    if (!hasDependency) {
      currentPhase.push(pkg);
    } else {
      phases.push([pkg]);
      currentPhaseIndex = phases.length - 1;
    }
  }

  return phases;
}
