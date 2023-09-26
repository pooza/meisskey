"use strict";
Object.defineProperty(exports, "detectUrlMime", {
    enumerable: true,
    get: function() {
        return detectUrlMime;
    }
});
const _createtemp = require("./create-temp");
const _downloadurl = require("./download-url");
const _getfileinfo = require("./get-file-info");
async function detectUrlMime(url) {
    const [path, cleanup] = await (0, _createtemp.createTemp)();
    try {
        await (0, _downloadurl.downloadUrl)(url, path);
        const { mime } = await (0, _getfileinfo.detectTypeWithCheck)(path);
        const md5 = await (0, _getfileinfo.calcHash)(path);
        return {
            mime,
            md5
        };
    } finally{
        cleanup();
    }
}

//# sourceMappingURL=detect-url-mime.js.map
