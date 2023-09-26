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
const _notereaction = require("../../../../models/note-reaction");
const _define = require("../../define");
const _getters = require("../../common/getters");
const _error = require("../../error");
const _reactionlib = require("../../../../misc/reaction-lib");
const _gethideusers = require("../../common/get-hide-users");
const meta = {
    desc: {
        'ja-JP': '指定した投稿のリアクション一覧を取得します。',
        'en-US': 'Show reactions of a note.'
    },
    tags: [
        'notes',
        'reactions'
    ],
    requireCredential: false,
    params: {
        noteId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象の投稿のID',
                'en-US': 'The ID of the target note'
            }
        },
        type: {
            validator: _cafy.default.optional.nullable.str
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        offset: {
            validator: _cafy.default.optional.num,
            default: 0
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
            type: 'Reaction'
        }
    },
    errors: {
        noSuchNote: {
            message: 'No such note.',
            code: 'NO_SUCH_NOTE',
            id: '263fff3d-d0e1-4af4-bea7-8408059b451a'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const note = await (0, _getters.getNote)(ps.noteId, user, true).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    const query = {
        noteId: note._id
    };
    const sort = {
        _id: -1
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
    if (ps.type) {
        const type = await (0, _reactionlib.toDbReactionNoResolve)(ps.type);
        //console.log(`${ps.type} => ${type}`);
        query.reaction = type;
        if (query.reaction === '🍮' || query.reaction === 'pudding') {
            query.reaction = {
                $in: [
                    '🍮',
                    'pudding'
                ]
            };
        }
    }
    if (user) {
        const hideUserIds = await (0, _gethideusers.getHideUserIdsById)(user._id, true, true);
        query.userId = {
            $nin: hideUserIds
        };
    }
    const reactions = await _notereaction.default.find(query, {
        limit: ps.limit,
        skip: ps.offset,
        sort: sort
    });
    return await Promise.all(reactions.map((reaction)=>(0, _notereaction.pack)(reaction, user)));
});

//# sourceMappingURL=reactions.js.map
