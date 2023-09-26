"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _default = (object, user)=>({
        type: 'Reject',
        actor: `${_config.default.url}/users/${user._id}`,
        object
    });

//# sourceMappingURL=reject.js.map
