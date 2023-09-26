"use strict";
Object.defineProperty(exports, "undoAnnounce", {
    enumerable: true,
    get: function() {
        return undoAnnounce;
    }
});
const _mongodb = require("mongodb");
const _config = require("../../../../config");
const _delete = require("../../../../services/note/delete");
const _note = require("../../../../models/note");
const undoAnnounce = async (actor, activity)=>{
    const targetUri = typeof activity.object == 'string' ? activity.object : activity.object.id;
    let note;
    if (targetUri.startsWith(_config.default.url + '/')) {
        // 対象がローカルの場合
        const id = new _mongodb.ObjectID(targetUri.split('/').pop());
        note = await _note.default.findOne({
            userId: actor._id,
            renoteId: id,
            deletedAt: {
                $exists: false
            }
        });
        if (!note) {
            return `skip: target renote is not found`;
        }
    } else {
        // 対象がリモートの場合
        const targetNote = await _note.default.findOne({
            uri: targetUri
        });
        if (!targetNote) {
            return `skip: target note is not found`;
        }
        note = await _note.default.findOne({
            userId: actor._id,
            renoteId: targetNote._id,
            deletedAt: {
                $exists: false
            }
        });
        if (!note) {
            return `skip: target renote is not found`;
        }
    }
    await (0, _delete.default)(actor, note);
    return `ok`;
};

//# sourceMappingURL=announce.js.map
