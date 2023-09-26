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
const _stream = require("../../../../../services/stream");
const _define = require("../../../define");
const _error = require("../../../error");
const _converthost = require("../../../../../misc/convert-host");
const _serverevent = require("../../../../../services/server-event");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーリストから指定したホストを削除します。',
        'en-US': 'Remove a host to a user list.'
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
        host: {
            validator: _cafy.default.str,
            desc: {
                'ja-JP': '対象のホスト',
                'en-US': 'Target host'
            }
        }
    },
    errors: {
        noSuchList: {
            message: 'No such list.',
            code: 'NO_SUCH_LIST',
            id: '4127a206-ff0b-46dd-ad1c-349e0e753177'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const userList = await _userlist.default.findOne({
        _id: ps.listId,
        userId: me._id
    });
    if (userList == null) {
        throw new _error.ApiError(meta.errors.noSuchList);
    }
    const host = (0, _converthost.toDbHost)(ps.host);
    await _userlist.default.update({
        _id: userList._id
    }, {
        $pull: {
            hosts: host
        }
    });
    (0, _stream.publishUserListStream)(userList._id, 'hostRemoved', host);
    (0, _serverevent.publishFilterChanged)(me._id);
});

//# sourceMappingURL=pull-host.js.map
