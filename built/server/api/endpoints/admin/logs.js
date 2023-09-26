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
const _define = require("../../define");
const _log = require("../../../../models/log");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 30
        },
        level: {
            validator: _cafy.default.optional.nullable.str,
            default: null
        },
        domain: {
            validator: _cafy.default.optional.nullable.str,
            default: null
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const sort = {
        _id: -1
    };
    const query = {};
    if (ps.level) query.level = ps.level;
    if (ps.domain) {
        for (const d of ps.domain.split(' ')){
            const qs = [];
            let i = 0;
            for (const sd of (d.startsWith('-') ? d.substr(1) : d).split('.')){
                qs.push({
                    [`domain.${i}`]: d.startsWith('-') ? {
                        $ne: sd
                    } : sd
                });
                i++;
            }
            if (d.startsWith('-')) {
                if (query['$and'] == null) query['$and'] = [];
                query['$and'].push({
                    $and: qs
                });
            } else {
                if (query['$or'] == null) query['$or'] = [];
                query['$or'].push({
                    $and: qs
                });
            }
        }
    }
    const logs = await _log.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    return logs;
});

//# sourceMappingURL=logs.js.map
