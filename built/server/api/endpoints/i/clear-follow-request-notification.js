"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    }
});
const _user = require("../../../../models/user");
const _define = require("../../define");
const meta = {
    tags: [
        'account',
        'following'
    ],
    requireCredential: true,
    kind: [
        'write:account',
        'account-write',
        'account/write'
    ],
    params: {}
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    await _user.default.update({
        _id: user._id
    }, {
        $set: {
            pendingReceivedFollowRequestsCount: 0
        }
    });
    return;
});

//# sourceMappingURL=clear-follow-request-notification.js.map
