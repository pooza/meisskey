"use strict";
Object.defineProperty(exports, "importMute", {
    enumerable: true,
    get: function() {
        return importMute;
    }
});
const _mongodb = require("mongodb");
const _logger = require("../../logger");
const _user = require("../../../models/user");
const _drivefile = require("../../../models/drive-file");
const _getdrivefileurl = require("../../../misc/get-drive-file-url");
const _parse = require("../../../misc/acct/parse");
const _resolveuser = require("../../../remote/resolve-user");
const _downloadtextfile = require("../../../misc/download-text-file");
const _converthost = require("../../../misc/convert-host");
const _mute = require("../../../models/mute");
const logger = _logger.queueLogger.createSubLogger('import-mute');
async function importMute(job) {
    logger.info(`Importing mute of ${job.data.user._id} ...`);
    const user = await _user.default.findOne({
        _id: new _mongodb.ObjectID(job.data.user._id.toString())
    });
    if (user == null) {
        return `skip: user not found`;
    }
    const file = await _drivefile.default.findOne({
        _id: new _mongodb.ObjectID(job.data.fileId.toString())
    });
    if (file == null) {
        return `skip: file not found`;
    }
    const url = (0, _getdrivefileurl.getOriginalUrl)(file);
    const csv = await (0, _downloadtextfile.downloadTextFile)(url);
    let linenum = 0;
    for (const line of csv.trim().split('\n')){
        linenum++;
        try {
            const acct = line.split(',')[0].trim();
            const { username, host } = (0, _parse.default)(acct);
            let target = (0, _converthost.isSelfHost)(host) ? await _user.default.findOne({
                host: null,
                usernameLower: username.toLowerCase()
            }) : await _user.default.findOne({
                host: (0, _converthost.toDbHost)(host),
                usernameLower: username.toLowerCase()
            });
            if (host == null && target == null) continue;
            if (target == null) {
                target = await (0, _resolveuser.default)(username, host);
            }
            if (target == null) {
                throw `cannot resolve user: @${username}@${host}`;
            }
            // skip myself
            if (target._id.equals(job.data.user._id)) continue;
            logger.info(`Mute[${linenum}] ${target._id} ...`);
            // Check if already muting
            const exist = await (0, _user.getMute)(user._id, target._id);
            if (exist != null) {
                continue;
            }
            // Create mute
            await _mute.default.insert({
                createdAt: new Date(),
                muterId: user._id,
                muteeId: target._id
            });
        } catch (e) {
            logger.warn(`Error in line:${linenum} ${e}`);
        }
    }
    return `ok: Imported`;
}

//# sourceMappingURL=import-mute.js.map
