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
const _user = require("../../../../models/user");
const _define = require("../../define");
const meta = {
    requireCredential: true,
    secure: true,
    params: {
        currentPassword: {
            validator: _cafy.default.str
        },
        newPassword: {
            validator: _cafy.default.str.min(1)
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Compare password
    const same = await _bcryptjs.compare(ps.currentPassword, user.password);
    if (!same) {
        throw new Error('incorrect password');
    }
    // Generate hash of password
    const salt = await _bcryptjs.genSalt(8);
    const hash = await _bcryptjs.hash(ps.newPassword, salt);
    await _user.default.update(user._id, {
        $set: {
            'password': hash
        }
    });
    return;
});

//# sourceMappingURL=change-password.js.map
