"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    triggerUpdate: function() {
        return triggerUpdate;
    },
    deliverQuestionUpdate: function() {
        return deliverQuestionUpdate;
    }
});
const _note = require("../../../models/note");
const _question = require("../../../remote/activitypub/models/question");
const _logger = require("../../logger");
const _user = require("../../../models/user");
const _update = require("../../../remote/activitypub/renderer/update");
const _renderer = require("../../../remote/activitypub/renderer");
const _note1 = require("../../../remote/activitypub/renderer/note");
const _delivermanager = require("../../../remote/activitypub/deliver-manager");
const _relay = require("../../relay");
const ms = require("ms");
const logger = new _logger.default('pollsUpdate');
async function triggerUpdate(note) {
    if (!note.updatedAt || Date.now() - new Date(note.updatedAt).getTime() > ms('1min')) {
        logger.info(`Updating ${note._id}`);
        try {
            const updated = await (0, _question.updateQuestion)(note.uri);
            logger.info(`Updated ${note._id} ${updated ? 'changed' : 'nochange'}`);
        } catch (e) {
            logger.error(e);
        }
    }
}
async function deliverQuestionUpdate(noteId) {
    const note = await _note.default.findOne({
        _id: noteId
    });
    const user = await _user.default.findOne({
        _id: note.userId
    });
    if ((0, _user.isLocalUser)(user)) {
        const content = (0, _renderer.renderActivity)((0, _update.default)(await (0, _note1.default)(note, false), user));
        (0, _delivermanager.deliverToFollowers)(user, content, true);
        (0, _relay.deliverToRelays)(user, content);
    }
}

//# sourceMappingURL=update.js.map
