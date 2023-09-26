"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _default = (acct)=>{
    if (acct.startsWith('@')) acct = acct.substr(1);
    const split = acct.split('@', 2);
    return {
        username: split[0],
        host: split[1] || null
    };
};

//# sourceMappingURL=parse.js.map
