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
const _signin = require("../../../../models/signin");
const _define = require("../../define");
const meta = {
    requireCredential: true,
    secure: true,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const query = {
        userId: user._id
    };
    const sort = {
        _id: -1
    };
    if (ps.sinceId) {
        sort._id = 1;
        query._id = {
            $gt: ps.sinceId
        };
    } else if (ps.untilId) {
        query._id = {
            $lt: ps.untilId
        };
    }
    const history = await _signin.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    return await Promise.all(history.map((record)=>(0, _signin.pack)(record)));
});

//# sourceMappingURL=signin-history.js.map
