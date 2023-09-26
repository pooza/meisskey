"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const PasswordResetRequest = _mongodb.default.get('passwordResetRequests');
PasswordResetRequest.createIndex('createdAt', {
    expireAfterSeconds: 3600 * 24 * 3
});
PasswordResetRequest.createIndex('token', {
    unique: true
});
const _default = PasswordResetRequest;

//# sourceMappingURL=password-reset-request.js.map
