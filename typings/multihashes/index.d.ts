declare module 'multihashes' {
  interface Decoded {
    code: number;
    name: string;
    length: number;
    digest: Buffer;
  }

  export function encode(digest: Buffer, code: string): Buffer;
  export function decode(data: Buffer): Decoded;
}
