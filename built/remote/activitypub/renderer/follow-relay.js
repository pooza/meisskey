"use strict";
Object.defineProperty(exports, "renderFollowRelay", {
    enumerable: true,
    get: function() {
        return renderFollowRelay;
    }
});
const _config = require("../../../config");
function renderFollowRelay(relay, relayActor) {
    const follow = {
        id: `${_config.default.url}/activities/follow-relay/${relay._id}`,
        type: 'Follow',
        actor: `${_config.default.url}/users/${relayActor._id}`,
        object: 'https://www.w3.org/ns/activitystreams#Public'
    };
    return follow;
}

//# sourceMappingURL=follow-relay.js.map
