"use strict";
Object.defineProperty(exports, "deleteMessage", {
    enumerable: true,
    get: function() {
        return deleteMessage;
    }
});
const _user = require("../../models/user");
const _messagingmessage = require("../../models/messaging-message");
const _stream = require("../stream");
const _drivefile = require("../../models/drive-file");
async function deleteMessage(message) {
    await _messagingmessage.default.remove({
        _id: message._id
    });
    postDeleteMessage(message);
}
async function postDeleteMessage(message) {
    const user = await _user.default.findOne({
        _id: message.userId
    });
    const recipient = await _user.default.findOne({
        _id: message.recipientId
    });
    if (user == null || recipient == null) return;
    if ((0, _user.isLocalUser)(user)) {
        (0, _stream.publishMessagingStream)(user._id, message.recipientId, 'deleted', message._id);
    }
    if ((0, _user.isLocalUser)(recipient)) {
        (0, _stream.publishMessagingStream)(recipient._id, message.userId, 'deleted', message._id);
    }
    // ファイルが添付されていた場合ドライブのファイルの「このファイルが添付されたチャットメッセージ一覧」プロパティからこの投稿を削除
    if (message.fileId) {
        _drivefile.default.update({
            _id: message.fileId
        }, {
            $pull: {
                'metadata.attachedMessageIds': message._id
            }
        });
    }
}

//# sourceMappingURL=delete.js.map
