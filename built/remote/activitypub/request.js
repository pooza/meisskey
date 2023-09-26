"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    signedGet: function() {
        return signedGet;
    }
});
const _config = require("../../config");
const _fetch = require("../../misc/fetch");
const _aprequest = require("./ap-request");
const _default = async (user, url, object)=>{
    const body = JSON.stringify(object);
    const req = (0, _aprequest.createSignedPost)({
        key: {
            privateKeyPem: user.keypair,
            keyId: `${_config.default.url}/users/${user._id}#main-key`
        },
        url,
        body,
        additionalHeaders: {
            'User-Agent': _config.default.userAgent
        }
    });
    const res = await (0, _fetch.getResponse)({
        url,
        method: req.request.method,
        headers: req.request.headers,
        body,
        timeout: 10 * 1000
    });
    return `${res.statusCode} ${res.statusMessage} ${res.body}`;
};
async function signedGet(url, user) {
    const req = (0, _aprequest.createSignedGet)({
        key: {
            privateKeyPem: user.keypair,
            keyId: `${_config.default.url}/users/${user._id}#main-key`
        },
        url,
        additionalHeaders: {
            'User-Agent': _config.default.userAgent
        }
    });
    const res = await (0, _fetch.getResponse)({
        url,
        method: req.request.method,
        headers: req.request.headers
    });
    if (res.body.length > 65536) throw new Error('too large JSON');
    return await JSON.parse(res.body);
}

//# sourceMappingURL=request.js.map
