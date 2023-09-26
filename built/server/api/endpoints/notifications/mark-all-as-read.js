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
const _notification = require("../../../../models/notification");
const _stream = require("../../../../services/stream");
const _user = require("../../../../models/user");
const _define = require("../../define");
const meta = {
    desc: {
        'ja-JP': '全ての通知を既読にします。',
        'en-US': 'Mark all notifications as read.'
    },
    tags: [
        'notifications',
        'account'
    ],
    requireCredential: true,
    kind: [
        'write:notifications',
        'notification-write'
    ]
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Update documents
    await _notification.default.update({
        notifieeId: user._id,
        isRead: false
    }, {
        $set: {
            isRead: true
        }
    }, {
        multi: true
    });
    // Update flag
    _user.default.update({
        _id: user._id
    }, {
        $set: {
            hasUnreadNotification: false
        }
    });
    // 全ての通知を読みましたよというイベントを発行
    (0, _stream.publishMainStream)(user._id, 'readAllNotifications');
});

//# sourceMappingURL=mark-all-as-read.js.map
