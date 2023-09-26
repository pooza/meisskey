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
const _fetchmeta = require("../../../../misc/fetch-meta");
const _gethideusers = require("../../common/get-hide-users");
const _error = require("../../error");
const _gettimeline = require("../../common/get-timeline");
const meta = {
    desc: {
        'ja-JP': 'グローバルタイムラインを取得します。'
    },
    tags: [
        'notes'
    ],
    params: {
        withFiles: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'ファイルが添付された投稿に限定するか否か'
            }
        },
        mediaOnly: {
            validator: _cafy.default.optional.bool,
            deprecated: true,
            desc: {
                'ja-JP': 'ファイルが添付された投稿に限定するか否か (このパラメータは廃止予定です。代わりに withFiles を使ってください。)'
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
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        minScore: {
            validator: _cafy.default.optional.num.min(1)
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        sinceDate: {
            validator: _cafy.default.optional.num
        },
        untilDate: {
            validator: _cafy.default.optional.num
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'Note'
        }
    },
    errors: {
        gtlDisabled: {
            message: 'Global timeline has been disabled.',
            code: 'GTL_DISABLED',
            id: '0332fc13-6ab2-4427-ae80-a9fadffd1a6b'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const m = await (0, _fetchmeta.default)();
    if (m.disableGlobalTimeline) {
        throw new _error.ApiError(meta.errors.gtlDisabled);
    }
    if (!user && m.disableTimelinePreview) {
        throw new _error.ApiError(meta.errors.gtlDisabled);
    }
    // 隠すユーザーを取得
    const hideUserIds = await (0, _gethideusers.getHideUserIds)(user);
    //#region Construct query
    const sort = {
        _id: -1
    };
    const query = {
        deletedAt: null,
        // public only
        visibility: 'public'
    };
    if (!m.showReplayInPublicTimeline) {
        query.replyId = null;
    }
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
        if (ps.excludeSfw) {
            query['_files.metadata.isSensitive'] = true;
        }
    }
    if (ps.minScore) {
        query.score = {
            $gte: ps.minScore
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

//# sourceMappingURL=global-timeline.js.map
