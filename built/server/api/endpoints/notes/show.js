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
const _note = require("../../../../models/note");
const _define = require("../../define");
const _getters = require("../../common/getters");
const _error = require("../../error");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定した投稿を取得します。',
        'en-US': 'Get a note.'
    },
    tags: [
        'notes'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 60,
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
    res: {
        type: 'Note'
    },
    errors: {
        noSuchNote: {
            message: 'No such note.',
            code: 'NO_SUCH_NOTE',
            id: '24fcbfc6-2e37-42b6-8388-c29b3861a08d'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    var _user, _user1;
    const note = await (0, _getters.getNote)(ps.noteId, user).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    return await (0, _note.pack)(note, user, {
        detail: true,
        skipHide: ((_user = user) === null || _user === void 0 ? void 0 : _user.isAdmin) || ((_user1 = user) === null || _user1 === void 0 ? void 0 : _user1.isModerator)
    });
});

//# sourceMappingURL=show.js.map
