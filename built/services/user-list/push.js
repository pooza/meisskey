"use strict";
Object.defineProperty(exports, "pushUserToUserList", {
    enumerable: true,
    get: function() {
        return pushUserToUserList;
    }
});
const _user = require("../../models/user");
const _userlist = require("../../models/user-list");
const _stream = require("../stream");
const _following = require("../../models/following");
const _person = require("../../remote/activitypub/models/person");
const _create = require("../following/create");
const _followrequest = require("../../models/follow-request");
async function pushUserToUserList(target, list) {
    await _userlist.default.update({
        _id: list._id
    }, {
        $push: {
            userIds: target._id
        }
    });
    (0, _stream.publishUserListStream)(list._id, 'userAdded', await (0, _user.pack)(target));
    (0, _person.fetchOutbox)(target);
    // このインスタンス内にこのリモートユーザーをフォローしているユーザーがいなくても投稿を受け取るためにダミーのユーザーがフォローしたということにする
    if ((0, _user.isRemoteUser)(target)) {
        tryProxyFollow(target, list.userId);
    }
}
async function tryProxyFollow(target, userId) {
    // めんどくさそうなアカウントはスキップ
    if (target.isLocked) {
        return;
    }
    // 誰かがフォローしていればスキップ
    const exist = await _following.default.count({
        followeeId: target._id,
        '_follower.host': null
    }, {
        limit: 1
    });
    if (exist > 0) {
        return;
    }
    // その人がフォロー申請中だったらスキップ
    const req = await _followrequest.default.findOne({
        followerId: userId,
        followeeId: target._id
    });
    if (req) {
        return;
    }
    const proxy = await (0, _user.fetchProxyAccount)();
    (0, _create.default)(proxy, target);
}

//# sourceMappingURL=push.js.map
