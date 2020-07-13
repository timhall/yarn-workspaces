import findUp from 'find-up';
import createIgnore from 'ignore';
import { dirname, relative } from 'path';
import { readFile } from './fs';

export type Filter = (absolutePath: string) => boolean;

export const passthrough = () => true;

const RELATIVE_UP = /\.\./;

export async function createGitignoreFilter(dir: string): Promise<Filter> {
  const gitignores = await findGitignores(dir);

  // Convert .gitignore to filters
  const filters: Filter[] = [];
  for (const gitignorePath of gitignores) {
    filters.push(await gitignoreToFilter(gitignorePath));
  }

  return combineFilters(...filters);
}

export async function findGitignores(dir: string): Promise<string[]> {
  // Find .git directory as root for project
  const git = await findUp('.git', { cwd: dir, type: 'directory' });
  if (!git) return [];

  // Find all .gitignore from dir to root
  const root = dirname(git);
  const gitignores: string[] = [];
  let searchDir = dir;

  while (isSubDirectory(root, searchDir)) {
    const gitignore = await findUp('.gitignore', { cwd: searchDir });
    if (!gitignore) break;

    // Keep looking from parent folder of .gitignore
    searchDir = dirname(dirname(gitignore));
    gitignores.push(gitignore);
  }

  return gitignores;
}

export async function gitignoreToFilter(gitignorePath: string): Promise<Filter> {
  const dir = dirname(gitignorePath);
  const gitignore = await readFile(gitignorePath, 'utf8');
  const filter = createIgnore()
    .add(gitignore)
    .createFilter();

  // Resolve absolute paths to gitignore directory for relative filter
  return (absolutePath: string) => {
    const relativePath = relative(dir, absolutePath);
    return filter(relativePath);
  };
}

export function combineFilters(...allFilters: Array<Filter | undefined>): Filter {
  const filters = allFilters.filter(Boolean) as Filter[];

  return (path: string) => {
    // Return false if any filter returns false
    return !filters.some(filter => !filter(path));
  };
}

export function isSubDirectory(dir: string, subdirectory: string): boolean {
  return !RELATIVE_UP.test(relative(dir, subdirectory));
}
