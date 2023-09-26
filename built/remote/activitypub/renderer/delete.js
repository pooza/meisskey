"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _default = (object, user, id)=>{
    const activity = {
        type: 'Delete',
        actor: `${_config.default.url}/users/${user._id}`,
        object,
        published: new Date().toISOString()
    };
    if (id) activity.id = id;
    return activity;
};

//# sourceMappingURL=delete.js.map
