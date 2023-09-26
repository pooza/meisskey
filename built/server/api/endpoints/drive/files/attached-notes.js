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
const _define = require("../../../define");
const _note = require("../../../../../models/note");
const _error = require("../../../error");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定したドライブのファイルが添付されている投稿一覧を取得します。',
        'en-US': 'Get the notes that specified file of drive attached.'
    },
    tags: [
        'drive',
        'notes'
    ],
    requireCredential: true,
    kind: [
        'read:drive',
        'drive-read'
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
    res: {
        type: 'array',
        items: {
            type: 'Note'
        }
    },
    errors: {
        noSuchFile: {
            message: 'No such file.',
            code: 'NO_SUCH_FILE',
            id: 'c118ece3-2e4b-4296-99d1-51756e32d232'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    var _file_metadata;
    // Fetch file
    const file = await _drivefile.default.findOne({
        _id: ps.fileId,
        'metadata.userId': user._id,
        'metadata.deletedAt': {
            $exists: false
        }
    });
    if (file == null) {
        throw new _error.ApiError(meta.errors.noSuchFile);
    }
    return await (0, _note.packMany)(((_file_metadata = file.metadata) === null || _file_metadata === void 0 ? void 0 : _file_metadata.attachedNoteIds) || [], user, {
        detail: true
    });
});

//# sourceMappingURL=attached-notes.js.map
