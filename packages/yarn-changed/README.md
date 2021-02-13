# yarn-changed

Workspace-aware change detection, compared to a git reference.

```
$ changed -d master
$ echo $? # 0 = unchanged, # = changed
```

## API

### `findWorkspaceChanges([reference], [options])`

Options:

- `includeDependencies`
- `cwd`

## CLI

### `changed [<reference>] [options]`

Options:

- `-d, --dependencies` Check dependencies for changes
