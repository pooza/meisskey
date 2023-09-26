"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _ = require("punycode/");
const _default = (host)=>{
    if (host == null) return null;
    return (0, _.toUnicode)(host).toLowerCase();
};

//# sourceMappingURL=get-host-lower.js.map
