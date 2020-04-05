import _debug from 'debug';
import execa from 'execa';
import { copy } from 'fs-extra';
import { add as cacheAdd, show as cacheShow } from './cache';
import { Config } from './config';
import { fingerprint as fingerprintDir } from './fingerprint';

const debug = _debug('yarn-lifeline:run');

export interface Options {
  cwd?: string;
  shell?: string | boolean;
}

export async function run(command: string, config: Config, options: Options = {}) {
  const { cwd = process.cwd(), shell = true } = options;

  // 1. Check current fingerprint
  const fingerprint = await fingerprintDir(cwd, config);
  debug(`Fingerprint: ${fingerprint}`);

  // 2. Check for fingerprint in cache
  const maybeCachedDir = await cacheShow(fingerprint, config);

  // 3. Restore from cache to output
  if (maybeCachedDir && !process.env.LIFELINE_DISABLE_CACHE) {
    debug(`Restoring from cache ${maybeCachedDir}`);
    await copy(maybeCachedDir, config.output, { overwrite: true });
    return;
  }

  // 4. Run command
  debug(`Running ${command}`);
  const subprocess = execa.command(command, { cwd, shell, preferLocal: true });
  subprocess.stdout?.pipe(process.stdout);
  subprocess.stderr?.pipe(process.stderr);

  const { exitCode } = await subprocess;
  if (exitCode !== 0) {
    debug(`Command exited with ${exitCode}`);
    process.exit(exitCode);
  }

  // 5. Cache output
  await cacheAdd(fingerprint, config);
}
