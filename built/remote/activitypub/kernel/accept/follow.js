"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../../models/user");
const _accept = require("../../../../services/following/requests/accept");
const _dbresolver = require("../../db-resolver");
const _relay = require("../../../../services/relay");
const _default = async (actor, activity)=>{
    var _activity_id;
    // ※ activityはこっちから投げたフォローリクエストなので、activity.actorは存在するローカルユーザーである必要がある
    const dbResolver = new _dbresolver.default();
    const follower = await dbResolver.getUserFromApId(activity.actor);
    if (follower == null) {
        return `skip: follower not found`;
    }
    if (!(0, _user.isLocalUser)(follower)) {
        return `skip: follower is not a local user`;
    }
    // relay
    const match = (_activity_id = activity.id) === null || _activity_id === void 0 ? void 0 : _activity_id.match(/follow-relay\/(\w+)/);
    if (match) {
        return await (0, _relay.relayAccepted)(match[1]);
    }
    await (0, _accept.default)(actor, follower);
    return `ok`;
};

//# sourceMappingURL=follow.js.map
