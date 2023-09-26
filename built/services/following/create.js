"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    insertFollowingDoc: function() {
        return insertFollowingDoc;
    },
    default: function() {
        return _default;
    }
});
const _user = require("../../models/user");
const _following = require("../../models/following");
const _blocking = require("../../models/blocking");
const _stream = require("../stream");
const _createnotification = require("../../services/create-notification");
const _renderer = require("../../remote/activitypub/renderer");
const _follow = require("../../remote/activitypub/renderer/follow");
const _accept = require("../../remote/activitypub/renderer/accept");
const _reject = require("../../remote/activitypub/renderer/reject");
const _queue = require("../../queue");
const _create = require("./requests/create");
const _peruserfollowing = require("../../services/chart/per-user-following");
const _registerorfetchinstancedoc = require("../register-or-fetch-instance-doc");
const _instance = require("../../models/instance");
const _instance1 = require("../../services/chart/instance");
const _logger = require("../logger");
const _followrequest = require("../../models/follow-request");
const _identifiableerror = require("../../misc/identifiable-error");
const _serverevent = require("../server-event");
const logger = new _logger.default('following/create');
async function insertFollowingDoc(followee, follower) {
    let alreadyFollowed = false;
    await _following.default.insert({
        createdAt: new Date(),
        followerId: follower._id,
        followeeId: followee._id,
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
    }).catch((e)=>{
        if (e.code === 11000 && (0, _user.isRemoteUser)(follower) && (0, _user.isLocalUser)(followee)) {
            logger.info(`Insert duplicated ignore. ${follower._id} => ${followee._id}`);
            alreadyFollowed = true;
        } else {
            throw e;
        }
    });
    const removed = await _followrequest.default.remove({
        followeeId: followee._id,
        followerId: follower._id
    });
    if (removed.deletedCount === 1) {
        await _user.default.update({
            _id: followee._id
        }, {
            $inc: {
                pendingReceivedFollowRequestsCount: -1
            }
        });
    }
    if (alreadyFollowed) return;
    //#region Increment counts
    _user.default.update({
        _id: follower._id
    }, {
        $inc: {
            followingCount: 1
        }
    });
    _user.default.update({
        _id: followee._id
    }, {
        $inc: {
            followersCount: 1
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
                    followingCount: 1
                }
            });
            _instance1.default.updateFollowing(i.host, true);
        });
    } else if ((0, _user.isLocalUser)(follower) && (0, _user.isRemoteUser)(followee)) {
        (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(followee.host).then((i)=>{
            _instance.default.update({
                _id: i._id
            }, {
                $inc: {
                    followersCount: 1
                }
            });
            _instance1.default.updateFollowers(i.host, true);
        });
    }
    //#endregion
    _peruserfollowing.default.update(follower, followee, true);
    // Publish follow event
    if ((0, _user.isLocalUser)(follower)) {
        (0, _user.pack)(followee, follower, {
            detail: true
        }).then((packed)=>(0, _stream.publishMainStream)(follower._id, 'follow', packed));
    }
    // Publish followed event
    if ((0, _user.isLocalUser)(followee)) {
        (0, _user.pack)(follower, followee).then((packed)=>(0, _stream.publishMainStream)(followee._id, 'followed', packed)), // 通知を作成
        (0, _createnotification.createNotification)(followee._id, follower._id, 'follow');
        // server event
        (0, _serverevent.publishFollowingChanged)(follower._id);
    }
}
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
    if ((0, _user.isRemoteUser)(follower) && (0, _user.isLocalUser)(followee) && (blocked || userRefused)) {
        // リモートフォローを受けてブロックしていた場合は、エラーにするのではなくRejectを送り返しておしまい。
        const content = (0, _renderer.renderActivity)((0, _reject.default)((0, _follow.default)(follower, followee, requestId), followee));
        (0, _queue.deliver)(followee, content, follower.inbox);
        return;
    } else if ((0, _user.isRemoteUser)(follower) && (0, _user.isLocalUser)(followee) && blocking) {
        // リモートフォローを受けてブロックされているはずの場合だったら、ブロック解除しておく。
        await _blocking.default.remove({
            _id: blocking._id
        });
    } else {
        // それ以外は単純に例外
        if (blocking != null) throw new _identifiableerror.IdentifiableError('710e8fb0-b8c3-4922-be49-d5d93d8e6a6e', 'blocking');
        if (blocked || userRefused) throw new _identifiableerror.IdentifiableError('3338392a-f764-498d-8855-db939dcf8c48', 'blocked');
    }
    // フォロー対象が鍵アカウントである or
    // フォロワーがBotであり、フォロー対象がBotからのフォローに慎重である or
    // フォロワーがローカルユーザーであり、フォロー対象がリモートユーザーである
    // 大量フォロワーであり、フォロー対象が大量フォロワーに慎重である
    // 上記のいずれかに当てはまる場合はすぐフォローせずにフォローリクエストを発行しておく
    if (followee.isLocked || followee.carefulBot && follower.isBot || followee.carefulRemote && (0, _user.isRemoteUser)(follower) || followee.carefulMassive && follower.followingCount > 5000 && follower.followingCount / follower.followersCount > 10 || (0, _user.isLocalUser)(follower) && (0, _user.isRemoteUser)(followee)) {
        let autoAccept = false;
        // 鍵アカウントであっても、既にフォローされていた場合はスルー
        const following = await _following.default.findOne({
            followerId: follower._id,
            followeeId: followee._id
        });
        if (following) {
            autoAccept = true;
        }
        // フォローしているユーザーは自動承認オプション
        if (!autoAccept && (0, _user.isLocalUser)(followee) && followee.autoAcceptFollowed) {
            const followed = await _following.default.findOne({
                followerId: followee._id,
                followeeId: follower._id
            });
            if (followed) autoAccept = true;
        }
        if (!autoAccept) {
            await (0, _create.default)(follower, followee, requestId);
            return;
        }
    }
    await insertFollowingDoc(followee, follower);
    if ((0, _user.isRemoteUser)(follower) && (0, _user.isLocalUser)(followee)) {
        const content = (0, _renderer.renderActivity)((0, _accept.default)((0, _follow.default)(follower, followee, requestId), followee));
        (0, _queue.deliver)(followee, content, follower.inbox);
    }
}

//# sourceMappingURL=create.js.map
