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
const _define = require("../../../define");
const _stream = require("../../../../../services/stream");
const _drivefile = require("../../../../../models/drive-file");
const _error = require("../../../error");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定したドライブのフォルダを削除します。',
        'en-US': 'Delete specified folder of drive.'
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
        }
    },
    errors: {
        noSuchFolder: {
            message: 'No such folder.',
            code: 'NO_SUCH_FOLDER',
            id: '1069098f-c281-440f-b085-f9932edbe091'
        },
        hasChildFilesOrFolders: {
            message: 'This folder has child files or folders.',
            code: 'HAS_CHILD_FILES_OR_FOLDERS',
            id: 'b0fc8a17-963c-405d-bfbc-859a487295e1'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Get folder
    const folder = await _drivefolder.default.findOne({
        _id: ps.folderId,
        userId: user._id
    });
    if (folder === null) {
        throw new _error.ApiError(meta.errors.noSuchFolder);
    }
    const [childFoldersCount, childFilesCount] = await Promise.all([
        _drivefolder.default.count({
            parentId: folder._id
        }),
        _drivefile.default.count({
            'metadata.folderId': folder._id
        })
    ]);
    if (childFoldersCount !== 0 || childFilesCount !== 0) {
        throw new _error.ApiError(meta.errors.hasChildFilesOrFolders);
    }
    await _drivefolder.default.remove({
        _id: folder._id
    });
    // Publish folderCreated event
    (0, _stream.publishDriveStream)(user._id, 'folderDeleted', folder._id);
    return;
});

//# sourceMappingURL=delete.js.map
