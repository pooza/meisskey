"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../../models/user");
const _create = require("../../../../services/blocking/create");
const _dbresolver = require("../../db-resolver");
const _default = async (actor, activity)=>{
    // ※ activity.objectにブロック対象があり、それは存在するローカルユーザーのはず
    const dbResolver = new _dbresolver.default();
    const blockee = await dbResolver.getUserFromApId(activity.object);
    if (blockee == null) {
        return `skip: blockee not found`;
    }
    if (!(0, _user.isLocalUser)(blockee)) {
        return `skip: ブロックしようとしているユーザーはローカルユーザーではありません`;
    }
    await (0, _create.default)(actor, blockee);
    return `ok`;
};

//# sourceMappingURL=index.js.map
