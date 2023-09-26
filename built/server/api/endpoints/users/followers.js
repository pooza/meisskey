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
const _user = require("../../../../models/user");
const _following = require("../../../../models/following");
const _getfriends = require("../../common/get-friends");
const _define = require("../../define");
const _error = require("../../error");
const _canshowfollows = require("../../common/can-show-follows");
const _packutils = require("../../../../misc/pack-utils");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーのフォロワー一覧を取得します。',
        'en-US': 'Get followers of a user.'
    },
    tags: [
        'users'
    ],
    requireCredential: false,
    params: {
        userId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        username: {
            validator: _cafy.default.optional.str
        },
        host: {
            validator: _cafy.default.optional.nullable.str
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        cursor: {
            validator: _cafy.default.optional.type(_cafyid.default),
            default: null,
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '指定すると、このIDより過去のレコードを取得します。'
            }
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '指定すると、このIDより未来のレコードを取得します。またソート順が逆になります。'
            }
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '指定すると、このIDより過去のレコードを取得します。'
            }
        },
        v11compatible: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': '指定すると、Entiryがv11互換に変わります。'
            }
        },
        iknow: {
            validator: _cafy.default.optional.bool,
            default: false
        },
        diff: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': '相互フォローは除く'
            }
        }
    },
    res: {
        type: 'object',
        properties: {
            users: {
                type: 'array',
                items: {
                    type: 'User'
                }
            },
            next: {
                type: 'string',
                format: 'id',
                nullable: true
            }
        }
    },
    errors: {
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '27fa5435-88ab-43de-9360-387de88727cd'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const q = ps.userId != null ? {
        _id: ps.userId
    } : {
        usernameLower: ps.username.toLowerCase(),
        host: ps.host
    };
    const user = await _user.default.findOne(q);
    if (user == null) {
        throw new _error.ApiError(meta.errors.noSuchUser);
    }
    if (!await (0, _canshowfollows.canShowFollows)(me, user)) {
        return {
            users: [],
            next: null
        };
    }
    const query = {
        followeeId: user._id
    };
    // ログインしていてかつ iknow フラグがあるとき
    if (me && ps.iknow) {
        // Get my friends
        const myFriends = await (0, _getfriends.getFriendIds)(me._id);
        query.followerId = {
            $in: myFriends
        };
    }
    if (ps.diff && me && me._id.equals(user._id)) {
        const followingIds = await (0, _getfriends.getFriendIds)(user._id);
        query.followerId = {
            $nin: followingIds
        };
    }
    // TODO: iknow && diff
    const sort = {
        _id: -1
    };
    // カーソルが指定されている場合
    if (ps.cursor) {
        query._id = {
            $lt: ps.cursor
        };
    // v11互換パラメーター
    } else if (ps.sinceId) {
        sort._id = 1;
        query._id = {
            $gt: ps.sinceId
        };
    } else if (ps.untilId) {
        query._id = {
            $lt: ps.untilId
        };
    }
    // Get followers
    const following = await _following.default.aggregate([
        {
            $match: query
        },
        {
            $sort: {
                _id: -1
            }
        },
        {
            $limit: ps.limit + (ps.v11compatible ? 0 : 1)
        },
        {
            // join User
            $lookup: {
                from: 'users',
                localField: 'followerId',
                foreignField: '_id',
                as: '_user'
            }
        },
        {
            $unwind: '$_user'
        }
    ]);
    if (!ps.v11compatible) {
        // 「次のページ」があるかどうか
        const inStock = following.length === ps.limit + 1;
        if (inStock) {
            following.pop();
        }
        const users = await Promise.all(following.map((f)=>(0, _user.pack)(f._user, me, {
                detail: true
            })));
        return {
            users: users,
            next: inStock ? following[following.length - 1]._id : null
        };
    } else {
        const packFollower = async (x, me)=>{
            return {
                id: (0, _packutils.toOidString)(x._id),
                createdAt: (0, _packutils.toISODateOrNull)(x.createdAt),
                followeeId: (0, _packutils.toOidString)(x.followeeId),
                followerId: (0, _packutils.toOidString)(x.followerId),
                follower: await (0, _user.pack)(x._user, me, {
                    detail: true
                })
            };
        };
        return await Promise.all(following.map((x)=>packFollower(x)));
    }
});

//# sourceMappingURL=followers.js.map
