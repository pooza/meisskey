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
const _cafy = require("cafy");
const _userlist = require("../../../../../models/user-list");
const _define = require("../../../define");
const _serverevent = require("../../../../../services/server-event");
const meta = {
    desc: {
        'ja-JP': 'ユーザーリストを作成します。',
        'en-US': 'Create a user list'
    },
    tags: [
        'lists'
    ],
    requireCredential: true,
    kind: [
        'write:account',
        'account-write',
        'account/write'
    ],
    params: {
        title: {
            validator: _cafy.default.str.range(1, 100)
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const userList = await _userlist.default.insert({
        createdAt: new Date(),
        userId: user._id,
        title: ps.title,
        userIds: []
    });
    (0, _serverevent.publishFilterChanged)(user._id);
    return await (0, _userlist.pack)(userList);
});

//# sourceMappingURL=create.js.map
