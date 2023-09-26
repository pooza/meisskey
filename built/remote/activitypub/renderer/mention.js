"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../models/user");
const _config = require("../../../config");
const _default = (mention)=>({
        type: 'Mention',
        href: (0, _user.isRemoteUser)(mention) ? mention.uri : `${_config.default.url}/users/${mention._id}`,
        name: (0, _user.isRemoteUser)(mention) ? `@${mention.username}@${mention.host}` : `@${mention.username}`
    });

//# sourceMappingURL=mention.js.map
