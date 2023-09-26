"use strict";
Object.defineProperty(exports, /**
 * typeがObjectIDか、stringじゃダメ
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
function _default(x) {
    return x && typeof x === 'object' && (Object.prototype.hasOwnProperty.call(x, 'toHexString') || Object.prototype.hasOwnProperty.call(x, '_bsontype'));
}

//# sourceMappingURL=is-objectid.js.map
