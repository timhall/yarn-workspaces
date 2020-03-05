"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("@timhall/cli");
const dedent_1 = __importDefault(require("@timhall/dedent"));
const mri_1 = __importDefault(require("mri"));
const help = dedent_1.default `
  Usage: workspaces-foreach
`;
cli_1.run(async () => {
    const args = mri_1.default(process.argv.slice(2), { alias: { h: 'help' } });
    if (args.help) {
        console.log(help);
        return;
    }
});
