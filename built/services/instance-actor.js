"use strict";
Object.defineProperty(exports, "getInstanceActor", {
    enumerable: true,
    get: function() {
        return getInstanceActor;
    }
});
const _user = require("../models/user");
const _createsystemuser = require("./create-system-user");
const ACTOR_USERNAME = 'instance.actor';
async function getInstanceActor() {
    const user = await _user.default.findOne({
        host: null,
        username: ACTOR_USERNAME
    });
    if (user) return user;
    const created = await (0, _createsystemuser.createSystemUser)(ACTOR_USERNAME);
    return created;
}

//# sourceMappingURL=instance-actor.js.map
