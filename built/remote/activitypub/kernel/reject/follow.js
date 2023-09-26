"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../../models/user");
const _reject = require("../../../../services/following/requests/reject");
const _dbresolver = require("../../db-resolver");
const _relay = require("../../../../services/relay");
const _default = async (actor, activity)=>{
    var _activity_id_match, _this;
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
    const match = (_this = activity.id) === null || _this === void 0 ? void 0 : (_activity_id_match = _this.match) === null || _activity_id_match === void 0 ? void 0 : _activity_id_match.call(_this, /follow-relay\/(\w+)/);
    if (match) {
        return await (0, _relay.relayRejected)(match[1]);
    }
    await (0, _reject.default)(actor, follower);
    return `ok`;
};

//# sourceMappingURL=follow.js.map
