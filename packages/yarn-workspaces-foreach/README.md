# yarn-workspaces-foreach

Run a command in each workspace.

```js
const { foreach } = require('yarn-workspaces-foreach');

await foreach('yarn build', { parallel: true, topological: true });
```

```
$ workspaces-foreach -pt yarn build
```

### foreach(command, options?)

### workspaces-foreach <command...> [options]

Options:

- `--parallel` / `-p` run commands in parallel
- `--topological` / `-t` run commands ordered by dependency graph
- `--jobs <count>` / `-j <count>` number of parallel jobs to run
- `--include` workspaces to include
- `--exclude` workspaces to exclude
