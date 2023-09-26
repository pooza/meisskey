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
const _cafyid = require("../../../misc/cafy-id");
const _note = require("../../../models/note");
const _define = require("../define");
const _gethideusers = require("../common/get-hide-users");
const meta = {
    desc: {
        'ja-JP': '投稿を取得します。'
    },
    tags: [
        'notes'
    ],
    params: {
        local: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'ローカルの投稿に限定するか否か'
            }
        },
        reply: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': '返信に限定するか否か'
            }
        },
        renote: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'Renoteに限定するか否か'
            }
        },
        withFiles: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'ファイルが添付された投稿に限定するか否か'
            }
        },
        media: {
            validator: _cafy.default.optional.bool,
            deprecated: true,
            desc: {
                'ja-JP': 'ファイルが添付された投稿に限定するか否か (このパラメータは廃止予定です。代わりに withFiles を使ってください。)'
            }
        },
        poll: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'アンケートが添付された投稿に限定するか否か'
            }
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
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'Note'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    // 隠すユーザーを取得
    const hideUserIds = await (0, _gethideusers.getHideUserIds)(null);
    const sort = {
        _id: -1
    };
    const query = {
        deletedAt: null,
        visibility: 'public',
        localOnly: {
            $ne: true
        },
        userId: {
            $nin: hideUserIds
        }
    };
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
    if (ps.local) {
        query['_user.host'] = null;
    }
    if (ps.reply != undefined) {
        query.replyId = ps.reply ? {
            $exists: true,
            $ne: null
        } : null;
    }
    if (ps.renote != undefined) {
        query.renoteId = ps.renote ? {
            $exists: true,
            $ne: null
        } : null;
    }
    const withFiles = ps.withFiles != undefined ? ps.withFiles : ps.media;
    if (withFiles) query.fileIds = {
        $exists: true,
        $ne: null
    };
    if (ps.poll != undefined) {
        query.poll = ps.poll ? {
            $exists: true,
            $ne: null
        } : null;
    }
    // TODO
    //if (bot != undefined) {
    //	query.isBot = bot;
    //}
    const notes = await _note.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    return await (0, _note.packMany)(notes);
});

//# sourceMappingURL=notes.js.map
