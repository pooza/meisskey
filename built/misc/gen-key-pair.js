"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    genRsaKeyPair: function() {
        return genRsaKeyPair;
    },
    genEcKeyPair: function() {
        return genEcKeyPair;
    }
});
const _crypto = require("crypto");
const _util = require("util");
const generateKeyPair = _util.promisify(_crypto.generateKeyPair);
async function genRsaKeyPair(modulusLength = 2048) {
    return await generateKeyPair('rsa', {
        modulusLength,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: undefined,
            passphrase: undefined
        }
    });
}
async function genEcKeyPair(namedCurve = 'prime256v1') {
    return await generateKeyPair('ec', {
        namedCurve,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: undefined,
            passphrase: undefined
        }
    });
}

//# sourceMappingURL=gen-key-pair.js.map
