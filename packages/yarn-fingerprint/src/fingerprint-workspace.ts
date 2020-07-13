import { createHash } from 'crypto';
import _debug from 'debug';
import findWorkspaceRoot from 'find-yarn-workspace-root';
import { join } from 'path';
import { listWorkspacesByName, loadWorkspace } from 'yarn-workspaces-list';
import { encode } from './encode';
import { fingerprintDir, fingerprintFile, Options } from './fingerprint';
import { pathExists } from './fs';

const debug = _debug('yarn-fingerprint');

export async function fingerprintWorkspace(dir: string, options: Options = {}): Promise<string> {
  const { algorithm, encoding } = options;

  // Fingerprint = workspace + yarn.lock + dependent workspaces
  const workspaceFingerprint = await fingerprintDir(dir, options);
  debug('workspace', workspaceFingerprint);

  // Filter likely only applies to workspace,
  // ignore filter for lockfile and dependencies
  const lockfileFingerprint = await fingerprintLockfile(dir, { algorithm, encoding });
  debug('lockfile', lockfileFingerprint);

  const workspace = await loadWorkspace(dir);
  const workspaces = await listWorkspacesByName({ cwd: dir });
  const dependencies = workspace.workspaceDependencies
    .concat(workspace.transitiveWorkspaceDependencies)
    .map((name) => workspaces[name]);

  const dependencyFingerprints = await Promise.all(
    dependencies.map(async (dependency) => {
      const fingerprint = await fingerprintDir(dependency.path, { algorithm, encoding });
      debug(dependency.name, fingerprint);

      return fingerprint;
    })
  );

  // Compute combined fingerprint from all fingerprints
  const fingerprint = mergeFingerprints(
    [workspaceFingerprint, lockfileFingerprint, ...dependencyFingerprints],
    { algorithm, encoding }
  );
  debug('fingerprint', dir, fingerprint);

  return fingerprint;
}

async function fingerprintLockfile(dir: string, options: Options): Promise<string> {
  const root = await findWorkspaceRoot(dir);
  if (!root) return '';

  const lockfile = join(root, 'yarn.lock');
  if (!(await pathExists(lockfile))) return '';

  const fingerprint = await fingerprintFile(lockfile, options);

  return fingerprint;
}

function mergeFingerprints(fingerprints: string[], options: Options = {}): string {
  const { algorithm = 'sha1', encoding = 'base64' } = options;

  const hash = createHash(algorithm);
  for (const fingerprint of fingerprints) {
    hash.update(fingerprint);
  }

  return encode(hash.digest(), algorithm, encoding);
}
