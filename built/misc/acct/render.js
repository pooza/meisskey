"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _default = (user)=>{
    return user.host === null ? user.username : `${user.username}@${user.host}`;
};

//# sourceMappingURL=render.js.map
