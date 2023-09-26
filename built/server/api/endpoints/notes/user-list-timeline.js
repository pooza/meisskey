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
const _userlist = require("../../../../models/user-list");
const _define = require("../../define");
const _getfriends = require("../../common/get-friends");
const _gethideusers = require("../../common/get-hide-users");
const _error = require("../../error");
const _converthost = require("../../../../misc/convert-host");
const _gethiderenoteusers = require("../../common/get-hide-renote-users");
const _lodash = require("lodash");
const _gettimeline = require("../../common/get-timeline");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーリストのタイムラインを取得します。',
        'en-US': 'Get timeline of a user list.'
    },
    tags: [
        'notes',
        'lists'
    ],
    requireCredential: true,
    params: {
        listId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': 'リストのID'
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
        includeForeignReply: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': '外部リプライを含める'
            }
        },
        excludeRenote: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'Renoteを含めない'
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
    },
    errors: {
        noSuchList: {
            message: 'No such list.',
            code: 'NO_SUCH_LIST',
            id: '8fb1fbd5-e476-4c37-9fb0-43d55b63a2ff'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const [list, followingIds, hideUserIds, hideRenoteUserIds] = await Promise.all([
        // リストを取得
        // Fetch the list
        _userlist.default.findOne({
            _id: ps.listId,
            userId: user._id
        }),
        // フォローを取得
        // Fetch following
        (0, _getfriends.getFriendIds)(user._id, true),
        // 隠すユーザーを取得
        (0, _gethideusers.getHideUserIds)(user, false),
        // リノートを隠すユーザーを取得
        (0, _gethiderenoteusers.getHideRenoteUserIds)(user)
    ]);
    if (list == null) {
        throw new _error.ApiError(meta.errors.noSuchList);
    }
    if (list.mediaOnly) {
        var _ps_fileType;
        const medias = [
            'image/jpeg',
            'image/png',
            'image/apng',
            'image/gif',
            'image/webp',
            'image/avif',
            'video/mp4',
            'video/webm'
        ];
        if ((_ps_fileType = ps.fileType) === null || _ps_fileType === void 0 ? void 0 : _ps_fileType.length) {
            ps.fileType = (0, _lodash.intersection)(ps.fileType, medias);
        } else {
            ps.fileType = medias;
        }
    }
    //#region Construct query
    const sort = {
        _id: -1
    };
    let listQuery = list.userIds.map((u)=>({
            userId: u
        }));
    if (list.hosts && list.hosts.length > 0) {
        if (list.hosts.some((x)=>x === '*')) {
            listQuery = [
                {}
            ];
        } else {
            listQuery.push({
                '_user.host': {
                    $in: list.hosts.map((x)=>(0, _converthost.isSelfHost)(x) ? null : x)
                }
            });
        }
    }
    if (listQuery.length == 0) {
        return [];
    }
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
        },
        {
            visibility: 'followers',
            userId: {
                $in: followingIds
            }
        }
    ];
    const query = {
        $and: [
            {
                deletedAt: null,
                $and: [
                    {
                        // リストに入っている人のタイムラインへの投稿
                        $or: listQuery
                    },
                    {
                        // visible for me
                        $or: visibleQuery
                    }
                ],
                // mute
                userId: {
                    $nin: hideUserIds
                },
                '_reply.userId': {
                    $nin: hideUserIds
                },
                '_renote.userId': {
                    $nin: hideUserIds
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
        console.log('excludeRenote');
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

//# sourceMappingURL=user-list-timeline.js.map
