"use strict";
Object.defineProperty(exports, "publishToFollowers", {
    enumerable: true,
    get: function() {
        return publishToFollowers;
    }
});
const _user = require("../../models/user");
const _person = require("../../remote/activitypub/renderer/person");
const _update = require("../../remote/activitypub/renderer/update");
const _renderer = require("../../remote/activitypub/renderer");
const _delivermanager = require("../../remote/activitypub/deliver-manager");
const _relay = require("../relay");
async function publishToFollowers(userId) {
    const user = await _user.default.findOne({
        _id: userId
    });
    if ((0, _user.isLocalUser)(user) && !user.noFederation) {
        const content = (0, _renderer.renderActivity)((0, _update.default)(await (0, _person.default)(user), user));
        (0, _delivermanager.deliverToFollowers)(user, content);
        (0, _relay.deliverToRelays)(user, content);
    }
}

//# sourceMappingURL=update.js.map
