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
const _user = require("../../../../models/user");
const _stream = require("../../../../services/stream");
const _noteunread = require("../../../../models/note-unread");
const _define = require("../../define");
const meta = {
    desc: {
        'ja-JP': '未読の投稿をすべて既読にします。',
        'en-US': 'Mark all messages as read.'
    },
    tags: [
        'account'
    ],
    requireCredential: true,
    kind: [
        'write:account',
        'account-write',
        'account/write'
    ],
    params: {}
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Remove documents
    await _noteunread.default.remove({
        userId: user._id
    });
    _user.default.update({
        _id: user._id
    }, {
        $set: {
            hasUnreadMentions: false,
            hasUnreadSpecifiedNotes: false
        }
    });
    // 全て既読になったイベントを発行
    (0, _stream.publishMainStream)(user._id, 'readAllUnreadMentions');
    (0, _stream.publishMainStream)(user._id, 'readAllUnreadSpecifiedNotes');
    return;
});

//# sourceMappingURL=read-all-unread-notes.js.map
