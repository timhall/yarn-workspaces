import { cli, commands } from '@timhall/cli';

const subcommands = commands({
  add: {
    load: () => import('./lifeline-cache-add'),
    description: 'Add current output to cache for current fingerprint'
  },
  list: {
    load: () => import('./lifeline-cache-list'),
    description: 'List cached output directories, by fingerprint'
  },
  show: {
    load: () => import('./lifeline-cache-show'),
    description: 'Show cached output directory for fingerprint'
  },
  clear: {
    load: () => import('./lifeline-cache-clear'),
    description: 'Clear all cached directories'
  }
});

const cache = cli({ name: 'lifeline cache', subcommands });

export default async function run(argv: string[]) {
  await cache.run(argv);
}
