"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _notewatching = require("../../models/note-watching");
const _default = async (me, note)=>{
    // 自分の投稿はwatchできない
    if (me.equals(note.userId)) {
        return;
    }
    // if watching now
    const exist = await _notewatching.default.findOne({
        noteId: note._id,
        userId: me
    });
    if (exist !== null) {
        return;
    }
    await _notewatching.default.insert({
        createdAt: new Date(),
        noteId: note._id,
        userId: me
    });
};

//# sourceMappingURL=watch.js.map
