"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    genMeid7: function() {
        return genMeid7;
    },
    meid7ToDate: function() {
        return meid7ToDate;
    }
});
const _lodash = require("lodash");
//  4bit Fixed hex value '7'
// 44bit UNIX Time ms in Hex
// 48bit Random value in Hex
/**
 * タイムスタンプ文字列を返します
 * @param time タイムスタンプ
 * @param radix 進数
 * @param length 文字数
 */ function getTime(time, radix, length) {
    if (time < 0) time = 0;
    return time.toString(radix).padStart(length, '0').slice(length * -1);
}
/**
 * ランダム文字列を返します
 * @param radix 進数
 * @param length 文字数
 * @returns 
 */ function getRandom(radix, length) {
    let str = '';
    for(let i = 0; i < length; i++){
        str += Math.floor(Math.random() * radix).toString(radix).slice(-1);
    }
    return str;
}
function genMeid7(date) {
    if (date.toString() === 'Invalid Date') throw 'Invalid Date';
    return '7' + getTime(date.getTime(), 16, 11) + getRandom(16, 12);
}
function meid7ToDate(id) {
    var _id_match, _this;
    const m = (_this = id) === null || _this === void 0 ? void 0 : (_id_match = _this.match) === null || _id_match === void 0 ? void 0 : _id_match.call(_this, /^7([0-9a-f]{11})([0-9a-f]{12})$/);
    if (m == null) return null;
    const int = (0, _lodash.parseInt)(m[1], 16);
    return new Date(int);
}

//# sourceMappingURL=meid7.js.map
