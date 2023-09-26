"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../models/user");
const _stream = require("../../stream");
const _createnotification = require("../../../services/create-notification");
const _renderer = require("../../../remote/activitypub/renderer");
const _follow = require("../../../remote/activitypub/renderer/follow");
const _queue = require("../../../queue");
const _followrequest = require("../../../models/follow-request");
const _blocking = require("../../../models/blocking");
const _reject = require("../../../remote/activitypub/renderer/reject");
const _following = require("../../../models/following");
async function _default(follower, followee, requestId) {
    // badoogirls
    if ((0, _user.isRemoteUser)(follower) && (0, _user.isLocalUser)(followee)) {
        if (follower.description && follower.description.match(/badoogirls/)) {
            const content = (0, _renderer.renderActivity)((0, _reject.default)((0, _follow.default)(follower, followee, requestId), followee));
            (0, _queue.deliver)(followee, content, follower.inbox);
            return;
        }
    }
    // check blocking
    const [blocking, blocked] = await Promise.all([
        _blocking.default.findOne({
            blockerId: follower._id,
            blockeeId: followee._id
        }),
        _blocking.default.findOne({
            blockerId: followee._id,
            blockeeId: follower._id
        })
    ]);
    // このアカウントはフォローできないオプション
    let userRefused = false;
    if ((0, _user.isLocalUser)(followee) && followee.refuseFollow) {
        userRefused = true;
        if (followee.autoAcceptFollowed) {
            const followed = await _following.default.findOne({
                followerId: followee._id,
                followeeId: follower._id
            });
            if (followed) userRefused = false;
        }
    }
    if (blocking != null) throw new Error('blocking');
    if (blocked || userRefused) throw new Error('blocked');
    await _followrequest.default.insert({
        createdAt: new Date(),
        followerId: follower._id,
        followeeId: followee._id,
        requestId,
        // 非正規化
        _follower: {
            host: follower.host,
            inbox: (0, _user.isRemoteUser)(follower) ? follower.inbox : undefined,
            sharedInbox: (0, _user.isRemoteUser)(follower) ? follower.sharedInbox : undefined
        },
        _followee: {
            host: followee.host,
            inbox: (0, _user.isRemoteUser)(followee) ? followee.inbox : undefined,
            sharedInbox: (0, _user.isRemoteUser)(followee) ? followee.sharedInbox : undefined
        }
    });
    await _user.default.update({
        _id: followee._id
    }, {
        $inc: {
            pendingReceivedFollowRequestsCount: 1
        }
    });
    // Publish receiveRequest event
    if ((0, _user.isLocalUser)(followee)) {
        (0, _user.pack)(follower, followee).then((packed)=>(0, _stream.publishMainStream)(followee._id, 'receiveFollowRequest', packed));
        (0, _user.pack)(followee, followee, {
            detail: true
        }).then((packed)=>(0, _stream.publishMainStream)(followee._id, 'meUpdated', packed));
        // 通知を作成
        (0, _createnotification.createNotification)(followee._id, follower._id, 'receiveFollowRequest');
    }
    if ((0, _user.isLocalUser)(follower) && (0, _user.isRemoteUser)(followee)) {
        const content = (0, _renderer.renderActivity)((0, _follow.default)(follower, followee));
        (0, _queue.deliver)(follower, content, followee.inbox);
    }
}

//# sourceMappingURL=create.js.map
