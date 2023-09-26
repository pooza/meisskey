"use strict";
Object.defineProperty(exports, "genFid", {
    enumerable: true,
    get: function() {
        return genFid;
    }
});
const _crypto = require("crypto");
const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
const CHARS_LEN = CHARS.length;
function genFid() {
    return getRandom(24);
}
function getRandom(num) {
    let str = '';
    for(let i = 0; i < num; i++){
        let rand = Math.floor(_crypto.randomBytes(1).readUInt8(0) / 0xFF * CHARS_LEN);
        if (rand === CHARS_LEN) {
            rand = CHARS_LEN - 1;
        }
        str += CHARS.charAt(rand);
    }
    return str;
}

//# sourceMappingURL=fid.js.map
