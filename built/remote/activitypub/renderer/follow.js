"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _rndstr = require("rndstr");
const _config = require("../../../config");
const _user = require("../../../models/user");
const _default = (follower, followee, requestId)=>{
    const follow = {
        type: 'Follow',
        actor: (0, _user.isLocalUser)(follower) ? `${_config.default.url}/users/${follower._id}` : follower.uri,
        object: (0, _user.isLocalUser)(followee) ? `${_config.default.url}/users/${followee._id}` : followee.uri
    };
    if (requestId) {
        follow.id = requestId;
    } else if ((0, _user.isLocalUser)(follower) && (0, _user.isRemoteUser)(followee)) {
        follow.id = `${_config.default.url}/followings_from/${follower._id}/${(0, _rndstr.default)(8)}`;
    }
    return follow;
};

//# sourceMappingURL=follow.js.map
