import { exec as _exec } from 'child_process';
import { promisify } from 'util';
import { PackageInfo } from './package-info';

interface CliOptions {
  cwd?: string;
}

const exec = promisify(_exec);

export async function isBerry(options: CliOptions = {}): Promise<boolean> {
  const { cwd = process.cwd() } = options;
  const { stdout } = await exec(`yarn --version`, { cwd });

  return /2\./.test(stdout);
}

export async function list(options: CliOptions = {}): Promise<PackageInfo[]> {
  const { cwd = process.cwd() } = options;
  const { stdout } = await exec(`yarn workspaces list --verbose --json`, { cwd });

  const list = stdout
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line)) as PackageInfo[];

  return list;
}
