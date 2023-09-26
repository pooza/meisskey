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
const _accesstoken = require("../../../../models/access-token");
const _app = require("../../../../models/app");
const _define = require("../../define");
const meta = {
    requireCredential: true,
    secure: true,
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
            validator: _cafy.default.optional.str.or('desc|asc'),
            default: 'desc'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Get tokens
    const tokens = await _accesstoken.default.find({
        userId: user._id
    }, {
        limit: ps.limit,
        skip: ps.offset,
        sort: {
            _id: ps.sort == 'asc' ? 1 : -1
        }
    });
    return await Promise.all(tokens.map((token)=>(0, _app.pack)(token.appId, user, {
            detail: true
        })));
});

//# sourceMappingURL=authorized-apps.js.map
