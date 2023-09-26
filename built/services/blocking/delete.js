"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../models/user");
const _blocking = require("../../models/blocking");
const _renderer = require("../../remote/activitypub/renderer");
const _block = require("../../remote/activitypub/renderer/block");
const _undo = require("../../remote/activitypub/renderer/undo");
const _queue = require("../../queue");
const _logger = require("../logger");
const _serverevent = require("../server-event");
const logger = new _logger.default('blocking/delete');
async function _default(blocker, blockee) {
    const blocking = await _blocking.default.findOne({
        blockerId: blocker._id,
        blockeeId: blockee._id
    });
    if (blocking == null) {
        logger.warn('ブロック解除がリクエストされましたがブロックしていませんでした');
        return;
    }
    _blocking.default.remove({
        _id: blocking._id
    });
    if ((0, _user.isLocalUser)(blocker)) {
        (0, _serverevent.publishMutingChanged)(blocker._id);
    }
    if ((0, _user.isLocalUser)(blockee)) {
        (0, _serverevent.publishMutingChanged)(blockee._id);
    }
    // deliver if remote bloking
    if ((0, _user.isLocalUser)(blocker) && (0, _user.isRemoteUser)(blockee)) {
        const content = (0, _renderer.renderActivity)((0, _undo.default)((0, _block.default)(blocker, blockee), blocker));
        (0, _queue.deliver)(blocker, content, blockee.inbox);
    }
}

//# sourceMappingURL=delete.js.map
