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
const _user = require("../../../../models/user");
const _define = require("../../define");
const _symbol = require("../../../../prelude/symbol");
const _escaperegexp = require("escape-regexp");
const _converthost = require("../../../../misc/convert-host");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        },
        sort: {
            validator: _cafy.default.optional.str.or([
                '+follower',
                '-follower',
                '+createdAt',
                '-createdAt',
                '+updatedAt',
                '-updatedAt'
            ])
        },
        state: {
            validator: _cafy.default.optional.str.or([
                'all',
                'available',
                'admin',
                'moderator',
                'adminOrModerator',
                'verified',
                'silenced',
                'suspended',
                'deleted'
            ]),
            default: 'all'
        },
        origin: {
            validator: _cafy.default.optional.str.or([
                'combined',
                'local',
                'remote'
            ]),
            default: 'local'
        },
        username: {
            validator: _cafy.default.optional.str
        },
        hostname: {
            validator: _cafy.default.optional.str
        },
        description: {
            validator: _cafy.default.optional.str
        }
    }
};
const sort = {
    '+follower': {
        followersCount: -1
    },
    '-follower': {
        followersCount: 1
    },
    '+createdAt': {
        createdAt: -1
    },
    '-createdAt': {
        createdAt: 1
    },
    '+updatedAt': {
        updatedAt: -1
    },
    '-updatedAt': {
        updatedAt: 1
    },
    [_symbol.fallback]: {
        _id: -1
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const q = {
        $and: []
    };
    // state
    q.$and.push(ps.state == 'available' ? {
        $and: [
            {
                isSuspended: {
                    $ne: true
                }
            },
            {
                isDeleted: {
                    $ne: true
                }
            }
        ]
    } : ps.state == 'admin' ? {
        isAdmin: true
    } : ps.state == 'moderator' ? {
        isModerator: true
    } : ps.state == 'adminOrModerator' ? {
        $or: [
            {
                isAdmin: true
            },
            {
                isModerator: true
            }
        ]
    } : ps.state == 'verified' ? {
        isVerified: true
    } : ps.state == 'silenced' ? {
        isSilenced: true
    } : ps.state == 'suspended' ? {
        isSuspended: true
    } : ps.state == 'deleted' ? {
        isDeleted: true
    } : {});
    // origin
    q.$and.push(ps.origin == 'local' ? {
        host: null
    } : ps.origin == 'remote' ? {
        host: {
            $ne: null
        }
    } : {});
    if (ps.username) {
        q.usernameLower = new RegExp('^' + _escaperegexp(ps.username.toLowerCase()));
    }
    if (ps.hostname) {
        q.host = new RegExp(_escaperegexp((0, _converthost.toDbHost)(ps.hostname)));
    }
    if (ps.description) {
        q.description = new RegExp(_escaperegexp(ps.description), 'i');
    }
    const users = await _user.default.find(q, {
        limit: ps.limit,
        sort: sort[ps.sort] || sort[_symbol.fallback],
        skip: ps.offset
    });
    return await Promise.all(users.map((user)=>(0, _user.pack)(user, me, {
            detail: true
        })));
});

//# sourceMappingURL=show-users.js.map
