import { exec as _exec } from 'child_process';
import { promisify } from 'util';

export const exec = promisify(_exec);
