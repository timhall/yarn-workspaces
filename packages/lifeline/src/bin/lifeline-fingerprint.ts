import dedent from '@timhall/dedent';
import { fingerprintDir } from 'fingerprint';
import mri from 'mri';

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

  const fingerprint = await fingerprintDir(process.cwd());
  console.log(fingerprint);
}
