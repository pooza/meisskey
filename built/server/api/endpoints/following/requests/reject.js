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
const _reject = require("../../../../../services/following/requests/reject");
const _define = require("../../../define");
const _error = require("../../../error");
const _getters = require("../../../common/getters");
const meta = {
    desc: {
        'ja-JP': '自分に届いた、指定したフォローリクエストを拒否します。',
        'en-US': 'Reject a follow request.'
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
            id: 'abc2ffa6-25b2-4380-ba99-321ff3a94555'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Fetch follower
    const follower = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    await (0, _reject.default)(user, follower);
    return;
});

//# sourceMappingURL=reject.js.map
