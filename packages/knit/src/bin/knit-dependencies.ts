import dedent from '@timhall/dedent';
import mri from 'mri';
import { dependencies } from '../';

const help = dedent`
  Build workspace dependencies for the current package

  Usage: knit dependencies
`;

export default async function(argv: string[]) {
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  await dependencies();
}
