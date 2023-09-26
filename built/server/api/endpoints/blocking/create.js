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
const _create = require("../../../../services/blocking/create");
const _define = require("../../define");
const _error = require("../../error");
const _getters = require("../../common/getters");
const _delete = require("../../../../services/following/delete");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定したユーザーをブロックします。',
        'en-US': 'Block a user.'
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
            id: '7cc4f851-e2f1-4621-9633-ec9e1d00c01e'
        },
        blockeeIsYourself: {
            message: 'Blockee is yourself.',
            code: 'BLOCKEE_IS_YOURSELF',
            id: '88b19138-f28d-42c0-8499-6a31bbd0fdc6'
        },
        alreadyBlocking: {
            message: 'You are already blocking that user.',
            code: 'ALREADY_BLOCKING',
            id: '787fed64-acb9-464a-82eb-afbd745b9614'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const blocker = user;
    // 自分自身
    if (user._id.equals(ps.userId)) {
        throw new _error.ApiError(meta.errors.blockeeIsYourself);
    }
    // Get blockee
    const blockee = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    // Check if already blocking
    const exist = await _blocking.default.findOne({
        blockerId: blocker._id,
        blockeeId: blockee._id
    });
    if (exist !== null) {
        throw new _error.ApiError(meta.errors.alreadyBlocking);
    }
    const follower = await (0, _getters.getUser)(ps.userId);
    const followee = user;
    await (0, _delete.default)(follower, followee);
    // Create blocking
    await (0, _create.default)(blocker, blockee);
    return await (0, _user.pack)(blockee._id, user, {
        detail: true
    });
});

//# sourceMappingURL=create.js.map
