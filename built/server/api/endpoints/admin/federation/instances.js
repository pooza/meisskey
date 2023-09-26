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
const _define = require("../../../define");
const _instance = require("../../../../../models/instance");
const _escaperegexp = require("escape-regexp");
const meta = {
    tags: [
        'federation'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        blocked: {
            validator: _cafy.default.optional.nullable.bool
        },
        notResponding: {
            validator: _cafy.default.optional.nullable.bool
        },
        markedAsClosed: {
            validator: _cafy.default.optional.nullable.bool
        },
        softwareName: {
            validator: _cafy.default.optional.str
        },
        softwareVersion: {
            validator: _cafy.default.optional.str
        },
        cc: {
            validator: _cafy.default.optional.str
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 1000),
            default: 30
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        },
        sort: {
            validator: _cafy.default.optional.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    let sort;
    if (ps.sort) {
        if (ps.sort == '+notes') {
            sort = {
                notesCount: -1
            };
        } else if (ps.sort == '-notes') {
            sort = {
                notesCount: 1
            };
        } else if (ps.sort == '+users') {
            sort = {
                usersCount: -1
            };
        } else if (ps.sort == '-users') {
            sort = {
                usersCount: 1
            };
        } else if (ps.sort == '+activeHalfyear') {
            sort = {
                activeHalfyear: -1
            };
        } else if (ps.sort == '-activeHalfyear') {
            sort = {
                activeHalfyear: 1
            };
        } else if (ps.sort == '+activeMonth') {
            sort = {
                activeMonth: -1
            };
        } else if (ps.sort == '-activeMonth') {
            sort = {
                activeMonth: 1
            };
        } else if (ps.sort == '+following') {
            sort = {
                followingCount: -1
            };
        } else if (ps.sort == '-following') {
            sort = {
                followingCount: 1
            };
        } else if (ps.sort == '+followers') {
            sort = {
                followersCount: -1
            };
        } else if (ps.sort == '-followers') {
            sort = {
                followersCount: 1
            };
        } else if (ps.sort == '+caughtAt') {
            sort = {
                caughtAt: -1
            };
        } else if (ps.sort == '-caughtAt') {
            sort = {
                caughtAt: 1
            };
        } else if (ps.sort == '+lastCommunicatedAt') {
            sort = {
                lastCommunicatedAt: -1
            };
        } else if (ps.sort == '-lastCommunicatedAt') {
            sort = {
                lastCommunicatedAt: 1
            };
        } else if (ps.sort == '+driveUsage') {
            sort = {
                driveUsage: -1
            };
        } else if (ps.sort == '-driveUsage') {
            sort = {
                driveUsage: 1
            };
        } else if (ps.sort == '+driveFiles') {
            sort = {
                driveFiles: -1
            };
        } else if (ps.sort == '-driveFiles') {
            sort = {
                driveFiles: 1
            };
        }
    } else {
        sort = {
            _id: -1
        };
    }
    const q = {};
    if (ps.softwareName) q.softwareName = new RegExp(_escaperegexp(ps.softwareName).toLowerCase());
    if (ps.softwareVersion) q.softwareVersion = new RegExp(_escaperegexp(ps.softwareVersion).toLowerCase());
    if (ps.cc) q.cc = ps.cc.toUpperCase();
    if (typeof ps.blocked === 'boolean') q.isBlocked = ps.blocked;
    if (typeof ps.notResponding === 'boolean') q.isNotResponding = ps.notResponding;
    if (typeof ps.markedAsClosed === 'boolean') q.isMarkedAsClosed = ps.markedAsClosed;
    const instances = await _instance.default.find(q, {
        limit: ps.limit,
        sort: sort,
        skip: ps.offset
    });
    return instances;
});

//# sourceMappingURL=instances.js.map
