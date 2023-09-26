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
const _define = require("../define");
const _user = require("../../../models/user");
const meta = {
    desc: {
        'ja-JP': 'アクティブユーザー数を取得します',
        'en-US': 'Get active users count.'
    },
    tags: [
        'meta'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 60,
    params: {},
    res: {
        type: 'object',
        properties: {
            local: {
                type: 'number',
                description: 'Local active users count.',
                example: 10
            },
            global: {
                type: 'number',
                description: 'Global active users count.',
                example: 100
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const dt = new Date(Date.now() - 1000 * 60 * 10);
    const [local, global] = await Promise.all([
        _user.default.count({
            lastActivityAt: {
                $gt: dt
            },
            host: null
        }),
        _user.default.count({
            lastActivityAt: {
                $gt: dt
            }
        })
    ]);
    return {
        local,
        global
    };
});

//# sourceMappingURL=active-users-count.js.map
