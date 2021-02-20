import { isMatch } from 'micromatch';
import { relative } from 'path';
import { Filter, fingerprintWorkspace } from 'yarn-fingerprint';
import { Config } from './config';

export async function fingerprint(cwd: string, config: Config): Promise<string> {
  const filter = config.source && globsToFilter(config.source, config.base);

  return fingerprintWorkspace(cwd, { filter, includeDependencies: config.dependencies });
}

function globsToFilter(patterns: string[], base: string): Filter {
  return (absolutePath: string) => {
    const relativePath = relative(absolutePath, base);
    return isMatch(relativePath, patterns);
  };
}
