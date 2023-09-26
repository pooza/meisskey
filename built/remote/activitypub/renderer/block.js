"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _default = (blocker, blockee)=>({
        type: 'Block',
        actor: `${_config.default.url}/users/${blocker._id}`,
        object: blockee.uri
    });

//# sourceMappingURL=block.js.map
