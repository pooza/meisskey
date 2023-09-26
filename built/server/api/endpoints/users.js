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
const _user = require("../../../models/user");
const _define = require("../define");
const _symbol = require("../../../prelude/symbol");
const _gethideusers = require("../common/get-hide-users");
const _fetchmeta = require("../../../misc/fetch-meta");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
const nonnull = {
    $ne: null
};
const meta = {
    tags: [
        'users'
    ],
    requireCredential: false,
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
                'admin',
                'moderator',
                'adminOrModerator',
                'verified',
                'alive'
            ]),
            default: 'all'
        },
        origin: {
            validator: _cafy.default.optional.str.or([
                'combined',
                'local',
                'remote'
            ]),
            default: 'combined'
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'User'
        }
    }
};
const state = {
    'admin': {
        isAdmin: true
    },
    'moderator': {
        isModerator: true
    },
    'adminOrModerator': {
        $or: [
            {
                isAdmin: true
            },
            {
                isModerator: true
            }
        ]
    },
    'verified': {
        isVerified: true
    },
    'alive': {
        $and: [
            {
                updatedAt: {
                    $gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
                }
            },
            {
                isExplorable: true
            }
        ]
    },
    [_symbol.fallback]: {
        isExplorable: true
    }
};
const origin = {
    'local': {
        host: null
    },
    'remote': {
        host: nonnull
    },
    [_symbol.fallback]: {}
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
    const m = await (0, _fetchmeta.default)();
    if (me == null && m.disableProfileDirectory) {
        return [];
    }
    const hideUserIds = await (0, _gethideusers.getHideUserIds)(me);
    const users = await _user.default.find(_object_spread({
        $and: [
            state[ps.state] || state[_symbol.fallback],
            origin[ps.origin] || origin[_symbol.fallback]
        ]
    }, hideUserIds && hideUserIds.length > 0 ? {
        _id: {
            $nin: hideUserIds
        }
    } : {}), {
        limit: ps.limit,
        sort: sort[ps.sort] || sort[_symbol.fallback],
        skip: ps.offset
    });
    return await Promise.all(users.map((user)=>(0, _user.pack)(user, me, {
            detail: true
        })));
});

//# sourceMappingURL=users.js.map
