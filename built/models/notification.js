"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    packMany: function() {
        return packMany;
    },
    pack: function() {
        return pack;
    }
});
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _user = require("./user");
const _note = require("./note");
const _messagingmessage = require("./messaging-message");
const _logger = require("../db/logger");
const _reactionlib = require("../misc/reaction-lib");
const Notification = _mongodb1.default.get('notifications');
Notification.createIndex('notifieeId');
Notification.createIndex('noteId', {
    sparse: true
});
const _default = Notification;
const packMany = (notifications)=>{
    return Promise.all(notifications.map((n)=>pack(n)));
};
const pack = async (notification)=>{
    let _notification;
    // Populate the notification if 'notification' is ID
    if ((0, _isobjectid.default)(notification)) {
        _notification = await Notification.findOne({
            _id: notification
        });
    } else if (typeof notification === 'string') {
        _notification = await Notification.findOne({
            _id: new _mongodb.ObjectID(notification)
        });
    } else {
        _notification = _deepcopy(notification);
    }
    // Rename _id to id
    _notification.id = _notification._id;
    delete _notification._id;
    // Rename notifierId to userId
    _notification.userId = _notification.notifierId;
    delete _notification.notifierId;
    const me = _notification.notifieeId;
    delete _notification.notifieeId;
    // Populate notifier
    _notification.user = await (0, _user.pack)(_notification.userId, me);
    switch(_notification.type){
        case 'follow':
        case 'receiveFollowRequest':
            break;
        case 'mention':
        case 'reply':
        case 'renote':
        case 'quote':
        case 'reaction':
        case 'poll_vote':
        case 'highlight':
        case 'poll_finished':
            // Populate note
            _notification.note = await (0, _note.pack)(_notification.noteId, me);
            // (データベースの不具合などで)投稿が見つからなかったら
            if (_notification.note == null) {
                _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: notification -> note :: ${_notification.id} (note ${_notification.noteId})`);
                _notification.type = '_missing_';
                delete _notification.noteId;
                delete _notification.note;
            }
            break;
        case 'unreadMessagingMessage':
            _notification.message = await (0, _messagingmessage.pack)(_notification.messageId, me);
            // (データベースの不具合などで)投稿が見つからなかったら
            if (_notification.message == null) {
                _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: notification -> message :: ${_notification.id} (note ${_notification.messageId})`);
                _notification.type = '_missing_';
                delete _notification.messageId;
                delete _notification.message;
            }
            break;
        default:
            _logger.dbLogger.error(`Unknown type: ${_notification.type}`);
            break;
    }
    if (_notification.reaction) _notification.reaction = (0, _reactionlib.decodeReaction)(_notification.reaction);
    return _notification;
};

//# sourceMappingURL=notification.js.map
