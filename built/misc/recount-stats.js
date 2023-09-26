"use strict";
Object.defineProperty(exports, "RecountStats", {
    enumerable: true,
    get: function() {
        return RecountStats;
    }
});
const _note = require("../models/note");
const _user = require("../models/user");
const _meta = require("../models/meta");
const _notereaction = require("../models/note-reaction");
async function RecountStats() {
    const notesCount = await _note.default.count({
    });
    console.log(`notesCount: ${notesCount}`);
    const originalNotesCount = await _note.default.count({
        //deletedAt: { $exists: false },
        '_user.host': null
    });
    console.log(`originalNotesCount: ${originalNotesCount}`);
    const usersCount = await _user.default.count({
    });
    console.log(`usersCount: ${usersCount}`);
    const originalUsersCount = await _user.default.count({
        //isDeleted: { $ne: true },
        //isSuspended: { $ne: true },
        host: null
    });
    console.log(`originalUsersCount: ${originalUsersCount}`);
    const reactionsCount = await _notereaction.default.count({});
    //const originalReactionsCount = await Note.count(...);
    console.log(`reactionsCount: ${reactionsCount}`);
    _meta.default.update({}, {
        $set: {
            'stats.notesCount': notesCount,
            'stats.originalNotesCount': originalNotesCount,
            'stats.usersCount': usersCount,
            'stats.originalUsersCount': originalUsersCount,
            'stats.reactionsCount': reactionsCount
        }
    });
}

//# sourceMappingURL=recount-stats.js.map
