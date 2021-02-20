import dedent from '@timhall/dedent';
import mri from 'mri';
import { run, runWithCache } from '..';
import { loadConfig } from '../config';

const help = dedent`
  Run command with caching
  (use LIFELINE_NO_CACHE=1 or NO_CACHE=1 to temporarily disable caching)

  Usage: lifeline run <command>...

  Options:
    <command>...  Run command or restore from cache if up-to-date
`;

export default async function (argv: string[]): Promise<void> {
  const args = mri(argv, { alias: { h: 'help' } });
  const cwd = process.cwd();

  if (args.help) {
    console.log(help);
    return;
  }

  const command = argv.join(' ');
  const options = { cwd };

  const NO_CACHE =
    process.env.LIFELINE_NO_CACHE || process.env.NO_CACHE || process.env.LIFELINE_DISABLE_CACHE;
  const noCache = NO_CACHE && NO_CACHE !== '0';

  if (noCache) {
    await run(command, options);
    return;
  }

  const config = await loadConfig(cwd);
  await runWithCache(command, config, options);
}
