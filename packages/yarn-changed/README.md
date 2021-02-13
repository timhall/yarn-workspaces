# yarn-changed

Workspace-aware change detection, compared to a git reference.

```
$ changed -d master
$ echo $? # 0 = unchanged, 1 = changed
```

## API

### `isWorkspaceChanged(workspace, [reference], [options])`

## CLI

### `changed [<reference>] [options]`

Options:

- `-d, --dependencies` Check dependencies for changes
