#!/usr/bin/env node

import { run } from '@timhall/cli';
import dedent from '@timhall/dedent';
import execa from 'execa';
import mri from 'mri';
import { listWorkspaces } from 'yarn-workspaces-list';
import { findChangedWorkspaces } from '..';

const help = dedent`
  List all changed workspaces as NDJSON (https://github.com/ndjson/ndjson-spec).

  Usage: workspaces-changes <reference>
`;

run(async () => {
  const args = mri(process.argv.slice(2), {
    alias: { h: 'help' },
    boolean: ['help'],
  }) as {
    _: string[];
    help?: boolean;
  };

  if (args.help) {
    console.log(help);
    return;
  }

  const {
    _: [reference],
  } = args;

  const changed = await findChangedWorkspaces(reference);
  for (const workspace of changed) {
    const { name, location } = workspace;
    console.log(JSON.stringify({ name, location }));
  }
});
