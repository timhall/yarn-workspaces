import dedent from '@timhall/dedent/macro';
import mri from 'mri';
import { run } from '../';

const help = dedent`
  Run command with caching

  Usage: lifeline run <command>

  Options:
    <command>  ...
`;

export default async function(argv: string[]): Promise<void> {
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  const command = args._;

  await run(command);
}
