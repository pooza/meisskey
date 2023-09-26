"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _notewatching = require("../../models/note-watching");
const _default = async (me, note)=>{
    await _notewatching.default.remove({
        noteId: note._id,
        userId: me
    });
};

//# sourceMappingURL=unwatch.js.map
