import { decode as decodeBase, encode as multibase, name as BaseEncoding } from 'multibase';
import { decode as decodeHash, encode as multihash } from 'multihashes';

const supportedAlgorithms: { [name: string]: string } = {
  sha1: 'sha1',
  sha256: 'sha2-256',
  sha512: 'sha2-512'
};
const supportedEncodings: { [name: string]: BaseEncoding } = {
  hex: 'base16',
  base64: 'base64'
};

export type Encoding = 'hex' | 'base64'

export function encode(hash: Buffer, algorithm: string, encoding: 'hex' | 'base64'): string {
  const supportedAlgorithm = supportedAlgorithms[algorithm];
  if (!supportedAlgorithm) {
    throw new Error(
      `Unsupported algorithm "${algorithm}". Supported algorithms are sha1, sha256, and sha512`
    );
  }

  const supportedEncoding = supportedEncodings[encoding];
  if (!supportedEncoding) {
    throw new Error(`Unsupported encoding "${encoding}". Supported encodings are hex and base64`);
  }

  const hashed = multihash(hash, supportedAlgorithm);
  const based = multibase(supportedEncoding, hashed);

  return based.toString(encoding);
}

export function decode(data: Buffer): Buffer {
  return decodeHash(decodeBase(data)).digest;
}
