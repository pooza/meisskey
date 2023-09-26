"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../models/user");
const _following = require("../../models/following");
const _followrequest = require("../../models/follow-request");
const _stream = require("../stream");
const _renderer = require("../../remote/activitypub/renderer");
const _follow = require("../../remote/activitypub/renderer/follow");
const _undo = require("../../remote/activitypub/renderer/undo");
const _block = require("../../remote/activitypub/renderer/block");
const _queue = require("../../queue");
const _reject = require("../../remote/activitypub/renderer/reject");
const _peruserfollowing = require("../../services/chart/per-user-following");
const _blocking = require("../../models/blocking");
const _serverevent = require("../server-event");
async function _default(blocker, blockee) {
    await Promise.all([
        cancelRequest(blocker, blockee),
        cancelRequest(blockee, blocker),
        unFollow(blocker, blockee),
        unFollow(blockee, blocker)
    ]);
    await _blocking.default.insert({
        createdAt: new Date(),
        blockerId: blocker._id,
        blockeeId: blockee._id
    });
    if ((0, _user.isLocalUser)(blocker) && (0, _user.isRemoteUser)(blockee)) {
        const content = (0, _renderer.renderActivity)((0, _block.default)(blocker, blockee));
        (0, _queue.deliver)(blocker, content, blockee.inbox);
    }
    if ((0, _user.isLocalUser)(blocker)) {
        (0, _serverevent.publishMutingChanged)(blocker._id);
    }
    if ((0, _user.isLocalUser)(blockee)) {
        (0, _serverevent.publishMutingChanged)(blockee._id);
    }
}
async function cancelRequest(follower, followee) {
    const request = await _followrequest.default.findOne({
        followeeId: followee._id,
        followerId: follower._id
    });
    if (request == null) {
        return;
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
    if ((0, _user.isLocalUser)(followee)) {
        (0, _user.pack)(followee, followee, {
            detail: true
        }).then((packed)=>(0, _stream.publishMainStream)(followee._id, 'meUpdated', packed));
    }
    if ((0, _user.isLocalUser)(follower)) {
        (0, _user.pack)(followee, follower, {
            detail: true
        }).then((packed)=>(0, _stream.publishMainStream)(follower._id, 'unfollow', packed));
    }
    // リモートにフォローリクエストをしていたらUndoFollow送信
    if ((0, _user.isLocalUser)(follower) && (0, _user.isRemoteUser)(followee)) {
        const content = (0, _renderer.renderActivity)((0, _undo.default)((0, _follow.default)(follower, followee), follower));
        (0, _queue.deliver)(follower, content, followee.inbox);
    }
    // リモートからフォローリクエストを受けていたらReject送信
    if ((0, _user.isRemoteUser)(follower) && (0, _user.isLocalUser)(followee)) {
        const content = (0, _renderer.renderActivity)((0, _reject.default)((0, _follow.default)(follower, followee, request.requestId), followee));
        (0, _queue.deliver)(followee, content, follower.inbox);
    }
}
async function unFollow(follower, followee) {
    const following = await _following.default.findOne({
        followerId: follower._id,
        followeeId: followee._id
    });
    if (following == null) {
        return;
    }
    await _following.default.remove({
        _id: following._id
    });
    //#region Decrement following count
    _user.default.update({
        _id: follower._id
    }, {
        $inc: {
            followingCount: -1
        }
    });
    //#endregion
    //#region Decrement followers count
    _user.default.update({
        _id: followee._id
    }, {
        $inc: {
            followersCount: -1
        }
    });
    //#endregion
    _peruserfollowing.default.update(follower, followee, false);
    // Publish unfollow event
    if ((0, _user.isLocalUser)(follower)) {
        (0, _user.pack)(followee, follower, {
            detail: true
        }).then((packed)=>(0, _stream.publishMainStream)(follower._id, 'unfollow', packed));
        (0, _serverevent.publishFollowingChanged)(follower._id);
    }
    // リモートにフォローをしていたらUndoFollow送信
    if ((0, _user.isLocalUser)(follower) && (0, _user.isRemoteUser)(followee)) {
        const content = (0, _renderer.renderActivity)((0, _undo.default)((0, _follow.default)(follower, followee), follower));
        (0, _queue.deliver)(follower, content, followee.inbox);
    }
}

//# sourceMappingURL=create.js.map
