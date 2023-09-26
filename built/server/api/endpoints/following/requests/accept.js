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
const _accept = require("../../../../../services/following/requests/accept");
const _define = require("../../../define");
const _error = require("../../../error");
const _getters = require("../../../common/getters");
const meta = {
    desc: {
        'ja-JP': '自分に届いた、指定したフォローリクエストを承認します。',
        'en-US': 'Accept a follow request.'
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
            id: '66ce1645-d66c-46bb-8b79-96739af885bd'
        },
        noFollowRequest: {
            message: 'No follow request.',
            code: 'NO_FOLLOW_REQUEST',
            id: 'bcde4f8b-0913-4614-8881-614e522fb041'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Fetch follower
    const follower = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    await (0, _accept.default)(user, follower).catch((e)=>{
        if (e.id === '8884c2dd-5795-4ac9-b27e-6a01d38190f9') throw new _error.ApiError(meta.errors.noFollowRequest);
        throw e;
    });
    return;
});

//# sourceMappingURL=accept.js.map
