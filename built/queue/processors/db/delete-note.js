"use strict";
Object.defineProperty(exports, "deleteNote", {
    enumerable: true,
    get: function() {
        return deleteNote;
    }
});
const _logger = require("../../logger");
const _note = require("../../../models/note");
const _user = require("../../../models/user");
const _delete = require("../../../services/note/delete");
const logger = _logger.queueLogger.createSubLogger('delete-note');
async function deleteNote(job) {
    logger.info(`deleting note ${job.data.noteId} ...`);
    const note = await _note.default.findOne(job.data.noteId);
    if (note == null) {
        return `skip: note not found (${job.data.noteId})`;
    }
    const user = await _user.default.findOne(note.userId);
    if (user == null) {
        return `skip: note user not found (${note.userId})`;
    }
    await (0, _delete.default)(user, note);
    return `ok: deleted note: ${note._id}`;
}

//# sourceMappingURL=delete-note.js.map
