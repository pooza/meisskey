"use strict";
Object.defineProperty(exports, /**
 * Mark messages as read
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("mongodb");
const _isobjectid = require("../../../misc/is-objectid");
const _messagingmessage = require("../../../models/messaging-message");
const _stream = require("../../../services/stream");
const _user = require("../../../models/user");
const _default = async (user, otherparty, message)=>{
    // populate my (メッセージを読んだユーザー) user id
    const userId = (0, _isobjectid.default)(user) ? user : new _mongodb.ObjectID(user);
    // populate otherparty (メッセージを読まれた/既読通知を送られる側) user id
    const otherpartyId = (0, _isobjectid.default)(otherparty) ? otherparty : new _mongodb.ObjectID(otherparty);
    // populate target message ids
    const ids = Array.isArray(message) ? (0, _isobjectid.default)(message[0]) ? message : typeof message[0] === 'string' ? message.map((m)=>new _mongodb.ObjectID(m)) : message.map((m)=>m._id) : (0, _isobjectid.default)(message) ? [
        message
    ] : typeof message === 'string' ? [
        new _mongodb.ObjectID(message)
    ] : [
        message._id
    ];
    // 実際に既読にされるであろうメッセージを予め取得
    const toRead = await _messagingmessage.default.find({
        _id: {
            $in: ids
        },
        userId: otherpartyId,
        recipientId: userId,
        isRead: false
    });
    if (toRead.length === 0) return [];
    // 必要であれば既読処理
    await _messagingmessage.default.update({
        _id: {
            $in: toRead.map((x)=>x._id)
        }
    }, {
        $set: {
            isRead: true
        }
    }, {
        multi: true
    });
    // Publish event
    (0, _stream.publishMessagingStream)(otherpartyId, userId, 'read', toRead.map((x)=>x._id.toString()));
    (0, _stream.publishMessagingIndexStream)(userId, 'read', toRead.map((x)=>x._id.toString()));
    // Calc count of my unread messages
    const count = await _messagingmessage.default.count({
        recipientId: userId,
        isRead: false
    }, {
        limit: 1
    });
    if (count == 0) {
        // Update flag
        _user.default.update({
            _id: userId
        }, {
            $set: {
                hasUnreadMessagingMessage: false
            }
        });
        // 全ての(いままで未読だった)自分宛てのメッセージを(これで)読みましたよというイベントを発行
        (0, _stream.publishMainStream)(userId, 'readAllMessagingMessages');
    }
    return toRead;
};

//# sourceMappingURL=read-messaging-message.js.map
