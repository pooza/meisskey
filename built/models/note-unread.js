"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const NoteUnread = _mongodb.default.get('noteUnreads');
NoteUnread.createIndex('userId');
NoteUnread.createIndex('noteId');
NoteUnread.createIndex([
    'userId',
    'noteId'
], {
    unique: true
});
const _default = NoteUnread;

//# sourceMappingURL=note-unread.js.map
