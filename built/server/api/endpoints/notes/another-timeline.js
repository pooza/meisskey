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
const _getfriends = require("../../common/get-friends");
const _define = require("../../define");
const _gethideusers = require("../../common/get-hide-users");
const _gettimeline = require("../../common/get-timeline");
const meta = {
    desc: {
        'ja-JP': 'タイムラインを取得します。',
        'en-US': 'Get timeline of myself.'
    },
    tags: [
        'notes'
    ],
    requireCredential: true,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10,
            desc: {
                'ja-JP': '最大数'
            }
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '指定すると、この投稿を基点としてより新しい投稿を取得します'
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
            validator: _cafy.default.optional.num,
            desc: {
                'ja-JP': '指定した時間を基点としてより新しい投稿を取得します。数値は、1970年1月1日 00:00:00 UTC から指定した日時までの経過時間をミリ秒単位で表します。'
            }
        },
        untilDate: {
            validator: _cafy.default.optional.num,
            desc: {
                'ja-JP': '指定した時間を基点としてより古い投稿を取得します。数値は、1970年1月1日 00:00:00 UTC から指定した日時までの経過時間をミリ秒単位で表します。'
            }
        },
        withFiles: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'true にすると、ファイルが添付された投稿だけ取得します'
            }
        },
        fileType: {
            validator: _cafy.default.optional.arr(_cafy.default.str),
            desc: {
                'ja-JP': '指定された種類のファイルが添付された投稿のみを取得します'
            }
        },
        excludeNsfw: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'true にすると、NSFW指定されたファイルを除外します(fileTypeが指定されている場合のみ有効)'
            }
        },
        excludeSfw: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'true にすると、NSFW指定されてないファイルを除外します(fileTypeが指定されている場合のみ有効)'
            }
        },
        mediaOnly: {
            validator: _cafy.default.optional.bool,
            deprecated: true,
            desc: {
                'ja-JP': 'true にすると、ファイルが添付された投稿だけ取得します (このパラメータは廃止予定です。代わりに withFiles を使ってください。)'
            }
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
    const [followingIds, hideUserIds] = await Promise.all([
        // フォローを取得
        // Fetch following
        (0, _getfriends.getFriendIds)(user._id, true),
        // 隠すユーザーを取得
        (0, _gethideusers.getHideUserIds)(user, false)
    ]);
    //#region Construct query
    const sort = {
        _id: -1
    };
    const notFollowQuery = [
        {
            userId: {
                $nin: followingIds
            }
        }
    ];
    const visibleQuery = [
        {
            visibility: {
                $in: [
                    'public'
                ]
            }
        }
    ];
    const query = {
        $and: [
            {
                deletedAt: null,
                $and: [
                    {
                        // フォローしてない人の投稿
                        $or: notFollowQuery
                    },
                    {
                        // visible for me
                        $or: visibleQuery
                    }
                ],
                // mute
                '_reply.userId': {
                    $nin: hideUserIds
                },
                '_renote.userId': {
                    $nin: hideUserIds
                }
            }
        ]
    };
    query.$and.push({
        $or: [
            {
                replyId: null // normal post
            },
            {
                $expr: {
                    $eq: [
                        '$_reply.userId',
                        '$userId'
                    ]
                }
            }
        ]
    });
    query.$and.push({
        $or: [
            {
                renoteId: null
            },
            {
                text: {
                    $ne: null
                }
            },
            {
                fileIds: {
                    $ne: []
                }
            },
            {
                poll: {
                    $ne: null
                }
            }
        ]
    });
    const withFiles = ps.withFiles != null ? ps.withFiles : ps.mediaOnly;
    if (withFiles) {
        query.$and.push({
            fileIds: {
                $exists: true,
                $ne: []
            }
        });
    }
    if (ps.fileType) {
        query.fileIds = {
            $exists: true,
            $ne: []
        };
        query['_files.contentType'] = {
            $in: ps.fileType
        };
        if (ps.excludeNsfw) {
            query['_files.metadata.isSensitive'] = {
                $ne: true
            };
            query['cw'] = null;
        }
        if (ps.excludeSfw) {
            query['_files.metadata.isSensitive'] = true;
        }
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
    } else if (ps.sinceDate) {
        sort._id = 1;
        query.createdAt = {
            $gt: new Date(ps.sinceDate)
        };
    } else if (ps.untilDate) {
        query.createdAt = {
            $lt: new Date(ps.untilDate)
        };
    }
    //#endregion
    return await (0, _gettimeline.getPackedTimeline)(user, query, sort, ps.limit);
});

//# sourceMappingURL=another-timeline.js.map
