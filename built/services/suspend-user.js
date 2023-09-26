"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    doPostSuspend: function() {
        return doPostSuspend;
    },
    sendDeleteActivity: function() {
        return sendDeleteActivity;
    },
    removeFollowingRequestAll: function() {
        return removeFollowingRequestAll;
    },
    removeFollowedRequestAll: function() {
        return removeFollowedRequestAll;
    }
});
const _delete = require("../remote/activitypub/renderer/delete");
const _renderer = require("../remote/activitypub/renderer");
const _queue = require("../queue");
const _config = require("../config");
const _user = require("../models/user");
const _following = require("../models/following");
const _delete1 = require("../services/following/delete");
const _reject = require("../services/following/requests/reject");
const _followrequest = require("../models/follow-request");
const _notification = require("../models/notification");
const _notereaction = require("../models/note-reaction");
const _userlist = require("../models/user-list");
const _blocking = require("../models/blocking");
const _mute = require("../models/mute");
async function doPostSuspend(user, isDelete = false) {
    await unFollowAll(user).catch(()=>{});
    await rejectFollowAll(user).catch(()=>{});
    await removeFollowingRequestAll(user).catch(()=>{});
    await removeFollowedRequestAll(user).catch(()=>{});
    await sendDeleteActivity(user).catch(()=>{});
    // Delete block/mute
    if (isDelete) {
        await _blocking.default.remove({
            blockerId: user._id
        }).catch(()=>{});
        await _blocking.default.remove({
            blockeeId: user._id
        }).catch(()=>{});
        await _mute.default.remove({
            muterId: user._id
        }).catch(()=>{});
        await _mute.default.remove({
            muteeId: user._id
        }).catch(()=>{});
    }
    // アカウント削除時に送受信したNotificationを削除するように
    await _notification.default.remove({
        notifieeId: user._id
    }).catch(()=>{});
    await _notification.default.remove({
        notifierId: user._id
    }).catch(()=>{});
    await _notereaction.default.remove({
        userId: user._id
    }).catch(()=>{});
    // 入れられたリストから削除
    await _userlist.default.update({
        userIds: user._id
    }, {
        $pull: {
            userIds: user._id
        }
    }).catch(()=>{});
}
async function sendDeleteActivity(user) {
    if ((0, _user.isLocalUser)(user)) {
        // 知り得る全SharedInboxにDelete配信
        const content = (0, _renderer.renderActivity)((0, _delete.default)(`${_config.default.url}/users/${user._id}`, user));
        const queue = [];
        const followings = await _following.default.find({
            $or: [
                {
                    '_follower.sharedInbox': {
                        $ne: null
                    }
                },
                {
                    '_followee.sharedInbox': {
                        $ne: null
                    }
                }
            ]
        }, {
            '_follower.sharedInbox': 1,
            '_followee.sharedInbox': 1
        });
        const inboxes = followings.map((x)=>x._follower.sharedInbox || x._followee.sharedInbox);
        for (const inbox of inboxes){
            if (inbox != null && !queue.includes(inbox)) queue.push(inbox);
        }
        for (const inbox of queue){
            (0, _queue.deliver)(user, content, inbox);
        }
    }
}
async function unFollowAll(follower) {
    const followings = await _following.default.find({
        followerId: follower._id
    });
    for (const following of followings){
        const followee = await _user.default.findOne({
            _id: following.followeeId
        });
        if (followee == null) {
            continue;
        }
        await (0, _delete1.default)(follower, followee, true);
    }
}
async function rejectFollowAll(followee) {
    const followings = await _following.default.find({
        followeeId: followee._id
    });
    for (const following of followings){
        const follower = await _user.default.findOne({
            _id: following.followerId
        });
        if (follower == null) {
            continue;
        }
        await (0, _reject.default)(followee, follower);
    }
}
async function removeFollowingRequestAll(follower) {
    const reqs = await _followrequest.default.find({
        followerId: follower._id
    });
    for (const req of reqs){
        await _followrequest.default.remove({
            _id: req._id
        });
        const followee = await _user.default.findOne({
            _id: req.followeeId
        });
        if (followee == null) {
            continue;
        }
        await _user.default.update({
            _id: followee._id
        }, {
            $inc: {
                pendingReceivedFollowRequestsCount: -1
            }
        });
    }
}
async function removeFollowedRequestAll(followee) {
    const reqs = await _followrequest.default.find({
        followeeId: followee._id
    });
    for (const req of reqs){
        await _followrequest.default.remove({
            _id: req._id
        });
    }
}

//# sourceMappingURL=suspend-user.js.map
