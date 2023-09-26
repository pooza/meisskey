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
const _bcryptjs = require("bcryptjs");
const _user = require("../../../../../models/user");
const _define = require("../../../define");
const meta = {
    requireCredential: true,
    secure: true,
    params: {
        password: {
            validator: _cafy.default.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Compare password
    const same = await _bcryptjs.compare(ps.password, user.password);
    if (!same) {
        throw new Error('incorrect password');
    }
    await _user.default.update(user._id, {
        $set: {
            'twoFactorSecret': null,
            'twoFactorEnabled': false
        }
    });
    return;
});

//# sourceMappingURL=unregister.js.map
