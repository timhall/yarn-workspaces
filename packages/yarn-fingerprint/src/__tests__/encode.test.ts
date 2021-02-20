import { encode } from '../encode';

type LooseEncode = (hash: Buffer, algorithm: string, encoding: string) => string;

test('should throw for unsupported algorithm', () => {
  expect(() => encode(Buffer.from(''), 'unsupported', 'hex')).toThrow(
    'Unsupported algorithm "unsupported". Supported algorithms are sha1, sha256, and sha512'
  );
});

test('should throw for unsupported encoding', () => {
  expect(() => (encode as LooseEncode)(Buffer.from(''), 'sha256', 'unsupported')).toThrow(
    'Unsupported encoding "unsupported". Supported encodings are hex and base64'
  );
});
