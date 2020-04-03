import _debug from 'debug';
import { copy, pathExists, readdir, remove, Stats, statSync } from 'fs-extra';
import { join } from 'path';
import { Config } from './config';

const debug = _debug('yarn-lifeline:cache');

export async function add(fingerprint: string, config: Config) {
  if (!(await pathExists(config.output))) {
    throw new Error(`[yarn-lifeline] Expected output directory "${config.output}" not found`);
  }

  const cacheDir = join(config.cache, fingerprint);

  debug(`[add] ${config.output} to ${cacheDir}`);
  await copy(config.output, cacheDir, { overwrite: true });
}

interface Info {
  fingerprint: string;
  path: string;
  stats: Stats;
}

interface List {
  [fingerprint: string]: Info;
}

export async function list(config: Config): Promise<List> {
  if (!(await pathExists(config.cache))) {
    debug(`[list] Nothing cached at ${config.cache}`);
    return {};
  }

  const values: Info[] = (await readdir(config.cache))
    .map(name => {
      const path = join(config.cache, name);
      return {
        fingerprint: name,
        path,
        stats: statSync(path)
      };
    })
    .filter(info => info.stats.isDirectory());

  const list: List = {};
  for (const info of values) {
    list[info.fingerprint] = info;
  }

  return list;
}

export async function show(fingerprint: string, config: Config): Promise<string | undefined> {
  const values = await list(config);
  return values[fingerprint]?.path;
}

export async function clear(config: Config) {
  debug(`[clear] ${config.cache}`);
  await remove(config.cache);
}

export async function evictOutdated(config: Config, keep: number = 3) {
  const all = Object.values(await list(config)).sort(byAgeAscending);
  if (keep > all.length) return;

  const evict = all.slice(all.length - keep + 1);
  await Promise.all(evict.map(info => remove(info.path)));
}

function byAgeAscending(a: Info, b: Info): -1 | 0 | 1 {
  const aAge = a.stats.mtimeMs;
  const bAge = b.stats.mtimeMs;

  if (aAge < bAge) {
    return 1;
  } else if (aAge > bAge) {
    return -1;
  } else {
    return 0;
  }
}
