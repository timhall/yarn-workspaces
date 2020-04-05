#!/usr/bin/env node

import { cli, commands, run } from '@timhall/cli';

const { name, version } = require('../../package.json');

const subcommands = commands({
  run: {
    load: () => import('./lifeline-run'),
    description: 'Run command with caching'
  },
  fingerprint: {
    load: () => import('./lifeline-fingerprint'),
    description: 'Compute fingerprint for current source'
  },
  cache: {
    load: () => import('./lifeline-cache'),
    description: 'Subcommands for caching'
  }
});
const lifeline = cli({ name, version, subcommands });

run(name, async () => {
  const argv = process.argv.slice(2);
  await lifeline.run(argv);
});
