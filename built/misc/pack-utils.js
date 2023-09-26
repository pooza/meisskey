"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    toISODateOrNull: function() {
        return toISODateOrNull;
    },
    toOidString: function() {
        return toOidString;
    },
    toOidStringOrNull: function() {
        return toOidStringOrNull;
    },
    forceNumber: function() {
        return forceNumber;
    },
    forceBoolean: function() {
        return forceBoolean;
    }
});
function toISODateOrNull(input) {
    if (!(input instanceof Date)) return null;
    if (input.toString() === 'Invalid Date') return null;
    return input.toISOString();
}
function toOidString(input) {
    return `${input}`;
}
function toOidStringOrNull(input) {
    return input == null ? null : `${input}`;
}
function forceNumber(input) {
    return input || 0;
}
function forceBoolean(input) {
    return !!input;
}

//# sourceMappingURL=pack-utils.js.map
