import { encode, Filter, fingerprintDir, fingerprintFile } from '@timhall/fingerprint';
import { createHash } from 'crypto';
import _debug from 'debug';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { pathExists } from 'fs-extra';
import { isMatch } from 'micromatch';
import { join, relative } from 'path';
import { Config } from './config';
import { listWorkspaceDependencies } from './dependencies';

const debug = _debug('yarn-lifeline:fingerprint');

export async function fingerprint(cwd: string, config: Config): Promise<string> {
  const filter = config.source && globsToFilter(config.source, config.base);

  // Fingerprint is generated from project + yarn.lock + workspace dependencies
  const srcFingerprint = await fingerprintDir(cwd, { filter });
  debug('src', srcFingerprint);

  const lockfileFingerprint = await fingerprintLockfile(cwd);
  debug('lockfile', lockfileFingerprint);

  const dependencies = await listWorkspaceDependencies(cwd);
  const dependencyFingerprints = await Promise.all(
    dependencies.map(async dependency => {
      const fingerprint = await fingerprintDir(dependency.path);
      debug(dependency.name, fingerprint);

      return fingerprint;
    })
  );

  // Compute combined fingerprint from all fingerprints
  const fingerprint = mergeFingerprints([
    srcFingerprint,
    lockfileFingerprint,
    ...dependencyFingerprints
  ]);
  debug('fingerprint', cwd, fingerprint);

  return fingerprint;
}

async function fingerprintLockfile(cwd: string): Promise<string> {
  const root = await findWorkspaceRoot(cwd);
  if (!root) return '';

  const lockfile = join(root, 'yarn.lock');
  if (!(await pathExists(lockfile))) return '';

  const fingerprint = await fingerprintFile(lockfile);

  return fingerprint;
}

function mergeFingerprints(fingerprints: string[]): string {
  const algorithm = 'sha1';
  const encoding = 'base64';

  const hash = createHash(algorithm);
  for (const fingerprint of fingerprints) {
    hash.update(fingerprint);
  }

  return encode(hash.digest(), algorithm, encoding);
}

function globsToFilter(patterns: string[], base: string): Filter {
  return (absolutePath: string) => {
    const relativePath = relative(absolutePath, base);
    return isMatch(relativePath, patterns);
  };
}
