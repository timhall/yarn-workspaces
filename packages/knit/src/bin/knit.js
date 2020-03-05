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
const { name, version } = require('../../package.json');
const subcommands = cli_1.commands({
    dependencies: {
        load: () => Promise.resolve().then(() => __importStar(require('./knit-dependencies'))),
        description: 'Build workspace dependencies for the current package'
    },
    workspace: {
        load: () => Promise.resolve().then(() => __importStar(require('./knit-workspace'))),
        description: 'Build workspace dependencies for the entire workspace'
    }
});
const knit = cli_1.cli({ name, version, subcommands });
cli_1.run(name, async () => {
    const argv = process.argv.slice(2);
    await knit.run(argv);
});
