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
    desc: {
        'ja-JP': '指定した投稿のRenote一覧を取得します。',
        'en-US': 'Show a renotes of a note.'
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
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
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
            id: '12908022-2e21-46cd-ba6a-3edaf6093f46'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const note = await (0, _getters.getNote)(ps.noteId, user, true).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    const sort = {
        _id: -1
    };
    const query = {
        renoteId: note._id
    };
    if (ps.sinceId) {
        sort._id = 1;
        query._id = {
            $gt: ps.sinceId
        };
    } else if (ps.untilId) {
        query._id = {
            $lt: ps.untilId
        };
    }
    const renotes = await _note.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    return await (0, _note.packMany)(renotes, user);
});

//# sourceMappingURL=renotes.js.map
