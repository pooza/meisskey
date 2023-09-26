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
const _user = require("../../../../models/user");
const _resolveuser = require("../../../../remote/resolve-user");
const _define = require("../../define");
const _logger = require("../../logger");
const _error = require("../../error");
const cursorOption = {
    fields: {
        data: false
    }
};
const meta = {
    desc: {
        'ja-JP': '指定したユーザーの情報を取得します。'
    },
    tags: [
        'users'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 60,
    params: {
        userId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        userIds: {
            validator: _cafy.default.optional.arr(_cafy.default.type(_cafyid.default)).unique(),
            transform: _cafyid.transformMany,
            desc: {
                'ja-JP': 'ユーザーID (配列)'
            }
        },
        username: {
            validator: _cafy.default.optional.str
        },
        host: {
            validator: _cafy.default.optional.nullable.str
        }
    },
    res: {
        type: 'User'
    },
    errors: {
        failedToResolveRemoteUser: {
            message: 'Failed to resolve remote user.',
            code: 'FAILED_TO_RESOLVE_REMOTE_USER',
            id: 'ef7b9be4-9cba-4e6f-ab41-90ed171c7d3c',
            kind: 'server'
        },
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '4362f8dc-731f-4ad8-a694-be5a88922a24'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    let user;
    if (ps.userIds) {
        const users = await _user.default.find({
            _id: {
                $in: ps.userIds
            }
        });
        return await Promise.all(users.map((u)=>(0, _user.pack)(u, me, {
                detail: true
            })));
    } else {
        // Lookup user
        if (typeof ps.host === 'string') {
            user = await (0, _resolveuser.default)(ps.username, ps.host, cursorOption).catch((e)=>{
                _logger.apiLogger.warn(`failed to resolve remote user: ${e}`);
                throw new _error.ApiError(meta.errors.failedToResolveRemoteUser);
            });
        } else {
            const q = ps.userId != null ? {
                _id: ps.userId
            } : {
                usernameLower: ps.username.toLowerCase(),
                host: null
            };
            user = await _user.default.findOne(q, cursorOption);
            if (user && (0, _user.isRemoteUser)(user)) {
                (0, _resolveuser.default)(user.username, user.host);
            }
        }
        if (user == null || user.isDeleted) {
            throw new _error.ApiError(meta.errors.noSuchUser);
        }
        if (me == null || !(me.isAdmin || me.isModerator)) {
            if (user.isSuspended) {
                throw new _error.ApiError(meta.errors.noSuchUser);
            }
        }
        return await (0, _user.pack)(user, me, {
            detail: true
        });
    }
});

//# sourceMappingURL=show.js.map
