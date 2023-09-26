"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _default = (object, note)=>{
    const activity = {
        id: `${_config.default.url}/notes/${note._id}/activity`,
        actor: `${_config.default.url}/users/${note.userId}`,
        type: 'Create',
        published: note.createdAt.toISOString(),
        object
    };
    if (object.to) activity.to = object.to;
    if (object.cc) activity.cc = object.cc;
    return activity;
};

//# sourceMappingURL=create.js.map
