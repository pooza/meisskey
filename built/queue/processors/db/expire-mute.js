"use strict";
Object.defineProperty(exports, "expireMute", {
    enumerable: true,
    get: function() {
        return expireMute;
    }
});
const _mongodb = require("mongodb");
const _logger = require("../../logger");
const _mute = require("../../../models/mute");
const _serverevent = require("../../../services/server-event");
const logger = _logger.queueLogger.createSubLogger('expire-mute');
async function expireMute(job) {
    logger.info(`deleting mute ${job.data.muteId} ...`);
    const mute = await _mute.default.findOne({
        _id: new _mongodb.ObjectID(job.data.muteId),
        expiresAt: {
            $lt: new Date()
        }
    });
    if (mute == null) {
        return `skip: mute not found (${job.data.muteId})`;
    }
    await _mute.default.remove({
        _id: mute._id
    });
    (0, _serverevent.publishMutingChanged)(mute.muterId);
    return `ok: mute deleted: ${mute._id}`;
}

//# sourceMappingURL=expire-mute.js.map
