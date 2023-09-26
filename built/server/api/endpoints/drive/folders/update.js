"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    }
});
const _cafy = require("cafy");
const _cafyid = require("../../../../../misc/cafy-id");
const _drivefolder = require("../../../../../models/drive-folder");
const _stream = require("../../../../../services/stream");
const _define = require("../../../define");
const _error = require("../../../error");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定したドライブのフォルダの情報を更新します。',
        'en-US': 'Update specified folder of drive.'
    },
    tags: [
        'drive'
    ],
    requireCredential: true,
    kind: [
        'write:drive',
        'drive-write'
    ],
    params: {
        folderId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のフォルダID',
                'en-US': 'Target folder ID'
            }
        },
        name: {
            validator: _cafy.default.optional.str.pipe(_drivefolder.isValidFolderName),
            desc: {
                'ja-JP': 'フォルダ名',
                'en-US': 'Folder name'
            }
        },
        parentId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '親フォルダID',
                'en-US': 'Parent folder ID'
            }
        }
    },
    errors: {
        noSuchFolder: {
            message: 'No such folder.',
            code: 'NO_SUCH_FOLDER',
            id: 'f7974dac-2c0d-4a27-926e-23583b28e98e'
        },
        noSuchParentFolder: {
            message: 'No such parent folder.',
            code: 'NO_SUCH_PARENT_FOLDER',
            id: 'ce104e3a-faaf-49d5-b459-10ff0cbbcaa1'
        },
        recursiveNesting: {
            message: 'It can not be structured like nesting folders recursively.',
            code: 'NO_SUCH_PARENT_FOLDER',
            id: 'ce104e3a-faaf-49d5-b459-10ff0cbbcaa1'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Fetch folder
    const folder = await _drivefolder.default.findOne({
        _id: ps.folderId,
        userId: user._id
    });
    if (folder === null) {
        throw new _error.ApiError(meta.errors.noSuchFolder);
    }
    if (ps.name) folder.name = ps.name;
    if (ps.parentId !== undefined) {
        if (ps.parentId.equals(folder._id)) {
            throw new _error.ApiError(meta.errors.recursiveNesting);
        } else if (ps.parentId === null) {
            folder.parentId = null;
        } else {
            // Get parent folder
            const parent = await _drivefolder.default.findOne({
                _id: ps.parentId,
                userId: user._id
            });
            if (parent === null) {
                throw new _error.ApiError(meta.errors.noSuchParentFolder);
            }
            // Check if the circular reference will occur
            async function checkCircle(folderId) {
                // Fetch folder
                const folder2 = await _drivefolder.default.findOne({
                    _id: folderId
                }, {
                    _id: true,
                    parentId: true
                });
                if (folder2._id.equals(folder._id)) {
                    return true;
                } else if (folder2.parentId) {
                    return await checkCircle(folder2.parentId);
                } else {
                    return false;
                }
            }
            if (parent.parentId !== null) {
                if (await checkCircle(parent.parentId)) {
                    throw new _error.ApiError(meta.errors.recursiveNesting);
                }
            }
            folder.parentId = parent._id;
        }
    }
    // Update
    _drivefolder.default.update(folder._id, {
        $set: {
            name: folder.name,
            parentId: folder.parentId
        }
    });
    const folderObj = await (0, _drivefolder.pack)(folder);
    // Publish folderUpdated event
    (0, _stream.publishDriveStream)(user._id, 'folderUpdated', folderObj);
    return folderObj;
});

//# sourceMappingURL=update.js.map
