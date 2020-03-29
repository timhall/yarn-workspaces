import { cosmiconfig } from 'cosmiconfig';
import findCacheDir from 'find-cache-dir';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { dirname, join } from 'path';

export interface Config {
  name: string;
  base: string;
  cache: string;
  source?: string[];
  output: string;
}

const explorer = cosmiconfig('lifeline');
const DEFAULT_OUTPUT = 'dist';

export async function loadConfig(cwd = process.cwd()): Promise<Config> {
  let name;
  try {
    ({ name } = require('./package.json'));
  } catch (error) {
    throw new Error(`Expected package.json in given directory "${cwd}"`);
  }

  // First, look for config at package level
  const maybePackageConfig = await explorer.search(cwd);
  if (
    maybePackageConfig &&
    maybePackageConfig?.config.cacheDir &&
    maybePackageConfig?.config.outDir
  ) {
    return maybePackageConfig.config;
  }

  // Next, look for config at root
  const workspaceRootPath = findWorkspaceRoot(cwd);
  const maybeRootConfig = workspaceRootPath && (await explorer.search(workspaceRootPath))?.config;

  const cacheCwd = workspaceRootPath || cwd;
  const cache =
    maybePackageConfig?.config.cache ||
    maybeRootConfig?.cache ||
    findCacheDir({ name: 'lifeline', cwd: cacheCwd }) ||
    join(cacheCwd, '.cache');

  const base = maybePackageConfig ? dirname(maybePackageConfig.filepath) : cwd;
  const source = maybePackageConfig?.config.source;
  const output = maybePackageConfig?.config.output || join(cwd, DEFAULT_OUTPUT);

  return { name, base, cache, source, output };
}
