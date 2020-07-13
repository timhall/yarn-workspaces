import { Stats } from 'fs';
import { join } from 'path';
import { Filter } from './filter';
import { lstat, readdir } from './fs';

export interface PathProperties {
  path: string;
  stats: Stats;
}

export interface WalkOptions {
  filter?: Filter;
}

export async function* walkDir(
  dir: string,
  options: WalkOptions = {}
): AsyncGenerator<PathProperties> {
  const { filter } = options;
  const paths = (await readdir(dir)).sort(ascending).map(relativePath => join(dir, relativePath));

  for (const path of paths) {
    if (filter && !filter(path)) continue;

    const stats = await lstat(path);
    yield { path, stats };
  }
}

function ascending(a: any, b: any): -1 | 0 | 1 {
  if (a < b) {
    return -1;
  } else if (b > a) {
    return 1;
  } else {
    return 0;
  }
}
