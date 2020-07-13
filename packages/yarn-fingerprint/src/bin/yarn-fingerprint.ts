#!/usr/bin/env node

import { run } from '@timhall/cli';
import dedent from '@timhall/dedent';
import { HexBase64Latin1Encoding } from 'crypto';
import mri from 'mri';
import { fingerprintDir, fingerprintFile, fingerprintWorkspace } from '..';
import { lstat, pathExists } from '../fs';

const help = dedent`
  Fingerprint the current workspace, directory, or given path

  Usage: fingerprint [<path>] [options]

  Options:
    <path>                  Path to workspace, directory, or file [default: cwd]
    -w, --workspace         Include workspace dependencies in fingerprint
    --algorithm ALGORITHM   Hash algorithm [default: sha1]
    --encoding ENCODING     Hash encoding [default: base64]
`;

run(async () => {
  const args = mri(process.argv.slice(2), { alias: { h: 'help', w: 'workspace' } });

  if (args.help) {
    console.log(help);
    return;
  }

  const path = args._[0] || process.cwd();
  if (!(await pathExists(path))) {
    throw new Error(`Could not find a file or directory at "${path}"`);
  }

  const { algorithm = 'sha1', encoding = 'base64', workspace: isWorkspace = false } = args;
  const options = { algorithm: algorithm as string, encoding: encoding as HexBase64Latin1Encoding };

  const stats = await lstat(path);
  const fingerprint = stats.isDirectory()
    ? isWorkspace
      ? await fingerprintWorkspace(path, options)
      : await fingerprintDir(path, options)
    : await fingerprintFile(path, options);

  console.log(fingerprint);
});
