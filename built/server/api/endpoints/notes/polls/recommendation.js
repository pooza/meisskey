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
const _pollvote = require("../../../../../models/poll-vote");
const _note = require("../../../../../models/note");
const _define = require("../../../define");
const _gethideusers = require("../../../common/get-hide-users");
const meta = {
    desc: {
        'ja-JP': 'おすすめのアンケート一覧を取得します。',
        'en-US': 'Get recommended polls.'
    },
    tags: [
        'notes'
    ],
    requireCredential: true,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // voted
    const votes = await _pollvote.default.find({
        userId: user._id
    }, {
        fields: {
            _id: false,
            noteId: true
        }
    });
    const nin = votes && votes.length != 0 ? votes.map((v)=>v.noteId) : [];
    const nonVoted = await _pollvote.default.distinct('noteId', {
        noteId: {
            $nin: nin
        },
        createdAt: {
            $gte: new Date(Date.now() - 1000 * 86400 * 180)
        }
    });
    // 隠すユーザーを取得
    const hideUserIds = await (0, _gethideusers.getHideUserIds)(user);
    const notes = await _note.default.find({
        '_user.host': null,
        _id: {
            $in: nonVoted
        },
        userId: {
            $nin: hideUserIds
        },
        visibility: 'public',
        poll: {
            $exists: true,
            $ne: null
        },
        $or: [
            {
                'poll.expiresAt': null
            },
            {
                'poll.expiresAt': {
                    $gt: new Date()
                }
            }
        ]
    }, {
        limit: ps.limit,
        skip: ps.offset,
        sort: {
            _id: -1
        }
    });
    return await Promise.all(notes.map((note)=>(0, _note.pack)(note, user, {
            detail: true
        })));
});

//# sourceMappingURL=recommendation.js.map
