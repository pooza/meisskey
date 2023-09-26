"use strict";
Object.defineProperty(exports, /**
 * Convert (local|remote)(Follower|Followee)ID to URL
 * @param id Follower|Followee ID
 */ "default", {
    enumerable: true,
    get: function() {
        return renderFollowUser;
    }
});
const _config = require("../../../config");
const _user = require("../../../models/user");
async function renderFollowUser(id) {
    const user = await _user.default.findOne({
        _id: id
    });
    return (0, _user.isLocalUser)(user) ? `${_config.default.url}/users/${user._id}` : user.uri;
}

//# sourceMappingURL=follow-user.js.map
