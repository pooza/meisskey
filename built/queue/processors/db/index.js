"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _deletenotes = require("./delete-notes");
const _deletedrivefiles = require("./delete-drive-files");
const _deletenote = require("./delete-note");
const _deletesignins = require("./delete-signins");
const _exportnotes = require("./export-notes");
const _exportfollowing = require("./export-following");
const _exportmute = require("./export-mute");
const _exportblocking = require("./export-blocking");
const _exportuserlists = require("./export-user-lists");
const _importfollowing = require("./import-following");
const _importblocking = require("./import-blocking");
const _importmute = require("./import-mute");
const _importuserlists = require("./import-user-lists");
const _notifypollfinished = require("./notify-poll-finished");
const _expiremute = require("./expire-mute");
const jobs = {
    deleteNotes: _deletenotes.deleteNotes,
    deleteDriveFiles: _deletedrivefiles.deleteDriveFiles,
    deleteNote: _deletenote.deleteNote,
    deleteSignins: _deletesignins.deleteSignins,
    exportNotes: _exportnotes.exportNotes,
    exportFollowing: _exportfollowing.exportFollowing,
    exportMute: _exportmute.exportMute,
    exportBlocking: _exportblocking.exportBlocking,
    exportUserLists: _exportuserlists.exportUserLists,
    importFollowing: _importfollowing.importFollowing,
    importBlocking: _importblocking.importBlocking,
    importMute: _importmute.importMute,
    importUserLists: _importuserlists.importUserLists,
    notifyPollFinished: _notifypollfinished.notifyPollFinished,
    expireMute: _expiremute.expireMute
};
function _default(dbQueue) {
    for (const [k, v] of Object.entries(jobs)){
        dbQueue.process(k, v);
    }
}

//# sourceMappingURL=index.js.map
