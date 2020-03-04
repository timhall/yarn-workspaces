import dedent from '@timhall/dedent';
import mri from 'mri';
import { show } from '../';

const help = dedent`
  Show cached output directory for fingerprint

  Usage: lifeline cache show <fingerprint>
`;

export default async function(argv: string[]): Promise<void> {
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  const fingerprint = args._[0];

  await show(fingerprint);
}
