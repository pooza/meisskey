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
    isValidFolderName: function() {
        return isValidFolderName;
    },
    pack: function() {
        return pack;
    }
});
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _drivefile = require("./drive-file");
const DriveFolder = _mongodb1.default.get('driveFolders');
DriveFolder.createIndex('userId');
const _default = DriveFolder;
function isValidFolderName(name) {
    return name.trim().length > 0 && name.length <= 200;
}
const pack = async (folder, options)=>{
    const opts = Object.assign({
        detail: false
    }, options);
    let _folder;
    // Populate the folder if 'folder' is ID
    if ((0, _isobjectid.default)(folder)) {
        _folder = await DriveFolder.findOne({
            _id: folder
        });
    } else if (typeof folder === 'string') {
        _folder = await DriveFolder.findOne({
            _id: new _mongodb.ObjectID(folder)
        });
    } else {
        _folder = _deepcopy(folder);
    }
    // Rename _id to id
    _folder.id = _folder._id;
    delete _folder._id;
    if (opts.detail) {
        const childFoldersCount = await DriveFolder.count({
            parentId: _folder.id
        });
        const childFilesCount = await _drivefile.default.count({
            'metadata.folderId': _folder.id
        });
        _folder.foldersCount = childFoldersCount;
        _folder.filesCount = childFilesCount;
    }
    if (opts.detail && _folder.parentId) {
        // Populate parent folder
        _folder.parent = await pack(_folder.parentId, {
            detail: true
        });
    }
    return _folder;
};

//# sourceMappingURL=drive-folder.js.map
