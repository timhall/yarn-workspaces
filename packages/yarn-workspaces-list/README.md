# yarn-workspaces-list

List all available workspaces using the format from `yarn workspaces list --verbose --json` from yarn v2.

```js
const { listWorkspaces } = require('yarn-workspaces-list');

const list = await listWorkspaces();
```

```
$ workspaces-list

{"location":".","name":"@workspace/monorepo","workspaceDependencies":[],"mismatchedWorkspaceDependencies":[]}
{"location":"packages/a","name":"@workspace/a",...}
{"location":"packages/b","name":"@workspace/b","workspaceDependencies":["packages/a"],...}
```

## API

### `listWorkspaces([options])`

Options:

- `[cwd]`

## CLI

### `workspaces-list`
