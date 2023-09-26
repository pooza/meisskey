"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../models/user");
const _followrequest = require("../../../models/follow-request");
const _renderer = require("../../../remote/activitypub/renderer");
const _follow = require("../../../remote/activitypub/renderer/follow");
const _undo = require("../../../remote/activitypub/renderer/undo");
const _queue = require("../../../queue");
const _stream = require("../../stream");
const _identifiableerror = require("../../../misc/identifiable-error");
async function _default(followee, follower) {
    if ((0, _user.isRemoteUser)(followee)) {
        const content = (0, _renderer.renderActivity)((0, _undo.default)((0, _follow.default)(follower, followee), follower));
        (0, _queue.deliver)(follower, content, followee.inbox);
    }
    const request = await _followrequest.default.findOne({
        followeeId: followee._id,
        followerId: follower._id
    });
    if (request == null) {
        throw new _identifiableerror.IdentifiableError('17447091-ce07-46dd-b331-c1fd4f15b1e7', 'request not found');
    }
    await _followrequest.default.remove({
        followeeId: followee._id,
        followerId: follower._id
    });
    await _user.default.update({
        _id: followee._id
    }, {
        $inc: {
            pendingReceivedFollowRequestsCount: -1
        }
    });
    (0, _user.pack)(followee, followee, {
        detail: true
    }).then((packed)=>(0, _stream.publishMainStream)(followee._id, 'meUpdated', packed));
}

//# sourceMappingURL=cancel.js.map
