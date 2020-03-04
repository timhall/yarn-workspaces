import dedent from '@timhall/dedent';
import mri from 'mri';
import { fingerprint } from '../';

const help = dedent`
  Compute fingerprint for current source

  Usage: lifeline fingerprint
`;

export default async function(argv: string[]): Promise<void> {
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  await fingerprint();
}
