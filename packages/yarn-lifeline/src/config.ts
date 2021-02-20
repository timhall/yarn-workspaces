import { cosmiconfig } from 'cosmiconfig';
import _debug from 'debug';
import findCacheDir from 'find-cache-dir';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { dirname, join, resolve } from 'path';
import { ok } from 'assert';
import { IRemoteCache } from './cache';

const debug = _debug('yarn-lifeline:config');

export interface Config {
  base: string;
  cache: string;
  source?: string[];
  output: string[];
  dependencies: boolean;
  remote?: IRemoteCache | null;
}

const explorer = cosmiconfig('yarn-lifeline');
const DEFAULT_OUTPUT = 'dist';

export async function loadConfig(cwd = process.cwd()): Promise<Config> {
  // First, look for config at package level
  const maybePackageConfig = await explorer.search(cwd);
  debug(
    `[package] (${cwd}) ${
      maybePackageConfig ? JSON.stringify(maybePackageConfig.config) : 'Not Found'
    } `
  );

  // Next, look for config at root
  const workspaceRootPath = findWorkspaceRoot(cwd);
  const maybeRootConfig = workspaceRootPath ? await explorer.search(workspaceRootPath) : null;
  debug(
    `[workspace] (${workspaceRootPath}) ${
      maybeRootConfig ? JSON.stringify(maybeRootConfig.config) : 'Not Found'
    }`
  );

  const base = maybePackageConfig ? dirname(maybePackageConfig.filepath) : cwd;
  const source = maybePackageConfig?.config.source;
  const output = maybePackageConfig?.config.output
    ? toArray(maybePackageConfig.config.output).map((path) => resolve(base, path))
    : [join(cwd, DEFAULT_OUTPUT)];

  const cacheCwd = workspaceRootPath || cwd;
  const cache =
    (maybePackageConfig?.config.cache && resolve(base, maybePackageConfig.config.cache)) ||
    (maybeRootConfig?.config.cache &&
      resolve(maybeRootConfig.filepath, maybeRootConfig.config.cache)) ||
    findCacheDir({ name: 'lifeline', cwd: cacheCwd }) ||
    join(cacheCwd, '.cache', 'lifeline');

  const dependencies =
    maybePackageConfig?.config.dependencies ?? maybeRootConfig?.config.dependencies ?? false;

  const maybeRemote = maybePackageConfig?.config.remove || maybeRootConfig?.config.remote;
  const remote =
    typeof maybeRemote === 'string' ? tryRequireRemote(maybeRemote) : maybeRemote || null;

  ok(
    !remote ||
      (typeof remote.has === 'function' &&
        typeof remote.download === 'function' &&
        typeof remote.upload === 'function'),
    `Invalid remote cache, "has", "download", and "upload" methods are required.`
  );

  const config = { base, cache, source, output, dependencies, remote };

  debug(`Loaded ${JSON.stringify(config)}`);

  return config;
}

function toArray<TValue>(value: TValue | TValue[] | null | undefined): TValue[] {
  return Array.isArray(value) ? value : value != null ? [value] : [];
}

function tryRequireRemote<IRemoteCache>(id: string): IRemoteCache | null {
  try {
    const RemoteCache = require(id);
    return new RemoteCache();
  } catch (error) {
    console.log(`[yarn-lifeline] Failed to load remote cache "${id}"`, error);
    return null;
  }
}
