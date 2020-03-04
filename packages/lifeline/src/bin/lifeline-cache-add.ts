import dedent from '@timhall/dedent';
import mri from 'mri';
import { add } from '../';

const help = dedent`
  Add current output to cache for current fingerprint

  Usage: lifeline cache add
`;

export default async function(argv: string[]): Promise<void> {
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  await add();
}
