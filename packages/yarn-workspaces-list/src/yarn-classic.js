"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const find_yarn_workspace_root_1 = __importDefault(require("find-yarn-workspace-root"));
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const exec = util_1.promisify(child_process_1.exec);
const readFile = util_1.promisify(fs_1.readFile);
async function isClassic(options = {}) {
    const { cwd = process.cwd() } = options;
    const { stdout } = await exec(`yarn --version`, { cwd });
    return /1\./.test(stdout);
}
exports.isClassic = isClassic;
async function info(options = {}) {
    const { cwd = process.cwd() } = options;
    const { stdout } = await exec(`yarn --json workspaces info`, { cwd });
    const lines = stdout
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line));
    const byName = JSON.parse(lines[lines.length - 1].data);
    const nameToLocation = (name) => byName[name].location;
    if (!Object.keys(byName).length) {
        return [];
    }
    const packages = [];
    for (const [name, info] of Object.entries(byName)) {
        const { location, workspaceDependencies, mismatchedWorkspaceDependencies } = info;
        packages.push({
            name,
            location,
            workspaceDependencies: workspaceDependencies.map(nameToLocation),
            mismatchedWorkspaceDependencies: mismatchedWorkspaceDependencies.map(nameToLocation)
        });
    }
    // `yarn workspaces list` includes workspace root as first item,
    // find the root package.json from one of the found packages
    const workspaceRootPath = find_yarn_workspace_root_1.default(cwd);
    if (workspaceRootPath) {
        const workspaceRoot = await readJson(path_1.join(workspaceRootPath, 'package.json'));
        const workspaceDependencies = Object.keys(workspaceRoot.dependencies || {})
            .concat(Object.keys(workspaceRoot.devDependencies || {}))
            .filter(name => byName.hasOwnProperty(name))
            .map(nameToLocation);
        // TODO Clarify difference between two types of workspace dependencies
        //
        // From example yarn v2 spike:
        // "a": "*" -> { ... "mismatchedWorkspaceDependencies": ["a@*"] }
        // "a": "workspace:*" -> { ... "workspaceDependencies": ["packages/a"] }
        const mismatchedWorkspaceDependencies = [];
        packages.unshift({
            name: workspaceRoot.name,
            location: '.',
            workspaceDependencies,
            mismatchedWorkspaceDependencies
        });
    }
    return packages;
}
exports.info = info;
async function readJson(path) {
    const data = await readFile(path, 'utf8');
    return JSON.parse(data);
}
