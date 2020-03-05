import { PackageInfo } from './package-info';
interface CliOptions {
    cwd?: string;
}
export declare function isBerry(options?: CliOptions): Promise<boolean>;
export declare function list(options?: CliOptions): Promise<PackageInfo[]>;
export {};
