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
const _user = require("../../../../models/user");
const _stream = require("../../../../services/stream");
const _messagingmessage = require("../../../../models/messaging-message");
const _define = require("../../define");
const meta = {
    desc: {
        'ja-JP': 'チャットメッセージをすべて既読にします。',
        'en-US': 'Mark all talk messages as read.'
    },
    tags: [
        'account',
        'messaging'
    ],
    requireCredential: true,
    kind: [
        'write:account',
        'account-write',
        'account/write'
    ],
    params: {}
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Update documents
    await _messagingmessage.default.update({
        recipientId: user._id,
        isRead: false
    }, {
        $set: {
            isRead: true
        }
    }, {
        multi: true
    });
    _user.default.update({
        _id: user._id
    }, {
        $set: {
            hasUnreadMessagingMessage: false
        }
    });
    (0, _stream.publishMainStream)(user._id, 'readAllMessagingMessages');
    return;
});

//# sourceMappingURL=read-all-messaging-messages.js.map
