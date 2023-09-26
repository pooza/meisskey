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
    DriveFileWebpublicChunk: function() {
        return DriveFileWebpublicChunk;
    },
    getDriveFileWebpublicBucket: function() {
        return getDriveFileWebpublicBucket;
    }
});
const _mongodb = require("mongodb");
const _mongodb1 = require("../db/mongodb");
const DriveFileWebpublic = _mongodb1.default.get('driveFileWebpublics.files');
DriveFileWebpublic.createIndex('metadata.originalId', {
    sparse: true,
    unique: true
});
const _default = DriveFileWebpublic;
const DriveFileWebpublicChunk = _mongodb1.default.get('driveFileWebpublics.chunks');
const getDriveFileWebpublicBucket = async ()=>{
    const db = await (0, _mongodb1.nativeDbConn)();
    const bucket = new _mongodb.GridFSBucket(db, {
        bucketName: 'driveFileWebpublics'
    });
    return bucket;
};

//# sourceMappingURL=drive-file-webpublic.js.map
