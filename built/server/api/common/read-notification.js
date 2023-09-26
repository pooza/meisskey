"use strict";
Object.defineProperty(exports, /**
 * Mark notifications as read
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("mongodb");
const _isobjectid = require("../../../misc/is-objectid");
const _notification = require("../../../models/notification");
const _stream = require("../../../services/stream");
const _gethideusers = require("./get-hide-users");
const _user = require("../../../models/user");
const _default = (user, message)=>new Promise(async (resolve, reject)=>{
        const userId = (0, _isobjectid.default)(user) ? user : new _mongodb.ObjectID(user);
        const ids = Array.isArray(message) ? (0, _isobjectid.default)(message[0]) ? message : typeof message[0] === 'string' ? message.map((m)=>new _mongodb.ObjectID(m)) : message.map((m)=>m._id) : (0, _isobjectid.default)(message) ? [
            message
        ] : typeof message === 'string' ? [
            new _mongodb.ObjectID(message)
        ] : [
            message._id
        ];
        // Update documents
        const readResult = await _notification.default.update({
            _id: {
                $in: ids
            },
            isRead: false
        }, {
            $set: {
                isRead: true
            }
        }, {
            multi: true
        });
        if (readResult.nModified === 0) return;
        const hideUserIds = await (0, _gethideusers.getHideUserIdsById)(userId, false, true);
        // Calc count of my unread notifications
        const count = await _notification.default.count({
            notifieeId: userId,
            notifierId: {
                $nin: hideUserIds
            },
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
                    hasUnreadNotification: false
                }
            });
            // 全ての(いままで未読だった)通知を(これで)読みましたよというイベントを発行
            (0, _stream.publishMainStream)(userId, 'readAllNotifications');
        }
    });

//# sourceMappingURL=read-notification.js.map
