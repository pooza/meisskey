"use strict";
Object.defineProperty(exports, "exportMute", {
    enumerable: true,
    get: function() {
        return exportMute;
    }
});
const _tmp = require("tmp");
const _fs = require("fs");
const _mongodb = require("mongodb");
const _logger = require("../../logger");
const _addfile = require("../../../services/drive/add-file");
const _user = require("../../../models/user");
const _datefns = require("date-fns");
const _mute = require("../../../models/mute");
const _converthost = require("../../../misc/convert-host");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
const logger = _logger.queueLogger.createSubLogger('export-mute');
async function exportMute(job) {
    logger.info(`Exporting mute of ${job.data.user._id} ...`);
    const user = await _user.default.findOne({
        _id: new _mongodb.ObjectID(job.data.user._id.toString())
    });
    if (user == null) {
        return `skip: user not found`;
    }
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
    let exportedCount = 0;
    let cursor = null;
    // 期限付きのは常にリストに含まない
    const total = await _mute.default.count({
        expiresAt: null,
        muterId: user._id
    });
    while(true){
        const mutes = await _mute.default.find(_object_spread({
            expiresAt: null,
            muterId: user._id
        }, cursor ? {
            _id: {
                $gt: cursor
            }
        } : {}), {
            limit: 100,
            sort: {
                _id: 1
            }
        });
        if (mutes.length === 0) {
            job.progress(100);
            break;
        }
        cursor = mutes[mutes.length - 1]._id;
        for (const mute of mutes){
            const u = await _user.default.findOne({
                _id: mute.muteeId
            }, {
                fields: {
                    username: true,
                    host: true
                }
            });
            if (u == null) continue; // DB blocken ?
            const content = (0, _converthost.getFullApAccount)(u.username, u.host);
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
            exportedCount++;
        }
        job.progress(exportedCount / total);
    }
    stream.end();
    logger.succ(`Exported to: ${path}`);
    const fileName = 'mute-' + (0, _datefns.format)(new Date(), 'yyyy-MM-dd-HH-mm-ss') + '.csv';
    const driveFile = await (0, _addfile.addFile)({
        user,
        path,
        name: fileName,
        force: true
    });
    cleanup();
    return `Exported to: ${driveFile._id}`;
}

//# sourceMappingURL=export-mute.js.map
