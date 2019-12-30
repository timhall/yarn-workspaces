import mri from 'mri';

process.title = 'lifeline';
process.on('unhandledRejection', handleError);
process.on('uncaughtException', handleError);

main()
  .then(() => process.exit(0))
  .catch(handleError);

async function main() {
  const args = mri(process.argv.slice(2), {
    alias: {
      v: 'version',
      h: 'help'
    }
  });

  console.log('lifeline', args);
}

function handleError(error: Error | any) {
  console.error(error);
  process.exit(1);
}
