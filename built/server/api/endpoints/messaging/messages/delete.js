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
const _define = require("../../../define");
const _ms = require("ms");
const _error = require("../../../error");
const _delete = require("../../../../../services/messages/delete");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定したメッセージを削除します。',
        'en-US': 'Delete a message.'
    },
    tags: [
        'messaging'
    ],
    requireCredential: true,
    kind: [
        'write:messaging',
        'messaging-write'
    ],
    limit: {
        duration: _ms('1hour'),
        max: 300,
        minInterval: _ms('1sec')
    },
    params: {
        messageId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のメッセージのID',
                'en-US': 'Target message ID.'
            }
        }
    },
    errors: {
        noSuchMessage: {
            message: 'No such message.',
            code: 'NO_SUCH_MESSAGE',
            id: '54b5b326-7925-42cf-8019-130fda8b56af'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const message = await _messagingmessage.default.findOne({
        _id: ps.messageId,
        userId: user._id
    });
    if (message == null) {
        throw new _error.ApiError(meta.errors.noSuchMessage);
    }
    await (0, _delete.deleteMessage)(message);
    return;
});

//# sourceMappingURL=delete.js.map
