# yarn-fingerprint

Calculate a hash fingerprint for workspaces, directories, and files.

```
$ fingerprint --help

Fingerprint the current workspace, directory, or given path

Usage: fingerprint [<path>] [options]

Options:
  <path>                  Path to workspace, directory, or file [default: cwd]
  -w, --workspace         Include workspace dependencies in fingerprint
  --algorithm ALGORITHM   Hash algorithm [default: sha1]
  --encoding ENCODING     Hash encoding [default: base64]
```

## API

### fingerprintWorkspace(dir: string, [options]): Promise<string>

```js
const { fingerprintWorkspace } = require('yarn-fingerprint');

// Calculate a fingerprint for the workspace, yarn.lock, and dependent workspaces
// - filter = active .gitignore files
// - algorithm = sha1
// - encoding = base64
const a = await fingerprintWorkspace(process.cwd());
```

Options:

- [algorithm = 'sha1'] - Hash algorithm, `'sha1'`, `'sha256'`, or `'sha512'`
- [encoding = 'base64'] - Encoding, `'base64'` or `'hex'`
- [filter = (by gitignore)] - Filter function, given absolute path and return `true` to include file or `false` to exclude

Compute hash fingerprint for the workspace, yarn.lock file, and dependent workspaces.

### fingerprintDir(dir: string, [options]): Promise<string>

```js
const { fingerprintDir } = require('yarn-fingerprint');

const b = await fingerprintDir(process.cwd(), {
  algorithm: 'sha256',
  encoding: 'hex',
  filter: (absolutePath) => /^\./.test(absolutePath),
});
```

Options:

- [algorithm = 'sha1'] - Hash algorithm, `'sha1'`, `'sha256'`, or `'sha512'`
- [encoding = 'base64'] - Encoding, `'base64'` or `'hex'`
- [filter = (by gitignore)] - Filter function, given absolute path and return `true` to include file or `false` to exclude

### fingerprintFile(file: string, [options]): Promise<string>

```js
const { fingerprintFile } = require('yarn-fingerprint');
const { join } = require('path');

const c = await fingerprintFile(join(__dirname, 'file.txt'));
```

Options:

- [algorithm = 'sha1'] - Hash algorithm, `'sha1'`, `'sha256'`, or `'sha512'`
- [encoding = 'base64'] - Encoding, `'base64'` or `'hex'`
