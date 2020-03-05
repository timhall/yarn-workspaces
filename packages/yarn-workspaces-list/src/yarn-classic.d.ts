import { PackageInfo } from './package-info';
interface CliOptions {
    cwd?: string;
}
export declare function isClassic(options?: CliOptions): Promise<boolean>;
export declare function info(options?: CliOptions): Promise<PackageInfo[]>;
export {};
