"use strict";
Object.defineProperty(exports, "secureRndstr", {
    enumerable: true,
    get: function() {
        return secureRndstr;
    }
});
const _crypto = require("crypto");
const L_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
const LU_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function secureRndstr(length = 32, useLU = true) {
    const chars = useLU ? LU_CHARS : L_CHARS;
    const chars_len = chars.length;
    let str = '';
    for(let i = 0; i < length; i++){
        let rand = Math.floor(_crypto.randomBytes(1).readUInt8(0) / 0xFF * chars_len);
        if (rand === chars_len) {
            rand = chars_len - 1;
        }
        str += chars.charAt(rand);
    }
    return str;
}

//# sourceMappingURL=secure-rndstr.js.map
