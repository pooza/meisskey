"use strict";
Object.defineProperty(exports, "remoteLogger", {
    enumerable: true,
    get: function() {
        return remoteLogger;
    }
});
const _logger = require("../services/logger");
const remoteLogger = new _logger.default('remote', 'cyan');

//# sourceMappingURL=logger.js.map
