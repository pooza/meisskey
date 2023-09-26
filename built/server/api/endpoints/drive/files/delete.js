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
const _drivefile = require("../../../../../models/drive-file");
const _deletefile = require("../../../../../services/drive/delete-file");
const _stream = require("../../../../../services/stream");
const _define = require("../../../define");
const _error = require("../../../error");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': 'ドライブのファイルを削除します。',
        'en-US': 'Delete a file of drive.'
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
        fileId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のファイルID',
                'en-US': 'Target file ID'
            }
        }
    },
    errors: {
        noSuchFile: {
            message: 'No such file.',
            code: 'NO_SUCH_FILE',
            id: '908939ec-e52b-4458-b395-1025195cea58'
        },
        accessDenied: {
            message: 'Access denied.',
            code: 'ACCESS_DENIED',
            id: '5eb8d909-2540-4970-90b8-dd6f86088121'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Fetch file
    const file = await _drivefile.default.findOne({
        _id: ps.fileId
    });
    if (file === null) {
        throw new _error.ApiError(meta.errors.noSuchFile);
    }
    if (!user.isAdmin && !user.isModerator && !file.metadata.userId.equals(user._id)) {
        throw new _error.ApiError(meta.errors.accessDenied);
    }
    // Delete
    await (0, _deletefile.default)(file);
    // Publish fileDeleted event
    (0, _stream.publishDriveStream)(user._id, 'fileDeleted', file._id);
    return;
});

//# sourceMappingURL=delete.js.map
