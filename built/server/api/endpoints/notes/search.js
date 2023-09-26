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
const _note = require("../../../../models/note");
const _define = require("../../define");
const _error = require("../../error");
const _user = require("../../../../models/user");
const _converthost = require("../../../../misc/convert-host");
const _following = require("../../../../models/following");
const _array = require("../../../../prelude/array");
const _gethideusers = require("../../common/get-hide-users");
const _getfriends = require("../../common/get-friends");
const _notewatching = require("../../../../models/note-watching");
const _config = require("../../../../config");
const _mecab = require("../../../../misc/mecab");
const _meid7 = require("../../../../misc/id/meid7");
const _mongodb = require("mongodb");
const meta = {
    desc: {
        'ja-JP': '投稿を検索します。',
        'en-US': 'Search notes.'
    },
    tags: [
        'notes'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 60,
    params: {
        query: {
            validator: _cafy.default.str
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
    },
    errors: {
        searchingNotAvailable: {
            message: 'Searching not available.',
            code: 'SEARCHING_NOT_AVAILABLE',
            id: '7ee9c119-16a1-479f-a6fd-6fab00ed946f'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const internal = await searchInternal(me, ps.query, ps.limit, ps.offset).catch((e)=>{
        console.warn(e);
        throw e;
    });
    if (internal !== null) return internal;
    throw new _error.ApiError(meta.errors.searchingNotAvailable);
});
async function searchInternal(me, query, limit, offset) {
    // extract tokens
    const tokens = query.trim().split(/\s+/);
    const words = [];
    let from = null;
    let followFrom = null;
    let since = null;
    let until = null;
    let types = [];
    let withFiles = false;
    let host; // = undefined
    let sensitive = 'all';
    let withPolls = false;
    for (const token of tokens){
        // from
        const matchFrom = token.match(/^from:@?([\w-]+)(?:@([\w.-]+))?$/);
        if (matchFrom) {
            const user = await _user.default.findOne({
                usernameLower: matchFrom[1].toLowerCase(),
                host: (0, _converthost.toDbHost)(matchFrom[2])
            });
            if (user == null) return []; // fromが存在しないユーザーならno match
            from = user;
            continue;
        }
        // followers
        const matchFollow = token.match(/^follow:@?([\w-]+)(?:@([\w.-]+))?$/);
        if (matchFollow) {
            followFrom = await _user.default.findOne({
                usernameLower: matchFollow[1].toLowerCase(),
                host: (0, _converthost.toDbHost)(matchFollow[2])
            });
            if (followFrom == null) return [];
            continue;
        }
        // Date
        const matchSince = token.match(/^since:(\d{4}-\d{1,2}-\d{1,2}.*)/);
        if (matchSince) {
            since = new Date(matchSince[1]);
            continue;
        }
        const matchUntil = token.match(/^until:(\d{4}-\d{1,2}-\d{1,2}.*)/);
        if (matchUntil) {
            until = new Date(matchUntil[1]);
            continue;
        }
        // filter
        const matchFilter = token.match(/^filter:(\w+)$/);
        if (matchFilter) {
            // files
            if (matchFilter[1] === 'files') {
                withFiles = true;
            }
            // medias (images/videos/audios)
            if (matchFilter[1] === 'medias' || matchFilter[1] === 'images') {
                types = (0, _array.concat)([
                    types,
                    [
                        'image/jpeg',
                        'image/gif',
                        'image/png',
                        'image/apng',
                        'image/webp',
                        'image/avif'
                    ]
                ]);
            }
            if (matchFilter[1] === 'medias' || matchFilter[1] === 'videos') {
                types = (0, _array.concat)([
                    types,
                    [
                        'video/mp4',
                        'video/webm'
                    ]
                ]);
            }
            if (matchFilter[1] === 'medias' || matchFilter[1] === 'audios') {
                types = (0, _array.concat)([
                    types,
                    [
                        'audio/mpeg',
                        'audio/mp4'
                    ]
                ]);
            }
            if (matchFilter[1] === 'polls') {
                withPolls = true;
            }
            // watching
            if (matchFilter[1] === 'watching') {
                const watches = await _notewatching.default.find({
                    userId: me._id
                }, {
                    limit,
                    skip: offset,
                    sort: {
                        _id: -1
                    }
                });
                return await (0, _note.packMany)(watches.map((w)=>w.noteId), me);
            }
            continue;
        }
        // sensitive
        const matchSensitive = token.match(/^sensitive:(all|sfw|nsfw)$/);
        if (matchSensitive) {
            sensitive = matchSensitive[1];
            continue;
        }
        // host
        const matchHost = token.match(/^host:([\w.-]+)$/);
        if (matchHost) {
            if (matchHost[1].match(/^(\.|local)$/) || (0, _converthost.isSelfHost)(matchHost[1])) {
                host = null;
            } else {
                host = (0, _converthost.toDbHost)(matchHost[1]);
            }
            continue;
        }
        words.push(token);
    }
    // 下でsince加工しているので（もうしてない）先にソートクエリだけ作っちゃう
    const sort = {
        _id: -1
    };
    // sinceのみ指定されてたら逆順
    if (since && !until) {
        sort._id = 1;
    }
    // ワード検索の場合
    if (words.length > 0) {
        // meCabしてなければESに回す
        if (!_config.default.mecabSearch) return null;
    }
    let visibleQuery;
    if (me == null) {
        visibleQuery = [
            {
                visibility: {
                    $in: [
                        'public',
                        'home'
                    ]
                }
            }
        ];
    } else if (from != null) {
        // ※ from指定は下でANDされる
        if (from._id == me._id) {
            visibleQuery = [
                {}
            ];
        } else {
            // from指定はフォローしている人？
            const isFollowing = await _following.default.findOne({
                followerId: me._id,
                followeeId: from._id
            }) != null;
            if (isFollowing) {
                visibleQuery = [
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
                        // to me (for specified)
                        visibleUserIds: {
                            $in: [
                                me._id
                            ]
                        }
                    }
                ];
            } else {
                visibleQuery = [
                    {
                        visibility: {
                            $in: [
                                'public',
                                'home'
                            ]
                        }
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
            }
        }
    } else if (followFrom != null) {
        const myFollowingIds = me ? await (0, _getfriends.getFriendIds)(me._id) : [];
        visibleQuery = [
            {
                visibility: {
                    $in: [
                        'public',
                        'home'
                    ]
                }
            },
            {
                $and: [
                    {
                        visibility: 'followers'
                    },
                    {
                        userId: {
                            $in: myFollowingIds
                        }
                    }
                ]
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
    } else {
        // フォローを取得
        const followings = await (0, _getfriends.getFriends)(me._id);
        const followQuery = followings.map((f)=>({
                userId: f.id
            }));
        visibleQuery = [
            {
                visibility: {
                    $in: [
                        'public',
                        'home'
                    ]
                }
            },
            {
                $and: [
                    {
                        visibility: 'followers'
                    },
                    {
                        $or: followQuery
                    }
                ]
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
    }
    // 隠すユーザーを取得
    const hideUserIds = await (0, _gethideusers.getHideUserIds)(me, false);
    // note
    const noteQuery = {
        $and: [
            {}
        ],
        deletedAt: null,
        $or: visibleQuery,
        userId: {
            $nin: hideUserIds
        },
        '_reply.userId': {
            $nin: hideUserIds
        },
        '_renote.userId': {
            $nin: hideUserIds
        }
    };
    // note - userId
    if (from != null) {
        noteQuery.userId = from._id;
    }
    if (followFrom != null) {
        const targetFollowingIds = await (0, _getfriends.getFriendIds)(followFrom._id);
        noteQuery.userId = {
            $in: targetFollowingIds
        };
    }
    // Date
    if (since) {
        noteQuery.$and.push({
            _id: {
                $gt: new _mongodb.ObjectID((0, _meid7.genMeid7)(since))
            }
        });
    }
    if (until) {
        noteQuery.$and.push({
            _id: {
                $lt: new _mongodb.ObjectID((0, _meid7.genMeid7)(until))
            }
        });
    }
    // note - files / medias
    if (withFiles) {
        noteQuery.fileIds = {
            $exists: true,
            $ne: []
        };
    } else if (types.length > 0) {
        noteQuery.fileIds = {
            $exists: true,
            $ne: []
        };
        noteQuery['_files.contentType'] = {
            $in: types
        };
    }
    // note - polls
    if (withPolls) {
        noteQuery.poll = {
            $exists: true,
            $ne: null
        };
    }
    if (noteQuery.fileIds && sensitive === 'sfw') {
        noteQuery['_files.metadata.isSensitive'] = {
            $ne: true
        };
    }
    if (noteQuery.fileIds && sensitive === 'nsfw') {
        noteQuery['_files.metadata.isSensitive'] = true;
    }
    // note - host
    if (typeof host != 'undefined') {
        noteQuery['_user.host'] = host;
    }
    if (words.length > 0) {
        const ws = await (0, _mecab.getIndexer)({
            text: words.join(' ')
        });
        if (!ws.length) return [];
        noteQuery.$and.push({
            mecabWords: {
                $all: ws
            }
        });
    }
    /*
	const ex = await Note.find(noteQuery, {
		maxTimeMS: 20000,
		limit,
		skip: offset,
		sort,
		explain: true,
	}) as unknown;
	console.log(JSON.stringify(ex, null, 1))
	*/ const notes = await _note.default.find(noteQuery, {
        maxTimeMS: 20000,
        limit,
        skip: offset,
        sort
    });
    return await (0, _note.packMany)(notes, me);
}

//# sourceMappingURL=search.js.map
