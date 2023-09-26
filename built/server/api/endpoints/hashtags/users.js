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
const _normalizetag = require("../../../../misc/normalize-tag");
const meta = {
    requireCredential: false,
    tags: [
        'hashtags',
        'users'
    ],
    params: {
        tag: {
            validator: _cafy.default.str
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        sort: {
            validator: _cafy.default.str.or([
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
            default: 'local'
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'User'
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
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const q = {
        tags: (0, _normalizetag.normalizeTag)(ps.tag),
        $and: []
    };
    // state
    q.$and.push(ps.state == 'alive' ? {
        updatedAt: {
            $gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
        }
    } : {});
    // origin
    q.$and.push(ps.origin == 'local' ? {
        host: null
    } : ps.origin == 'remote' ? {
        host: {
            $ne: null
        }
    } : {});
    const users = await _user.default.find(q, {
        limit: ps.limit,
        sort: sort[ps.sort]
    });
    return await Promise.all(users.map((user)=>(0, _user.pack)(user, me, {
            detail: true
        })));
});

//# sourceMappingURL=users.js.map
