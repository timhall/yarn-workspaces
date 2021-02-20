import _debug from 'debug';
import execa from 'execa';
import { Cache } from './cache';
import { CommandOutput, CommandResult } from './command';
import { Config } from './config';
import { fingerprint as fingerprintDir } from './fingerprint';

const debug = _debug('yarn-lifeline:run');

export interface Options {
  cwd?: string;
  shell?: string | boolean;
}

export async function runWithCache(
  command: string,
  config: Config,
  options: Options = {}
): Promise<void> {
  const { cwd = process.cwd() } = options;

  const cache = new Cache(config);

  // Calculate current fingerprint
  const fingerprint = await fingerprintDir(cwd, config);
  debug(`fingerprint: ${fingerprint}`);

  if (await cache.has(fingerprint)) {
    // Attempt to restore if cached
    try {
      debug(`restoring from cache`);
      await cache.restore(fingerprint, cwd);

      return;
    } catch (error) {
      // (ignore error)
      console.log(`[yarn-lifeline] Failed to restore from cache`, error);
    }
  }

  // Run command and cache
  const result = await run(command, options);
  await cache.add(cwd, result, fingerprint);
}

export async function run(command: string, options: Options = {}): Promise<CommandResult> {
  const { cwd = process.cwd(), shell = true } = options;

  const subprocess = execa.command(command, { cwd, shell, preferLocal: true });

  const output: CommandOutput[] = [];
  subprocess.stdout?.on('data', (chunk) => {
    process.stdout.push(chunk);

    const value = Buffer.from(chunk).toString('utf8');
    output.push({ source: 'stdout', value });
  });
  subprocess.stderr?.on('data', (chunk) => {
    process.stderr.push(chunk);

    const value = Buffer.from(chunk).toString('utf8');
    output.push({ source: 'stderr', value });
  });

  const { exitCode } = await subprocess;
  if (exitCode !== 0) {
    process.exit(exitCode);
  }

  return { output };
}
