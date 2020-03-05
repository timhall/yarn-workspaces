declare module 'multibase' {
  export function encode(code: string, data: Buffer): Buffer;
  export function decode(data: Buffer): Buffer;
}
