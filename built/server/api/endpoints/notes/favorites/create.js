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
const _favorite = require("../../../../../models/favorite");
const _define = require("../../../define");
const _error = require("../../../error");
const _getters = require("../../../common/getters");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定した投稿をお気に入りに登録します。',
        'en-US': 'Favorite a note.'
    },
    tags: [
        'favorites'
    ],
    requireCredential: true,
    kind: [
        'write:favorites',
        'favorite-write'
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
            id: '6dd26674-e060-4816-909a-45ba3f4da458'
        },
        alreadyFavorited: {
            message: 'The note has already been marked as a favorite.',
            code: 'ALREADY_FAVORITED',
            id: 'a402c12b-34dd-41d2-97d8-4d2ffd96a1a6'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Get favoritee
    const note = await (0, _getters.getNote)(ps.noteId, user, true).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    // if already favorited
    const exist = await _favorite.default.findOne({
        noteId: note._id,
        userId: user._id
    });
    if (exist !== null) {
        throw new _error.ApiError(meta.errors.alreadyFavorited);
    }
    // Create favorite
    await _favorite.default.insert({
        createdAt: new Date(),
        noteId: note._id,
        userId: user._id
    });
    return;
});

//# sourceMappingURL=create.js.map
