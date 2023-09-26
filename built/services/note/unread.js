"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _noteunread = require("../../models/note-unread");
const _user = require("../../models/user");
const _stream = require("../stream");
async function _default(user, note, isSpecified = false) {
    //#region ミュートしているなら無視
    const mute = await (0, _user.getMute)(user._id, note.userId);
    if (mute) return;
    const blocks = await (0, _user.getBlocks)(user._id, note.userId);
    if (blocks.length > 0) return;
    //#endregion
    const unread = await _noteunread.default.insert({
        noteId: note._id,
        userId: user._id,
        isSpecified,
        _note: {
            userId: note.userId
        }
    });
    // 2秒経っても既読にならなかったら「未読の投稿がありますよ」イベントを発行する
    setTimeout(async ()=>{
        const exist = await _noteunread.default.findOne({
            _id: unread._id
        });
        if (exist == null) return;
        _user.default.update({
            _id: user._id
        }, {
            $set: isSpecified ? {
                hasUnreadSpecifiedNotes: true,
                hasUnreadMentions: true
            } : {
                hasUnreadMentions: true
            }
        });
        (0, _stream.publishMainStream)(user._id, 'unreadMention', note._id);
        if (isSpecified) {
            (0, _stream.publishMainStream)(user._id, 'unreadSpecifiedNote', note._id);
        }
    }, 2000);
}

//# sourceMappingURL=unread.js.map
