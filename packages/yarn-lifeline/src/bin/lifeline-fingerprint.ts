import dedent from '@timhall/dedent';
import mri from 'mri';
import { loadConfig } from '../config';
import { fingerprint as fingerprintDir } from '../fingerprint';

const help = dedent`
  Compute fingerprint for current project

  Usage: lifeline fingerprint
`;

export default async function(argv: string[]): Promise<void> {
  const args = mri(argv, { alias: { h: 'help' } });
  const cwd = process.cwd();

  if (args.help) {
    console.log(help);
    return;
  }

  const config = await loadConfig(cwd);

  const fingerprint = await fingerprintDir(cwd, config);
  console.log(fingerprint);
}
