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
const _getfriends = require("../../common/get-friends");
const _gethideusers = require("../../common/get-hide-users");
const meta = {
    desc: {
        'ja-JP': '指定した投稿への返信を取得します。',
        'en-US': 'Get replies of a note.'
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
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const [followings, hideUserIds] = await Promise.all([
        // フォローを取得
        // Fetch following
        user ? (0, _getfriends.getFriends)(user._id) : [],
        // 隠すユーザーを取得
        (0, _gethideusers.getHideUserIds)(user, false)
    ]);
    const visibleQuery = user == null ? [
        {
            visibility: {
                $in: [
                    'public',
                    'home'
                ]
            }
        }
    ] : [
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
    const q = {
        replyId: ps.noteId,
        $or: visibleQuery
    };
    if (hideUserIds && hideUserIds.length > 0) {
        q['userId'] = {
            $nin: hideUserIds
        };
    }
    const notes = await _note.default.find(q, {
        limit: ps.limit,
        skip: ps.offset
    });
    return await (0, _note.packMany)(notes, user);
});

//# sourceMappingURL=replies.js.map
