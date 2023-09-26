"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const Log = _mongodb.default.get('logs');
Log.createIndex('createdAt', {
    expireAfterSeconds: 3600 * 24 * 3
});
Log.createIndex('level');
Log.createIndex('domain');
const _default = Log;

//# sourceMappingURL=log.js.map
