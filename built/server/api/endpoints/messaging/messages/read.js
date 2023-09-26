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
const _cafyid = require("../../../../../misc/cafy-id");
const _messagingmessage = require("../../../../../models/messaging-message");
const _readmessagingmessage = require("../../../common/read-messaging-message");
const _define = require("../../../define");
const _error = require("../../../error");
const meta = {
    desc: {
        'ja-JP': '指定した自分宛てのメッセージを既読にします。',
        'en-US': 'Mark as read a message of messaging.'
    },
    tags: [
        'messaging'
    ],
    requireCredential: true,
    kind: [
        'write:messaging',
        'messaging-write'
    ],
    params: {
        messageId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '既読にするメッセージのID',
                'en-US': 'The ID of a message that you want to mark as read'
            }
        }
    },
    errors: {
        noSuchMessage: {
            message: 'No such message.',
            code: 'NO_SUCH_MESSAGE',
            id: '86d56a2f-a9c3-4afb-b13c-3e9bfef9aa14'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const message = await _messagingmessage.default.findOne({
        _id: ps.messageId,
        recipientId: user._id
    });
    if (message == null) {
        throw new _error.ApiError(meta.errors.noSuchMessage);
    }
    (0, _readmessagingmessage.default)(user._id, message.userId, message);
    return;
});

//# sourceMappingURL=read.js.map
