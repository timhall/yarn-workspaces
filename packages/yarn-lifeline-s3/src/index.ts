import { Readable } from 'stream';
import type { IRemoteCache } from 'yarn-lifeline';

export default class S3 implements IRemoteCache {
  async has(file: string): Promise<boolean> {
    return false;
  }
  async download(file: string): Promise<AsyncIterable<Buffer>> {
    return new Readable();
  }
  async upload(file: string, data: AsyncIterable<Buffer>): Promise<void> {}
}
