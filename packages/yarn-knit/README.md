# yarn-knit

Intelligently build workspace dependencies.

## `knit dependencies`

Build workspace dependencies for the current package

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

## `knit workspace`

Build workspace dependencies for the entire workspace

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