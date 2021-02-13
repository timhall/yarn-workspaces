# yarn-knit

Intelligently build workspace dependencies.

## CLI

### `knit dependencies`

Build workspace dependencies for the current package

```
$ knit dependencies --help

Build workspace dependencies for the current package

Usage: knit dependencies [options]

Options:
  --parallel / -p   Build in parallel
  --jobs / -j       Number of parallel jobs to use
```

Example:

```json
{
  "scripts": {
    "start": "knit dependencies && react-scripts start"
  },
  "devDependencies": {
    "yarn-knit": "*"
  }
}
```

### `knit workspace`

Build workspace dependencies for the entire workspace

```
$ knit workspace --help

Build workspace dependencies for the entire workspace

Usage: knit workspace [options]

Options:
  --parallel / -p   Build in parallel
  --jobs / -j       Number of parallel jobs to use
```

Example:

```json
{
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "knit workspace"
  },
  "devDependencies": {
    "yarn-knit": "*"
  }
}
```
