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
const _getters = require("../../../common/getters");
const _push = require("../../../../../services/user-list/push");
const _oid = require("../../../../../prelude/oid");
const _serverevent = require("../../../../../services/server-event");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーリストに指定したユーザーを追加します。',
        'en-US': 'Add a user to a user list.'
    },
    tags: [
        'lists',
        'users'
    ],
    requireCredential: true,
    kind: [
        'write:account',
        'account-write',
        'account/write'
    ],
    params: {
        listId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform
        },
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        }
    },
    errors: {
        noSuchList: {
            message: 'No such list.',
            code: 'NO_SUCH_LIST',
            id: '2214501d-ac96-4049-b717-91e42272a711'
        },
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: 'a89abd3d-f0bc-4cce-beb1-2f446f4f1e6a'
        },
        alreadyAdded: {
            message: 'That user has already been added to that list.',
            code: 'ALREADY_ADDED',
            id: '1de7c884-1595-49e9-857e-61f12f4d4fc5'
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
    // Fetch the user
    const user = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    if ((0, _oid.oidIncludes)(userList.userIds, user._id)) {
        throw new _error.ApiError(meta.errors.alreadyAdded);
    }
    // Push the user
    (0, _push.pushUserToUserList)(user, userList);
    (0, _serverevent.publishFilterChanged)(me._id);
});

//# sourceMappingURL=push.js.map
