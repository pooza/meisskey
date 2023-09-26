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
const _define = require("../../define");
const _following = require("../../../../models/following");
const _error = require("../../error");
const _getters = require("../../common/getters");
const _gettimeline = require("../../common/get-timeline");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーのタイムラインを取得します。'
    },
    tags: [
        'users',
        'notes'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 60,
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        includeReplies: {
            validator: _cafy.default.optional.bool,
            default: true,
            desc: {
                'ja-JP': 'リプライを含めるか否か'
            }
        },
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
        includeMyRenotes: {
            validator: _cafy.default.optional.bool,
            default: true,
            desc: {
                'ja-JP': '自分の行ったRenoteを含めるかどうか'
            }
        },
        includeRenotedMyNotes: {
            validator: _cafy.default.optional.bool,
            default: true,
            desc: {
                'ja-JP': 'Renoteされた自分の投稿を含めるかどうか'
            }
        },
        includeLocalRenotes: {
            validator: _cafy.default.optional.bool,
            default: true,
            desc: {
                'ja-JP': 'Renoteされたローカルの投稿を含めるかどうか'
            }
        },
        withFiles: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'true にすると、ファイルが添付された投稿だけ取得します'
            }
        },
        mediaOnly: {
            validator: _cafy.default.optional.bool,
            default: false,
            deprecated: true,
            desc: {
                'ja-JP': 'true にすると、ファイルが添付された投稿だけ取得します (このパラメータは廃止予定です。代わりに withFiles を使ってください。)'
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
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'Note'
        }
    },
    errors: {
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '27e494ba-2ac2-48e8-893b-10d4d8c2387b'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    // Lookup user
    const user = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    const isFollowing = me == null ? false : await _following.default.findOne({
        followerId: me._id,
        followeeId: user._id
    }) != null;
    //#region Construct query
    const sort = {};
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
                $in: isFollowing ? [
                    'public',
                    'home',
                    'followers'
                ] : [
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
    const query = {
        $and: [
            {}
        ],
        deletedAt: null,
        userId: user._id,
        $or: visibleQuery
    };
    if (ps.sinceId) {
        sort._id = 1;
        query._id = {
            $gt: ps.sinceId
        };
    } else if (ps.untilId) {
        sort._id = -1;
        query._id = {
            $lt: ps.untilId
        };
    } else if (ps.sinceDate) {
        sort.createdAt = 1;
        query.createdAt = {
            $gt: new Date(ps.sinceDate)
        };
    } else if (ps.untilDate) {
        sort.createdAt = -1;
        query.createdAt = {
            $lt: new Date(ps.untilDate)
        };
    } else {
        sort._id = -1;
    }
    if (!ps.includeReplies) {
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
    }
    if (ps.includeMyRenotes === false) {
        query.$and.push({
            $or: [
                {
                    userId: {
                        $ne: user._id
                    }
                },
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
    }
    const withFiles = ps.withFiles != null ? ps.withFiles : ps.mediaOnly;
    if (withFiles) {
        query.fileIds = {
            $exists: true,
            $ne: []
        };
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
    }
    //#endregion
    return await (0, _gettimeline.getPackedTimeline)(me, query, sort, ps.limit);
});

//# sourceMappingURL=notes.js.map
