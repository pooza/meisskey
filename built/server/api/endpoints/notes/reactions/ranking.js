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
const meta = {
    tags: [
        'reactions',
        'notes'
    ],
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 1000),
            default: 10,
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
    cacheSec: 600
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    /*
	const users = await User.find({
		host: null,
		isDeleted: { $ne: true },
		isSuspended: { $ne: true },
	}, {
		fields: {
			_id: true
		}
	});
	*/ const xs = await _notereaction.default.aggregate([
        {
            $match: {
                //serId: { $in: users.map(x => x._id) },
                createdAt: {
                    $gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * ps.days)
                }
            }
        },
        {
            $group: {
                _id: '$userId',
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
    const global = await Promise.all(xs.map(async (x)=>{
        return {
            userId: x._id,
            count: x.count,
            user: await (0, _user.pack)(x._id, null)
        };
    }));
    const r = {
        global
    };
    return r;
});

//# sourceMappingURL=ranking.js.map
