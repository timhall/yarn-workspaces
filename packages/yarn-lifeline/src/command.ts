export interface CommandResult {
  output: CommandOutput[];
}

export interface CommandOutput {
  source: 'stdout' | 'stderr';
  value: string;
}

export function isCommandResult(value: unknown): value is CommandResult {
  return !!value && Object.hasOwnProperty.call(value, 'output');
}
