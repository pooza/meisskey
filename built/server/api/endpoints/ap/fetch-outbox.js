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
const _person = require("../../../../remote/activitypub/models/person");
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
    params: {
        userId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        username: {
            validator: _cafy.default.optional.str
        },
        host: {
            validator: _cafy.default.optional.nullable.str
        },
        sync: {
            validator: _cafy.default.optional.bool,
            default: false
        }
    },
    errors: {
        failedToResolveRemoteUser: {
            message: 'Failed to resolve remote user.',
            code: 'FAILED_TO_RESOLVE_REMOTE_USER',
            id: 'f829f287-4296-421e-8888-42a6d9ddd7fd',
            kind: 'server'
        },
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '64e7f792-08c8-4c73-9b40-c5a02e532421'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    let user;
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
        if ((0, _user.isRemoteUser)(user)) {
            (0, _resolveuser.default)(user.username, user.host);
        }
    }
    if (user === null) {
        throw new _error.ApiError(meta.errors.noSuchUser);
    }
    if (me == null || !(me.isAdmin || me.isModerator)) {
        if (user.isSuspended) {
            throw new _error.ApiError(meta.errors.noSuchUser);
        }
    }
    ps.sync ? await (0, _person.fetchOutbox)(user) : (0, _person.fetchOutbox)(user);
});

//# sourceMappingURL=fetch-outbox.js.map
