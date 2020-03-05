"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("@timhall/cli");
const subcommands = cli_1.commands({
    add: {
        load: () => Promise.resolve().then(() => __importStar(require('./lifeline-cache-add'))),
        description: 'Add current output to cache for current fingerprint'
    },
    list: {
        load: () => Promise.resolve().then(() => __importStar(require('./lifeline-cache-list'))),
        description: 'List cached output directories, by fingerprint'
    },
    show: {
        load: () => Promise.resolve().then(() => __importStar(require('./lifeline-cache-show'))),
        description: 'Show cached output directory for fingerprint'
    },
    clear: {
        load: () => Promise.resolve().then(() => __importStar(require('./lifeline-cache-clear'))),
        description: 'Clear all cached directories'
    }
});
const cache = cli_1.cli({ name: 'lifeline cache', subcommands });
async function run(argv) {
    await cache.run(argv);
}
exports.default = run;
