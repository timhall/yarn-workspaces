import dedent from '@timhall/dedent';
import mri from 'mri';
import { add } from '../';
import { loadConfig } from '../config';
import { fingerprint as fingerprintDir } from '../fingerprint';

const help = dedent`
  Add current output to cache for current fingerprint

  Usage: lifeline cache add
`;

export default async function(argv: string[]): Promise<void> {
  const cwd = process.cwd();
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  const config = await loadConfig(cwd);
  const fingerprint = await fingerprintDir(cwd, config);

  await add(fingerprint, config);
}
