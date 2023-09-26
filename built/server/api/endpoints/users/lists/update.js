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
const _stream = require("../../../../../services/stream");
const _serverevent = require("../../../../../services/server-event");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーリストを更新します。',
        'en-US': 'Update a user list'
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
        },
        title: {
            validator: _cafy.default.str.range(1, 100),
            desc: {
                'ja-JP': 'このユーザーリストの名前',
                'en-US': 'name of this user list'
            }
        },
        hideFromHome: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'これらのユーザーをホームに表示しない'
            }
        },
        mediaOnly: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'メディア投稿のみ'
            }
        }
    },
    errors: {
        noSuchList: {
            message: 'No such list.',
            code: 'NO_SUCH_LIST',
            id: '796666fe-3dff-4d39-becb-8a5932c1d5b7'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Fetch the list
    const userList = await _userlist.default.findOne({
        _id: ps.listId,
        userId: user._id
    });
    if (userList == null) {
        throw new _error.ApiError(meta.errors.noSuchList);
    }
    const set = {
        title: ps.title
    };
    if (typeof ps.hideFromHome == 'boolean') set.hideFromHome = ps.hideFromHome;
    if (typeof ps.mediaOnly == 'boolean') set.mediaOnly = ps.mediaOnly;
    await _userlist.default.update({
        _id: userList._id
    }, {
        $set: set
    });
    (0, _stream.publishUserListStream)(userList._id, 'settingChanged');
    (0, _serverevent.publishFilterChanged)(user._id);
    return await (0, _userlist.pack)(userList._id);
});

//# sourceMappingURL=update.js.map
