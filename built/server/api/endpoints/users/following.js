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
const _getfollowers = require("../../common/get-followers");
const _canshowfollows = require("../../common/can-show-follows");
const _packutils = require("../../../../misc/pack-utils");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーのフォロー一覧を取得します。',
        'en-US': 'Get following users of a user.'
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
                'ja-JP': '指定すると、このRelationIDより過去のレコードを取得します。'
            }
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '指定すると、このRelationIDより未来のレコードを取得します。またソート順が逆になります。'
            }
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '指定すると、このRelationIDより過去のレコードを取得します。'
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
        },
        moved: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': '引っ越したユーザーのみ'
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
            id: '63e4aba4-4156-4e53-be25-c9559e42d71b'
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
        followerId: user._id
    };
    // ログインしていてかつ iknow フラグがあるとき
    if (me && ps.iknow) {
        // Get my friends
        const myFriends = await (0, _getfriends.getFriendIds)(me._id);
        query.followeeId = {
            $in: myFriends
        };
    }
    if (ps.diff && me && me._id.equals(user._id)) {
        const followerIds = await (0, _getfollowers.getFollowerIds)(user._id);
        query.followeeId = {
            $nin: followerIds
        };
    }
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
    let following;
    if (!ps.moved) {
        following = await _following.default.aggregate([
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
                    localField: 'followeeId',
                    foreignField: '_id',
                    as: '_user'
                }
            },
            {
                $unwind: '$_user'
            }
        ]);
    } else {
        following = await _following.default.aggregate([
            {
                $match: query
            },
            {
                // join User
                $lookup: {
                    from: 'users',
                    localField: 'followeeId',
                    foreignField: '_id',
                    as: '_user'
                }
            },
            {
                $unwind: '$_user'
            },
            {
                $match: {
                    '_user.movedToUserId': {
                        $ne: null
                    }
                }
            },
            {
                $sort: {
                    _id: -1
                }
            },
            {
                $limit: ps.limit + (ps.v11compatible ? 0 : 1)
            }
        ]);
    }
    if (!ps.v11compatible) {
        // 「次のページ」があるかどうか
        const inStock = following.length === ps.limit + 1;
        if (inStock) {
            following.pop();
        }
        return {
            users: await Promise.all(following.map((f)=>(0, _user.pack)(f._user, me, {
                    detail: true
                }))),
            next: inStock ? (0, _packutils.toOidString)(following[following.length - 1]._id) : null
        };
    } else {
        const packFollowee = async (x, me)=>{
            return {
                id: (0, _packutils.toOidString)(x._id),
                createdAt: (0, _packutils.toISODateOrNull)(x.createdAt),
                followeeId: (0, _packutils.toOidString)(x.followeeId),
                followerId: (0, _packutils.toOidString)(x.followerId),
                followee: await (0, _user.pack)(x._user, me, {
                    detail: true
                })
            };
        };
        return await Promise.all(following.map((x)=>packFollowee(x)));
    }
});

//# sourceMappingURL=following.js.map
