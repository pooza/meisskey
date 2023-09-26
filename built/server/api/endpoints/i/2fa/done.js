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
const _speakeasy = require("speakeasy");
const _user = require("../../../../../models/user");
const _define = require("../../../define");
const meta = {
    requireCredential: true,
    secure: true,
    params: {
        token: {
            validator: _cafy.default.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const _token = ps.token.replace(/\s/g, '');
    if (user.twoFactorTempSecret == null) {
        throw new Error('二段階認証の設定が開始されていません');
    }
    const verified = _speakeasy.totp.verify({
        secret: user.twoFactorTempSecret,
        encoding: 'base32',
        token: _token
    });
    if (!verified) {
        throw new Error('not verified');
    }
    await _user.default.update(user._id, {
        $set: {
            'twoFactorSecret': user.twoFactorTempSecret,
            'twoFactorEnabled': true
        }
    });
    return;
});

//# sourceMappingURL=done.js.map
