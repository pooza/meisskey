"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    DriveFileThumbnailChunk: function() {
        return DriveFileThumbnailChunk;
    },
    getDriveFileThumbnailBucket: function() {
        return getDriveFileThumbnailBucket;
    }
});
const _mongodb = require("mongodb");
const _mongodb1 = require("../db/mongodb");
const DriveFileThumbnail = _mongodb1.default.get('driveFileThumbnails.files');
DriveFileThumbnail.createIndex('metadata.originalId', {
    sparse: true,
    unique: true
});
const _default = DriveFileThumbnail;
const DriveFileThumbnailChunk = _mongodb1.default.get('driveFileThumbnails.chunks');
const getDriveFileThumbnailBucket = async ()=>{
    const db = await (0, _mongodb1.nativeDbConn)();
    const bucket = new _mongodb.GridFSBucket(db, {
        bucketName: 'driveFileThumbnails'
    });
    return bucket;
};

//# sourceMappingURL=drive-file-thumbnail.js.map
