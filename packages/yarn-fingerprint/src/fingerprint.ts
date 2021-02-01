import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { encode, Encoding } from './encode';
import { createGitignoreFilter, Filter } from './filter';
import { walkDir } from './walk-dir';

export interface Options {
  algorithm?: string;
  encoding?: Encoding;
  filter?: Filter;
}

export async function fingerprintDir(dir: string, options: Options = {}): Promise<string> {
  const { algorithm = 'sha1', encoding = 'base64' as Encoding, filter } = options;
  const hash = createHash(algorithm);

  // Filter by gitignore by default
  const walkFilter = filter || (await createGitignoreFilter(dir));

  for await (const { path, stats } of walkDir(dir, { filter: walkFilter })) {
    const fingerprint = stats.isDirectory()
      ? await fingerprintDir(path, { algorithm, encoding, filter })
      : await fingerprintFile(path, { algorithm, encoding });

    hash.update(fingerprint);
  }

  return encode(hash.digest(), algorithm, encoding);
}

export async function fingerprintFile(file: string, options: Options = {}): Promise<string> {
  const { algorithm = 'sha1', encoding = 'base64' as Encoding } = options;

  const hash = createHash(algorithm);
  const stream = createReadStream(file);

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => reject(error));
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(encode(hash.digest(), algorithm, encoding)));
  });
}
