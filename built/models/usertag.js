"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const Usertag = _mongodb.default.get('usertags');
Usertag.createIndex([
    'ownerId',
    'targetId'
], {
    unique: true
});
Usertag.createIndex('tags');
const _default = Usertag;

//# sourceMappingURL=usertag.js.map
