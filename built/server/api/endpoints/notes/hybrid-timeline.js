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
const _fetchmeta = require("../../../../misc/fetch-meta");
const _gethideusers = require("../../common/get-hide-users");
const _error = require("../../error");
const _userlist = require("../../../../models/user-list");
const _array = require("../../../../prelude/array");
const _converthost = require("../../../../misc/convert-host");
const _gethiderenoteusers = require("../../common/get-hide-renote-users");
const _gettimeline = require("../../common/get-timeline");
const _config = require("../../../../config");
const meta = {
    desc: {
        'ja-JP': 'ハイブリッドタイムラインを取得します。'
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
        includeForeignReply: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': '外部リプライを含める'
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
        excludeRenote: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'Renoteを含めない'
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
    },
    errors: {
        stlDisabled: {
            message: 'Social timeline has been disabled.',
            code: 'STL_DISABLED',
            id: '620763f4-f621-4533-ab33-0577a1a3c342'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const m = await (0, _fetchmeta.default)();
    if (m.disableLocalTimeline) {
        throw new _error.ApiError(meta.errors.stlDisabled);
    }
    const [followingIds, hideUserIds, hideFromHomeLists, hideRenoteUserIds] = await Promise.all([
        // フォローを取得
        // Fetch following
        (0, _getfriends.getFriendIds)(user._id, true, _config.default.homeTlActiveLimitDays || -1),
        // 隠すユーザーを取得
        (0, _gethideusers.getHideUserIds)(user),
        // Homeから隠すリストを取得
        _userlist.default.find({
            userId: user._id,
            hideFromHome: true
        }),
        // リノートを隠すユーザーを取得
        (0, _gethiderenoteusers.getHideRenoteUserIds)(user)
    ]);
    const hideFromHomeUsers = (0, _array.concat)(hideFromHomeLists.map((list)=>list.userIds));
    const hideFromHomeHosts = (0, _array.concat)(hideFromHomeLists.map((list)=>list.hosts || [])).map((x)=>(0, _converthost.isSelfHost)(x) ? null : x);
    //#region Construct query
    const sort = {
        _id: -1
    };
    const filterQuery = [
        {
            userId: {
                $in: followingIds
            }
        },
        {
            mentions: {
                $in: [
                    user._id
                ]
            }
        }
    ];
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
                    'home',
                    'followers'
                ]
            }
        },
        {
            // myself (for specified/private)
            userId: user._id
        },
        {
            // to me (for specified)
            visibleUserIds: {
                $in: [
                    user._id
                ]
            }
        }
    ];
    const query = {
        $and: [
            {
                deletedAt: null,
                $or: [
                    {
                        $and: [
                            {
                                $or: filterQuery
                            },
                            {
                                // visible for me
                                $or: visibleQuery
                            }
                        ]
                    },
                    {
                        // public only
                        visibility: 'public',
                        // local
                        '_user.host': null
                    }
                ],
                // hide
                userId: {
                    $nin: hideUserIds.concat(hideFromHomeUsers)
                },
                '_reply.userId': {
                    $nin: hideUserIds
                },
                '_renote.userId': {
                    $nin: hideUserIds
                },
                '_user.host': {
                    $nin: hideFromHomeHosts
                }
            }
        ]
    };
    // MongoDBではトップレベルで否定ができないため、De Morganの法則を利用してクエリします。
    // つまり、「『自分の投稿かつRenote』ではない」を「『自分の投稿ではない』または『Renoteではない』」と表現します。
    // for details: https://en.wikipedia.org/wiki/De_Morgan%27s_laws
    if (!ps.includeForeignReply) {
        query.$and.push({
            $or: [
                {
                    replyId: null // normal post
                },
                {
                    '_reply.userId': user._id // to me
                },
                {
                    userId: user._id // my post
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
    if (ps.excludeRenote) {
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
    } else {
        if (hideRenoteUserIds.length > 0) {
            query.$and.push({
                $or: [
                    {
                        userId: {
                            $nin: hideRenoteUserIds
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
        if (ps.includeRenotedMyNotes === false) {
            query.$and.push({
                $or: [
                    {
                        '_renote.userId': {
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
        if (ps.includeLocalRenotes === false) {
            query.$and.push({
                $or: [
                    {
                        '_renote.user.host': {
                            $ne: null
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
    }
    if (ps.withFiles || ps.mediaOnly) {
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

//# sourceMappingURL=hybrid-timeline.js.map
