"use strict";
Object.defineProperty(exports, "exportUserLists", {
    enumerable: true,
    get: function() {
        return exportUserLists;
    }
});
const _tmp = require("tmp");
const _fs = require("fs");
const _mongodb = require("mongodb");
const _logger = require("../../logger");
const _addfile = require("../../../services/drive/add-file");
const _user = require("../../../models/user");
const _datefns = require("date-fns");
const _userlist = require("../../../models/user-list");
const _converthost = require("../../../misc/convert-host");
const logger = _logger.queueLogger.createSubLogger('export-user-lists');
async function exportUserLists(job) {
    logger.info(`Exporting user lists of ${job.data.user._id} ...`);
    const user = await _user.default.findOne({
        _id: new _mongodb.ObjectID(job.data.user._id.toString())
    });
    if (user == null) {
        return `skip: user not found`;
    }
    const lists = await _userlist.default.find({
        userId: user._id
    });
    // Create temp file
    const [path, cleanup] = await new Promise((res, rej)=>{
        _tmp.file((e, path, fd, cleanup)=>{
            if (e) return rej(e);
            res([
                path,
                cleanup
            ]);
        });
    });
    logger.info(`Temp file is ${path}`);
    const stream = _fs.createWriteStream(path, {
        flags: 'a'
    });
    for (const list of lists){
        const users = await _user.default.find({
            _id: {
                $in: list.userIds
            }
        }, {
            fields: {
                username: true,
                host: true
            }
        });
        for (const u of users){
            const acct = (0, _converthost.getFullApAccount)(u.username, u.host);
            const content = `${list.title},${acct}`;
            await new Promise((res, rej)=>{
                stream.write(content + '\n', (err)=>{
                    if (err) {
                        logger.error(err);
                        rej(err);
                    } else {
                        res();
                    }
                });
            });
        }
    }
    stream.end();
    logger.succ(`Exported to: ${path}`);
    const fileName = 'user-lists-' + (0, _datefns.format)(new Date(), 'yyyy-MM-dd-HH-mm-ss') + '.csv';
    const driveFile = await (0, _addfile.addFile)({
        user,
        path,
        name: fileName,
        force: true
    });
    cleanup();
    return `Exported to: ${driveFile._id}`;
}

//# sourceMappingURL=export-user-lists.js.map
