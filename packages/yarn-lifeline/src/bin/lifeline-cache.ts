import { cli, commands } from '@timhall/cli';

const subcommands = commands({
  clear: {
    load: () => import('./lifeline-cache-clear'),
    description: 'Clear local cache',
  },
});

const cache = cli({ name: 'lifeline cache', subcommands });

export default async function run(argv: string[]) {
  await cache.run(argv);
}
