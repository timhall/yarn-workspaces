import _debug from 'debug';
import { copy, pathExists, readdir, remove, statSync } from 'fs-extra';
import { basename, join } from 'path';
import { Config } from './config';

const debug = _debug('lifeline:cache');

export async function add(fingerprint: string, config: Config) {
  if (!(await pathExists(config.output))) {
    throw new Error(`[lifeline] Expected output directory "${config.output}" not found`);
  }

  const cacheDir = join(config.cache, fingerprint);

  debug(`[add] ${config.output} to ${cacheDir}`);
  await copy(config.output, cacheDir, { overwrite: true });
}

interface List {
  [fingerprint: string]: string;
}

export async function list(config: Config): Promise<List> {
  if (!(await pathExists(config.cache))) {
    debug(`[list] Nothing cached at ${config.cache}`);
    return {};
  }

  const directories = (await readdir(config.cache))
    .map(name => join(config.cache, name))
    .filter(path => statSync(path).isDirectory());

  const list: List = {};
  for (const dir of directories) {
    const fingerprint = basename(dir);
    list[fingerprint] = dir;
  }

  return list;
}

export async function show(fingerprint: string, config: Config): Promise<string | undefined> {
  const values = await list(config);
  return values[fingerprint];
}

export async function clear(config: Config) {
  debug(`[clear] ${config.cache}`);
  await remove(config.cache);
}
