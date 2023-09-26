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
const _define = require("../../../define");
const _delete = require("../../../../../services/note/reaction/delete");
const _getters = require("../../../common/getters");
const _error = require("../../../error");
const meta = {
    desc: {
        'ja-JP': '指定した投稿へのリアクションを取り消します。',
        'en-US': 'Unreact to a note.'
    },
    tags: [
        'reactions',
        'notes'
    ],
    requireCredential: true,
    kind: [
        'write:reactions',
        'reaction-write'
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
                'en-US': 'Target note ID'
            }
        }
    },
    errors: {
        noSuchNote: {
            message: 'No such note.',
            code: 'NO_SUCH_NOTE',
            id: '764d9fce-f9f2-4a0e-92b1-6ceac9a7ad37'
        },
        notReacted: {
            message: 'You are not reacting to that note.',
            code: 'NOT_REACTED',
            id: '92f4426d-4196-4125-aa5b-02943e2ec8fc'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const note = await (0, _getters.getNote)(ps.noteId).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    await (0, _delete.default)(user, note).catch((e)=>{
        if (e.id === '60527ec9-b4cb-4a88-a6bd-32d3ad26817d') throw new _error.ApiError(meta.errors.notReacted);
        throw e;
    });
});

//# sourceMappingURL=delete.js.map
