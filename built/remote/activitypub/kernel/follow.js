"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../models/user");
const _create = require("../../../services/following/create");
const _dbresolver = require("../db-resolver");
const _default = async (actor, activity)=>{
    const dbResolver = new _dbresolver.default();
    const followee = await dbResolver.getUserFromApId(activity.object);
    if (followee == null) {
        return `skip: followee not found`;
    }
    if (!(0, _user.isLocalUser)(followee)) {
        return `skip: フォローしようとしているユーザーはローカルユーザーではありません`;
    }
    await (0, _create.default)(actor, followee, activity.id);
    return `ok`;
};

//# sourceMappingURL=follow.js.map
