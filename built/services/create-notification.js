/* eslint-disable no-async-promise-executor */ "use strict";
Object.defineProperty(exports, "createNotification", {
    enumerable: true,
    get: function() {
        return createNotification;
    }
});
const _notification = require("../models/notification");
const _stream = require("./stream");
const _user = require("../models/user");
const _pushnotification = require("./push-notification");
async function createNotification(notifiee, notifier, type, content) {
    if (notifiee.equals(notifier)) return;
    // Create notification
    const notification = await _notification.default.insert(Object.assign({
        createdAt: new Date(),
        notifieeId: notifiee,
        notifierId: notifier,
        type: type,
        isRead: false
    }, content));
    // post process
    (async ()=>{
        const packed = await (0, _notification.pack)(notification);
        // Publish notification event
        (0, _stream.publishMainStream)(notifiee, 'notification', packed);
        // 2秒経っても(今回作成した)通知が既読にならなかったら「未読の通知がありますよ」イベントを発行する
        setTimeout(async ()=>{
            const fresh = await _notification.default.findOne({
                _id: notification._id
            }, {
                isRead: true
            });
            if (fresh == null) return;
            if (!fresh.isRead) {
                //#region ただしミュートしているユーザーからの通知なら無視
                const mute = await (0, _user.getMute)(notifiee, notifier);
                if (mute) return;
                const blocks = await (0, _user.getBlocks)(notifiee, notifier);
                if (blocks.length > 0) return;
                //#endregion
                // Update flag
                _user.default.update({
                    _id: notifiee
                }, {
                    $set: {
                        hasUnreadNotification: true
                    }
                });
                (0, _stream.publishMainStream)(notifiee, 'unreadNotification', packed);
                (0, _pushnotification.default)(notifiee, 'notification', packed);
            }
        }, 2000);
    })();
    return notification;
}

//# sourceMappingURL=create-notification.js.map
