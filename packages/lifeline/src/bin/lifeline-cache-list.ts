import dedent from '@timhall/dedent/macro';
import mri from 'mri';
import { list } from '../';

const help = dedent`
  List cached output directories, by fingerprint

  Usage: lifeline cache list
`;

export default async function(argv: string[]): Promise<void> {
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  await list();
}
