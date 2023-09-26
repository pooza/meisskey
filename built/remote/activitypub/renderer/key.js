"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _crypto = require("crypto");
const _default = (user, postfix)=>({
        id: `${_config.default.url}/users/${user._id}${postfix || '/publickey'}`,
        type: 'Key',
        owner: `${_config.default.url}/users/${user._id}`,
        publicKeyPem: (0, _crypto.createPublicKey)(user.keypair).export({
            type: 'spki',
            format: 'pem'
        })
    });

//# sourceMappingURL=key.js.map
