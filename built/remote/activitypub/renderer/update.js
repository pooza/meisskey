"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _default = (object, user)=>{
    const activity = {
        id: `${_config.default.url}/users/${user._id}#updates/${new Date().getTime()}`,
        actor: `${_config.default.url}/users/${user._id}`,
        type: 'Update',
        to: [
            'https://www.w3.org/ns/activitystreams#Public'
        ],
        object,
        published: new Date().toISOString()
    };
    return activity;
};

//# sourceMappingURL=update.js.map
