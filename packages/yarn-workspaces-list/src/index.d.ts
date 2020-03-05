import { PackageInfo } from './package-info';
interface ListOptions {
    cwd?: string;
}
export declare function listWorkspaces(options?: ListOptions): Promise<PackageInfo[]>;
export {};
