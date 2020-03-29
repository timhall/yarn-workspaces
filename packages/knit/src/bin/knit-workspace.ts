import dedent from '@timhall/dedent';
import mri from 'mri';
import { workspace } from '../';

const help = dedent`
  Build workspace dependencies for the entire workspace

  Usage: knit workspace [options]

  Options:
    --parallel / -p   Build in parallel
    --jobs / -j       Number of parallel jobs to use
`;

export default async function(argv: string[]) {
  const args = mri(argv, { alias: { h: 'help', p: 'parallel', j: 'jobs' } }) as {
    help?: boolean;
    parallel?: boolean;
    jobs?: string;
  };

  if (args.help) {
    console.log(help);
    return;
  }

  const { parallel, jobs: rawJobs } = args;
  const jobs = rawJobs ? parseInt(rawJobs) : undefined;

  await workspace({ parallel, jobs });
}
