"use strict";
Object.defineProperty(exports, "notifyPollFinished", {
    enumerable: true,
    get: function() {
        return notifyPollFinished;
    }
});
const _mongodb = require("mongodb");
const _logger = require("../../logger");
const _note = require("../../../models/note");
const _createnotification = require("../../../services/create-notification");
const _instanceactor = require("../../../services/instance-actor");
const logger = _logger.queueLogger.createSubLogger('notify-poll-finished');
async function notifyPollFinished(job) {
    logger.info(`${job.data.noteId} for ${job.data.userId} ...`);
    const note = await _note.default.findOne(job.data.noteId);
    if (note == null) {
        return `skip: poll not found (${job.data.noteId})`;
    }
    if (note.deletedAt) {
        return `skip: poll deleted (${job.data.noteId})`;
    }
    const notifee = new _mongodb.ObjectID(job.data.userId);
    const nofifer = await (0, _instanceactor.getInstanceActor)();
    (0, _createnotification.createNotification)(notifee, nofifer._id, 'poll_finished', {
        noteId: note._id
    });
    return `ok`;
}

//# sourceMappingURL=notify-poll-finished.js.map
