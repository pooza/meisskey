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
const _speakeasy = require("speakeasy");
const _qrcode = require("qrcode");
const _user = require("../../../../../models/user");
const _config = require("../../../../../config");
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
    // Generate user's secret key
    const secret = _speakeasy.generateSecret({
        length: 32
    });
    await _user.default.update(user._id, {
        $set: {
            twoFactorTempSecret: secret.base32
        }
    });
    // Get the data URL of the authenticator URL
    const dataUrl = await _qrcode.toDataURL(_speakeasy.otpauthURL({
        secret: secret.base32,
        encoding: 'base32',
        label: user.username,
        issuer: _config.default.host
    }));
    return {
        qr: dataUrl,
        secret: secret.base32,
        label: user.username,
        issuer: _config.default.host
    };
});

//# sourceMappingURL=register.js.map
