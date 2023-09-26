"use strict";
Object.defineProperty(exports, "uploadFromUrl", {
    enumerable: true,
    get: function() {
        return uploadFromUrl;
    }
});
const _drivefile = require("../../models/drive-file");
const _addfile = require("./add-file");
const _logger = require("./logger");
const _createtemp = require("../../misc/create-temp");
const _downloadurl = require("../../misc/download-url");
const logger = _logger.driveLogger.createSubLogger('downloader');
async function uploadFromUrl({ url, user, folderId = null, uri = null, sensitive = false, force = false, isLink = false }) {
    // Create temp file
    const [path, cleanup] = await (0, _createtemp.createTemp)();
    // write content at URL to temp file
    await (0, _downloadurl.downloadUrl)(url, path);
    let name = null;
    name = new URL(url).pathname.split('/').pop() || null;
    if (name && !(0, _drivefile.validateFileName)(name)) {
        name = null;
    }
    let driveFile;
    let error;
    try {
        driveFile = await (0, _addfile.addFile)({
            user,
            path,
            name,
            folderId,
            force,
            isLink,
            url,
            uri,
            sensitive
        });
        logger.succ(`Got: ${driveFile._id}`);
    } catch (e) {
        error = e;
        logger.error(`Failed to create drive file: ${e}`, {
            url: url,
            e: e
        });
    }
    // clean-up
    cleanup();
    if (error) {
        throw error;
    } else {
        return driveFile;
    }
}

//# sourceMappingURL=upload-from-url.js.map
