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
const _cafyid = require("../../../../misc/cafy-id");
const _ms = require("ms");
const _user = require("../../../../models/user");
const _blocking = require("../../../../models/blocking");
const _delete = require("../../../../services/blocking/delete");
const _define = require("../../define");
const _error = require("../../error");
const _getters = require("../../common/getters");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定したユーザーのブロックを解除します。',
        'en-US': 'Unblock a user.'
    },
    tags: [
        'account'
    ],
    limit: {
        duration: _ms('1hour'),
        max: 100
    },
    requireCredential: true,
    kind: [
        'write:blocks',
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
            id: '8621d8bf-c358-4303-a066-5ea78610eb3f'
        },
        blockeeIsYourself: {
            message: 'Blockee is yourself.',
            code: 'BLOCKEE_IS_YOURSELF',
            id: '06f6fac6-524b-473c-a354-e97a40ae6eac'
        },
        notBlocking: {
            message: 'You are not blocking that user.',
            code: 'NOT_BLOCKING',
            id: '291b2efa-60c6-45c0-9f6a-045c8f9b02cd'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const blocker = user;
    // Check if the blockee is yourself
    if (user._id.equals(ps.userId)) {
        throw new _error.ApiError(meta.errors.blockeeIsYourself);
    }
    // Get blockee
    const blockee = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    // Check not blocking
    const exist = await _blocking.default.findOne({
        blockerId: blocker._id,
        blockeeId: blockee._id
    });
    if (exist === null) {
        throw new _error.ApiError(meta.errors.notBlocking);
    }
    // Delete blocking
    await (0, _delete.default)(blocker, blockee);
    return await (0, _user.pack)(blockee._id, user, {
        detail: true
    });
});

//# sourceMappingURL=delete.js.map
