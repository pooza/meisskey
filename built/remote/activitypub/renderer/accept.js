"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _default = (object, user)=>({
        type: 'Accept',
        actor: `${_config.default.url}/users/${user._id}`,
        object
    });

//# sourceMappingURL=accept.js.map
