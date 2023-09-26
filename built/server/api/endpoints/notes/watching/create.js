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
const _watch = require("../../../../../services/note/watch");
const _getters = require("../../../common/getters");
const _error = require("../../../error");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定した投稿をウォッチします。',
        'en-US': 'Watch a note.'
    },
    tags: [
        'notes'
    ],
    requireCredential: true,
    kind: [
        'write:account',
        'account-write',
        'account/write'
    ],
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
            id: 'ea0e37a6-90a3-4f58-ba6b-c328ca206fc7'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const note = await (0, _getters.getNote)(ps.noteId, user, true).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    await (0, _watch.default)(user._id, note);
});

//# sourceMappingURL=create.js.map
