import { run } from '@timhall/cli';
import dedent from '@timhall/dedent';
import mri from 'mri';

const help = dedent`
  Usage: workspaces-foreach
`;

run(async () => {
  const args = mri(process.argv.slice(2), { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }
});
