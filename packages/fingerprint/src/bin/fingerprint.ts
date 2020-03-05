import { run } from '@timhall/cli';
import dedent from '@timhall/dedent';
import { HexBase64Latin1Encoding } from 'crypto';
import mri from 'mri';
import { fingerprintDir, fingerprintFile } from '..';
import { fileExists, lstat } from '../fs';

const help = dedent`
  Fingerprint the current directory or given path

  Usage: fingerprint [<path>] [options]

  Options:
    <path>                  Path to directory or file fingerprint [default: cwd]
    --algorithm ALGORITHM   Hash algorithm [default: sha1]
    --encoding ENCODING     Hash encoding [default: base64]
`;

run(async () => {
  const args = mri(process.argv.slice(2), { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  const path = args._[0] || process.cwd();
  if (!(await fileExists(path))) {
    throw new Error(`Could not find a file or directory at "${path}"`);
  }

  const { algorithm = 'sha1', encoding = 'base64' } = args;
  const options = { algorithm: algorithm as string, encoding: encoding as HexBase64Latin1Encoding };

  const stats = await lstat(path);
  const fingerprint = stats.isDirectory()
    ? await fingerprintDir(path, options)
    : await fingerprintFile(path, options);

  console.log(fingerprint);
});
