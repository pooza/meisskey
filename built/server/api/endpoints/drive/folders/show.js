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
const _error = require("../../../error");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定したドライブのフォルダの情報を取得します。',
        'en-US': 'Get specified folder of drive.'
    },
    tags: [
        'drive'
    ],
    requireCredential: true,
    kind: [
        'read:drive',
        'drive-read'
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
    res: {
        type: 'DriveFolder'
    },
    errors: {
        noSuchFolder: {
            message: 'No such folder.',
            code: 'NO_SUCH_FOLDER',
            id: 'd74ab9eb-bb09-4bba-bf24-fb58f761e1e9'
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
    return await (0, _drivefolder.pack)(folder, {
        detail: true
    });
});

//# sourceMappingURL=show.js.map
