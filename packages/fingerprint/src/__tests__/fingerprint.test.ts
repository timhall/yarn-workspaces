import { join, relative } from 'path';
import { fingerprintDir, fingerprintFile } from '../';
import { decode, encode } from '../encode';
import { createGitignoreFilter, findGitignores } from '../filter';
import { PathProperties, walkDir } from '../walk-dir';

const fixture = (path: string) => join(__dirname, '../__fixtures__', path);
const toRelative = (path: string) => relative(fixture('/'), path);

test('should fingerprint file', async () => {
  const fingerprint = await fingerprintFile(fixture('a.txt'));
  expect(fingerprint).toEqual('bUVSUnR6VXppUFlqaTdwVm91bFJzQUh4ajJSTWNHdw==');
});

test('should fingerprint directory', async () => {
  const fingerprint = await fingerprintDir(fixture('/'));
  expect(fingerprint).toEqual('bUVSVDhOb2hnalFCaTUzSEJsSjZjT0tEM2xNQ05wdw==');
});

// (internal)

test('should use multihash and multibase for hashes', () => {
  let hash = encode(Buffer.from('abcdef'), 'sha256', 'base64');
  expect(decode(Buffer.from(hash, 'base64')).toString()).toEqual('abcdef');

  hash = encode(Buffer.from('abcdef'), 'sha256', 'hex');
  expect(decode(Buffer.from(hash, 'hex')).toString()).toEqual('abcdef');
});

test('should find .gitignore files', async () => {
  expect((await findGitignores(fixture('/'))).map(toRelative)).toEqual(['.gitignore']);
  expect((await findGitignores(fixture('/b/c/d'))).map(toRelative)).toEqual([
    'b/.gitignore',
    '.gitignore'
  ]);
});

test('should filter directory by .gitignore', async () => {
  const dir = fixture('/');
  const paths: string[] = [];
  for await (const entry of walkDirRecursive(dir)) {
    paths.push(toRelative(entry.path));
  }

  expect(paths).toEqual(['.gitignore', 'a.txt', 'b/.gitignore', 'b/b.txt', 'b/c/c.txt']);
});

async function* walkDirRecursive(dir: string): AsyncGenerator<PathProperties> {
  const filter = await createGitignoreFilter(dir);

  for await (const { path, stats } of walkDir(dir, { filter })) {
    if (stats.isDirectory()) {
      yield* walkDirRecursive(path);
    } else {
      yield { path, stats };
    }
  }
}
