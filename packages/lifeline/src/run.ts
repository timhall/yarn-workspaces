import { add as cacheAdd, show as cacheShow } from './cache';
import { Config } from './config';
import { fingerprint as fingerprintDir } from './fingerprint';

export interface Options {
  cwd?: string;
}

export async function run(command: string[], config: Config, options: Options = {}) {
  const { cwd = process.cwd() } = options;

  // 1. Check current fingerprint
  const fingerprint = await fingerprintDir(cwd, config);

  // 2. Check for fingerprint in cache
  const maybeCachedDir = await cacheShow(fingerprint, config);

  // 3. Restore from cache to output
  if (maybeCachedDir) {
    await move(maybeCachedDir, config.output);
    return;
  }

  // 4. Run command
  // TODO

  // 5. Cache output
  // TODO
  await cacheAdd(fingerprint, config);
}

async function move(source: string, target: string) {
  // TODO
}
