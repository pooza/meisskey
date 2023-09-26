"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    oidEquals: function() {
        return oidEquals;
    },
    oidIncludes: function() {
        return oidIncludes;
    }
});
function oidEquals(x, y) {
    if (x == null && y == null) return true;
    return `${x}` === `${y}`;
}
function oidIncludes(array, target) {
    const map = new Set;
    for (const v of array || [])map.add(`${v}`);
    return map.has(`${target}`);
}

//# sourceMappingURL=oid.js.map
