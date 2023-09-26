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
    DriveFileChunk: function() {
        return DriveFileChunk;
    },
    getDriveFileBucket: function() {
        return getDriveFileBucket;
    },
    validateFileName: function() {
        return validateFileName;
    },
    packMany: function() {
        return packMany;
    },
    pack: function() {
        return pack;
    }
});
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _drivefolder = require("./drive-folder");
const _user = require("./user");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _getdrivefileurl = require("../misc/get-drive-file-url");
const _logger = require("../db/logger");
const _sanitizeurl = require("../misc/sanitize-url");
const DriveFile = _mongodb1.default.get('driveFiles.files');
DriveFile.createIndex('md5');
DriveFile.createIndex('metadata.uri');
DriveFile.createIndex('metadata.userId');
DriveFile.createIndex('metadata.folderId');
DriveFile.createIndex('metadata._user.host');
const _default = DriveFile;
const DriveFileChunk = _mongodb1.default.get('driveFiles.chunks');
const getDriveFileBucket = async ()=>{
    const db = await (0, _mongodb1.nativeDbConn)();
    const bucket = new _mongodb.GridFSBucket(db, {
        bucketName: 'driveFiles'
    });
    return bucket;
};
function validateFileName(name) {
    return name.trim().length > 0 && name.length <= 200 && name.indexOf('\\') === -1 && name.indexOf('/') === -1 && name.indexOf('..') === -1;
}
const packMany = (files, options)=>{
    return Promise.all(files.map((f)=>pack(f, options)));
};
const pack = async (file, options)=>{
    const opts = Object.assign({
        detail: false,
        self: false
    }, options);
    let _file;
    // Populate the file if 'file' is ID
    if ((0, _isobjectid.default)(file)) {
        _file = await DriveFile.findOne({
            _id: file
        });
    } else if (typeof file === 'string') {
        _file = await DriveFile.findOne({
            _id: new _mongodb.ObjectID(file)
        });
    } else {
        _file = _deepcopy(file);
    }
    // (データベースの欠損などで)ファイルがデータベース上に見つからなかったとき
    if (_file == null) {
        _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: driveFile :: ${file}`);
        return null;
    }
    // rendered target
    const _target = {};
    _target.id = _file._id;
    _target.createdAt = _file.uploadDate;
    _target.name = _file.filename;
    _target.type = _file.contentType;
    _target.animation = _file.animation;
    _target.datasize = _file.length;
    _target.size = _file.length;
    _target.md5 = _file.md5;
    _target.url = (0, _sanitizeurl.sanitizeUrl)((0, _getdrivefileurl.default)(_file));
    _target.thumbnailUrl = (0, _sanitizeurl.sanitizeUrl)((0, _getdrivefileurl.default)(_file, true));
    _target.properties = _file.metadata.properties || {};
    _target.comment = _file.metadata.comment;
    _target.deletedAt = _file.metadata.deletedAt;
    _target.isSensitive = _file.metadata.isSensitive;
    if (opts.detail) {
        _target.folderId = _file.metadata.folderId;
        if (_target.folderId) {
            // Populate folder
            _target.folder = await (0, _drivefolder.pack)(_target.folderId, {
                detail: true
            });
        }
    /*
		if (_target.tags) {
			// Populate tags
			_target.tags = await _target.tags.map(async (tag: any) =>
				await serializeDriveTag(tag)
			);
		}
		*/ }
    if (opts.withUser) {
        // Populate user
        _target.userId = _file.metadata.userId;
        _target.user = await (0, _user.pack)(_file.metadata.userId);
    }
    if (opts.self) {
        _target.webpublicUrl = _target.url;
        _target.url = (0, _sanitizeurl.sanitizeUrl)((0, _getdrivefileurl.getOriginalUrl)(_file));
        _target.attachedNoteIds = _file.metadata.attachedNoteIds;
        _target.attachedMessageIds = _file.metadata.attachedMessageIds;
    }
    return _target;
};

//# sourceMappingURL=drive-file.js.map
