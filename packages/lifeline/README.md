# lifeline

Cache build output based on source fingerprint.

Example:

```json
{
  "scripts": {
    "build": "lifeline run react-scripts build"
  },
  "devDependencies": {
    "lifeline": "*"
  }
}
```

## config

`lifeline` accepts config stored as `"lifeline"` in `package.json`, `.lifeline`, or `lifeline.config.js`:

```js
// lifeline.config.js
module.exports = {
  source: ["src/**/*.js", "package.json", "package-lock.json"],
  output: "dist"
};
```

## `lifeline run <command>`

Compute fingerprint for current source and if cached output exists restore it, otherwise run command and cache output.

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
