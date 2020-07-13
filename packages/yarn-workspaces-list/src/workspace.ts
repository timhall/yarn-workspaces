export type Name = string;
export type AbsolutePath = string;
export type RelativePath = string;

export interface Workspace {
  name: Name;
  path: AbsolutePath;
  location: RelativePath;
  workspaceDependencies: Name[];
  mismatchedWorkspaceDependencies: Name[];
  transitiveWorkspaceDependencies: Name[];
}
