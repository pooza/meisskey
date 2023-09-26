"use strict";
Object.defineProperty(exports, "renderReadActivity", {
    enumerable: true,
    get: function() {
        return renderReadActivity;
    }
});
const _config = require("../../../config");
const renderReadActivity = (user, message)=>({
        type: 'Read',
        actor: `${_config.default.url}/users/${user._id}`,
        object: message.uri
    });

//# sourceMappingURL=read.js.map
