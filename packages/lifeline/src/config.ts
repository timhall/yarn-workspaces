import { cosmiconfig } from 'cosmiconfig';
import _debug from 'debug';
import findCacheDir from 'find-cache-dir';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { dirname, join, resolve } from 'path';

const debug = _debug('lifeline:config');

export interface Config {
  base: string;
  cache: string;
  source?: string[];
  output: string;
}

const explorer = cosmiconfig('lifeline');
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
    ? resolve(base, maybePackageConfig.config.output)
    : join(cwd, DEFAULT_OUTPUT);

  const cacheCwd = workspaceRootPath || cwd;
  const cache =
    (maybePackageConfig?.config.cache && resolve(base, maybePackageConfig.config.cache)) ||
    (maybeRootConfig?.config.cache &&
      resolve(maybeRootConfig.filepath, maybeRootConfig.config.cache)) ||
    findCacheDir({ name: 'lifeline', cwd: cacheCwd }) ||
    join(cacheCwd, '.cache', 'lifeline');

  const config = { base, cache, source, output };

  debug(`Loaded ${JSON.stringify(config)}`);

  return config;
}
