import { fingerprintDir } from 'fingerprint';
import { Config } from './config';

export async function fingerprint(cwd: string, config: Config): Promise<string> {
  const filter = config.source && globsToFilter(config.source, config.base);

  return fingerprintDir(cwd, { filter });
}

function globsToFilter(patterns: string[], base: string): undefined {
  return;
}
