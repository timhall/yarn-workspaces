import dedent from '@timhall/dedent/macro';
import mri from 'mri';
import { clear } from '../';

const help = dedent`
  Clear all cached directories

  Usage: lifeline cache clear
`;

export default async function(argv: string[]): Promise<void> {
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  await clear();
}
