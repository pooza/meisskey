"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../models/user");
const _note = require("../../../models/note");
const _notereaction = require("../../../models/note-reaction");
const _stream = require("../../stream");
const _like = require("../../../remote/activitypub/renderer/like");
const _undo = require("../../../remote/activitypub/renderer/undo");
const _renderer = require("../../../remote/activitypub/renderer");
const _delivermanager = require("../../../remote/activitypub/deliver-manager");
const _identifiableerror = require("../../../misc/identifiable-error");
const _reactionlib = require("../../../misc/reaction-lib");
const _notification = require("../../../models/notification");
const _default = async (user, note)=>{
    // if already unreacted
    const exist = await _notereaction.default.findOne({
        noteId: note._id,
        userId: user._id,
        deletedAt: {
            $exists: false
        }
    });
    if (exist == null) {
        throw new _identifiableerror.IdentifiableError('60527ec9-b4cb-4a88-a6bd-32d3ad26817d', 'not reacted');
    }
    // Delete reaction
    const result = await _notereaction.default.remove({
        _id: exist._id
    });
    if (result.deletedCount !== 1) {
        throw new _identifiableerror.IdentifiableError('60527ec9-b4cb-4a88-a6bd-32d3ad26817d', 'not reacted');
    }
    const dec = {};
    dec[`reactionCounts.${exist.reaction}`] = -1;
    dec.score = user.isBot || exist.dislike ? 0 : -1;
    // Decrement reactions count
    _note.default.update({
        _id: note._id
    }, {
        $inc: dec
    });
    _notification.default.remove({
        noteId: note._id,
        notifierId: user._id,
        reaction: exist.reaction
    });
    (0, _stream.publishNoteStream)(note._id, 'unreacted', {
        reaction: (0, _reactionlib.decodeReaction)(exist.reaction),
        userId: user._id
    });
    //#region 配信
    if ((0, _user.isLocalUser)(user) && !note.localOnly && !user.noFederation) {
        const content = (0, _renderer.renderActivity)((0, _undo.default)(await (0, _like.renderLike)(exist, note), user), user);
        if ((0, _user.isRemoteUser)(note._user)) (0, _delivermanager.deliverToUser)(user, content, note._user);
        (0, _delivermanager.deliverToFollowers)(user, content, true);
    //deliverToRelays(user, content);
    }
    //#endregion
    return;
};

//# sourceMappingURL=delete.js.map
