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
const _error = require("../../error");
const _getters = require("../../common/getters");
const meta = {
    desc: {
        'ja-JP': '指定した投稿の文脈を取得します。',
        'en-US': 'Show conversation of a note.'
    },
    tags: [
        'notes'
    ],
    requireCredential: false,
    params: {
        noteId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象の投稿のID',
                'en-US': 'Target note ID'
            }
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'Note'
        }
    },
    errors: {
        noSuchNote: {
            message: 'No such note.',
            code: 'NO_SUCH_NOTE',
            id: 'e1035875-9551-45ec-afa8-1ded1fcb53c8'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const note = await (0, _getters.getNote)(ps.noteId, user, true).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    const conversation = [];
    let i = 0;
    async function get(id) {
        i++;
        const p = await _note.default.findOne({
            _id: id
        });
        if (i > ps.offset) {
            conversation.push(p);
        }
        if (conversation.length == ps.limit) {
            return;
        }
        if (p.replyId) {
            await get(p.replyId);
        }
    }
    if (note.replyId) {
        await get(note.replyId);
    }
    return await (0, _note.packMany)(conversation, user);
});

//# sourceMappingURL=conversation.js.map
