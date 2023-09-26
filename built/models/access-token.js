"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const AccessToken = _mongodb.default.get('accessTokens');
AccessToken.createIndex('token');
AccessToken.createIndex('hash');
const _default = AccessToken;

//# sourceMappingURL=access-token.js.map
