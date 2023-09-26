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
const _define = require("../define");
const _passwordresetrequest = require("../../../models/password-reset-request");
const _user = require("../../../models/user");
const meta = {
    tags: [
        'reset password'
    ],
    requireCredential: false,
    params: {
        token: {
            validator: _cafy.default.str.min(1)
        },
        password: {
            validator: _cafy.default.str.min(1)
        }
    },
    errors: {}
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const req = await _passwordresetrequest.default.findOne({
        token: ps.token
    });
    if (req == null) {
        throw new Error(); // TODO
    }
    // 発行してから30分以上経過していたら無効
    if (Date.now() - req.createdAt.getTime() > 1000 * 60 * 30) {
        throw new Error(); // TODO
    }
    // Generate hash of password
    const salt = await _bcryptjs.genSalt(8);
    const hash = await _bcryptjs.hash(ps.password, salt);
    await _user.default.findOneAndUpdate({
        _id: req.userId
    }, {
        $set: {
            password: hash
        }
    });
    _passwordresetrequest.default.remove({
        _id: req._id
    });
});

//# sourceMappingURL=reset-password.js.map
