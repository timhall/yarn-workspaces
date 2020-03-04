const { promisify } = require('util');

const child_process = jest.genMockFromModule('child_process');

function exec(command, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (/\-\-version/.test(command)) {
    callback(undefined, '1.22.0', '');
  } else if (/workspaces info/.test(command)) {
    const line = {
      type: 'log',
      data: JSON.stringify({
        a: {
          location: 'packages/a',
          workspaceDependencies: [],
          mismatchedWorkspaceDependencies: []
        },
        b: {
          location: 'packages/b',
          workspaceDependencies: ['a'],
          mismatchedWorkspaceDependencies: []
        },
        c: {
          location: 'packages/c',
          workspaceDependencies: ['a'],
          mismatchedWorkspaceDependencies: []
        },
        d: {
          location: 'projects/d',
          workspaceDependencies: ['b', 'c'],
          mismatchedWorkspaceDependencies: []
        }
      })
    };
    callback(undefined, JSON.stringify(line), '');
  } else {
    callback(new Error(`Unknown command "${command}"`));
  }
}
exec[promisify.custom] = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve({ stdout, stderr });
    });
  });
};

child_process.exec = exec;

module.exports = child_process;
