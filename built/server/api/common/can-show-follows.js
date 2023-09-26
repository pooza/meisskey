"use strict";
Object.defineProperty(exports, "canShowFollows", {
    enumerable: true,
    get: function() {
        return canShowFollows;
    }
});
const _user = require("../../../models/user");
const _oid = require("../../../prelude/oid");
async function canShowFollows(me, user) {
    // 未指定なら許可
    if (!user.hideFollows) {
        return true;
    }
    // 未指定以外なら匿名じゃ見れない
    if (!me) {
        return false;
    }
    // 自分は常に許可
    if ((0, _oid.oidEquals)(user._id, me._id)) {
        return true;
    }
    // フォロワーのみ
    if (user.hideFollows === 'follower') {
        const relation = await (0, _user.getRelation)(me._id, user._id);
        return relation.isFollowing;
    }
    // それ以外の値は拒否
    return false;
}

//# sourceMappingURL=can-show-follows.js.map
