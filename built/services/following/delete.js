"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    decrementFollowing: function() {
        return decrementFollowing;
    }
});
const _user = require("../../models/user");
const _following = require("../../models/following");
const _stream = require("../stream");
const _renderer = require("../../remote/activitypub/renderer");
const _follow = require("../../remote/activitypub/renderer/follow");
const _undo = require("../../remote/activitypub/renderer/undo");
const _reject = require("../../remote/activitypub/renderer/reject");
const _queue = require("../../queue");
const _peruserfollowing = require("../../services/chart/per-user-following");
const _logger = require("../logger");
const _registerorfetchinstancedoc = require("../register-or-fetch-instance-doc");
const _instance = require("../../models/instance");
const _instance1 = require("../../services/chart/instance");
const _serverevent = require("../server-event");
const logger = new _logger.default('following/delete');
async function _default(follower, followee, silent = false) {
    const following = await _following.default.findOne({
        followerId: follower._id,
        followeeId: followee._id
    });
    if (following == null) {
        logger.warn('フォロー解除がリクエストされましたがフォローしていませんでした');
        return;
    }
    await _following.default.remove({
        _id: following._id
    });
    decrementFollowing(follower, followee);
    // Publish unfollow event
    if (!silent && (0, _user.isLocalUser)(follower)) {
        (0, _user.pack)(followee, follower, {
            detail: true
        }).then((packed)=>(0, _stream.publishMainStream)(follower._id, 'unfollow', packed));
        (0, _serverevent.publishFollowingChanged)(follower._id);
    }
    if ((0, _user.isLocalUser)(follower) && (0, _user.isRemoteUser)(followee)) {
        const content = (0, _renderer.renderActivity)((0, _undo.default)((0, _follow.default)(follower, followee), follower));
        (0, _queue.deliver)(follower, content, followee.inbox);
    }
    if ((0, _user.isLocalUser)(followee) && (0, _user.isRemoteUser)(follower)) {
        const content = (0, _renderer.renderActivity)((0, _reject.default)((0, _follow.default)(follower, followee), followee));
        (0, _queue.deliver)(followee, content, follower.inbox);
    }
}
async function decrementFollowing(follower, followee) {
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
    //#region Update instance stats
    if ((0, _user.isRemoteUser)(follower) && (0, _user.isLocalUser)(followee)) {
        (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(follower.host).then((i)=>{
            _instance.default.update({
                _id: i._id
            }, {
                $inc: {
                    followingCount: -1
                }
            });
            _instance1.default.updateFollowing(i.host, false);
        });
    } else if ((0, _user.isLocalUser)(follower) && (0, _user.isRemoteUser)(followee)) {
        (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(followee.host).then((i)=>{
            _instance.default.update({
                _id: i._id
            }, {
                $inc: {
                    followersCount: -1
                }
            });
            _instance1.default.updateFollowers(i.host, false);
        });
    }
    //#endregion
    _peruserfollowing.default.update(follower, followee, false);
}

//# sourceMappingURL=delete.js.map
