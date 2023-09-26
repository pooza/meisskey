"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _default = (emoji)=>{
    if (emoji.uri) return emoji.uri;
    return {
        id: `${_config.default.url}/emojis/${emoji.name}`,
        type: 'Emoji',
        name: `:${emoji.name}:`,
        updated: emoji.updatedAt != null ? emoji.updatedAt.toISOString() : new Date().toISOString,
        icon: {
            type: 'Image',
            mediaType: emoji.type || 'image/png',
            url: emoji.url
        }
    };
};

//# sourceMappingURL=emoji.js.map
