#!/usr/bin/env node

import { run } from '@timhall/cli';
import dedent from '@timhall/dedent';
import mri from 'mri';
import { relative } from 'path';
import { findWorkspaceChanges } from '..';

const help = dedent`
  Check workspace for changes, exit 0 for unchanged, 1 for changed

  Usage: changed [<reference>] [options]

  Options:
    <reference>         git reference to compare to [default: HEAD]
    -d, --dependencies  Check workspace dependencies for changes
`;

run(async () => {
  const args = mri(process.argv.slice(2), {
    alias: { h: 'help', d: 'dependencies' },
    boolean: ['help', 'dependencies'],
  }) as {
    _: string[];
    help?: boolean;
    dependencies?: boolean;
  };

  if (args.help) {
    console.log(help);
    return;
  }

  const {
    _: [reference],
    dependencies: includeDependencies = false,
  } = args;

  const changed = await findWorkspaceChanges(reference || 'HEAD', { includeDependencies });
  for (const change of changed) {
    console.log(relative(process.cwd(), change));
  }

  process.exit(changed.length);
});
