"use strict";
Object.defineProperty(exports, "createMessage", {
    enumerable: true,
    get: function() {
        return createMessage;
    }
});
const _user = require("../../models/user");
const _drivefile = require("../../models/drive-file");
const _stream = require("../stream");
const _messagingmessage = require("../../models/messaging-message");
const _pushnotification = require("../push-notification");
const _createnotification = require("../create-notification");
async function createMessage(user, recipient, text, file, uri) {
    const message = await _messagingmessage.default.insert({
        createdAt: new Date(),
        fileId: file ? file._id : undefined,
        recipientId: recipient._id,
        text: text ? text.trim() : undefined,
        userId: user._id,
        isRead: false,
        uri
    });
    // ファイルが添付されていた場合ドライブのファイルの「このファイルが添付されたチャットメッセージ一覧」プロパティにこの投稿を追加
    if (file) {
        _drivefile.default.update({
            _id: file._id
        }, {
            $push: {
                'metadata.attachedMessageIds': message._id
            }
        });
    }
    const messageObj = await (0, _messagingmessage.pack)(message);
    if ((0, _user.isLocalUser)(user)) {
        // 自分のストリーム
        (0, _stream.publishMessagingStream)(message.userId, message.recipientId, 'message', messageObj);
        (0, _stream.publishMessagingIndexStream)(message.userId, 'message', messageObj);
        (0, _stream.publishMainStream)(message.userId, 'messagingMessage', messageObj);
    }
    if ((0, _user.isLocalUser)(recipient)) {
        // 相手のストリーム
        (0, _stream.publishMessagingStream)(message.recipientId, message.userId, 'message', messageObj);
        (0, _stream.publishMessagingIndexStream)(message.recipientId, 'message', messageObj);
        (0, _stream.publishMainStream)(message.recipientId, 'messagingMessage', messageObj);
        // Update flag
        _user.default.update({
            _id: recipient._id
        }, {
            $set: {
                hasUnreadMessagingMessage: true
            }
        });
        // 2秒経っても(今回作成した)メッセージが既読にならなかったら「未読のメッセージがありますよ」イベントを発行する
        setTimeout(async ()=>{
            const freshMessage = await _messagingmessage.default.findOne({
                _id: message._id
            }, {
                isRead: true
            });
            if (freshMessage == null) return; // メッセージが削除されている場合もある
            if (!freshMessage.isRead) {
                //#region ただしミュートされているなら発行しない
                const mute = await (0, _user.getMute)(recipient._id, user._id);
                if (mute) return;
                const blocks = await (0, _user.getBlocks)(recipient, user);
                if (blocks.length > 0) return;
                //#endregion
                (0, _stream.publishMainStream)(message.recipientId, 'unreadMessagingMessage', messageObj);
                (0, _pushnotification.default)(message.recipientId, 'unreadMessagingMessage', messageObj);
                (0, _createnotification.createNotification)(message.recipientId, message.userId, 'unreadMessagingMessage', {
                    messageId: freshMessage._id
                });
            }
        }, 2000);
    }
    return messageObj;
}

//# sourceMappingURL=create.js.map
