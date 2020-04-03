import dedent from '@timhall/dedent';
import mri from 'mri';
import { run } from '..';
import { loadConfig } from '../config';

const help = dedent`
  Run command with caching

  Usage: lifeline run <command>...

  Options:
    <command>...  Run command or restore from cache if up-to-date
`;

export default async function(argv: string[]): Promise<void> {
  const args = mri(argv, { alias: { h: 'help' } });
  const cwd = process.cwd();

  if (args.help) {
    console.log(help);
    return;
  }

  const command = args._;
  const config = await loadConfig(cwd);

  await run(command.join(' '), config, { cwd });
}
