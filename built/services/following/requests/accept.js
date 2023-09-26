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
const _accept = require("../../../remote/activitypub/renderer/accept");
const _queue = require("../../../queue");
const _stream = require("../../stream");
const _create = require("../create");
const _identifiableerror = require("../../../misc/identifiable-error");
async function _default(followee, follower) {
    const request = await _followrequest.default.findOne({
        followeeId: followee._id,
        followerId: follower._id
    });
    if (request == null) {
        throw new _identifiableerror.IdentifiableError('8884c2dd-5795-4ac9-b27e-6a01d38190f9', 'No follow request.');
    }
    await (0, _create.insertFollowingDoc)(followee, follower);
    if ((0, _user.isRemoteUser)(follower)) {
        const content = (0, _renderer.renderActivity)((0, _accept.default)((0, _follow.default)(follower, followee, request.requestId), followee));
        (0, _queue.deliver)(followee, content, follower.inbox);
    }
    (0, _user.pack)(followee, followee, {
        detail: true
    }).then((packed)=>(0, _stream.publishMainStream)(followee._id, 'meUpdated', packed));
}

//# sourceMappingURL=accept.js.map
