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
const _getfriends = require("../../common/get-friends");
const _define = require("../../define");
const _read = require("../../../../services/note/read");
const _gethideusers = require("../../common/get-hide-users");
const meta = {
    desc: {
        'ja-JP': '自分に言及している投稿の一覧を取得します。',
        'en-US': 'Get mentions of myself.'
    },
    tags: [
        'notes'
    ],
    requireCredential: true,
    params: {
        following: {
            validator: _cafy.default.optional.bool,
            default: false
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
        },
        visibility: {
            validator: _cafy.default.optional.str
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'Note'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // フォローを取得
    const followings = await (0, _getfriends.getFriends)(user._id);
    const visibleQuery = [
        {
            visibility: {
                $in: [
                    'public',
                    'home'
                ]
            }
        },
        {
            // myself (for followers/specified/private)
            userId: user._id
        },
        {
            // to me (for specified)
            visibleUserIds: {
                $in: [
                    user._id
                ]
            }
        },
        {
            visibility: 'followers',
            $or: [
                {
                    // フォロワーの投稿
                    userId: {
                        $in: followings.map((f)=>f.id)
                    }
                },
                {
                    // 自分の投稿へのリプライ
                    '_reply.userId': user._id
                },
                {
                    // 自分へのメンションが含まれている
                    mentions: {
                        $in: [
                            user._id
                        ]
                    }
                }
            ]
        }
    ];
    const query = {
        $and: [
            {
                deletedAt: null
            },
            {
                $or: visibleQuery
            }
        ],
        $or: [
            {
                mentions: user._id
            },
            {
                visibleUserIds: user._id
            }
        ]
    };
    // 隠すユーザーを取得
    const hideUserIds = await (0, _gethideusers.getHideUserIds)(user, false);
    if (hideUserIds && hideUserIds.length > 0) {
        query.userId = {
            $nin: hideUserIds
        };
        query['_reply.userId'] = {
            $nin: hideUserIds
        };
        query['_renote.userId'] = {
            $nin: hideUserIds
        };
    }
    const sort = {
        _id: -1
    };
    if (ps.visibility) {
        query.visibility = ps.visibility;
    }
    if (ps.following) {
        const followingIds = await (0, _getfriends.getFriendIds)(user._id);
        query.userId = {
            $in: followingIds
        };
    }
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
    const mentions = await _note.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    for (const note of mentions){
        (0, _read.default)(user._id, note._id);
    }
    return await (0, _note.packMany)(mentions, user);
});

//# sourceMappingURL=mentions.js.map
