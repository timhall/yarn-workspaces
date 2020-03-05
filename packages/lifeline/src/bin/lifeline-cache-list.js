"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dedent_1 = __importDefault(require("@timhall/dedent"));
const mri_1 = __importDefault(require("mri"));
const __1 = require("../");
const help = dedent_1.default `
  List cached output directories, by fingerprint

  Usage: lifeline cache list
`;
async function default_1(argv) {
    const args = mri_1.default(argv, { alias: { h: 'help' } });
    if (args.help) {
        console.log(help);
        return;
    }
    await __1.list();
}
exports.default = default_1;
