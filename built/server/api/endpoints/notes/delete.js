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
const _cafyid = require("../../../../misc/cafy-id");
const _delete = require("../../../../services/note/delete");
const _user = require("../../../../models/user");
const _define = require("../../define");
const _getters = require("../../common/getters");
const _error = require("../../error");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定した投稿を削除します。',
        'en-US': 'Delete a note.'
    },
    tags: [
        'notes'
    ],
    requireCredential: true,
    kind: [
        'write:notes',
        'note-write'
    ],
    limit: {
        minInterval: 500
    },
    params: {
        noteId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象の投稿のID',
                'en-US': 'Target note ID.'
            }
        }
    },
    errors: {
        noSuchNote: {
            message: 'No such note.',
            code: 'NO_SUCH_NOTE',
            id: '490be23f-8c1f-4796-819f-94cb4f9d1630'
        },
        accessDenied: {
            message: 'Access denied.',
            code: 'ACCESS_DENIED',
            id: 'fe8d7103-0ea8-4ec3-814d-f8b401dc69e9'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const note = await (0, _getters.getNote)(ps.noteId).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    if (!user.isAdmin && !user.isModerator && !note.userId.equals(user._id)) {
        throw new _error.ApiError(meta.errors.accessDenied);
    }
    await (0, _delete.default)(await _user.default.findOne({
        _id: note.userId
    }), note);
});

//# sourceMappingURL=delete.js.map
