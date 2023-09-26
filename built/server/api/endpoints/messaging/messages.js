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
const _messagingmessage = require("../../../../models/messaging-message");
const _readmessagingmessage = require("../../common/read-messaging-message");
const _define = require("../../define");
const _error = require("../../error");
const _getters = require("../../common/getters");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーとのMessagingのメッセージ一覧を取得します。',
        'en-US': 'Get messages of messaging.'
    },
    tags: [
        'messaging'
    ],
    requireCredential: true,
    kind: [
        'read:messaging',
        'messaging-read'
    ],
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
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        markAsRead: {
            validator: _cafy.default.optional.bool,
            default: true
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'MessagingMessage'
        }
    },
    errors: {
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '11795c64-40ea-4198-b06e-3c873ed9039d'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Fetch recipient
    const recipient = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    const query = {
        $or: [
            {
                userId: user._id,
                recipientId: recipient._id
            },
            {
                userId: recipient._id,
                recipientId: user._id
            }
        ]
    };
    const sort = {
        _id: -1
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
    const messages = await _messagingmessage.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    // Mark all as read
    if (ps.markAsRead) {
        await (0, _readmessagingmessage.default)(user._id, recipient._id, messages);
    }
    return await Promise.all(messages.map((message)=>(0, _messagingmessage.pack)(message, user, {
            populateRecipient: false
        })));
});

//# sourceMappingURL=messages.js.map
