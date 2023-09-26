"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const Instance = _mongodb.default.get('instances');
Instance.createIndex('host', {
    unique: true
});
const _default = Instance;

//# sourceMappingURL=instance.js.map
