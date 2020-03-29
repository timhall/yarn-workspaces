import { Config } from './config';

export async function add(fingerprint: string, config: Config) {
  console.log('add', fingerprint, config);
}

interface List {
  [fingerprint: string]: string;
}

export async function list(config: Config): Promise<List> {
  console.log('list', config);
  return {};
}

export async function show(fingerprint: string, config: Config): Promise<string | undefined> {
  const values = await list(config);
  return values[fingerprint];
}

export async function clear(config: Config) {
  console.log('clear', config.cache);
}
