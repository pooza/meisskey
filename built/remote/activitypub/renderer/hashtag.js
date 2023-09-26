"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _default = (tag)=>({
        type: 'Hashtag',
        href: `${_config.default.url}/tags/${encodeURIComponent(tag)}`,
        name: `#${tag}`
    });

//# sourceMappingURL=hashtag.js.map
