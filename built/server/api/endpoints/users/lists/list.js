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
const _userlist = require("../../../../../models/user-list");
const _define = require("../../../define");
const _cafy = require("cafy");
const _cafyid = require("../../../../../misc/cafy-id");
const meta = {
    desc: {
        'ja-JP': '自分の作成したユーザーリスト一覧を取得します。'
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
        userId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '特定のユーザーを含むリストのみ'
            }
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'UserList'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const query = {
        userId: me._id
    };
    if (ps.userId) {
        query.userIds = ps.userId;
    }
    const userLists = await _userlist.default.find(query);
    return await Promise.all(userLists.map((x)=>(0, _userlist.pack)(x)));
});

//# sourceMappingURL=list.js.map
