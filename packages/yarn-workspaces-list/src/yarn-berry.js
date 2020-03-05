"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const exec = util_1.promisify(child_process_1.exec);
async function isBerry(options = {}) {
    const { cwd = process.cwd() } = options;
    const { stdout } = await exec(`yarn --version`, { cwd });
    return /2\./.test(stdout);
}
exports.isBerry = isBerry;
async function list(options = {}) {
    const { cwd = process.cwd() } = options;
    const { stdout } = await exec(`yarn workspaces list --verbose --json`, { cwd });
    const list = stdout
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line));
    return list;
}
exports.list = list;
