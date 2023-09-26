"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const Following = _mongodb.default.get('following');
Following.createIndex('followerId');
Following.createIndex('followeeId');
Following.createIndex([
    'followerId',
    'followeeId'
], {
    unique: true
});
const _default = Following;

//# sourceMappingURL=following.js.map
