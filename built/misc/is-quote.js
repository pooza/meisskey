"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
function _default(note) {
    return note.renoteId != null && (note.text != null || note.poll != null || note.fileIds != null && note.fileIds.length > 0);
}

//# sourceMappingURL=is-quote.js.map
