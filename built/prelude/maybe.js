"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    just: function() {
        return just;
    },
    nothing: function() {
        return nothing;
    }
});
function just(value) {
    return {
        isJust: ()=>true,
        get: ()=>value
    };
}
function nothing() {
    return {
        isJust: ()=>false
    };
}

//# sourceMappingURL=maybe.js.map
