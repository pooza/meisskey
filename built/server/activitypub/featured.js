"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("mongodb");
const _config = require("../../config");
const _user = require("../../models/user");
const _renderer = require("../../remote/activitypub/renderer");
const _orderedcollection = require("../../remote/activitypub/renderer/ordered-collection");
const _activitypub = require("../activitypub");
const _note = require("../../models/note");
const _note1 = require("../../remote/activitypub/renderer/note");
const _default = async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    if (!_mongodb.ObjectID.isValid(ctx.params.user)) {
        ctx.status = 404;
        return;
    }
    const userId = new _mongodb.ObjectID(ctx.params.user);
    // Verify user
    const user = await _user.default.findOne({
        _id: userId,
        isDeleted: {
            $ne: true
        },
        isSuspended: {
            $ne: true
        },
        noFederation: {
            $ne: true
        },
        host: null
    });
    if (user == null) {
        ctx.status = 404;
        return;
    }
    const pinnedNoteIds = user.pinnedNoteIds || [];
    const pinnedNotes = await Promise.all(pinnedNoteIds.filter(_mongodb.ObjectID.isValid).map((id)=>_note.default.findOne({
            _id: id
        })));
    const renderedNotes = await Promise.all(pinnedNotes.filter((note)=>note != null && note.deletedAt == null).map((note)=>(0, _note1.default)(note)));
    const rendered = (0, _orderedcollection.default)(`${_config.default.url}/users/${userId}/collections/featured`, renderedNotes.length, null, null, renderedNotes);
    ctx.body = (0, _renderer.renderActivity)(rendered);
    ctx.set('Cache-Control', 'public, max-age=180');
    (0, _activitypub.setResponseType)(ctx);
};

//# sourceMappingURL=featured.js.map
