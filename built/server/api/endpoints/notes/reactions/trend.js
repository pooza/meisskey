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
const _define = require("../../../define");
const _notereaction = require("../../../../../models/note-reaction");
const _user = require("../../../../../models/user");
const _reactionlib = require("../../../../../misc/reaction-lib");
const _packemojis = require("../../../../../misc/pack-emojis");
const meta = {
    tags: [
        'reactions',
        'notes'
    ],
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 1000),
            default: 20
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0,
            desc: {
                'ja-JP': 'オフセット'
            }
        }
    },
    requireCredential: false,
    allowGet: true,
    cacheSec: 600
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const users = await _user.default.find({
        host: null,
        isDeleted: {
            $ne: true
        },
        isSuspended: {
            $ne: true
        }
    }, {
        fields: {
            _id: true
        }
    });
    const xs = await _notereaction.default.aggregate([
        {
            $match: {
                userId: {
                    $in: users.map((x)=>x._id)
                },
                createdAt: {
                    $gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
                }
            }
        },
        {
            $group: {
                _id: '$reaction',
                count: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                count: -1
            }
        },
        {
            $skip: ps.offset
        },
        {
            $limit: ps.limit
        }
    ]);
    const reactions = xs.map((x)=>{
        return {
            count: x.count,
            reaction: (0, _reactionlib.decodeReaction)(x._id)
        };
    });
    const emojis = await (0, _packemojis.packEmojis)(xs.map((x)=>(0, _reactionlib.decodeReaction)(x._id)).map((x)=>x.replace(/:/g, '')), null);
    const r = {
        reactions,
        emojis
    };
    return r;
});

//# sourceMappingURL=trend.js.map
