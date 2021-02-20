import _debug from 'debug';
import { Readable, pipeline } from 'stream';
import { promisify } from 'util';
import { createReadStream, createWriteStream } from 'fs';
import { createGunzip, createGzip } from 'zlib';
import { ensureDir, pathExists, readJson, remove, writeJson } from 'fs-extra';
import { join } from 'path';
import { Config } from './config';
import { CommandResult, isCommandResult } from './command';
import { extract, pack } from 'tar-fs';

const pipe = promisify(pipeline);
const debug = _debug('yarn-lifeline:cache');

export interface IRemoteCache {
  has(file: string): Promise<boolean>;
  download(file: string): Promise<AsyncIterable<Buffer>>;
  upload(file: string, data: AsyncIterable<Buffer>): Promise<void>;
}

export class Cache {
  protected baseDir: string;
  protected outputEntries: string[];
  protected cacheDir: string;
  protected remote?: IRemoteCache | null;

  constructor(config: Config) {
    this.baseDir = config.base;
    this.outputEntries = config.output;
    this.cacheDir = config.cache;
    this.remote = config.remote;
  }

  private getPaths(fingerprint: string): { local: string; remote: string } {
    return {
      local: join(this.cacheDir, `${fingerprint}.tar`),
      remote: `${fingerprint}.tar.gz`,
    };
  }

  async has(fingerprint: string): Promise<boolean> {
    const paths = this.getPaths(fingerprint);

    if (await pathExists(paths.local)) return true;
    if (!this.remote) return false;

    return await this.remote.has(paths.remote);
  }

  async restore(fingerprint: string, cwd: string): Promise<void> {
    const paths = this.getPaths(fingerprint);
    const hasFingerprint = await this.has(fingerprint);

    if (!hasFingerprint) {
      throw new Error(
        `Output for fingerprint "${fingerprint}" was not found in the local or remote cache`
      );
    }

    // 1. Download if not cached locally
    const isLocal = await pathExists(paths.local);
    if (!isLocal) {
      const download = Readable.from(await this.remote!.download(paths.remote));
      const unzip = createGunzip();
      const write = createWriteStream(paths.local);

      debug(`[restore] downloading "${paths.remote}" from remote cache`);
      await pipe(download, unzip, write);
    }

    // 2. Remove local output path(s)
    debug(`[restore] removing output entries from "${cwd}"`);
    await Promise.all(
      this.outputEntries.map(async (path) => {
        await remove(join(this.baseDir, path));
      })
    );

    // 3. Extract to cwd
    const untar = extract(cwd);
    const read = createReadStream(paths.local);

    debug(`[restore] extracting from cache to "${cwd}"`);
    await pipe(read, untar);

    // 4. Replay command output from cache
    const resultFile = join(cwd, '.lifeline-result.json');
    const hasResult = await pathExists(resultFile);
    if (hasResult) {
      const result = await readJson(resultFile);

      if (isCommandResult(result)) {
        debug(`[restore] replaying command output`);
        for (const { source, value } of result.output) {
          if (source === 'stderr') {
            process.stderr.push(value);
          } else {
            process.stdout.push(value);
          }
        }
      }

      await remove(resultFile);
    }
  }

  async add(cwd: string, result: CommandResult, fingerprint: string): Promise<void> {
    const paths = this.getPaths(fingerprint);

    // Prepare cache directory and remove existing
    if (await pathExists(paths.local)) {
      await remove(paths.local);
    }
    await ensureDir(this.cacheDir);

    debug(`[add] writing command result to "${cwd}"`);
    const resultFile = join(cwd, '.lifeline-result.json');
    await writeJson(resultFile, result);

    const tar = pack(cwd, { entries: this.outputEntries });
    const writeFile = createWriteStream(paths.local);

    debug(`[add] add "${fingerprint}" to local cache`);
    await pipe(tar, writeFile);

    if (this.remote) {
      const gzip = createGzip();

      try {
        debug(`[add] upload "${fingerprint}" to remote cache`);
        await this.remote.upload(paths.remote, pipeline(tar, gzip));
      } catch (error) {
        // (ignore error)
        console.log('[yarn-lifeline] Failed to upload to remote cache', error);
      }
    }

    debug(`[add] removing command result`);
    await remove(resultFile);
  }
}

export async function clearLocalCache(config: Config): Promise<void> {
  debug(`[clear] ${config.cache}`);
  await remove(config.cache);
}
