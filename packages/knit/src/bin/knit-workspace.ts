import dedent from '@timhall/dedent';
import mri from 'mri';
import { workspace } from '../';

const help = dedent`
  Build workspace dependencies for the entire workspace

  Usage: knit workspace
`;

export default async function(argv: string[]) {
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  await workspace();
}
