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
const _delete = require("../../../../services/following/delete");
const _define = require("../../define");
const _error = require("../../error");
const _getters = require("../../common/getters");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定したユーザーのフォローを解除します。',
        'en-US': 'Unfollow a user.'
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
            id: '5b12c78d-2b28-4dca-99d2-f56139b42ff8'
        },
        followeeIsYourself: {
            message: 'Followee is yourself.',
            code: 'FOLLOWEE_IS_YOURSELF',
            id: 'd9e400b9-36b0-4808-b1d8-79e707f1296c'
        },
        notFollowing: {
            message: 'You are not following that user.',
            code: 'NOT_FOLLOWING',
            id: '5dbf82f5-c92b-40b1-87d1-6c8c0741fd09'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const follower = user;
    // Check if the followee is yourself
    if (user._id.equals(ps.userId)) {
        throw new _error.ApiError(meta.errors.followeeIsYourself);
    }
    // Get followee
    const followee = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    // Check not following
    const exist = await _following.default.findOne({
        followerId: follower._id,
        followeeId: followee._id
    });
    if (exist === null) {
        throw new _error.ApiError(meta.errors.notFollowing);
    }
    await (0, _delete.default)(follower, followee);
    return await (0, _user.pack)(followee._id, user);
});

//# sourceMappingURL=delete.js.map
