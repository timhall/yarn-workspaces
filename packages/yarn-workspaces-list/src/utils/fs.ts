import { existsSync, readFile as _readFile } from 'fs';
import { promisify } from 'util';

export const readFile = promisify(_readFile);

export async function readJson<TValue = any>(path: string): Promise<TValue> {
  const data = await readFile(path, 'utf8');
  return JSON.parse(data);
}

export async function pathExists(path: string): Promise<boolean> {
  return Promise.resolve(existsSync(path));
}
