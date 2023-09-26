"use strict";
Object.defineProperty(exports, /**
 * 通知を表す文字列を取得します。
 * @param notification 通知
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _getusername = require("./get-user-name");
const _getnotesummary = require("./get-note-summary");
const _getreactionemoji = require("./get-reaction-emoji");
function _default(notification) {
    switch(notification.type){
        case 'follow':
            return `Follow ${(0, _getusername.default)(notification.user)}`;
        case 'mention':
            return `Mention ${(0, _getusername.default)(notification.user)} ${(0, _getnotesummary.default)(notification.note)}`;
        case 'reply':
            return `Reply ${(0, _getusername.default)(notification.user)} ${(0, _getnotesummary.default)(notification.note)}`;
        case 'renote':
            return `Renote ${(0, _getusername.default)(notification.user)} ${(0, _getnotesummary.default)(notification.note)}`;
        case 'quote':
            return `Quote ${(0, _getusername.default)(notification.user)} ${(0, _getnotesummary.default)(notification.note)}`;
        case 'reaction':
            return `${(0, _getreactionemoji.default)(notification.reaction)} ${(0, _getusername.default)(notification.user)} ${(0, _getnotesummary.default)(notification.note)}`;
        case 'poll_vote':
            return `Vote ${(0, _getusername.default)(notification.user)} ${(0, _getnotesummary.default)(notification.note)}`;
        case 'poll_finished':
            return `poll_finished ${(0, _getusername.default)(notification.user)} ${(0, _getnotesummary.default)(notification.note)}`;
        case 'unreadMessagingMessage':
            var _notification_message;
            return `${(0, _getusername.default)(notification.user)} ${(_notification_message = notification.message) === null || _notification_message === void 0 ? void 0 : _notification_message.text}}`;
        case 'highlight':
            return `Highlight ${(0, _getusername.default)(notification.user)} ${(0, _getnotesummary.default)(notification.note)}`;
        default:
            return `Unknown ${notification.type}`;
    }
}

//# sourceMappingURL=get-notification-summary.js.map
