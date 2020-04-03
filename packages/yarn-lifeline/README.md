# yarn-lifeline

Cache build output based on source fingerprint.

Example:

```json
{
  "scripts": {
    "build": "lifeline run react-scripts build"
  },
  "devDependencies": {
    "yarn-lifeline": "*"
  }
}
```

## config

`lifeline` accepts config stored as `"lifeline"` in `package.json`, `.lifeline`, or `lifeline.config.js`:

```js
// lifeline.config.js
module.exports = {
  // (default: uses .gitignore)
  source: ['src/**/*.js', 'package.json', 'package-lock.json'],

  // (default: dist)
  output: 'lib',

  // (default: node_modules/.cache)
  cache: '.cache'
};
```

## `lifeline run <command>`

Compute fingerprint for current source and if cached output exists restore it, otherwise run command and cache output.

Use `LIFELINE_DISABLE_CACHE=1` to skip checking the cache for run.

## `lifeline fingerprint`

Compute fingerprint for current source.

## `lifeline cache add`

Add current output to cache for current fingerprint

## `lifeline cache list`

List cached output directories, by fingerprint

## `lifeline cache show <fingerprint>`

Show cached output directory for fingerprint

## `lifeline cache clear`

Clear all cached directories
