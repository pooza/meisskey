// npx ts-node --swc src/tools/dev/gen-api-endpoints.ts
"use strict";
const _path = require("path");
const _glob = require("glob");
const _fs = require("fs");
const rootDir = (0, _path.resolve)(__dirname, '../../../');
const endpointsDir = (0, _path.resolve)(rootDir, 'src/server/api/endpoints');
const endpointsFile = (0, _path.resolve)(rootDir, 'src/server/api/files.ts');
const files = _glob.sync('**/*.ts', {
    cwd: endpointsDir
}).map((x)=>x.replace(/[.]ts$/, ''));
console.log(`Saving ... ${endpointsFile}`);
(0, _fs.writeFileSync)(endpointsFile, `/* eslint-disable quotes */\nexport default ${JSON.stringify(files, null, 2)};\n`);

//# sourceMappingURL=gen-api-endpoints.js.map
