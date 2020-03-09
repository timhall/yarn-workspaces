# fingerprint

Calculate a hash fingerprint for directories and files.

```js
const { fingerprintDir } = require('fingerprint');

// Calculate a fingerprint of the current working directory using
// - filter = active .gitignore files
// - algorithm = sha1
// - encoding = base64
const a = await fingerprintDir(process.cwd());
```

```js
const { fingerprintDir, fingerprintFile } = require('fingerprint');
const { join } = require('path');

const b = await fingerprintDir(process.cwd(), {
  algorithm: 'sha256',
  encoding: 'hex',
  filter: absolutePath => /^\./.test(absolutePath)
});

const c = await fingerprintFile(join(__dirname, 'file.txt'));
```

## fingerprintDir(dir: string, [options]): Promise<string>

Options:

- [algorithm = 'sha1'] - Hash algorithm, `'sha1'`, `'sha256'`, or `'sha512'`
- [encoding = 'base64'] - Encoding, `'base64'` or `'hex'`
- [filter = (by gitignore)] - Filter function, given absolute path and return `true` to include file or `false` to exclude
