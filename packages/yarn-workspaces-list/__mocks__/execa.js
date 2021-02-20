async function execa(command, args, options) {
  if (args[0] === '--version') {
    return { stdout: '1.22.0' };
  } else if (/workspaces info/.test(args.join(' '))) {
    const line = {
      type: 'log',
      data: JSON.stringify({
        a: {
          location: 'packages/a',
          workspaceDependencies: [],
          mismatchedWorkspaceDependencies: [],
        },
        b: {
          location: 'packages/b',
          workspaceDependencies: ['a'],
          mismatchedWorkspaceDependencies: [],
        },
        c: {
          location: 'packages/c',
          workspaceDependencies: ['a'],
          mismatchedWorkspaceDependencies: [],
        },
        d: {
          location: 'projects/d',
          workspaceDependencies: ['b', 'c'],
          mismatchedWorkspaceDependencies: [],
        },
      }),
    };
    return { stdout: JSON.stringify(line) };
  } else {
    console.log(command, args);
    throw new Error(`Unknown command "${command}"`);
  }
}

module.exports = execa;
