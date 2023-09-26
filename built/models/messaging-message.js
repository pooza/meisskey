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
    isValidText: function() {
        return isValidText;
    },
    pack: function() {
        return pack;
    }
});
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _user = require("./user");
const _drivefile = require("./drive-file");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _stringz = require("stringz");
const MessagingMessage = _mongodb1.default.get('messagingMessages');
MessagingMessage.createIndex('userId');
MessagingMessage.createIndex('recipientId');
const _default = MessagingMessage;
function isValidText(text) {
    return (0, _stringz.length)(text.trim()) <= 1000 && text.trim() != '';
}
const pack = async (message, me, options)=>{
    const opts = options || {
        populateRecipient: true
    };
    let _message;
    // Populate the message if 'message' is ID
    if ((0, _isobjectid.default)(message)) {
        _message = await MessagingMessage.findOne({
            _id: message
        });
    } else if (typeof message === 'string') {
        _message = await MessagingMessage.findOne({
            _id: new _mongodb.ObjectID(message)
        });
    } else {
        _message = _deepcopy(message);
    }
    if (_message == null) return null;
    // Rename _id to id
    _message.id = _message._id;
    delete _message._id;
    // Populate user
    _message.user = await (0, _user.pack)(_message.userId, me);
    if (_message.fileId) {
        // Populate file
        _message.file = await (0, _drivefile.pack)(_message.fileId);
    }
    if (opts.populateRecipient) {
        // Populate recipient
        _message.recipient = await (0, _user.pack)(_message.recipientId, me);
    }
    return _message;
};

//# sourceMappingURL=messaging-message.js.map
