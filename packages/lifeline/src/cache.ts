export async function add() {
  const dir = process.cwd();
  console.log('add', dir);
}

export async function list() {
  console.log('list');
}

export async function show(fingerprint: string) {
  console.log('show', fingerprint);
}

export async function clear() {
  console.log('clear');
}
