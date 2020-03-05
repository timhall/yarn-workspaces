export declare type Location = string;
export interface PackageInfo {
    name: string;
    location: Location;
    workspaceDependencies: Location[];
    mismatchedWorkspaceDependencies: Location[];
}
