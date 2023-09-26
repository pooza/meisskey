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
const _following = require("../../../../models/following");
const _create = require("../../../../services/following/create");
const _define = require("../../define");
const _error = require("../../error");
const _getters = require("../../common/getters");
const _config = require("../../../../config");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定したユーザーをフォローします。',
        'en-US': 'Follow a user.'
    },
    tags: [
        'following',
        'users'
    ],
    limit: {
        duration: _ms('1hour'),
        max: 1000
    },
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
            id: 'fcd2eef9-a9b2-4c4f-8624-038099e90aa5'
        },
        followeeIsYourself: {
            message: 'Followee is yourself.',
            code: 'FOLLOWEE_IS_YOURSELF',
            id: '26fbe7bb-a331-4857-af17-205b426669a9'
        },
        alreadyFollowing: {
            message: 'You are already following that user.',
            code: 'ALREADY_FOLLOWING',
            id: '35387507-38c7-4cb9-9197-300b93783fa0'
        },
        blocking: {
            message: 'You are blocking that user.',
            code: 'BLOCKING',
            id: '4e2206ec-aa4f-4960-b865-6c23ac38e2d9'
        },
        blocked: {
            message: 'This account cannot be followed.',
            code: 'BLOCKED',
            id: 'c4ab57cc-4e41-45e9-bfd9-584f61e35ce0'
        },
        noFederation: {
            message: 'noFederation.',
            code: 'NO_FEDERATION',
            id: '32850d5a-3269-4ef2-8c5d-f08f71884df6'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const follower = user;
    // 自分自身
    if (user._id.equals(ps.userId)) {
        throw new _error.ApiError(meta.errors.followeeIsYourself);
    }
    // Get followee
    const followee = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    // no federation
    if (user.noFederation && (0, _user.isRemoteUser)(followee)) {
        throw new _error.ApiError(meta.errors.noFederation);
    }
    // disableFederation
    if (_config.default.disableFederation && (0, _user.isRemoteUser)(followee)) {
        throw new _error.ApiError(meta.errors.noFederation);
    }
    // Check if already following
    const exist = await _following.default.findOne({
        followerId: follower._id,
        followeeId: followee._id
    });
    if (exist !== null) {
        throw new _error.ApiError(meta.errors.alreadyFollowing);
    }
    try {
        await (0, _create.default)(follower, followee);
    } catch (e) {
        if (e.id === '710e8fb0-b8c3-4922-be49-d5d93d8e6a6e') throw new _error.ApiError(meta.errors.blocking);
        if (e.id === '3338392a-f764-498d-8855-db939dcf8c48') throw new _error.ApiError(meta.errors.blocked);
        throw e;
    }
    return await (0, _user.pack)(followee._id, user);
});

//# sourceMappingURL=create.js.map
