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
const meta = {
    tags: [
        'users'
    ],
    requireCredential: false,
    params: {
        username: {
            validator: _cafy.default.str.pipe(_user.validateUsername)
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    // Get exist
    const exist = await _user.default.count({
        host: null,
        usernameLower: ps.username.toLowerCase()
    }, {
        limit: 1
    });
    return {
        available: exist === 0
    };
});

//# sourceMappingURL=available.js.map
