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
const _define = require("../../define");
const _favorite = require("../../../../models/favorite");
const _notewatching = require("../../../../models/note-watching");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定した投稿の状態を取得します。',
        'en-US': 'Get state of a note.'
    },
    tags: [
        'notes'
    ],
    requireCredential: true,
    params: {
        noteId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象の投稿のID',
                'en-US': 'Target note ID.'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const [favorite, watching] = await Promise.all([
        _favorite.default.count({
            userId: user._id,
            noteId: ps.noteId
        }, {
            limit: 1
        }),
        _notewatching.default.count({
            userId: user._id,
            noteId: ps.noteId
        }, {
            limit: 1
        })
    ]);
    return {
        isFavorited: favorite !== 0,
        isWatching: watching !== 0
    };
});

//# sourceMappingURL=state.js.map
