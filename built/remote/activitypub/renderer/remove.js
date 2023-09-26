"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _default = (user, target, object)=>({
        type: 'Remove',
        actor: `${_config.default.url}/users/${user._id}`,
        target,
        object
    });

//# sourceMappingURL=remove.js.map
