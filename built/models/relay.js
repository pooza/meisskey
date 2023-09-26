"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const Relay = _mongodb.default.get('relays');
Relay.createIndex('inbox', {
    unique: true
});
const _default = Relay;

//# sourceMappingURL=relay.js.map
