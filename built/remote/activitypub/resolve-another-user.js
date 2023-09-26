"use strict";
Object.defineProperty(exports, "resolveAnotherUser", {
    enumerable: true,
    get: function() {
        return resolveAnotherUser;
    }
});
const _type = require("./type");
const _person = require("./models/person");
const _user = require("../../models/user");
async function resolveAnotherUser(selfUri, target, resolver) {
    var _user1;
    if (target == null) return null;
    const targetUri = (0, _type.getApId)(target);
    if (selfUri === targetUri) {
        throw new Error(`target is self ${selfUri}`);
    }
    const user = await (0, _person.resolvePerson)(targetUri, null, resolver).catch((e)=>{
        throw new Error(`failed to resolvePerson ${selfUri} => ${targetUri}, ${e}`);
    });
    if ((0, _user.isRemoteUser)(user) && selfUri === ((_user1 = user) === null || _user1 === void 0 ? void 0 : _user1.uri)) {
        throw new Error(`result is self ${selfUri}`);
    }
    return user;
}

//# sourceMappingURL=resolve-another-user.js.map
