"use strict";
Object.defineProperty(exports, "downloadTextFile", {
    enumerable: true,
    get: function() {
        return downloadTextFile;
    }
});
const _fs = require("fs");
const _util = require("util");
const _logger = require("../services/logger");
const _createtemp = require("./create-temp");
const _downloadurl = require("./download-url");
const logger = new _logger.default('download-text-file');
async function downloadTextFile(url) {
    // Create temp file
    const [path, cleanup] = await (0, _createtemp.createTemp)();
    logger.info(`Temp file is ${path}`);
    try {
        // write content at URL to temp file
        await (0, _downloadurl.downloadUrl)(url, path);
        const text = await _util.promisify(_fs.readFile)(path, 'utf8');
        return text;
    } finally{
        cleanup();
    }
}

//# sourceMappingURL=download-text-file.js.map
