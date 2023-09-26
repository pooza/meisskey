"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
const _default = (object, note)=>{
    const attributedTo = `${_config.default.url}/users/${note.userId}`;
    let to = [];
    let cc = [];
    if (note.visibility == 'public') {
        to = [
            'https://www.w3.org/ns/activitystreams#Public'
        ];
        cc = [
            `${attributedTo}/followers`
        ];
    } else if (note.visibility == 'home') {
        to = [
            `${attributedTo}/followers`
        ];
        cc = [
            'https://www.w3.org/ns/activitystreams#Public'
        ];
    } else {
        return null;
    }
    return {
        id: `${_config.default.url}/notes/${note._id}/activity`,
        actor: `${_config.default.url}/users/${note.userId}`,
        type: 'Announce',
        published: note.createdAt.toISOString(),
        to,
        cc,
        object
    };
};

//# sourceMappingURL=announce.js.map
