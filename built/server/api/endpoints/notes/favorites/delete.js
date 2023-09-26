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
        'ja-JP': '指定した投稿のお気に入りを解除します。',
        'en-US': 'Unfavorite a note.'
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
            id: '80848a2c-398f-4343-baa9-df1d57696c56'
        },
        notFavorited: {
            message: 'You have not marked that note a favorite.',
            code: 'NOT_FAVORITED',
            id: 'b625fc69-635e-45e9-86f4-dbefbef35af5'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Get favoritee
    const note = await (0, _getters.getNote)(ps.noteId).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    // if already favorited
    const exist = await _favorite.default.findOne({
        noteId: note._id,
        userId: user._id
    });
    if (exist === null) {
        throw new _error.ApiError(meta.errors.notFavorited);
    }
    // Delete favorite
    await _favorite.default.remove({
        _id: exist._id
    });
    return;
});

//# sourceMappingURL=delete.js.map
