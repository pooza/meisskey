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
const _serverevent = require("../../../../../services/server-event");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーリストを削除します。',
        'en-US': 'Delete a user list'
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
        listId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象となるユーザーリストのID',
                'en-US': 'ID of target user list'
            }
        }
    },
    errors: {
        noSuchList: {
            message: 'No such list.',
            code: 'NO_SUCH_LIST',
            id: '78436795-db79-42f5-b1e2-55ea2cf19166'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const userList = await _userlist.default.findOne({
        _id: ps.listId,
        userId: user._id
    });
    if (userList == null) {
        throw new _error.ApiError(meta.errors.noSuchList);
    }
    await _userlist.default.remove({
        _id: userList._id
    });
    (0, _serverevent.publishFilterChanged)(user._id);
});

//# sourceMappingURL=delete.js.map
