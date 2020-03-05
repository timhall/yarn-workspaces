"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("@timhall/cli");
const dedent_1 = __importDefault(require("@timhall/dedent"));
const mri_1 = __importDefault(require("mri"));
const __1 = require("..");
const help = dedent_1.default `
  List all available workspaces as NDJSON (https://github.com/ndjson/ndjson-spec).

  Usage: workspaces-list
`;
cli_1.run(async () => {
    const args = mri_1.default(process.argv.slice(2), { alias: { h: 'help' } });
    if (args.help) {
        console.log(help);
        return;
    }
    const list = await __1.listWorkspaces();
    for (const pkg of list) {
        console.log(JSON.stringify(pkg));
    }
});
