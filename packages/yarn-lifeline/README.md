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

## Config

`lifeline` accepts config stored as `"lifeline"` in `package.json`, `.lifeline`, or `lifeline.config.js`:

```js
// lifeline.config.js
module.exports = {
  // Source files/directories
  // (default: uses .gitignore)
  source: ['src/**/*.js', 'package.json', 'package-lock.json'],

  // Output files/directories
  // (default: 'dist')
  output: 'lib',

  // Local cache directory
  // (default: node_modules/.cache)
  cache: '.cache',

  // Include dependencies in fingerprint
  // (default: false)
  dependencies: true

  // Use external cache sources
  // (default: undefined)
  remote: {
    require: '@yarn-lifeline/s3',
    options: {
      bucket: '...'
    }
  }

  // or (for lifeline.config.js only)
  remote: require('@yarn-lifeline/s3')({ bucket: '...' })
};
```

## CLI

### `lifeline run <command>`

Compute fingerprint for current source and if cached output exists restore it, otherwise run command and cache output.

Use `LIFELINE_NO_CACHE=1` or `NO_CACHE=1` to temporarily skip caching.

### `lifeline fingerprint`

Compute fingerprint for current source.

### `lifeline cache add`

Add current output to cache for current fingerprint

### `lifeline cache list`

List cached output directories, by fingerprint

### `lifeline cache show <fingerprint>`

Show cached output directory for fingerprint

### `lifeline cache clear`

Clear all cached directories
