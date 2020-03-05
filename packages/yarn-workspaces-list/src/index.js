"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yarn_berry_1 = require("./yarn-berry");
const yarn_classic_1 = require("./yarn-classic");
async function listWorkspaces(options = {}) {
    return (await yarn_classic_1.isClassic(options)) ? await yarn_classic_1.info(options) : await yarn_berry_1.list(options);
}
exports.listWorkspaces = listWorkspaces;
