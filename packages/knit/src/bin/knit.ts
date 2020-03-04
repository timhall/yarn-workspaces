import { cli, commands, run } from '@timhall/cli';

const { name, version } = require('../../package.json');

const subcommands = commands({
  dependencies: {
    load: () => import('./knit-dependencies'),
    description: 'Build workspace dependencies for the current package'
  },
  workspace: {
    load: () => import('./knit-workspace'),
    description: 'Build workspace dependencies for the entire workspace'
  }
});
const knit = cli({ name, version, subcommands });

run(name, async () => {
  const argv = process.argv.slice(2);
  await knit.run(argv);
});
