"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../../models/user");
const _messagingmessage = require("../../../../models/messaging-message");
const _logger = require("../../logger");
const _queue = require("../../../../queue");
const _suspenduser = require("../../../../services/suspend-user");
const logger = _logger.apLogger;
async function _default(actor, uri) {
    logger.info(`Deleting the Actor: ${uri}`);
    if (actor.uri !== uri) {
        return `skip: delete actor ${actor.uri} !== ${uri}`;
    }
    if (actor.isDeleted) {
        logger.info(`skip: already deleted`);
    }
    await _user.default.update({
        _id: actor._id
    }, {
        $set: {
            isDeleted: true,
            name: null,
            description: null,
            pinnedNoteIds: [],
            password: null,
            email: null,
            twitter: null,
            github: null,
            discord: null,
            profile: {},
            fields: [],
            clientSettings: {}
        }
    });
    _messagingmessage.default.remove({
        userId: actor._id
    });
    (0, _queue.createDeleteNotesJob)(actor);
    (0, _queue.createDeleteDriveFilesJob)(actor);
    (0, _suspenduser.doPostSuspend)(actor);
    return 'ok: deleted';
}

//# sourceMappingURL=actor.js.map
