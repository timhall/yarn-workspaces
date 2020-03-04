import { run } from '@timhall/cli';
import dedent from '@timhall/dedent';
import mri from 'mri';
import { listWorkspaces } from '..';

const help = dedent`
  List all available workspaces as NDJSON (https://github.com/ndjson/ndjson-spec).

  Usage: workspaces-list
`;

run(async () => {
  const args = mri(process.argv.slice(2), { alias: { h: 'help' } });

  if (args.help) {
    console.log(help);
    return;
  }

  const list = await listWorkspaces();

  for (const pkg of list) {
    console.log(JSON.stringify(pkg));
  }
});
