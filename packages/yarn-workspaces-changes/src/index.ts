interface ChangesOptions {
  cwd?: string;
}

export async function changes(reference: string, options: ChangesOptions = {}): Promise<void> {
  const { cwd = process.cwd() } = options;
  // TODO
}
