"use strict";
Object.defineProperty(exports, "getDriveConfig", {
    enumerable: true,
    get: function() {
        return getDriveConfig;
    }
});
const _config = require("../config");
function getDriveConfig(remote = false) {
    if (!_config.default.drive) {
        return {
            storage: 'db'
        };
    }
    return remote && _config.default.remoteDrive ? _config.default.remoteDrive : _config.default.drive;
}

//# sourceMappingURL=get-drive-config.js.map
