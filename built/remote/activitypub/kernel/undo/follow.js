"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../../models/user");
const _delete = require("../../../../services/following/delete");
const _cancel = require("../../../../services/following/requests/cancel");
const _followrequest = require("../../../../models/follow-request");
const _following = require("../../../../models/following");
const _dbresolver = require("../../db-resolver");
const _default = async (actor, activity)=>{
    const dbResolver = new _dbresolver.default();
    const followee = await dbResolver.getUserFromApId(activity.object);
    if (followee == null) {
        return `skip: followee not found`;
    }
    if (!(0, _user.isLocalUser)(followee)) {
        return `skip: フォロー解除しようとしているユーザーはローカルユーザーではありません`;
    }
    const req = await _followrequest.default.findOne({
        followerId: actor._id,
        followeeId: followee._id
    });
    const following = await _following.default.findOne({
        followerId: actor._id,
        followeeId: followee._id
    });
    if (req) {
        await (0, _cancel.default)(followee, actor);
        return `ok: follow request canceled`;
    }
    if (following) {
        await (0, _delete.default)(actor, followee);
        return `ok: unfollowed`;
    }
    return `skip: リクエストもフォローもされていない`;
};

//# sourceMappingURL=follow.js.map
