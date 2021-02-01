# yarn-fingerprint

Calculate a hash fingerprint for workspaces, directories, and files.

```js
const { fingerprintWorkspace } = require('yarn-fingerprint');

// Calculate a fingerprint for the workspace, yarn.lock, and dependent workspaces
// - filter = active .gitignore files
// - algorithm = sha1
// - encoding = base64
const a = await fingerprintWorkspace(process.cwd());
```

```js
const { fingerprintDir } = require('yarn-fingerprint');

// Calculate a fingerprint of the current working directory using
// - filter = active .gitignore files
// - algorithm = sha1
// - encoding = base64
const b = await fingerprintDir(process.cwd());
```

```js
const { fingerprintDir, fingerprintFile } = require('yarn-fingerprint');
const { join } = require('path');

const c = await fingerprintDir(process.cwd(), {
  algorithm: 'sha256',
  encoding: 'hex',
  filter: (absolutePath) => /^\./.test(absolutePath),
});

const d = await fingerprintFile(join(__dirname, 'file.txt'));
```

## fingerprintWorkspace(dir: string, [optionss]): Promise<string>

Options:

- [algorithm = 'sha1'] - Hash algorithm, `'sha1'`, `'sha256'`, or `'sha512'`
- [encoding = 'base64'] - Encoding, `'base64'` or `'hex'`
- [filter = (by gitignore)] - Filter function, given absolute path and return `true` to include file or `false` to exclude

Compute hash fingerprint for the workspace, yarn.lock file, and dependent workspaces.

## fingerprintDir(dir: string, [options]): Promise<string>

Options:

- [algorithm = 'sha1'] - Hash algorithm, `'sha1'`, `'sha256'`, or `'sha512'`
- [encoding = 'base64'] - Encoding, `'base64'` or `'hex'`
- [filter = (by gitignore)] - Filter function, given absolute path and return `true` to include file or `false` to exclude

## fingerprintFile(file: string, [options]): Promise<string>

Options:

- [algorithm = 'sha1'] - Hash algorithm, `'sha1'`, `'sha256'`, or `'sha512'`
- [encoding = 'base64'] - Encoding, `'base64'` or `'hex'`
