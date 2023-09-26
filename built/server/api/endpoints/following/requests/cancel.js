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
const _cancel = require("../../../../../services/following/requests/cancel");
const _user = require("../../../../../models/user");
const _define = require("../../../define");
const _error = require("../../../error");
const _getters = require("../../../common/getters");
const meta = {
    desc: {
        'ja-JP': '自分が作成した、指定したフォローリクエストをキャンセルします。',
        'en-US': 'Cancel a follow request.'
    },
    tags: [
        'following',
        'account'
    ],
    requireCredential: true,
    kind: [
        'write:following',
        'following-write'
    ],
    params: {
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
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '4e68c551-fc4c-4e46-bb41-7d4a37bf9dab'
        },
        followRequestNotFound: {
            message: 'Follow request not found.',
            code: 'FOLLOW_REQUEST_NOT_FOUND',
            id: '089b125b-d338-482a-9a09-e2622ac9f8d4'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Fetch followee
    const followee = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    try {
        await (0, _cancel.default)(followee, user);
    } catch (e) {
        if (e.id === '17447091-ce07-46dd-b331-c1fd4f15b1e7') throw new _error.ApiError(meta.errors.followRequestNotFound);
        throw e;
    }
    return await (0, _user.pack)(followee._id, user);
});

//# sourceMappingURL=cancel.js.map
