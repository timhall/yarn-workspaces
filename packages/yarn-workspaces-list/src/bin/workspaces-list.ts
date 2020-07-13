#!/usr/bin/env node

import { run } from '@timhall/cli';
import dedent from '@timhall/dedent';
import mri from 'mri';
import { listWorkspaces } from '..';
import { Name, RelativePath, Workspace } from '../workspace';

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

  const workspaces = await listWorkspaces();

  const byName: Record<Name, Workspace> = {};
  for (const workspace of workspaces) {
    byName[workspace.name] = workspace;
  }
  const nameToLocation = (name: Name): RelativePath => byName[name].location;

  for (const workspace of workspaces) {
    const { name, location } = workspace;
    const info = {
      name,
      location,
      workspaceDependencies: workspace.workspaceDependencies.map(nameToLocation),
      mismatchedWorkspaceDependencies: workspace.mismatchedWorkspaceDependencies.map(
        nameToLocation
      ),
    };

    console.log(JSON.stringify(info));
  }
});
