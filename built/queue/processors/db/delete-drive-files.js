"use strict";
Object.defineProperty(exports, "deleteDriveFiles", {
    enumerable: true,
    get: function() {
        return deleteDriveFiles;
    }
});
const _mongodb = require("mongodb");
const _logger = require("../../logger");
const _user = require("../../../models/user");
const _drivefile = require("../../../models/drive-file");
const _deletefile = require("../../../services/drive/delete-file");
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
const logger = _logger.queueLogger.createSubLogger('delete-drive-files');
async function deleteDriveFiles(job) {
    logger.info(`Deleting drive files of ${job.data.user._id} ...`);
    const user = await _user.default.findOne({
        _id: new _mongodb.ObjectID(job.data.user._id.toString())
    });
    if (user == null) {
        return `skip: user not found`;
    }
    let deletedCount = 0;
    let cursor = null;
    const total = await _drivefile.default.count({
        'metadata.userId': user._id
    });
    while(true){
        const files = await _drivefile.default.find(_object_spread({
            'metadata.userId': user._id
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
        if (files.length === 0) {
            job.progress(100);
            break;
        }
        cursor = files[files.length - 1]._id;
        for (const file of files){
            await (0, _deletefile.default)(file).catch((e)=>{
                logger.warn(`Delete failed: ${user._id}: ${file._id} ${e}`);
            }).then(()=>{
                logger.info(`Deleted: ${user._id}: ${file._id}`);
            });
            deletedCount++;
        }
        job.progress(deletedCount / total);
    }
    return `ok: All drive files (${deletedCount}) of ${user._id} has been deleted.`;
}

//# sourceMappingURL=delete-drive-files.js.map
