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
const _user = require("../../../../models/user");
const _define = require("../../define");
const _array = require("../../../../prelude/array");
const _gethideusers = require("../../common/get-hide-users");
const _error = require("../../error");
const _getters = require("../../common/getters");
const meta = {
    tags: [
        'users'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 3600 * 24,
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'User'
        }
    },
    errors: {
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: 'e6965129-7b2a-40a4-bae2-cd84cd434822'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    // Lookup user
    const user = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    // Fetch recent notes
    const recentNotes = await _note.default.find({
        userId: user._id,
        deletedAt: {
            $exists: false
        },
        visibility: {
            $in: [
                'public',
                'home'
            ]
        },
        replyId: {
            $exists: true,
            $ne: null
        }
    }, {
        sort: {
            _id: -1
        },
        limit: 1000,
        fields: {
            _id: false,
            replyId: true
        }
    });
    // 投稿が少なかったら中断
    if (recentNotes.length === 0) {
        return [];
    }
    const hideUserIds = await (0, _gethideusers.getHideUserIds)(me);
    hideUserIds.push(user._id);
    const replyTargetNotes = await _note.default.find({
        _id: {
            $in: recentNotes.map((p)=>p.replyId)
        },
        userId: {
            $nin: hideUserIds
        },
        deletedAt: {
            $exists: false
        },
        visibility: {
            $in: [
                'public',
                'home'
            ]
        }
    }, {
        fields: {
            _id: false,
            userId: true
        }
    });
    const repliedUsers = {};
    // Extract replies from recent notes
    for (const userId of replyTargetNotes.map((x)=>x.userId.toString())){
        if (repliedUsers[userId]) {
            repliedUsers[userId]++;
        } else {
            repliedUsers[userId] = 1;
        }
    }
    // Calc peak
    const peak = (0, _array.maximum)(Object.values(repliedUsers));
    // Sort replies by frequency
    const repliedUsersSorted = Object.keys(repliedUsers).sort((a, b)=>repliedUsers[b] - repliedUsers[a]);
    // Extract top replied users
    const topRepliedUsers = repliedUsersSorted.slice(0, ps.limit);
    // Make replies object (includes weights)
    const repliesObj = await Promise.all(topRepliedUsers.map(async (user)=>({
            user: await (0, _user.pack)(user, me, {
                detail: true
            }),
            weight: repliedUsers[user] / peak
        })));
    return repliesObj;
});

//# sourceMappingURL=get-frequently-replied-users.js.map
