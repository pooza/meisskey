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
const _reject = require("../../../remote/activitypub/renderer/reject");
const _queue = require("../../../queue");
const _stream = require("../../stream");
const _following = require("../../../models/following");
const _delete = require("../delete");
const _serverevent = require("../../server-event");
async function _default(followee, follower) {
    if ((0, _user.isRemoteUser)(follower)) {
        var _request;
        const request = await _followrequest.default.findOne({
            followeeId: followee._id,
            followerId: follower._id
        });
        const content = (0, _renderer.renderActivity)((0, _reject.default)((0, _follow.default)(follower, followee, (_request = request) === null || _request === void 0 ? void 0 : _request.requestId), followee));
        (0, _queue.deliver)(followee, content, follower.inbox);
    }
    const request = await _followrequest.default.findOne({
        followeeId: followee._id,
        followerId: follower._id
    });
    if (request) {
        await _followrequest.default.remove({
            _id: request._id
        });
        _user.default.update({
            _id: followee._id
        }, {
            $inc: {
                pendingReceivedFollowRequestsCount: -1
            }
        });
    } else {
        const following = await _following.default.findOne({
            followeeId: followee._id,
            followerId: follower._id
        });
        if (following) {
            await _following.default.remove({
                _id: following._id
            });
            (0, _delete.decrementFollowing)(follower, followee);
            if ((0, _user.isLocalUser)(follower)) {
                (0, _serverevent.publishFollowingChanged)(follower._id);
            }
        }
    }
    (0, _user.pack)(followee, follower, {
        detail: true
    }).then((packed)=>(0, _stream.publishMainStream)(follower._id, 'unfollow', packed));
}

//# sourceMappingURL=reject.js.map
