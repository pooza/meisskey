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
const _define = require("../../define");
const _notereaction = require("../../../../models/note-reaction");
const _reactionlib = require("../../../../misc/reaction-lib");
const _packemojis = require("../../../../misc/pack-emojis");
const _cafyid = require("../../../../misc/cafy-id");
const _meid7 = require("../../../../misc/id/meid7");
const _note = require("../../../../models/note");
const _mongodb = require("mongodb");
const _array = require("../../../../prelude/array");
const meta = {
    tags: [
        'reactions',
        'users'
    ],
    params: {
        target: {
            validator: _cafy.default.optional.str,
            desc: {
                'ja-JP': 'target',
                'en-US': 'target'
            }
        },
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 1000),
            default: 20,
            desc: {
                'ja-JP': '取得数'
            }
        },
        days: {
            validator: _cafy.default.optional.num.range(1, 30),
            default: 30,
            desc: {
                'ja-JP': '集計期間 (日)'
            }
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
    cacheSec: 3600 * 24
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * ps.days);
    const id = (0, _meid7.genMeid7)(date);
    // よくするリアクション
    const queryReactions = _notereaction.default.aggregate([
        {
            $match: {
                userId: ps.userId,
                createdAt: {
                    $gt: date
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
    // よくされるリアクション
    const queryReacteds = ps.target === 'reactions' ? [] : _note.default.aggregate([
        {
            $match: {
                userId: ps.userId,
                _id: {
                    $gt: new _mongodb.ObjectID(id)
                },
                reactionCounts: {
                    $ne: {}
                }
            }
        },
        {
            $lookup: {
                from: 'noteReactions',
                localField: '_id',
                foreignField: 'noteId',
                as: '_reactions'
            }
        },
        {
            $group: {
                _id: '$_reactions.reaction',
                count: {
                    $sum: 1
                }
            }
        },
        {
            $unwind: '$_id'
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
            $limit: ps.limit * 3
        }
    ]);
    const [xs, ys] = await Promise.all([
        queryReactions,
        queryReacteds
    ]);
    const reactions = xs.map((x)=>{
        return {
            count: x.count,
            reaction: (0, _reactionlib.decodeReaction)(x._id)
        };
    });
    const reacteds = ys.map((x)=>{
        return {
            count: x.count,
            reaction: (0, _reactionlib.decodeReaction)(x._id)
        };
    });
    // なんか被るので多めに取得して再集計
    const n = {};
    for (const r of reacteds){
        if (r.reaction == '__proto__') continue;
        if (n[r.reaction]) {
            n[r.reaction] += r.count;
        } else {
            n[r.reaction] = 0;
        }
    }
    const reacteds2 = Object.keys(n).map((x)=>({
            reaction: x,
            count: n[x]
        })).sort((a, b)=>a.count - b.count).splice(0, ps.limit);
    const reactionNames = (0, _array.unique)((0, _array.concat)([
        xs.map((x)=>x._id),
        ys.map((x)=>x._id)
    ]));
    const emojis = await (0, _packemojis.packEmojis)(reactionNames.map((x)=>(0, _reactionlib.decodeReaction)(x)).map((x)=>x.replace(/:/g, '')), null);
    const r = {
        reactions,
        reacteds: reacteds2,
        emojis
    };
    return r;
});

//# sourceMappingURL=reaction-stats.js.map
