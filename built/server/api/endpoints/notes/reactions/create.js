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
const _create = require("../../../../../services/note/reaction/create");
const _define = require("../../../define");
const _getters = require("../../../common/getters");
const _error = require("../../../error");
const _notereaction = require("../../../../../models/note-reaction");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定した投稿にリアクションします。',
        'en-US': 'React to a note.'
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
    params: {
        noteId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象の投稿'
            }
        },
        reaction: {
            validator: _cafy.default.str,
            desc: {
                'ja-JP': 'リアクションの種類'
            }
        },
        dislike: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'きらい'
            }
        },
        _res: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': '_res'
            }
        }
    },
    errors: {
        noSuchNote: {
            message: 'No such note.',
            code: 'NO_SUCH_NOTE',
            id: '033d0620-5bfe-4027-965d-980b0c85a3ea'
        },
        isMyNote: {
            message: 'You can not react to your own notes.',
            code: 'IS_MY_NOTE',
            id: '7eeb9714-b047-43b5-b559-7b1b72810f53'
        },
        alreadyReacted: {
            message: 'You are already reacting to that note.',
            code: 'ALREADY_REACTED',
            id: '71efcf98-86d6-4e2b-b2ad-9d032369366b'
        },
        youHaveBeenBlocked: {
            message: 'You cannot react this note because you have been blocked by this user.',
            code: 'YOU_HAVE_BEEN_BLOCKED',
            id: '20ef5475-9f38-4e4c-bd33-de6d979498ec'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const note = await (0, _getters.getNote)(ps.noteId, user, true).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    const reaction = await (0, _create.default)(user, note, ps.reaction, ps.dislike).catch((e)=>{
        if (e.id === '2d8e7297-1873-4c00-8404-792c68d7bef0') throw new _error.ApiError(meta.errors.isMyNote);
        if (e.id === '51c42bb4-931a-456b-bff7-e5a8a70dd298') throw new _error.ApiError(meta.errors.alreadyReacted);
        if (e.id === 'e70412a4-7197-4726-8e74-f3e0deb92aa7') throw new _error.ApiError(meta.errors.youHaveBeenBlocked);
        throw e;
    });
    if (ps._res) {
        return await (0, _notereaction.pack)(reaction);
    } else {
        return;
    }
});

//# sourceMappingURL=create.js.map
