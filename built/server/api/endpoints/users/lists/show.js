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
const _cafyid = require("../../../../../misc/cafy-id");
const _userlist = require("../../../../../models/user-list");
const _define = require("../../../define");
const _error = require("../../../error");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーリストの情報を取得します。',
        'en-US': 'Show a user list.'
    },
    tags: [
        'lists',
        'account'
    ],
    requireCredential: true,
    kind: [
        'read:account',
        'account-read',
        'account/read'
    ],
    params: {
        listId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform
        }
    },
    res: {
        type: 'UserList'
    },
    errors: {
        noSuchList: {
            message: 'No such list.',
            code: 'NO_SUCH_LIST',
            id: '7bc05c21-1d7a-41ae-88f1-66820f4dc686'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    // Fetch the list
    const userList = await _userlist.default.findOne({
        _id: ps.listId,
        userId: me._id
    });
    if (userList == null) {
        throw new _error.ApiError(meta.errors.noSuchList);
    }
    return await (0, _userlist.pack)(userList);
});

//# sourceMappingURL=show.js.map
