#!/usr/bin/env node

import { run } from '@timhall/cli';
import dedent from '@timhall/dedent';
import mri from 'mri';

const help = dedent`
  Usage: workspaces-changes <reference> [options]

  Options:
    -v, --verbose   Show detailed workspace information
`;

run(async () => {
  const args = mri(process.argv.slice(2), {
    alias: { h: 'help', v: 'verbose' },
    boolean: ['verbose'],
  }) as {
    _: string[];
    help?: boolean;
    verbose?: boolean;
  };

  if (args.help) {
    console.log(help);
    return;
  }

  const { verbose } = args;

  // TODO
});
