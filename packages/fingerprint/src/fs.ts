import { existsSync, lstat as _lstat, readdir as _readdir, readFile as _readFile } from 'fs';
import { promisify } from 'util';

export const readdir = promisify(_readdir);
export const lstat = promisify(_lstat);
export const readFile = promisify(_readFile);

export async function fileExists(file: string): Promise<boolean> {
  return existsSync(file);
}
