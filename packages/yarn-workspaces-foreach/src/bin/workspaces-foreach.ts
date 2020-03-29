import { run } from '@timhall/cli';
import dedent from '@timhall/dedent';
import mri from 'mri';
import { foreach } from '..';

const help = dedent`
  Usage: workspaces-foreach [options] <command...>
`;

run(async () => {
  const args = mri(process.argv.slice(2), {
    alias: { h: 'help', p: 'parallel', t: 'topological', j: 'jobs' },
    boolean: ['parallel', 'topological']
  }) as {
    _: string[];
    help?: boolean;
    parallel?: boolean;
    topological?: boolean;
    jobs?: string;
    include?: string[];
    exclude?: string[];
  };

  if (args.help) {
    console.log(help);
    return;
  }

  const { parallel, jobs: rawJobs, topological, include, exclude } = args;
  const jobs = rawJobs ? parseInt(rawJobs) : undefined;
  const command = args._.join(' ');

  const { exitCode } = await foreach(command, {
    parallel,
    jobs,
    topological,
    include,
    exclude
  });

  process.exit(exitCode);
});
