import { fingerprintDir } from 'fingerprint';
import { Config } from './config';

export async function fingerprint(cwd: string, config: Config): Promise<string> {
  return fingerprintDir(cwd, {
    filter: config.source && globsToFilter(config.source, config.base)
  });
}

function globsToFilter(patterns: string[], base: string): undefined {
  return;
}
