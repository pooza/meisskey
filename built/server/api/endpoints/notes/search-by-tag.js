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
const _gethideusers = require("../../common/get-hide-users");
const _user = require("../../../../models/user");
const _converthost = require("../../../../misc/convert-host");
const _normalizetag = require("../../../../misc/normalize-tag");
const meta = {
    desc: {
        'ja-JP': '指定されたタグが付けられた投稿を取得します。'
    },
    tags: [
        'notes',
        'hashtags'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 60,
    params: {
        tag: {
            validator: _cafy.default.optional.str,
            desc: {
                'ja-JP': 'タグ'
            }
        },
        query: {
            validator: _cafy.default.optional.arr(_cafy.default.arr(_cafy.default.str)),
            desc: {
                'ja-JP': 'クエリ'
            }
        },
        following: {
            validator: _cafy.default.optional.nullable.bool,
            default: null
        },
        mute: {
            validator: _cafy.default.optional.str,
            default: 'mute_all'
        },
        reply: {
            validator: _cafy.default.optional.nullable.bool,
            default: null,
            desc: {
                'ja-JP': '返信に限定するか否か'
            }
        },
        renote: {
            validator: _cafy.default.optional.nullable.bool,
            default: null,
            desc: {
                'ja-JP': 'Renoteに限定するか否か'
            }
        },
        withFiles: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'true にすると、ファイルが添付された投稿だけ取得します'
            }
        },
        media: {
            validator: _cafy.default.optional.nullable.bool,
            default: null,
            deprecated: true,
            desc: {
                'ja-JP': 'ファイルが添付された投稿に限定するか否か (このパラメータは廃止予定です。代わりに withFiles を使ってください。)'
            }
        },
        poll: {
            validator: _cafy.default.optional.nullable.bool,
            default: null,
            desc: {
                'ja-JP': 'アンケートが添付された投稿に限定するか否か'
            }
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '指定すると、この投稿を基点としてより古い投稿を取得します'
            }
        },
        sinceDate: {
            validator: _cafy.default.optional.num
        },
        untilDate: {
            validator: _cafy.default.optional.num
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 30),
            default: 10
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'Note'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const visibleQuery = me == null ? [
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
            // myself (for specified/private)
            userId: me._id
        },
        {
            // to me (for specified)
            visibleUserIds: {
                $in: [
                    me._id
                ]
            }
        }
    ];
    const push = (x)=>q.$and.push(x);
    const q = {
        $and: [],
        deletedAt: {
            $exists: false
        },
        $or: visibleQuery
    };
    if (ps.tag) {
        const tokens = ps.tag.trim().split(/\s+/);
        const tag = tokens.shift();
        push({
            tagsLower: (0, _normalizetag.normalizeTag)(tag)
        });
        for (const token of tokens){
            // from
            const matchFrom = token.match(/^from:@?([\w-]+)(?:@([\w.-]+))?$/);
            if (matchFrom) {
                const user = await _user.default.findOne({
                    usernameLower: matchFrom[1].toLowerCase(),
                    host: (0, _converthost.toDbHost)(matchFrom[2])
                });
                if (!user) {
                    return [];
                }
                push({
                    userId: user._id
                });
                continue;
            }
        }
    } else if (ps.query) {
        push({
            $or: ps.query.map((tags)=>({
                    $and: tags.map((t)=>({
                            tagsLower: t.toLowerCase()
                        }))
                }))
        });
    } else {
        throw 'tag or query required'; // TODO
    }
    if (ps.following != null && me != null) {
        const ids = await (0, _getfriends.getFriendIds)(me._id, false);
        push({
            userId: ps.following ? {
                $in: ids
            } : {
                $nin: ids.concat(me._id)
            }
        });
    }
    if (me != null) {
        const hideUserIds = await (0, _gethideusers.getHideUserIds)(me, false);
        switch(ps.mute){
            case 'mute_all':
                push({
                    userId: {
                        $nin: hideUserIds
                    },
                    '_reply.userId': {
                        $nin: hideUserIds
                    },
                    '_renote.userId': {
                        $nin: hideUserIds
                    }
                });
                break;
            case 'mute_related':
                push({
                    '_reply.userId': {
                        $nin: hideUserIds
                    },
                    '_renote.userId': {
                        $nin: hideUserIds
                    }
                });
                break;
            case 'mute_direct':
                push({
                    userId: {
                        $nin: hideUserIds
                    }
                });
                break;
            case 'direct_only':
                push({
                    userId: {
                        $in: hideUserIds
                    }
                });
                break;
            case 'related_only':
                push({
                    $or: [
                        {
                            '_reply.userId': {
                                $in: hideUserIds
                            }
                        },
                        {
                            '_renote.userId': {
                                $in: hideUserIds
                            }
                        }
                    ]
                });
                break;
            case 'all_only':
                push({
                    $or: [
                        {
                            userId: {
                                $in: hideUserIds
                            }
                        },
                        {
                            '_reply.userId': {
                                $in: hideUserIds
                            }
                        },
                        {
                            '_renote.userId': {
                                $in: hideUserIds
                            }
                        }
                    ]
                });
                break;
        }
    }
    if (ps.reply != null) {
        if (ps.reply) {
            push({
                replyId: {
                    $exists: true,
                    $ne: null
                }
            });
        } else {
            push({
                $or: [
                    {
                        replyId: {
                            $exists: false
                        }
                    },
                    {
                        replyId: null
                    }
                ]
            });
        }
    }
    if (ps.renote != null) {
        if (ps.renote) {
            push({
                renoteId: {
                    $exists: true,
                    $ne: null
                }
            });
        } else {
            push({
                $or: [
                    {
                        renoteId: {
                            $exists: false
                        }
                    },
                    {
                        renoteId: null
                    }
                ]
            });
        }
    }
    const withFiles = ps.withFiles != null ? ps.withFiles : ps.media;
    if (withFiles) {
        push({
            fileIds: {
                $exists: true,
                $ne: []
            }
        });
    }
    if (ps.poll != null) {
        if (ps.poll) {
            push({
                poll: {
                    $exists: true,
                    $ne: null
                }
            });
        } else {
            push({
                $or: [
                    {
                        poll: {
                            $exists: false
                        }
                    },
                    {
                        poll: null
                    }
                ]
            });
        }
    }
    if (ps.untilId) {
        push({
            _id: {
                $lt: ps.untilId
            }
        });
    }
    if (ps.sinceDate) {
        push({
            createdAt: {
                $gt: new Date(ps.sinceDate)
            }
        });
    }
    if (ps.untilDate) {
        push({
            createdAt: {
                $lt: new Date(ps.untilDate)
            }
        });
    }
    if (q.$and.length == 0) {
        delete q.$and;
    }
    // Search notes
    const notes = await _note.default.find(q, {
        sort: {
            _id: -1
        },
        limit: ps.limit,
        skip: ps.offset
    });
    return await (0, _note.packMany)(notes, me);
});

//# sourceMappingURL=search-by-tag.js.map