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
const _notification = require("../../../../models/notification");
const _getfriends = require("../../common/get-friends");
const _readnotification = require("../../common/read-notification");
const _define = require("../../define");
const _gethideusers = require("../../common/get-hide-users");
const meta = {
    desc: {
        'ja-JP': '通知一覧を取得します。',
        'en-US': 'Get notifications.'
    },
    tags: [
        'account',
        'notifications'
    ],
    requireCredential: true,
    kind: [
        'read:notifications',
        'read:account',
        'account-read',
        'account/read'
    ],
    params: {
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
        },
        following: {
            validator: _cafy.default.optional.bool,
            default: false
        },
        markAsRead: {
            validator: _cafy.default.optional.bool,
            default: true
        },
        includeTypes: {
            validator: _cafy.default.optional.arr(_cafy.default.str.or([
                'follow',
                'mention',
                'reply',
                'renote',
                'quote',
                'reaction',
                'poll_vote',
                'poll_finished',
                'receiveFollowRequest',
                'highlight',
                'unreadMessagingMessage'
            ])),
            default: []
        },
        excludeTypes: {
            validator: _cafy.default.optional.arr(_cafy.default.str.or([
                'follow',
                'mention',
                'reply',
                'renote',
                'quote',
                'reaction',
                'poll_vote',
                'poll_finished',
                'receiveFollowRequest',
                'highlight',
                'unreadMessagingMessage'
            ])),
            default: []
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'Notification'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const hideUserIds = await (0, _gethideusers.getHideUserIds)(user, false);
    const query = {
        notifieeId: user._id,
        $and: [
            {
                notifierId: {
                    $nin: hideUserIds
                }
            }
        ]
    };
    const sort = {
        _id: -1
    };
    if (ps.following) {
        // ID list of the user itself and other users who the user follows
        const followingIds = await (0, _getfriends.getFriendIds)(user._id);
        query.$and.push({
            notifierId: {
                $in: followingIds
            }
        });
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
    }
    if (ps.includeTypes.length > 0) {
        query.type = {
            $in: ps.includeTypes
        };
    } else if (ps.excludeTypes.length > 0) {
        query.type = {
            $nin: ps.excludeTypes
        };
    }
    const notifications = await _notification.default.find(query, {
        maxTimeMS: 20000,
        limit: ps.limit,
        sort: sort
    });
    // Mark all as read
    if (notifications.length > 0 && ps.markAsRead) {
        (0, _readnotification.default)(user._id, notifications);
    }
    return await (0, _notification.packMany)(notifications);
});

//# sourceMappingURL=notifications.js.map
