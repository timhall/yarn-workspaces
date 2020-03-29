import dedent from '@timhall/dedent';
import mri from 'mri';
import { clear } from '../';
import { loadConfig } from '../config';

const help = dedent`
  Clear all cached directories

  Usage: lifeline cache clear
`;

export default async function(argv: string[]): Promise<void> {
  const cwd = process.cwd();
  const args = mri(argv, { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  const config = await loadConfig(cwd);
  await clear(config);
}
