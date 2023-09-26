"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _kernel = require("./kernel");
const _default = async (actor, activity)=>{
    return await (0, _kernel.performActivity)(actor, activity);
};

//# sourceMappingURL=perform.js.map
