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
const _user = require("../../../../../models/user");
const _stream = require("../../../../../services/stream");
const _define = require("../../../define");
const _error = require("../../../error");
const _getters = require("../../../common/getters");
const _serverevent = require("../../../../../services/server-event");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーリストから指定したユーザーを削除します。',
        'en-US': 'Remove a user to a user list.'
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
            id: '7f44670e-ab16-43b8-b4c1-ccd2ee89cc02'
        },
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '588e7f72-c744-4a61-b180-d354e912bda2'
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
    // Pull the user
    await _userlist.default.update({
        _id: userList._id
    }, {
        $pull: {
            userIds: user._id
        }
    });
    (0, _stream.publishUserListStream)(userList._id, 'userRemoved', await (0, _user.pack)(user));
    (0, _serverevent.publishFilterChanged)(me._id);
});

//# sourceMappingURL=pull.js.map
