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
const _mute = require("../../../../models/mute");
const _messagingmessage = require("../../../../models/messaging-message");
const _define = require("../../define");
const meta = {
    desc: {
        'ja-JP': 'Messagingの履歴を取得します。',
        'en-US': 'Show messaging history.'
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
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'MessagingMessage'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const mute = await _mute.default.find({
        $or: [
            {
                expiresAt: null
            },
            {
                expiresAt: {
                    $gt: new Date()
                }
            }
        ],
        muterId: user._id,
        deletedAt: {
            $exists: false
        }
    });
    const history = [];
    for(let i = 0; i < ps.limit; i++){
        const found = history.map((m)=>m.userId.equals(user._id) ? m.recipientId : m.userId);
        const message = await _messagingmessage.default.findOne({
            $or: [
                {
                    userId: user._id
                },
                {
                    recipientId: user._id
                }
            ],
            $and: [
                {
                    userId: {
                        $nin: found
                    },
                    recipientId: {
                        $nin: found
                    }
                },
                {
                    userId: {
                        $nin: mute.map((m)=>m.muteeId)
                    },
                    recipientId: {
                        $nin: mute.map((m)=>m.muteeId)
                    }
                }
            ]
        }, {
            sort: {
                createdAt: -1
            }
        });
        if (message) {
            history.push(message);
        } else {
            break;
        }
    }
    return await Promise.all(history.map((h)=>(0, _messagingmessage.pack)(h._id, user)));
});

//# sourceMappingURL=history.js.map
