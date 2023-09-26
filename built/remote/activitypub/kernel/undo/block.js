"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../../models/user");
const _delete = require("../../../../services/blocking/delete");
const _dbresolver = require("../../db-resolver");
const _default = async (actor, activity)=>{
    const dbResolver = new _dbresolver.default();
    const blockee = await dbResolver.getUserFromApId(activity.object);
    if (blockee == null) {
        return `skip: blockee not found`;
    }
    if (!(0, _user.isLocalUser)(blockee)) {
        return `skip: ブロック解除しようとしているユーザーはローカルユーザーではありません`;
    }
    await (0, _delete.default)(actor, blockee);
    return `ok`;
};

//# sourceMappingURL=block.js.map
