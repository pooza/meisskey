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
        'ja-JP': 'ドライブのフォルダを作成します。',
        'en-US': 'Create a folder of drive.'
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
        name: {
            validator: _cafy.default.optional.str.pipe(_drivefolder.isValidFolderName),
            default: 'Untitled',
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
            id: '53326628-a00d-40a6-a3cd-8975105c0f95'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // If the parent folder is specified
    let parent = null;
    if (ps.parentId) {
        // Fetch parent folder
        parent = await _drivefolder.default.findOne({
            _id: ps.parentId,
            userId: user._id
        });
        if (parent === null) {
            throw new _error.ApiError(meta.errors.noSuchFolder);
        }
    }
    // Create folder
    const folder = await _drivefolder.default.insert({
        createdAt: new Date(),
        name: ps.name,
        parentId: parent !== null ? parent._id : null,
        userId: user._id
    });
    const folderObj = await (0, _drivefolder.pack)(folder);
    // Publish folderCreated event
    (0, _stream.publishDriveStream)(user._id, 'folderCreated', folderObj);
    return folderObj;
});

//# sourceMappingURL=create.js.map
