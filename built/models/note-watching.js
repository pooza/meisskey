"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const NoteWatching = _mongodb.default.get('noteWatching');
NoteWatching.createIndex('userId');
NoteWatching.createIndex('noteId');
NoteWatching.createIndex([
    'userId',
    'noteId'
], {
    unique: true
});
const _default = NoteWatching;

//# sourceMappingURL=note-watching.js.map
