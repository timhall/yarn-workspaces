import dedent from '@timhall/dedent';
import mri from 'mri';
import { list } from '../';
import { loadConfig } from '../config';

const help = dedent`
  List cached output directories, by fingerprint

  Usage: lifeline cache list
`;

export default async function(argv: string[]): Promise<void> {
  const cwd = process.cwd();
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  const config = await loadConfig(cwd);
  const items = await list(config);

  for (const [fingerprint, dir] of Object.entries(items)) {
    console.log(fingerprint, dir);
  }
}
